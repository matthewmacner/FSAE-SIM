"""Quasi-steady-state lap simulator.

Input: a track represented as samples of (distance, curvature) where
curvature κ = 1/R (1/m). Sign is ignored — only |κ| matters for grip.

Algorithm:
1. For each sample, find the grip-limited cornering speed by iterating
   `v² = ay_max(v) / |κ|`. ay_max comes from the lateral solver, which
   uses downforce at v.
2. Forward pass: v_f[i] = min(v_grip[i], sqrt(v_f[i-1]² + 2·ax_drive·ds))
   where ax_drive accounts for combined slip at the corner load.
3. Backward pass: v_b[i] = min(v_grip[i], sqrt(v_b[i+1]² + 2·ax_brake·ds)).
4. Take the elementwise min as the final speed trace.
5. Lap time = Σ ds/v; energy = Σ F_drive · ds over driving segments.

For endurance the lap is multiplied by 22 km / lap distance.
"""

from __future__ import annotations

import math
from dataclasses import dataclass

from app.models import LapResult, LapTracePoint, VehicleSetup
from app.physics import aero as aero_mod
from app.physics import powertrain as pt_mod
from app.physics import suspension as suspension_mod
from app.physics.lateral import _solve_lateral_equilibrium
from app.physics.tire import grip_at_load

G = 9.81
ENDURANCE_DISTANCE_M = 22000.0


@dataclass
class Track:
    distance_m: list[float]
    curvature_1_m: list[float]

    @property
    def length_m(self) -> float:
        return self.distance_m[-1] if self.distance_m else 0.0


def default_fs_autocross() -> Track:
    """Stylized FS autocross — ~1.05 km, mix of slalom + hairpin + sweeper."""
    segments: list[tuple[float, float]] = [
        # (length_m, curvature_1_m). curvature 0 = straight.
        (80.0, 0.0),
        (30.0, 1.0 / 15.0),     # 90° R15 right
        (60.0, 0.0),
        (20.0, 1.0 / 7.0),      # slalom 1
        (20.0, -1.0 / 7.0),     # slalom 2
        (20.0, 1.0 / 7.0),      # slalom 3
        (20.0, -1.0 / 7.0),     # slalom 4
        (20.0, 1.0 / 7.0),      # slalom 5
        (20.0, -1.0 / 7.0),     # slalom 6
        (60.0, 0.0),
        (40.0, 1.0 / 20.0),     # sweeper
        (60.0, 0.0),
        (25.0, 1.0 / 6.0),      # tight 90°
        (50.0, 0.0),
        (60.0, 1.0 / 25.0),     # long sweeper
        (80.0, 0.0),
        (18.85, 1.0 / 6.0),     # hairpin 180° R6 — π·6 ≈ 18.85 m
        (60.0, 0.0),
        (30.0, 1.0 / 12.0),     # quick S — part 1
        (30.0, -1.0 / 12.0),    # quick S — part 2
        (80.0, 0.0),
        (30.0, 1.0 / 15.0),     # final 90°
        (40.0, 0.0),
        (25.0, 1.0 / 10.0),
        (80.0, 0.0),
    ]
    ds = 1.0
    dist: list[float] = []
    curv: list[float] = []
    d = 0.0
    for length, k in segments:
        n = max(int(round(length / ds)), 1)
        for _ in range(n):
            dist.append(d)
            curv.append(k)
            d += ds
    return Track(distance_m=dist, curvature_1_m=curv)


def _v_grip_at_curvature(setup: VehicleSetup, abs_k: float) -> float:
    if abs_k <= 1e-6:
        return 200.0  # straight — return effectively unbounded
    radius = 1.0 / abs_k
    v_guess = math.sqrt(1.4 * G * radius)
    for _ in range(8):
        ay = _solve_lateral_equilibrium(setup, v_guess, ax_g=0.0).ay_g
        v_new = math.sqrt(max(ay * G * radius, 0.0))
        if abs(v_new - v_guess) < 1e-3:
            return v_new
        v_guess = 0.5 * v_guess + 0.5 * v_new
    return v_guess


def _max_ax_at_speed(
    setup: VehicleSetup, v_ms: float, ay_g: float, drive: bool
) -> float:
    """Max forward (drive=True) or braking (drive=False) accel in g, accounting
    for the lateral force already in use."""
    if v_ms <= 0:
        if drive:
            # From rest, weight-transfer assist applied; bound by tire fmax at static rear load + estimated transfer.
            pass
    # Compute available longitudinal at the rear (drive) or all four (brake).
    mg = setup.mass_geometry
    m = mg.total_mass_kg
    L = mg.wheelbase_mm / 1000.0
    h_cg = mg.cg_height_mm / 1000.0
    W = m * G

    sus = suspension_mod.compute(setup)
    aero_f = aero_mod.forces_at_speed(setup, v_ms)

    # Iterate ax → load transfer → grip → ax.
    ax_guess = (0.6 if drive else -1.3)
    for _ in range(6):
        delta_lon = m * (ax_guess * G) * h_cg / L
        Wf = W * (mg.weight_dist_front_pct / 100.0) + aero_f.df_front_N - delta_lon
        Wr = (W - W * (mg.weight_dist_front_pct / 100.0)) + aero_f.df_rear_N + delta_lon
        delta_lat_f = sus.llt_front_total_N_per_g * ay_g
        delta_lat_r = sus.llt_rear_total_N_per_g * ay_g

        fz_fl = max(Wf / 2.0 + delta_lat_f, 0.0)
        fz_fr = max(Wf / 2.0 - delta_lat_f, 0.0)
        fz_rl = max(Wr / 2.0 + delta_lat_r, 0.0)
        fz_rr = max(Wr / 2.0 - delta_lat_r, 0.0)
        f_fl = grip_at_load(setup.tire, fz_fl).fmax_N
        f_fr = grip_at_load(setup.tire, fz_fr).fmax_N
        f_rl = grip_at_load(setup.tire, fz_rl).fmax_N
        f_rr = grip_at_load(setup.tire, fz_rr).fmax_N

        # Lateral usage λ = ay * m * g / (sum of fmax).
        total_fmax = f_fl + f_fr + f_rl + f_rr
        if total_fmax <= 0:
            return 0.0
        lam = min(abs(ay_g) * m * G / total_fmax, 1.0)
        rem = math.sqrt(max(1.0 - lam * lam, 0.0))

        if drive:
            f_long = (f_rl + f_rr) * rem
            # Bound by powertrain torque too.
            engine = pt_mod.best_wheel_force(setup, v_ms).wheel_force_N
            f_long = min(f_long, engine)
            ax_new = (f_long - aero_f.drag_N - setup.tire.rolling_resistance_coef * (W + aero_f.df_total_N)) / m / G
        else:
            f_long = total_fmax * rem
            # Bound by brake torque (Nm) → force (N): T_per_axle / r_tire.
            r_tire = setup.powertrain.tire_radius_mm / 1000.0
            max_brake_force = (
                setup.brakes.max_brake_torque_front_Nm + setup.brakes.max_brake_torque_rear_Nm
            ) / r_tire
            f_long = min(f_long, max_brake_force)
            ax_new = -(f_long + aero_f.drag_N + setup.tire.rolling_resistance_coef * (W + aero_f.df_total_N)) / m / G

        if abs(ax_new - ax_guess) < 1e-3:
            return ax_new
        ax_guess = 0.5 * ax_guess + 0.5 * ax_new
    return ax_guess


def simulate(setup: VehicleSetup, track: Track | None = None) -> LapResult:
    if track is None:
        track = default_fs_autocross()
    n = len(track.distance_m)
    if n < 2:
        raise ValueError("Track must have at least 2 samples")

    # Step 1: grip-limited speed at each sample.
    v_grip = [_v_grip_at_curvature(setup, abs(k)) for k in track.curvature_1_m]

    # Step 2: forward pass.
    v_fwd = list(v_grip)
    v_fwd[0] = min(v_fwd[0], 5.0)  # start near zero (5 m/s ≈ rolling start)
    for i in range(1, n):
        ds = track.distance_m[i] - track.distance_m[i - 1]
        ay_g_here = v_fwd[i - 1] ** 2 * abs(track.curvature_1_m[i - 1]) / G
        ax_drive_g = _max_ax_at_speed(setup, v_fwd[i - 1], ay_g_here, drive=True)
        v_target_sq = v_fwd[i - 1] ** 2 + 2.0 * ax_drive_g * G * ds
        v_fwd[i] = min(v_grip[i], math.sqrt(max(v_target_sq, 0.0)))

    # Step 3: backward pass.
    v_back = list(v_grip)
    v_back[-1] = v_fwd[-1]  # close to forward at end
    for i in range(n - 2, -1, -1):
        ds = track.distance_m[i + 1] - track.distance_m[i]
        ay_g_here = v_back[i + 1] ** 2 * abs(track.curvature_1_m[i + 1]) / G
        ax_brake_g = _max_ax_at_speed(setup, v_back[i + 1], ay_g_here, drive=False)
        # ax_brake_g is negative; reversing the integration direction.
        v_target_sq = v_back[i + 1] ** 2 - 2.0 * ax_brake_g * G * ds
        v_back[i] = min(v_grip[i], math.sqrt(max(v_target_sq, 0.0)))

    # Step 4: take elementwise min.
    v = [min(vf, vb) for vf, vb in zip(v_fwd, v_back)]

    # Step 5: lap time + traces.
    sus = suspension_mod.compute(setup)
    mg = setup.mass_geometry
    W = mg.total_mass_kg * G
    lap_time = 0.0
    energy_J = 0.0
    trace: list[LapTracePoint] = []
    for i in range(n):
        ds = (track.distance_m[i] - track.distance_m[i - 1]) if i > 0 else 0.0
        v_i = max(v[i], 0.1)
        if ds > 0:
            v_prev = max(v[i - 1], 0.1)
            v_avg = 0.5 * (v_i + v_prev)
            lap_time += ds / v_avg
            ax = (v_i ** 2 - v_prev ** 2) / (2 * ds) / G  # in g
        else:
            v_avg = v_i
            ax = 0.0
        ay = (v_i ** 2 * abs(track.curvature_1_m[i])) / G

        aero_f = aero_mod.forces_at_speed(setup, v_i)
        Wf = W * (mg.weight_dist_front_pct / 100.0) + aero_f.df_front_N
        Wr = (W - W * (mg.weight_dist_front_pct / 100.0)) + aero_f.df_rear_N
        delta_lon = mg.total_mass_kg * (ax * G) * (mg.cg_height_mm / 1000.0) / (mg.wheelbase_mm / 1000.0)
        Wf -= delta_lon
        Wr += delta_lon
        delta_lat_f = sus.llt_front_total_N_per_g * ay
        delta_lat_r = sus.llt_rear_total_N_per_g * ay

        trace.append(
            LapTracePoint(
                distance_m=track.distance_m[i],
                speed_ms=v_i,
                ax_g=ax,
                ay_g=ay,
                fz_fl_N=max(Wf / 2.0 + delta_lat_f, 0.0),
                fz_fr_N=max(Wf / 2.0 - delta_lat_f, 0.0),
                fz_rl_N=max(Wr / 2.0 + delta_lat_r, 0.0),
                fz_rr_N=max(Wr / 2.0 - delta_lat_r, 0.0),
            )
        )

        if ds > 0 and ax > 0:
            # Approx tractive energy spent over this segment.
            f_required = mg.total_mass_kg * ax * G + aero_f.drag_N + setup.tire.rolling_resistance_coef * (W + aero_f.df_total_N)
            energy_J += max(f_required, 0.0) * ds

    track_length = track.length_m
    energy_per_lap_kj = energy_J / 1000.0
    laps_endurance = ENDURANCE_DISTANCE_M / track_length if track_length > 0 else 0.0
    endurance_energy_kj = energy_per_lap_kj * laps_endurance

    fuel_l: float | None = None
    battery_kwh: float | None = None
    pt = setup.powertrain
    if pt.drivetrain_type.lower() == "ev":
        battery_kwh = (endurance_energy_kj / 3600.0) / pt.drivetrain_efficiency
    else:
        thermal_eff = 0.30
        endurance_energy_mj = endurance_energy_kj / 1000.0
        fuel_l = endurance_energy_mj / (pt.drivetrain_efficiency * thermal_eff * pt.fuel_energy_density_mj_l)

    return LapResult(
        lap_time_s=lap_time,
        avg_speed_ms=track_length / lap_time if lap_time > 0 else 0.0,
        max_speed_ms=max(v),
        energy_per_lap_kj=energy_per_lap_kj,
        endurance_laps=laps_endurance,
        endurance_energy_kj=endurance_energy_kj,
        endurance_fuel_l=fuel_l,
        endurance_battery_kwh=battery_kwh,
        track_length_m=track_length,
        trace=trace,
    )
