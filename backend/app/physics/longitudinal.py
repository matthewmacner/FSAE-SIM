"""Straight-line acceleration sim (75 m FS event).

Forward Euler in time. At each step we recompute aero, weight transfer, and
the smaller of the traction limit and the engine limit, then integrate
velocity and distance. The car is assumed RWD (the dominant FS layout); for
4WD set both axles' tires as driven by editing this file (TODO config).

Records `limited_by` per step so the frontend can shade traction-limited vs
power-limited regions of the trace.
"""

from __future__ import annotations

from app.models import AccelResult, AccelTracePoint, VehicleSetup
from app.physics import aero as aero_mod
from app.physics import powertrain as pt_mod
from app.physics import suspension as suspension_mod
from app.physics.tire import grip_at_load

G = 9.81
TARGET_DISTANCE_M = 75.0
DT = 0.005  # 200 Hz integration
MAX_STEPS = 4000  # 20 s cap


def simulate(setup: VehicleSetup) -> AccelResult:
    mg = setup.mass_geometry
    m = mg.total_mass_kg
    L = mg.wheelbase_mm / 1000.0
    h_cg = mg.cg_height_mm / 1000.0
    W = m * G
    W_r_static = W * (1.0 - mg.weight_dist_front_pct / 100.0)

    sus = suspension_mod.compute(setup)
    rolling_coef = setup.tire.rolling_resistance_coef

    trace: list[AccelTracePoint] = []
    t = 0.0
    x = 0.0
    v = 0.0
    ax_prev = 0.5 * G  # initial guess for the iterative weight transfer

    for step in range(MAX_STEPS):
        if x >= TARGET_DISTANCE_M:
            break

        aero_f = aero_mod.forces_at_speed(setup, v)
        # Longitudinal weight transfer (use previous a_x to estimate).
        delta_lon = m * ax_prev * h_cg / L  # N transferred onto rear

        fz_rear_axle = W_r_static + aero_f.df_rear_N + delta_lon
        fz_rear_axle = max(fz_rear_axle, 0.0)
        fz_per_rear_tire = fz_rear_axle / 2.0

        # Traction limit at the rear (RWD).
        rear_grip = grip_at_load(setup.tire, fz_per_rear_tire)
        traction_force = 2.0 * rear_grip.fx_max_N

        # Powertrain limit.
        ppt = pt_mod.best_wheel_force(setup, v)
        engine_force = ppt.wheel_force_N

        drive_force = min(traction_force, engine_force)
        limited_by = "traction" if traction_force <= engine_force else "power"
        if ppt.gear == 0:
            limited_by = "redline"
            drive_force = 0.0

        # Resistive forces.
        f_drag = aero_f.drag_N
        f_rolling = rolling_coef * (W + aero_f.df_total_N)
        net_force = drive_force - f_drag - f_rolling

        ax = net_force / m if m > 0 else 0.0

        trace.append(
            AccelTracePoint(
                t_s=t,
                distance_m=x,
                speed_ms=v,
                accel_g=ax / G,
                limited_by=limited_by,
                gear=ppt.gear,
            )
        )

        # Integrate.
        v += ax * DT
        x += v * DT
        t += DT
        ax_prev = ax

    # Linear-interpolate to find when x crossed exactly 75 m.
    if len(trace) >= 2 and trace[-1].distance_m >= TARGET_DISTANCE_M:
        prev = trace[-2]
        last = trace[-1]
        frac = (TARGET_DISTANCE_M - prev.distance_m) / max(last.distance_m - prev.distance_m, 1e-9)
        t_75 = prev.t_s + frac * (last.t_s - prev.t_s)
        v_75 = prev.speed_ms + frac * (last.speed_ms - prev.speed_ms)
    else:
        t_75 = trace[-1].t_s if trace else float("inf")
        v_75 = trace[-1].speed_ms if trace else 0.0
        # Touch suspension to keep linter happy; meaningful use is in lateral.
        _ = sus.tlltd_front_pct

    return AccelResult(time_75m_s=t_75, top_speed_75m_ms=v_75, trace=trace)
