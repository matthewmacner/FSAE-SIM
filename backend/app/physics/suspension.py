"""Suspension math.

Computes wheel rates, axle roll stiffness, ride frequencies, damping ratios,
and the lateral-load-transfer distribution (TLLTD) using the standard
decomposition into elastic (springs + ARB), geometric (roll center), and
unsprung contributions.

Units: SI throughout in this module. The schema uses mm, N/mm, Nm/deg —
conversion happens at the boundary.
"""

from __future__ import annotations

import math
from dataclasses import dataclass

from app.models import VehicleSetup

G = 9.81  # m/s²


@dataclass
class SuspensionDerived:
    """Everything we can compute from setup + geometry, no simulation needed."""

    # Wheel rates per corner (N/m)
    k_wheel_front_corner_N_m: float
    k_wheel_rear_corner_N_m: float

    # Axle roll stiffness from springs alone (Nm/rad)
    k_roll_front_springs_Nm_rad: float
    k_roll_rear_springs_Nm_rad: float

    # ARB contribution (Nm/rad of roll)
    k_roll_front_arb_Nm_rad: float
    k_roll_rear_arb_Nm_rad: float

    # Total axle roll stiffness (Nm/rad)
    k_roll_front_total_Nm_rad: float
    k_roll_rear_total_Nm_rad: float

    # Sprung/unsprung mass split
    sprung_mass_kg: float
    sprung_mass_front_kg: float
    sprung_mass_rear_kg: float

    # Roll-axis geometry
    h_roll_axis_at_cg_m: float
    h_sprung_above_roll_axis_m: float

    # Natural frequencies (Hz) and damping ratios
    ride_freq_front_hz: float
    ride_freq_rear_hz: float
    damping_ratio_front: float
    damping_ratio_rear: float

    # Roll / pitch gradients (deg/g of lateral / longitudinal accel)
    roll_gradient_deg_g: float
    pitch_gradient_brake_deg_g: float
    pitch_gradient_accel_deg_g: float

    # LLT decomposition (N per g of ay) at each axle
    llt_front_elastic_N_per_g: float
    llt_rear_elastic_N_per_g: float
    llt_front_geometric_N_per_g: float
    llt_rear_geometric_N_per_g: float
    llt_front_unsprung_N_per_g: float
    llt_rear_unsprung_N_per_g: float
    llt_front_total_N_per_g: float
    llt_rear_total_N_per_g: float
    tlltd_front_pct: float  # 0–100 — fraction of total LLT taken by front

    # Static loads on each corner (N)
    fz_static_fl_N: float
    fz_static_fr_N: float
    fz_static_rl_N: float
    fz_static_rr_N: float


def _wheel_rate_corner(spring_rate_N_mm: float, motion_ratio: float) -> float:
    """Convert spring rate at the spring to wheel rate at the contact patch.

    k_wheel = k_spring / MR² where MR = wheel_travel / spring_travel.
    Returns N/m.
    """
    k_spring_N_m = spring_rate_N_mm * 1000.0
    return k_spring_N_m / (motion_ratio ** 2)


def _arb_roll_stiffness_Nm_rad(arb_Nm_deg: float, motion_ratio: float) -> float:
    """ARB roll stiffness in Nm per radian of roll.

    Convert the published Nm/deg → Nm/rad, then divide by MR² to bring the
    stiffness from the bar to the wheel. (Same MR convention as springs.)
    """
    arb_Nm_rad = arb_Nm_deg * (180.0 / math.pi)
    return arb_Nm_rad / (motion_ratio ** 2)


def _ride_frequency_hz(k_wheel_N_m: float, sprung_corner_kg: float) -> float:
    if sprung_corner_kg <= 0:
        return 0.0
    return (1.0 / (2 * math.pi)) * math.sqrt(k_wheel_N_m / sprung_corner_kg)


def _damping_ratio(c_Ns_m: float, k_wheel_N_m: float, m_sprung_corner_kg: float, motion_ratio: float) -> float:
    """Damping ratio at the wheel.

    Damper rate is quoted at the damper; like the spring, it gets divided by
    MR². We use the *average* of low-speed compression and rebound for the
    headline damping ratio because that's the regime that dominates ride.
    """
    if m_sprung_corner_kg <= 0 or k_wheel_N_m <= 0:
        return 0.0
    c_at_wheel = c_Ns_m / (motion_ratio ** 2)
    c_critical = 2.0 * math.sqrt(k_wheel_N_m * m_sprung_corner_kg)
    return c_at_wheel / c_critical


def compute(setup: VehicleSetup) -> SuspensionDerived:
    mg = setup.mass_geometry
    sus = setup.suspension

    # --- Mass split ----------------------------------------------------------
    sprung_mass = mg.total_mass_kg - mg.unsprung_mass_front_kg - mg.unsprung_mass_rear_kg
    # Approximate sprung-mass distribution as the static weight distribution.
    sprung_front = sprung_mass * (mg.weight_dist_front_pct / 100.0)
    sprung_rear = sprung_mass - sprung_front

    sprung_corner_front_kg = sprung_front / 2.0
    sprung_corner_rear_kg = sprung_rear / 2.0

    # --- Wheel rates ---------------------------------------------------------
    k_wheel_f = _wheel_rate_corner(sus.spring_rate_front_N_mm, sus.motion_ratio_front)
    k_wheel_r = _wheel_rate_corner(sus.spring_rate_rear_N_mm, sus.motion_ratio_rear)

    # --- Roll stiffness ------------------------------------------------------
    # From the springs: K = k_wheel * t² / 2 per axle (two springs across a track).
    track_f_m = mg.track_front_mm / 1000.0
    track_r_m = mg.track_rear_mm / 1000.0
    k_roll_f_springs = k_wheel_f * (track_f_m ** 2) / 2.0
    k_roll_r_springs = k_wheel_r * (track_r_m ** 2) / 2.0

    k_roll_f_arb = _arb_roll_stiffness_Nm_rad(sus.arb_front_Nm_deg, sus.arb_motion_ratio_front)
    k_roll_r_arb = _arb_roll_stiffness_Nm_rad(sus.arb_rear_Nm_deg, sus.arb_motion_ratio_rear)

    k_roll_f_total = k_roll_f_springs + k_roll_f_arb
    k_roll_r_total = k_roll_r_springs + k_roll_r_arb
    k_roll_total = k_roll_f_total + k_roll_r_total

    # --- Roll-axis geometry --------------------------------------------------
    L = mg.wheelbase_mm / 1000.0
    # CG longitudinal position from front axle (m).
    a = L * (1.0 - mg.weight_dist_front_pct / 100.0)
    b = L - a
    h_RCf = sus.roll_center_front_mm / 1000.0
    h_RCr = sus.roll_center_rear_mm / 1000.0
    h_cg = mg.cg_height_mm / 1000.0

    # Roll axis is a straight line between front and rear RCs. Its height at
    # the longitudinal location of the sprung CG (assumed ≈ total CG):
    h_roll_axis_at_cg = h_RCf + (a / L) * (h_RCr - h_RCf)
    h_s_above_RA = max(h_cg - h_roll_axis_at_cg, 1e-3)

    # --- Ride frequencies & damping -----------------------------------------
    fr_f = _ride_frequency_hz(k_wheel_f, sprung_corner_front_kg)
    fr_r = _ride_frequency_hz(k_wheel_r, sprung_corner_rear_kg)

    # Average of low-speed comp + rebound, at the damper.
    c_front_avg = 0.5 * (sus.damper_front.low_speed_comp_Ns_m + sus.damper_front.low_speed_reb_Ns_m)
    c_rear_avg = 0.5 * (sus.damper_rear.low_speed_comp_Ns_m + sus.damper_rear.low_speed_reb_Ns_m)
    zeta_f = _damping_ratio(c_front_avg, k_wheel_f, sprung_corner_front_kg, sus.motion_ratio_front)
    zeta_r = _damping_ratio(c_rear_avg, k_wheel_r, sprung_corner_rear_kg, sus.motion_ratio_rear)

    # --- Roll gradient -------------------------------------------------------
    # φ_roll(rad) per g = m_s * g * h_s / K_roll_total. Then to deg/g.
    if k_roll_total > 0:
        roll_grad_rad_g = sprung_mass * G * h_s_above_RA / k_roll_total
    else:
        roll_grad_rad_g = 0.0
    roll_grad_deg_g = math.degrees(roll_grad_rad_g)

    # --- Pitch gradient ------------------------------------------------------
    # ΔW per axle = m * a_x * h_cg / L. Spring compression front + rebound rear
    # at the wheel = ΔW / (2 * k_wheel_corner) each.
    k_wheel_axle_f = 2.0 * k_wheel_f
    k_wheel_axle_r = 2.0 * k_wheel_r
    delta_per_g_front = (mg.total_mass_kg * G * h_cg / L) / k_wheel_axle_f
    delta_per_g_rear = (mg.total_mass_kg * G * h_cg / L) / k_wheel_axle_r
    pitch_rad_g_raw = (delta_per_g_front + delta_per_g_rear) / L
    pitch_deg_g_raw = math.degrees(pitch_rad_g_raw)
    pitch_brake = pitch_deg_g_raw * (1.0 - sus.anti_dive_pct / 100.0)
    pitch_accel = pitch_deg_g_raw * (1.0 - sus.anti_squat_pct / 100.0)

    # --- LLT decomposition (N per g of ay) ----------------------------------
    # Sprung-mass elastic (split by roll-stiffness ratio).
    if k_roll_total > 0:
        ratio_f_elastic = k_roll_f_total / k_roll_total
    else:
        ratio_f_elastic = 0.5
    moment_roll_per_g = sprung_mass * G * h_s_above_RA  # Nm per g
    llt_f_elastic = moment_roll_per_g * ratio_f_elastic / track_f_m if track_f_m > 0 else 0.0
    llt_r_elastic = moment_roll_per_g * (1.0 - ratio_f_elastic) / track_r_m if track_r_m > 0 else 0.0

    # Sprung-mass geometric (through the roll centers).
    # Front axle takes a fraction (b/L) of the sprung-mass cornering force,
    # acting at the front RC height. Rear takes (a/L) at the rear RC height.
    llt_f_geom = sprung_mass * G * (b / L) * h_RCf / track_f_m if track_f_m > 0 else 0.0
    llt_r_geom = sprung_mass * G * (a / L) * h_RCr / track_r_m if track_r_m > 0 else 0.0

    # Unsprung — assume the unsprung CG sits at the loaded tire radius.
    r_unsprung_m = setup.powertrain.tire_radius_mm / 1000.0
    llt_f_us = mg.unsprung_mass_front_kg * G * r_unsprung_m / track_f_m if track_f_m > 0 else 0.0
    llt_r_us = mg.unsprung_mass_rear_kg * G * r_unsprung_m / track_r_m if track_r_m > 0 else 0.0

    llt_f_total = llt_f_elastic + llt_f_geom + llt_f_us
    llt_r_total = llt_r_elastic + llt_r_geom + llt_r_us
    llt_total = llt_f_total + llt_r_total
    tlltd = 100.0 * llt_f_total / llt_total if llt_total > 0 else 50.0

    # --- Static corner loads ------------------------------------------------
    W = mg.total_mass_kg * G
    W_f = W * (mg.weight_dist_front_pct / 100.0)
    W_r = W - W_f
    # No cross-weight asymmetry yet — even split L/R.
    fz_fl = fz_fr = W_f / 2.0
    fz_rl = fz_rr = W_r / 2.0

    return SuspensionDerived(
        k_wheel_front_corner_N_m=k_wheel_f,
        k_wheel_rear_corner_N_m=k_wheel_r,
        k_roll_front_springs_Nm_rad=k_roll_f_springs,
        k_roll_rear_springs_Nm_rad=k_roll_r_springs,
        k_roll_front_arb_Nm_rad=k_roll_f_arb,
        k_roll_rear_arb_Nm_rad=k_roll_r_arb,
        k_roll_front_total_Nm_rad=k_roll_f_total,
        k_roll_rear_total_Nm_rad=k_roll_r_total,
        sprung_mass_kg=sprung_mass,
        sprung_mass_front_kg=sprung_front,
        sprung_mass_rear_kg=sprung_rear,
        h_roll_axis_at_cg_m=h_roll_axis_at_cg,
        h_sprung_above_roll_axis_m=h_s_above_RA,
        ride_freq_front_hz=fr_f,
        ride_freq_rear_hz=fr_r,
        damping_ratio_front=zeta_f,
        damping_ratio_rear=zeta_r,
        roll_gradient_deg_g=roll_grad_deg_g,
        pitch_gradient_brake_deg_g=pitch_brake,
        pitch_gradient_accel_deg_g=pitch_accel,
        llt_front_elastic_N_per_g=llt_f_elastic,
        llt_rear_elastic_N_per_g=llt_r_elastic,
        llt_front_geometric_N_per_g=llt_f_geom,
        llt_rear_geometric_N_per_g=llt_r_geom,
        llt_front_unsprung_N_per_g=llt_f_us,
        llt_rear_unsprung_N_per_g=llt_r_us,
        llt_front_total_N_per_g=llt_f_total,
        llt_rear_total_N_per_g=llt_r_total,
        tlltd_front_pct=tlltd,
        fz_static_fl_N=fz_fl,
        fz_static_fr_N=fz_fr,
        fz_static_rl_N=fz_rl,
        fz_static_rr_N=fz_rr,
    )
