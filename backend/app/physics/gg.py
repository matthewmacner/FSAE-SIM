"""G-G diagram envelope.

For each requested speed, sweep the combined-slip envelope by varying the
fraction of grip used laterally (λ from 0 → 1). At each λ, per-tire lateral
load = λ * F_max, and the remaining longitudinal budget per tire is
`F_max * sqrt(1 - λ²)`. Summed over driven tires (rear-only for drive) or
all four (for braking) gives the car-level ax envelope.

This is a v1 approximation:
* Lateral force is distributed across tires proportionally to each tire's
  load-sensitive peak (an "even-pressure" assumption).
* Drive uses RWD; braking uses ideal bias and counts all four tires.
* Weight transfer from ax/ay is computed once at the current operating
  point and iterated implicitly through the per-tire Fz sweep.
"""

from __future__ import annotations

import math
from dataclasses import dataclass

from app.models import GGDiagram, GGEnvelope, GGPoint, VehicleSetup
from app.physics import aero as aero_mod
from app.physics import suspension as suspension_mod
from app.physics.tire import grip_at_load

G = 9.81

DEFAULT_SPEEDS_MS = [8.33, 13.89, 22.22]  # 30, 50, 80 km/h
LAMBDA_STEPS = 11


@dataclass
class _PerTireFmax:
    fl: float
    fr: float
    rl: float
    rr: float


def _per_tire_fmax(
    setup: VehicleSetup, v_ms: float, ay_g: float, ax_g: float
) -> _PerTireFmax:
    """Compute peak grip per tire at this operating point.

    Accounts for: static weight, downforce, lateral load transfer (from ay),
    longitudinal load transfer (from ax).
    """
    mg = setup.mass_geometry
    sus = suspension_mod.compute(setup)
    m = mg.total_mass_kg
    W = m * G
    L = mg.wheelbase_mm / 1000.0
    h_cg = mg.cg_height_mm / 1000.0

    aero_f = aero_mod.forces_at_speed(setup, v_ms)
    Wf = W * (mg.weight_dist_front_pct / 100.0) + aero_f.df_front_N
    Wr = (W - W * (mg.weight_dist_front_pct / 100.0)) + aero_f.df_rear_N

    # Longitudinal weight transfer (positive ax = forward = onto rear).
    delta_lon = m * (ax_g * G) * h_cg / L
    Wf -= delta_lon
    Wr += delta_lon

    # Lateral load transfer (per axle), at this ay.
    delta_lat_f = sus.llt_front_total_N_per_g * ay_g
    delta_lat_r = sus.llt_rear_total_N_per_g * ay_g

    fz_fl = max(Wf / 2.0 + delta_lat_f, 0.0)
    fz_fr = max(Wf / 2.0 - delta_lat_f, 0.0)
    fz_rl = max(Wr / 2.0 + delta_lat_r, 0.0)
    fz_rr = max(Wr / 2.0 - delta_lat_r, 0.0)

    return _PerTireFmax(
        fl=grip_at_load(setup.tire, fz_fl).fmax_N,
        fr=grip_at_load(setup.tire, fz_fr).fmax_N,
        rl=grip_at_load(setup.tire, fz_rl).fmax_N,
        rr=grip_at_load(setup.tire, fz_rr).fmax_N,
    )


def _envelope_at_speed(setup: VehicleSetup, v_ms: float) -> GGEnvelope:
    m = setup.mass_geometry.total_mass_kg

    points: list[GGPoint] = []

    # Pure lateral max (ax = 0). Iterate once to settle weight transfer.
    ay_guess = 1.5
    for _ in range(8):
        fmax = _per_tire_fmax(setup, v_ms, ay_guess, 0.0)
        total = fmax.fl + fmax.fr + fmax.rl + fmax.rr
        ay_new = total / (m * G)
        if abs(ay_new - ay_guess) < 1e-3:
            ay_guess = ay_new
            break
        ay_guess = 0.5 * ay_guess + 0.5 * ay_new
    ay_max = ay_guess

    for k in range(LAMBDA_STEPS):
        lam = k / (LAMBDA_STEPS - 1)  # 0 .. 1
        ay = lam * ay_max
        # Per-tire fractional lateral usage; remaining = sqrt(1 - lam²).
        rem = math.sqrt(max(1.0 - lam * lam, 0.0))

        # Drive envelope: rear tires only contribute fx.
        # Iterate weight transfer with current ax estimate.
        ax_drive_guess = rem * 0.8  # initial
        for _ in range(6):
            fmax = _per_tire_fmax(setup, v_ms, ay, ax_drive_guess)
            ax_drive = (fmax.rl + fmax.rr) * rem / (m * G)
            if abs(ax_drive - ax_drive_guess) < 1e-3:
                ax_drive_guess = ax_drive
                break
            ax_drive_guess = 0.5 * ax_drive_guess + 0.5 * ax_drive
        ax_drive = ax_drive_guess

        # Brake envelope: all four tires contribute fx.
        ax_brake_guess = -rem * 1.2
        for _ in range(6):
            fmax = _per_tire_fmax(setup, v_ms, ay, ax_brake_guess)
            ax_brake = -(fmax.fl + fmax.fr + fmax.rl + fmax.rr) * rem / (m * G)
            if abs(ax_brake - ax_brake_guess) < 1e-3:
                ax_brake_guess = ax_brake
                break
            ax_brake_guess = 0.5 * ax_brake_guess + 0.5 * ax_brake
        ax_brake = ax_brake_guess

        # Add the right-hand and left-hand sides (mirror about ay=0).
        points.append(GGPoint(ax_g=ax_drive, ay_g=ay))
        points.append(GGPoint(ax_g=ax_brake, ay_g=ay))
        if ay > 0:
            points.append(GGPoint(ax_g=ax_drive, ay_g=-ay))
            points.append(GGPoint(ax_g=ax_brake, ay_g=-ay))

    # Sort points by angle for clean line rendering on the frontend.
    points.sort(key=lambda p: math.atan2(p.ay_g, p.ax_g))
    return GGEnvelope(speed_ms=v_ms, points=points)


def compute(setup: VehicleSetup, speeds_ms: list[float] | None = None) -> GGDiagram:
    speeds = speeds_ms or DEFAULT_SPEEDS_MS
    envelopes = [_envelope_at_speed(setup, v) for v in speeds]

    # Pull peaks across all envelopes.
    peak_lat = max(abs(p.ay_g) for env in envelopes for p in env.points)
    peak_accel = max(p.ax_g for env in envelopes for p in env.points)
    peak_brake = abs(min(p.ax_g for env in envelopes for p in env.points))

    return GGDiagram(
        envelopes=envelopes,
        peak_lat_g=peak_lat,
        peak_long_accel_g=peak_accel,
        peak_long_brake_g=peak_brake,
    )
