"""Tire model.

Two interchangeable models behind a common interface:

* **Load-sensitive linear** (default): peak grip force per tire scales with
  vertical load as `mu * Fz_ref * (Fz / Fz_ref)^n`. The exponent `n < 1`
  captures the well-known drop in grip per unit load as a tire is loaded up.
  This is the dominant nonlinearity that matters for setup analysis (it's
  what makes load transfer cost you grip).

* **Simplified Pacejka** (optional): Pacejka MF-style `F = D sin(C arctan(B α
  - E (B α - arctan(B α))))`. Used only if `pacejka_B`, `_C`, `_E` are
  populated on the tire schema. Same load sensitivity applied to D.

Both models share a common `friction_circle` combined-slip approximation: the
available longitudinal and lateral forces lie on (or inside) a circle of
radius `F_max(Fz)`. This is acceptable for steady-state lap-sim work; the
real ellipse with combined-slip coupling is a v2 concern.
"""

from __future__ import annotations

import math
from dataclasses import dataclass

from app.models import Tire


@dataclass
class TireForceLimits:
    """The peak grip force a tire can produce at this vertical load."""

    fz_N: float
    fmax_N: float  # combined-slip envelope radius
    fy_max_N: float  # pure lateral (alpha = optimal)
    fx_max_N: float  # pure longitudinal (kappa = optimal)


def grip_at_load(tire: Tire, fz_N: float) -> TireForceLimits:
    """Peak force envelope for a single tire at vertical load `fz_N`.

    With load-sensitive scaling:
        F_max(Fz) = mu0 * Fz_ref * (Fz / Fz_ref)^n
    so peak *coefficient* mu(Fz) = F_max / Fz = mu0 * (Fz / Fz_ref)^(n-1),
    which decreases with Fz when n < 1.
    """
    if fz_N <= 0:
        return TireForceLimits(fz_N=0.0, fmax_N=0.0, fy_max_N=0.0, fx_max_N=0.0)

    ratio = fz_N / tire.reference_load_N
    fmax = tire.peak_mu * tire.reference_load_N * (ratio ** tire.load_sensitivity_exp)

    # For v1 we assume isotropic — fy_max and fx_max share the same peak.
    # The optional Pacejka path uses the same peak D = fmax.
    return TireForceLimits(fz_N=fz_N, fmax_N=fmax, fy_max_N=fmax, fx_max_N=fmax)


def lateral_force(tire: Tire, fz_N: float, slip_angle_deg: float) -> float:
    """Lateral force at a given slip angle and vertical load.

    Picks Pacejka if coefficients are present, otherwise uses a saturating
    bilinear model that ramps linearly with cornering stiffness up to the
    peak at `optimal_slip_angle_deg`, then holds the peak.
    """
    limits = grip_at_load(tire, fz_N)
    if limits.fmax_N <= 0:
        return 0.0

    alpha = slip_angle_deg
    sign = 1.0 if alpha >= 0 else -1.0
    alpha = abs(alpha)

    if tire.pacejka_B is not None and tire.pacejka_C is not None and tire.pacejka_E is not None:
        B, C, E = tire.pacejka_B, tire.pacejka_C, tire.pacejka_E
        alpha_rad = math.radians(alpha)
        x = B * alpha_rad
        fy = limits.fy_max_N * math.sin(C * math.atan(x - E * (x - math.atan(x))))
        return sign * fy

    # Bilinear fallback. Linear region uses scaled cornering stiffness:
    #   F_y_linear = C_α * alpha   (per Pacejka linearization)
    # Cornering stiffness is quoted at reference load; scale by Fz/Fz_ref.
    c_alpha = tire.cornering_stiffness_N_deg * (fz_N / tire.reference_load_N)
    linear_force = c_alpha * alpha
    if alpha >= tire.optimal_slip_angle_deg:
        return sign * limits.fy_max_N
    # Smooth ramp to peak — linear up to the peak, then clamp.
    ramp = min(linear_force, limits.fy_max_N)
    return sign * ramp


def longitudinal_force(tire: Tire, fz_N: float, slip_ratio: float) -> float:
    """Longitudinal force at a slip ratio (positive = drive, negative = brake).

    Mirrors the lateral model with the optimal_slip_ratio peak.
    """
    limits = grip_at_load(tire, fz_N)
    if limits.fmax_N <= 0:
        return 0.0

    kappa = slip_ratio
    sign = 1.0 if kappa >= 0 else -1.0
    kappa = abs(kappa)

    # Estimated longitudinal stiffness: a common rule-of-thumb is C_κ ≈ 10 * Fz
    # (per unit slip ratio). Use that with load scaling.
    c_kappa = 10.0 * fz_N
    linear_force = c_kappa * kappa
    if kappa >= tire.optimal_slip_ratio:
        return sign * limits.fx_max_N
    return sign * min(linear_force, limits.fx_max_N)


def friction_circle_available_fy(
    tire: Tire, fz_N: float, fx_used_N: float
) -> float:
    """How much lateral grip is left given some longitudinal force already used.

    Returns 0 if the tire is already at its longitudinal limit.
    """
    limits = grip_at_load(tire, fz_N)
    fmax = limits.fmax_N
    if fmax <= 0 or abs(fx_used_N) >= fmax:
        return 0.0
    return math.sqrt(fmax * fmax - fx_used_N * fx_used_N)


def friction_circle_available_fx(
    tire: Tire, fz_N: float, fy_used_N: float
) -> float:
    limits = grip_at_load(tire, fz_N)
    fmax = limits.fmax_N
    if fmax <= 0 or abs(fy_used_N) >= fmax:
        return 0.0
    return math.sqrt(fmax * fmax - fy_used_N * fy_used_N)
