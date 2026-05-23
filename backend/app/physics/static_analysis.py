"""Aggregates the static / steady-state derived numbers into the output schema."""

from __future__ import annotations

from app.models import BalanceVsSpeed, CornerLoads, StaticAnalysis, VehicleSetup
from app.physics import aero, suspension


def _understeer_gradient(setup: VehicleSetup, tlltd_pct: float) -> float:
    """A simple, observable understeer-gradient proxy.

    Compare TLLTD to the mechanical weight distribution. If the front carries
    a larger share of LLT than its share of static weight, the front loses
    more grip per g (because tire grip is load-sensitive), giving understeer.

    Returns degrees-of-steer per g, signed: positive = understeer.
    """
    weight_front_pct = setup.mass_geometry.weight_dist_front_pct
    # Each percentage-point of TLLTD-vs-weight imbalance ≈ 0.04 deg/g.
    # This is a coarse calibration, but it moves in the right direction
    # for setup changes (stiffer front = more TLLTD = more understeer).
    return 0.04 * (tlltd_pct - weight_front_pct)


def compute(setup: VehicleSetup) -> StaticAnalysis:
    sus = suspension.compute(setup)

    # Aero/mechanical balance at a few speeds
    speeds = [0.0, 10.0, 16.7, 22.2, 27.8]  # 0, 36, 60, 80, 100 km/h
    balance_vs_speed: list[BalanceVsSpeed] = []
    for v in speeds:
        aero_f = aero.forces_at_speed(setup, v)
        mech_balance = setup.mass_geometry.weight_dist_front_pct  # static %
        # Total balance = weighted average of mechanical and aero by their loads.
        W = setup.mass_geometry.total_mass_kg * 9.81
        df_total = aero_f.df_total_N
        if W + df_total > 0:
            total_balance = (W * mech_balance + df_total * aero_f.balance_front_pct) / (W + df_total)
        else:
            total_balance = mech_balance
        balance_vs_speed.append(
            BalanceVsSpeed(
                speed_ms=v,
                aero_balance_front_pct=aero_f.balance_front_pct,
                mechanical_balance_front_pct=mech_balance,
                total_balance_front_pct=total_balance,
            )
        )

    ug = _understeer_gradient(setup, sus.tlltd_front_pct)

    # Cross-weight (FR + RL) / total × 100. With even L/R splits this is 50%.
    total_static = sus.fz_static_fl_N + sus.fz_static_fr_N + sus.fz_static_rl_N + sus.fz_static_rr_N
    cross_weight = 100.0 * (sus.fz_static_fr_N + sus.fz_static_rl_N) / total_static if total_static > 0 else 50.0

    return StaticAnalysis(
        corner_weights_N=CornerLoads(
            fl_N=sus.fz_static_fl_N,
            fr_N=sus.fz_static_fr_N,
            rl_N=sus.fz_static_rl_N,
            rr_N=sus.fz_static_rr_N,
        ),
        cross_weight_pct=cross_weight,
        front_axle_load_N=sus.fz_static_fl_N + sus.fz_static_fr_N,
        rear_axle_load_N=sus.fz_static_rl_N + sus.fz_static_rr_N,
        front_wheel_rate_N_mm=sus.k_wheel_front_corner_N_m / 1000.0,
        rear_wheel_rate_N_mm=sus.k_wheel_rear_corner_N_m / 1000.0,
        front_ride_freq_hz=sus.ride_freq_front_hz,
        rear_ride_freq_hz=sus.ride_freq_rear_hz,
        front_damping_ratio=sus.damping_ratio_front,
        rear_damping_ratio=sus.damping_ratio_rear,
        front_roll_stiffness_Nm_deg=sus.k_roll_front_total_Nm_rad * 3.14159265 / 180.0,
        rear_roll_stiffness_Nm_deg=sus.k_roll_rear_total_Nm_rad * 3.14159265 / 180.0,
        tlltd_front_pct=sus.tlltd_front_pct,
        roll_gradient_deg_g=sus.roll_gradient_deg_g,
        pitch_gradient_brake_deg_g=sus.pitch_gradient_brake_deg_g,
        pitch_gradient_accel_deg_g=sus.pitch_gradient_accel_deg_g,
        understeer_gradient_deg_g=ug,
        balance_vs_speed=balance_vs_speed,
    )
