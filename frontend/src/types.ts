// TypeScript mirror of the backend Pydantic schemas.
// Kept in sync by hand for v1 — could be codegen'd from /openapi.json later.

export interface MassGeometry {
  total_mass_kg: number;
  weight_dist_front_pct: number;
  wheelbase_mm: number;
  track_front_mm: number;
  track_rear_mm: number;
  cg_height_mm: number;
  unsprung_mass_front_kg: number;
  unsprung_mass_rear_kg: number;
  yaw_inertia_kgm2: number;
}

export interface DamperRates {
  low_speed_comp_Ns_m: number;
  high_speed_comp_Ns_m: number;
  low_speed_reb_Ns_m: number;
  high_speed_reb_Ns_m: number;
}

export interface Suspension {
  spring_rate_front_N_mm: number;
  spring_rate_rear_N_mm: number;
  motion_ratio_front: number;
  motion_ratio_rear: number;
  arb_front_Nm_deg: number;
  arb_rear_Nm_deg: number;
  arb_motion_ratio_front: number;
  arb_motion_ratio_rear: number;
  damper_front: DamperRates;
  damper_rear: DamperRates;
  roll_center_front_mm: number;
  roll_center_rear_mm: number;
  static_camber_front_deg: number;
  static_camber_rear_deg: number;
  static_toe_front_deg: number;
  static_toe_rear_deg: number;
  caster_deg: number;
  anti_dive_pct: number;
  anti_squat_pct: number;
}

export interface Tire {
  compound: string;
  peak_mu: number;
  cornering_stiffness_N_deg: number;
  load_sensitivity_exp: number;
  reference_load_N: number;
  rolling_resistance_coef: number;
  vertical_stiffness_N_mm: number;
  optimal_slip_angle_deg: number;
  optimal_slip_ratio: number;
  pacejka_B: number | null;
  pacejka_C: number | null;
  pacejka_E: number | null;
}

export interface Aero {
  cla_front_m2: number;
  cla_rear_m2: number;
  cda_m2: number;
  reference_velocity_ms: number;
  air_density_kg_m3: number;
}

export interface Powertrain {
  drivetrain_type: string;
  torque_curve_rpm: number[];
  torque_curve_Nm: number[];
  redline_rpm: number;
  final_drive_ratio: number;
  gear_ratios: number[];
  drivetrain_efficiency: number;
  tire_radius_mm: number;
  battery_capacity_kwh: number | null;
  fuel_capacity_l: number | null;
  fuel_energy_density_mj_l: number;
}

export interface Brakes {
  brake_bias_front_pct: number;
  max_brake_torque_front_Nm: number;
  max_brake_torque_rear_Nm: number;
}

export interface VehicleSetup {
  name: string;
  notes: string;
  mass_geometry: MassGeometry;
  suspension: Suspension;
  tire: Tire;
  aero: Aero;
  powertrain: Powertrain;
  brakes: Brakes;
}

// ----- result shapes -----

export interface CornerLoads {
  fl_N: number;
  fr_N: number;
  rl_N: number;
  rr_N: number;
}

export interface BalanceVsSpeed {
  speed_ms: number;
  aero_balance_front_pct: number;
  mechanical_balance_front_pct: number;
  total_balance_front_pct: number;
}

export interface StaticAnalysis {
  corner_weights_N: CornerLoads;
  cross_weight_pct: number;
  front_axle_load_N: number;
  rear_axle_load_N: number;
  front_wheel_rate_N_mm: number;
  rear_wheel_rate_N_mm: number;
  front_ride_freq_hz: number;
  rear_ride_freq_hz: number;
  front_damping_ratio: number;
  rear_damping_ratio: number;
  front_roll_stiffness_Nm_deg: number;
  rear_roll_stiffness_Nm_deg: number;
  tlltd_front_pct: number;
  roll_gradient_deg_g: number;
  pitch_gradient_brake_deg_g: number;
  pitch_gradient_accel_deg_g: number;
  understeer_gradient_deg_g: number;
  balance_vs_speed: BalanceVsSpeed[];
}

export interface GGPoint {
  ax_g: number;
  ay_g: number;
}

export interface GGEnvelope {
  speed_ms: number;
  points: GGPoint[];
}

export interface GGDiagram {
  envelopes: GGEnvelope[];
  peak_lat_g: number;
  peak_long_accel_g: number;
  peak_long_brake_g: number;
}

export interface SkidpadResult {
  lap_time_s: number;
  lat_g: number;
  speed_ms: number;
  corner_loads_N: CornerLoads;
  inside_outside_load_delta_N: number;
  notes: string;
}

export interface AccelTracePoint {
  t_s: number;
  distance_m: number;
  speed_ms: number;
  accel_g: number;
  limited_by: string;
  gear: number;
}

export interface AccelResult {
  time_75m_s: number;
  top_speed_75m_ms: number;
  trace: AccelTracePoint[];
}

export interface LapTracePoint {
  distance_m: number;
  speed_ms: number;
  ax_g: number;
  ay_g: number;
  fz_fl_N: number;
  fz_fr_N: number;
  fz_rl_N: number;
  fz_rr_N: number;
}

export interface LapResult {
  lap_time_s: number;
  avg_speed_ms: number;
  max_speed_ms: number;
  energy_per_lap_kj: number;
  endurance_laps: number;
  endurance_energy_kj: number;
  endurance_fuel_l: number | null;
  endurance_battery_kwh: number | null;
  track_length_m: number;
  trace: LapTracePoint[];
}

export interface SweepPoint {
  value: number;
  lap_time_s: number | null;
  skidpad_time_s: number | null;
  accel_75m_s: number | null;
  tlltd_front_pct: number | null;
  understeer_gradient_deg_g: number | null;
}

export interface SweepResult {
  parameter_path: string;
  baseline_value: number;
  sweep_values: number[];
  points: SweepPoint[];
}

export interface PresetSummary {
  name: string;
  filename: string;
}
