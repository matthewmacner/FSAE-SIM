"""Aero forces.

Simple v² scaling. CL·A and CD·A are taken as constant (no ride-height map
in v1). Aero balance is the fraction of total downforce on the front axle.
"""

from __future__ import annotations

from dataclasses import dataclass

from app.models import VehicleSetup


@dataclass
class AeroForces:
    df_front_N: float
    df_rear_N: float
    df_total_N: float
    drag_N: float
    balance_front_pct: float


def forces_at_speed(setup: VehicleSetup, v_ms: float) -> AeroForces:
    aero = setup.aero
    q = 0.5 * aero.air_density_kg_m3 * v_ms * v_ms
    df_f = q * aero.cla_front_m2
    df_r = q * aero.cla_rear_m2
    df_total = df_f + df_r
    drag = q * aero.cda_m2
    balance = 100.0 * df_f / df_total if df_total > 0 else 50.0
    return AeroForces(
        df_front_N=df_f,
        df_rear_N=df_r,
        df_total_N=df_total,
        drag_N=drag,
        balance_front_pct=balance,
    )
