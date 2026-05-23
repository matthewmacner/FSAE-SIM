"""Powertrain — engine/motor torque curve to wheel force.

For a given vehicle speed, the best gear is the one that puts the engine
near its torque peak without exceeding redline. We pick max wheel force
across allowed gears.

For an EV with a single-speed reduction, set `gear_ratios = [1.0]` and use
`final_drive_ratio` as the total reduction (or vice versa — they multiply).
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np

from app.models import VehicleSetup

_2PI = 2.0 * np.pi


@dataclass
class WheelForceAtSpeed:
    """Best-gear traction limit at this vehicle speed."""

    v_ms: float
    gear: int  # 1-indexed
    engine_rpm: float
    engine_torque_Nm: float
    wheel_force_N: float
    limited_by: str  # "torque_curve" or "redline"


def _interp_torque_Nm(rpm: float, rpm_pts: list[float], tq_pts: list[float], redline: float) -> float:
    if rpm <= 0:
        return 0.0
    if rpm > redline:
        return 0.0
    return float(np.interp(rpm, rpm_pts, tq_pts, left=tq_pts[0], right=0.0))


def best_wheel_force(setup: VehicleSetup, v_ms: float) -> WheelForceAtSpeed:
    pt = setup.powertrain
    r_tire = pt.tire_radius_mm / 1000.0
    if r_tire <= 0:
        return WheelForceAtSpeed(v_ms=v_ms, gear=0, engine_rpm=0, engine_torque_Nm=0, wheel_force_N=0, limited_by="redline")

    # wheel rpm
    wheel_rps = v_ms / r_tire / _2PI  # rev/s
    wheel_rpm = wheel_rps * 60.0

    best = WheelForceAtSpeed(v_ms=v_ms, gear=0, engine_rpm=0, engine_torque_Nm=0, wheel_force_N=0, limited_by="redline")

    # Lowest rpm on the torque curve — below this we treat the clutch as
    # slipping (combustion) or the inverter as torque-limited (EV) and hold
    # the engine at the curve's lowest published rpm. This is the standard
    # FS launch simplification.
    min_curve_rpm = min(pt.torque_curve_rpm) if pt.torque_curve_rpm else 0.0

    for i, gear in enumerate(pt.gear_ratios, start=1):
        engine_rpm = wheel_rpm * gear * pt.final_drive_ratio
        if engine_rpm > pt.redline_rpm:
            continue
        # Clamp at the bottom so launch torque is available.
        engine_rpm_eff = max(engine_rpm, min_curve_rpm)
        tq_engine = _interp_torque_Nm(engine_rpm_eff, pt.torque_curve_rpm, pt.torque_curve_Nm, pt.redline_rpm)
        tq_wheel = tq_engine * gear * pt.final_drive_ratio * pt.drivetrain_efficiency
        force = tq_wheel / r_tire
        if force > best.wheel_force_N:
            best = WheelForceAtSpeed(
                v_ms=v_ms,
                gear=i,
                engine_rpm=engine_rpm_eff,
                engine_torque_Nm=tq_engine,
                wheel_force_N=force,
                limited_by="torque_curve",
            )

    # If no gear worked (everything over redline), the car is at top speed.
    if best.gear == 0:
        best.limited_by = "redline"
    return best


def top_speed_ms(setup: VehicleSetup) -> float:
    """Speed at which the highest gear hits redline."""
    pt = setup.powertrain
    r_tire = pt.tire_radius_mm / 1000.0
    if not pt.gear_ratios:
        return 0.0
    top_gear = pt.gear_ratios[-1]
    # v at redline = wheel_rpm * 2π * r_tire / 60
    wheel_rpm = pt.redline_rpm / (top_gear * pt.final_drive_ratio)
    return wheel_rpm * _2PI * r_tire / 60.0
