"""Result schemas. One per endpoint; all share the same nullable-field
philosophy so the frontend can render partial results if a sub-calc fails.
"""

from __future__ import annotations

from pydantic import BaseModel, Field


class CornerLoads(BaseModel):
    fl_N: float
    fr_N: float
    rl_N: float
    rr_N: float


class BalanceVsSpeed(BaseModel):
    speed_ms: float
    aero_balance_front_pct: float
    mechanical_balance_front_pct: float
    total_balance_front_pct: float


class StaticAnalysis(BaseModel):
    corner_weights_N: CornerLoads
    cross_weight_pct: float = Field(description="Cross-weight = (FR + RL) / total × 100. 50 % is square.")
    front_axle_load_N: float
    rear_axle_load_N: float
    front_wheel_rate_N_mm: float
    rear_wheel_rate_N_mm: float
    front_ride_freq_hz: float
    rear_ride_freq_hz: float
    front_damping_ratio: float
    rear_damping_ratio: float
    front_roll_stiffness_Nm_deg: float
    rear_roll_stiffness_Nm_deg: float
    tlltd_front_pct: float = Field(
        description="Total lateral load transfer distribution — fraction of total LLT taken by the front axle."
    )
    roll_gradient_deg_g: float
    pitch_gradient_brake_deg_g: float
    pitch_gradient_accel_deg_g: float
    understeer_gradient_deg_g: float = Field(
        description="Approximate understeer gradient: positive = understeer, negative = oversteer."
    )
    balance_vs_speed: list[BalanceVsSpeed]


class GGPoint(BaseModel):
    ax_g: float
    ay_g: float


class GGEnvelope(BaseModel):
    speed_ms: float
    points: list[GGPoint]


class GGDiagram(BaseModel):
    envelopes: list[GGEnvelope]
    peak_lat_g: float
    peak_long_accel_g: float
    peak_long_brake_g: float


class SkidpadResult(BaseModel):
    lap_time_s: float
    lat_g: float
    speed_ms: float
    corner_loads_N: CornerLoads
    inside_outside_load_delta_N: float
    notes: str = ""


class AccelTracePoint(BaseModel):
    t_s: float
    distance_m: float
    speed_ms: float
    accel_g: float
    limited_by: str  # "traction" or "power" or "redline"
    gear: int


class AccelResult(BaseModel):
    time_75m_s: float
    top_speed_75m_ms: float
    trace: list[AccelTracePoint]


class LapTracePoint(BaseModel):
    distance_m: float
    speed_ms: float
    ax_g: float
    ay_g: float
    fz_fl_N: float
    fz_fr_N: float
    fz_rl_N: float
    fz_rr_N: float


class LapResult(BaseModel):
    lap_time_s: float
    avg_speed_ms: float
    max_speed_ms: float
    energy_per_lap_kj: float
    endurance_laps: float = Field(description="22 km / lap distance.")
    endurance_energy_kj: float
    endurance_fuel_l: float | None = None
    endurance_battery_kwh: float | None = None
    track_length_m: float
    trace: list[LapTracePoint]


class SweepPoint(BaseModel):
    value: float
    lap_time_s: float | None = None
    skidpad_time_s: float | None = None
    accel_75m_s: float | None = None
    tlltd_front_pct: float | None = None
    understeer_gradient_deg_g: float | None = None


class SweepResult(BaseModel):
    parameter_path: str
    baseline_value: float
    sweep_values: list[float]
    points: list[SweepPoint]
