"""Lateral / cornering simulators.

* `max_lat_g_at_speed` — the steady-state lateral g a car can hold while
  cornering at a given speed (or any speed = 0 for skidpad). Iterates load
  transfer + grip until convergent.

* `skidpad` — wraps that for the FS 15.25 m radius circle.
"""

from __future__ import annotations

import math
from dataclasses import dataclass

from app.models import CornerLoads, SkidpadResult, VehicleSetup
from app.physics import aero as aero_mod
from app.physics import suspension as suspension_mod
from app.physics.tire import grip_at_load

G = 9.81
SKIDPAD_RADIUS_M = 15.25


@dataclass
class LateralCorneringPoint:
    v_ms: float
    ay_g: float
    fz_fl_N: float
    fz_fr_N: float
    fz_rl_N: float
    fz_rr_N: float


def _solve_lateral_equilibrium(
    setup: VehicleSetup, v_ms: float, ax_g: float = 0.0
) -> LateralCorneringPoint:
    """Iterate ay until tire-supplied lateral force = m * ay.

    `ax_g` is the simultaneous longitudinal acceleration in g (positive =
    forward). It eats into each tire's friction budget via the friction
    circle. Use ax_g = 0 for pure steady-state cornering.
    """
    sus = suspension_mod.compute(setup)
    mg = setup.mass_geometry
    W = mg.total_mass_kg * G

    # Aero at this speed (constant during the iteration — ay doesn't change v).
    aero_f = aero_mod.forces_at_speed(setup, v_ms)
    df_f = aero_f.df_front_N
    df_r = aero_f.df_rear_N

    # Static axle loads + aero downforce.
    Wf = W * (mg.weight_dist_front_pct / 100.0) + df_f
    Wr = W - W * (mg.weight_dist_front_pct / 100.0) + df_r

    # Initial ay guess: 1.5 g.
    ay_g = 1.5

    for _ in range(40):
        # Lateral load transfer per axle = LLT_per_g * ay_g
        delta_f = sus.llt_front_total_N_per_g * ay_g
        delta_r = sus.llt_rear_total_N_per_g * ay_g

        # Inside/outside per axle. (Outside loaded up, inside unloaded.)
        fz_fl_outside = Wf / 2.0 + delta_f
        fz_fr_inside = Wf / 2.0 - delta_f
        fz_rl_outside = Wr / 2.0 + delta_r
        fz_rr_inside = Wr / 2.0 - delta_r

        # Floor at 0 (a wheel lifting off the ground produces zero grip).
        fz_fl_outside = max(fz_fl_outside, 0.0)
        fz_fr_inside = max(fz_fr_inside, 0.0)
        fz_rl_outside = max(fz_rl_outside, 0.0)
        fz_rr_inside = max(fz_rr_inside, 0.0)

        # Each tire's available lateral force (after spending some on ax via
        # friction circle).
        per_tire_fz = [fz_fl_outside, fz_fr_inside, fz_rl_outside, fz_rr_inside]
        ay_force = 0.0
        m_axle = mg.total_mass_kg
        fx_per_tire_N = (ax_g * G * m_axle / 4.0) if ax_g != 0 else 0.0
        for fz in per_tire_fz:
            limits = grip_at_load(setup.tire, fz)
            f_lat_max_sq = limits.fmax_N ** 2 - fx_per_tire_N ** 2
            if f_lat_max_sq <= 0:
                continue
            ay_force += math.sqrt(f_lat_max_sq)

        ay_achievable_g = ay_force / (mg.total_mass_kg * G)
        # Under-relax for stability.
        if abs(ay_achievable_g - ay_g) < 1e-4:
            ay_g = ay_achievable_g
            break
        ay_g = 0.5 * ay_g + 0.5 * ay_achievable_g

    # Final corner loads at converged ay_g
    delta_f = sus.llt_front_total_N_per_g * ay_g
    delta_r = sus.llt_rear_total_N_per_g * ay_g
    return LateralCorneringPoint(
        v_ms=v_ms,
        ay_g=ay_g,
        fz_fl_N=max(Wf / 2.0 + delta_f, 0.0),
        fz_fr_N=max(Wf / 2.0 - delta_f, 0.0),
        fz_rl_N=max(Wr / 2.0 + delta_r, 0.0),
        fz_rr_N=max(Wr / 2.0 - delta_r, 0.0),
    )


def max_lat_g_at_speed(setup: VehicleSetup, v_ms: float, ax_g: float = 0.0) -> float:
    return _solve_lateral_equilibrium(setup, v_ms, ax_g).ay_g


def skidpad(setup: VehicleSetup) -> SkidpadResult:
    """Iterate v ↔ ay on the 15.25 m circle until consistent.

    From kinematics v² = ay * r. From grip ay = f(v) (downforce-loaded).
    We loop the two together.
    """
    v = math.sqrt(1.4 * G * SKIDPAD_RADIUS_M)  # initial guess at 1.4 g
    for _ in range(20):
        pt = _solve_lateral_equilibrium(setup, v, ax_g=0.0)
        v_new = math.sqrt(pt.ay_g * G * SKIDPAD_RADIUS_M)
        if abs(v_new - v) < 1e-3:
            v = v_new
            break
        v = 0.5 * v + 0.5 * v_new

    pt = _solve_lateral_equilibrium(setup, v, ax_g=0.0)
    circumference = 2 * math.pi * SKIDPAD_RADIUS_M
    lap_time = circumference / v if v > 0 else float("inf")

    inside_outside_delta = (pt.fz_fl_N + pt.fz_rl_N) - (pt.fz_fr_N + pt.fz_rr_N)

    return SkidpadResult(
        lap_time_s=lap_time,
        lat_g=pt.ay_g,
        speed_ms=v,
        corner_loads_N=CornerLoads(
            fl_N=pt.fz_fl_N,
            fr_N=pt.fz_fr_N,
            rl_N=pt.fz_rl_N,
            rr_N=pt.fz_rr_N,
        ),
        inside_outside_load_delta_N=inside_outside_delta,
        notes=(
            f"FS skidpad on R = {SKIDPAD_RADIUS_M} m circle. "
            f"Steady-state at {v:.1f} m/s ({v * 3.6:.1f} km/h)."
        ),
    )
