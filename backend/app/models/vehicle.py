"""Pydantic schema for a Formula Student vehicle setup.

All units in the schema are SI-ish but chosen to match what FS teams actually
write on their setup sheets: kg, mm, N/mm, Nm/deg, percent. The physics code
converts internally to base SI before integrating.
"""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class _Strict(BaseModel):
    model_config = ConfigDict(extra="forbid")


class MassGeometry(_Strict):
    total_mass_kg: float = Field(230.0, ge=120, le=400, description="Total mass with driver (kg).")
    weight_dist_front_pct: float = Field(
        47.0, ge=35, le=60, description="Static weight distribution, % on front axle."
    )
    wheelbase_mm: float = Field(1550.0, ge=1400, le=1800, description="Wheelbase (mm).")
    track_front_mm: float = Field(1250.0, ge=1100, le=1400, description="Front track (mm).")
    track_rear_mm: float = Field(1230.0, ge=1100, le=1400, description="Rear track (mm).")
    cg_height_mm: float = Field(280.0, ge=200, le=400, description="CG height above ground (mm).")
    unsprung_mass_front_kg: float = Field(12.0, ge=4, le=25, description="Unsprung mass per axle, front (kg).")
    unsprung_mass_rear_kg: float = Field(12.0, ge=4, le=25, description="Unsprung mass per axle, rear (kg).")
    yaw_inertia_kgm2: float = Field(
        90.0, ge=40, le=200, description="Yaw moment of inertia about CG (kg·m²)."
    )


class DamperRates(_Strict):
    low_speed_comp_Ns_m: float = Field(2000.0, ge=0, le=8000, description="Low-speed compression damping (N·s/m).")
    high_speed_comp_Ns_m: float = Field(1200.0, ge=0, le=8000, description="High-speed compression damping (N·s/m).")
    low_speed_reb_Ns_m: float = Field(3000.0, ge=0, le=10000, description="Low-speed rebound damping (N·s/m).")
    high_speed_reb_Ns_m: float = Field(1800.0, ge=0, le=10000, description="High-speed rebound damping (N·s/m).")


class Suspension(_Strict):
    # Springs
    spring_rate_front_N_mm: float = Field(35.0, ge=10, le=120, description="Front spring rate (N/mm at the spring).")
    spring_rate_rear_N_mm: float = Field(40.0, ge=10, le=120, description="Rear spring rate (N/mm at the spring).")
    motion_ratio_front: float = Field(
        1.0, ge=0.5, le=2.0, description="Front motion ratio (wheel travel / spring travel)."
    )
    motion_ratio_rear: float = Field(
        1.0, ge=0.5, le=2.0, description="Rear motion ratio (wheel travel / spring travel)."
    )

    # Anti-roll bars
    arb_front_Nm_deg: float = Field(80.0, ge=0, le=600, description="Front ARB stiffness (Nm/deg at the bar).")
    arb_rear_Nm_deg: float = Field(60.0, ge=0, le=600, description="Rear ARB stiffness (Nm/deg at the bar).")
    arb_motion_ratio_front: float = Field(1.0, ge=0.5, le=2.0, description="Front ARB motion ratio.")
    arb_motion_ratio_rear: float = Field(1.0, ge=0.5, le=2.0, description="Rear ARB motion ratio.")

    # Dampers
    damper_front: DamperRates = Field(default_factory=DamperRates)
    damper_rear: DamperRates = Field(default_factory=DamperRates)

    # Geometry
    roll_center_front_mm: float = Field(35.0, ge=-50, le=150, description="Front roll-center height (mm).")
    roll_center_rear_mm: float = Field(55.0, ge=-50, le=200, description="Rear roll-center height (mm).")
    static_camber_front_deg: float = Field(-2.0, ge=-5, le=2, description="Static camber front (deg, negative = top in).")
    static_camber_rear_deg: float = Field(-1.5, ge=-5, le=2, description="Static camber rear (deg).")
    static_toe_front_deg: float = Field(0.1, ge=-1, le=1, description="Static toe front (deg, positive = toe-in).")
    static_toe_rear_deg: float = Field(0.1, ge=-1, le=1, description="Static toe rear (deg).")
    caster_deg: float = Field(4.5, ge=0, le=10, description="Caster angle (deg).")
    anti_dive_pct: float = Field(20.0, ge=0, le=100, description="Anti-dive percentage front.")
    anti_squat_pct: float = Field(25.0, ge=0, le=100, description="Anti-squat percentage rear.")


class Tire(_Strict):
    compound: str = Field("Hoosier R25B 16x7.5-10", description="Compound preset name for display.")
    peak_mu: float = Field(
        1.55, ge=0.5, le=2.5, description="Peak friction coefficient at the reference load."
    )
    cornering_stiffness_N_deg: float = Field(
        950.0,
        ge=200,
        le=3000,
        description="Lateral cornering stiffness per tire at reference load (N/deg of slip angle).",
    )
    load_sensitivity_exp: float = Field(
        0.85,
        ge=0.5,
        le=1.0,
        description=(
            "Load-sensitivity exponent n in F_y_max = mu * (Fz_ref) * (Fz / Fz_ref)^n. "
            "n < 1 captures that grip per unit load drops as load increases."
        ),
    )
    reference_load_N: float = Field(
        1100.0, ge=400, le=3000, description="Reference vertical load the peak_mu / cornering_stiffness are quoted at (N)."
    )
    rolling_resistance_coef: float = Field(0.020, ge=0.005, le=0.05, description="Rolling-resistance coefficient.")
    vertical_stiffness_N_mm: float = Field(
        110.0, ge=40, le=300, description="Tire vertical stiffness (N/mm)."
    )
    optimal_slip_angle_deg: float = Field(
        7.0, ge=3, le=15, description="Slip angle at which peak lateral force occurs (deg)."
    )
    optimal_slip_ratio: float = Field(
        0.12, ge=0.05, le=0.30, description="Slip ratio at which peak longitudinal force occurs."
    )
    pacejka_B: float | None = Field(
        None, description="Optional Pacejka B (stiffness factor). If null, use linear-with-load-sensitivity."
    )
    pacejka_C: float | None = Field(None, description="Optional Pacejka C (shape factor).")
    pacejka_E: float | None = Field(None, description="Optional Pacejka E (curvature factor).")


class Aero(_Strict):
    cla_front_m2: float = Field(1.4, ge=0, le=5, description="Front lift coefficient × area (m²).")
    cla_rear_m2: float = Field(1.7, ge=0, le=5, description="Rear lift coefficient × area (m²).")
    cda_m2: float = Field(1.1, ge=0.3, le=3, description="Drag coefficient × area (m²).")
    reference_velocity_ms: float = Field(
        20.0, ge=5, le=50, description="Velocity at which CL·A / CD·A are quoted (m/s)."
    )
    air_density_kg_m3: float = Field(1.20, ge=0.9, le=1.35, description="Ambient air density (kg/m³).")


class Powertrain(_Strict):
    drivetrain_type: str = Field("combustion", description="Either 'combustion' or 'ev'.")
    # Curve. If torque_curve_rpm/Nm provided (must be same length, monotonically increasing rpm),
    # used directly. Otherwise build a flat torque curve from peak values.
    torque_curve_rpm: list[float] = Field(
        default_factory=lambda: [2000, 4000, 6000, 8000, 10000, 12000],
        description="Engine/motor speed points (rpm).",
    )
    torque_curve_Nm: list[float] = Field(
        default_factory=lambda: [50, 65, 75, 75, 65, 50],
        description="Torque at the engine/motor at each speed point (Nm).",
    )
    redline_rpm: float = Field(12000.0, ge=3000, le=20000, description="Maximum engine/motor rpm.")
    final_drive_ratio: float = Field(
        3.7,
        ge=1.0,
        le=20.0,
        description="Final drive ratio. EV single-speed reductions often land between 10–15.",
    )
    gear_ratios: list[float] = Field(
        default_factory=lambda: [2.92, 2.05, 1.61, 1.33, 1.14, 1.0],
        description="Gear ratios. For an EV, use a single-entry list (e.g., [1.0]).",
    )
    drivetrain_efficiency: float = Field(0.92, ge=0.5, le=0.99, description="Driveline efficiency, engine → wheels.")
    tire_radius_mm: float = Field(228.0, ge=180, le=300, description="Loaded tire radius (mm).")
    battery_capacity_kwh: float | None = Field(
        None, description="Battery capacity for EV (kWh). Null for combustion."
    )
    fuel_capacity_l: float | None = Field(
        7.0, description="Fuel-tank capacity for combustion (L). Null for EV."
    )
    fuel_energy_density_mj_l: float = Field(
        32.0, description="Energy density of fuel (MJ/L). 32 ≈ E85; use ~34 for gasoline."
    )


class Brakes(_Strict):
    brake_bias_front_pct: float = Field(58.0, ge=40, le=80, description="Brake bias on front axle (%).")
    max_brake_torque_front_Nm: float = Field(
        900.0, ge=200, le=3000, description="Maximum brake torque per axle, front (Nm)."
    )
    max_brake_torque_rear_Nm: float = Field(
        700.0, ge=200, le=3000, description="Maximum brake torque per axle, rear (Nm)."
    )


class VehicleSetup(_Strict):
    """The complete vehicle setup. This is the input to every endpoint."""

    name: str = Field("Untitled setup", description="Display name.")
    notes: str = Field("", description="Free-form notes for the user.")
    mass_geometry: MassGeometry = Field(default_factory=MassGeometry)
    suspension: Suspension = Field(default_factory=Suspension)
    tire: Tire = Field(default_factory=Tire)
    aero: Aero = Field(default_factory=Aero)
    powertrain: Powertrain = Field(default_factory=Powertrain)
    brakes: Brakes = Field(default_factory=Brakes)
