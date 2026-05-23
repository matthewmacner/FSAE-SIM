# Physics models and assumptions

This document is the source of truth for what the simulator actually computes.
If a tab in the UI surprises you, the answer is here.

All formulae use SI: m, kg, s, N, rad. The Pydantic schema accepts more
intuitive units (mm, N/mm, Nm/deg, %) and the physics modules convert at the
boundary.

---

## 1. Tire model

Two interchangeable models live behind a common interface in
[`physics/tire.py`](../backend/app/physics/tire.py).

### Peak grip — load-sensitive

The peak force a single tire can produce at vertical load `Fz` is

$$ F_\text{max}(F_z) = \mu_0 \cdot F_{z,\text{ref}} \cdot \left( \frac{F_z}{F_{z,\text{ref}}} \right)^n $$

where:

- `μ₀` is the peak friction coefficient at the reference load,
- `F_{z,ref}` is the reference vertical load (typical: 1100 N for a 16" R25B),
- `n ∈ (0.5, 1.0]` is the load-sensitivity exponent. `n < 1` means grip per
  unit load drops as load rises. This is the dominant nonlinearity that
  motivates load-transfer minimization in setup work.

For combined slip we use a **friction circle**: the lateral and longitudinal
forces are constrained by `F_x² + F_y² ≤ F_max²`. The true ellipse with
combined-slip coupling is a v2 concern.

### Per-direction force

For lateral force at slip angle `α`:

- if Pacejka coefficients `B, C, E` are present, use
  `F_y = D sin(C arctan(B α - E (B α - arctan(B α))))` with `D = F_max`.
- otherwise, use a bilinear model: linear with cornering stiffness `C_α`
  (scaled by `Fz/Fz_ref`) up to the optimal slip angle, then clamped to peak.

For longitudinal force at slip ratio `κ`, the same shape with a default
longitudinal stiffness `C_κ ≈ 10·Fz` (a textbook rule-of-thumb).

---

## 2. Load transfer decomposition

Computed in [`physics/suspension.py`](../backend/app/physics/suspension.py).
Lateral load transfer per axle is decomposed into three contributions, all
linear in lateral acceleration `a_y`:

### 2.1 Sprung — elastic

The sprung mass's cornering force creates a roll moment about the roll axis.
That moment is reacted by springs and ARBs, distributed by **roll-stiffness
ratio**:

$$ \Delta W_{f,\text{elastic}} = \frac{M_\text{roll} \cdot K_{\phi f}}{(K_{\phi f} + K_{\phi r}) \cdot t_f} $$

with

$$ M_\text{roll} = m_s \cdot a_y \cdot h_{s/RA} $$

`h_{s/RA}` is the height of the sprung CG above the **roll axis** — the
straight line joining front and rear roll centers, evaluated at the sprung
CG's longitudinal location.

### 2.2 Sprung — geometric

The portion of the sprung mass's cornering force that reacts through the
suspension links (not the springs) projects onto the roll-center heights:

$$ \Delta W_{f,\text{geom}} = m_s \cdot a_y \cdot \frac{b}{L} \cdot \frac{h_{RCf}}{t_f} $$

where `b/L` is the static fraction of sprung weight on the front axle. Lower
roll centers → less geometric LLT.

### 2.3 Unsprung

The unsprung mass acts directly at the wheel center:

$$ \Delta W_{f,\text{us}} = m_{us,f} \cdot a_y \cdot \frac{r_{us}}{t_f} $$

with `r_{us}` ≈ loaded tire radius.

### 2.4 TLLTD

Total per-axle LLT is the sum of the three. **TLLTD** (Total Lateral Load
Transfer Distribution) is the front axle's share:

$$ \text{TLLTD} = \frac{\Delta W_f}{\Delta W_f + \Delta W_r} $$

Raising TLLTD pushes the front axle further past the load-sensitivity knee,
shrinking front grip relative to rear → understeer.

### Spring + ARB stiffness

Wheel rate from spring rate and motion ratio:

$$ k_\text{wheel} = \frac{k_\text{spring}}{\text{MR}^2} $$

(MR = wheel travel ÷ spring travel.)

Roll stiffness from springs at one axle (two springs separated by track `t`):

$$ K_{\phi,\text{springs}} = \frac{k_\text{wheel} \cdot t^2}{2} $$

ARB roll stiffness at the axle:

$$ K_{\phi,\text{ARB}} = \frac{k_\text{ARB,bar} \cdot (180/\pi)}{\text{MR}^2} $$

with the published Nm/deg converted to Nm/rad first.

---

## 3. Aero

Constant `CL·A` and `CD·A`, with the textbook v² law:

$$ F = \tfrac{1}{2} \rho v^2 \cdot (CL\!A\,\text{or}\,CD\!A) $$

No ride-height map in v1 — `CL·A` is fixed regardless of attitude. This is
acceptable for setup-sensitivity work; a real RH map would shift the
"balance vs speed" chart at the front of the static tab.

Aero balance (% on front axle) is `CL·A_f / (CL·A_f + CL·A_r)`.

---

## 4. Powertrain

[`physics/powertrain.py`](../backend/app/physics/powertrain.py).

Engine RPM at speed `v` and gear ratio `r_gear`:

$$ \text{RPM} = \frac{v}{r_\text{tire}} \cdot r_\text{gear} \cdot r_\text{final drive} \cdot \frac{60}{2\pi} $$

Wheel force in that gear:

$$ F_\text{wheel} = \frac{T_\text{engine}(\text{RPM}) \cdot r_\text{gear} \cdot r_\text{final drive} \cdot \eta}{r_\text{tire}} $$

The simulator picks whichever gear produces the highest wheel force without
exceeding redline.

**Launch simplification:** at low road speed the computed engine RPM goes
below the bottom of the published torque curve. We clamp the effective RPM
at the curve's minimum value, treating the clutch as slipping (or the
inverter as torque-limited for an EV). This is the standard FS launch model.

---

## 5. Acceleration sim (75 m)

Forward Euler at 200 Hz in [`physics/longitudinal.py`](../backend/app/physics/longitudinal.py).
Per step:

1. Aero drag and downforce at current `v`.
2. Longitudinal weight transfer using the previous step's `a_x` as the
   estimate: `ΔW = m · a_x · h_cg / L`. Front loses, rear gains.
3. Rear axle vertical load = static + downforce + ΔW. Per-tire `F_x,max`
   from the tire model.
4. Powertrain wheel force at `v`.
5. `F_drive = min(traction_limited, power_limited)`.
6. `a_x = (F_drive − F_drag − F_rolling) / m`.
7. Integrate `v` and `x` forward.

The trace records `limited_by` per step so the UI can shade
traction-limited vs power-limited regions. **Drive is assumed RWD**, which is
the dominant FS layout. AWD support is a future fork in step 3.

---

## 6. Skidpad (steady-state lateral)

[`physics/lateral.py`](../backend/app/physics/lateral.py).

The constraint pair on the FS R = 15.25 m circle is:

- kinematic: `v² = a_y · R`
- grip: `a_y = f(v)` (downforce-loaded)

Iterate the two until consistent. Within `f(v)` we run another loop on
`a_y` itself, recomputing LLT and the per-tire grip envelope until the
implied `a_y_achievable = ΣF_y / (m·g)` equals the assumed `a_y`. Lap time
is `2πR / v`.

---

## 7. G-G diagram

[`physics/gg.py`](../backend/app/physics/gg.py). At each requested speed:

1. Find `a_y_max` (pure lateral, iterate weight transfer).
2. Sweep `λ ∈ [0, 1]`: lateral force per tire `= λ · F_max`, leaving
   `F_max · sqrt(1 - λ²)` for longitudinal.
3. Drive envelope: sum the longitudinal residual over **rear tires only**.
4. Brake envelope: sum over **all four tires** (we assume ideal bias).
5. Iterate the longitudinal weight transfer until consistent.

Mirror the result around `a_y = 0` for symmetry, sort points by angle for
clean polygon rendering.

**Distribution assumption:** lateral load is shared across tires
proportionally to each tire's load-sensitive peak (the "even pressure"
approximation). This is conservative for an oversteer-prone car and slightly
optimistic for an understeer-prone one, but the difference is small at FS
scale.

---

## 8. Lap simulation (quasi-steady-state)

[`physics/lapsim.py`](../backend/app/physics/lapsim.py). Track input is
`(distance, curvature)` samples. The standard QSS algorithm:

1. **Grip limit at each point** — find `v` such that `a_y_grip(v) = v² · |κ|`.
2. **Forward pass** —
   `v_f[i] = min(v_grip[i], √(v_f[i−1]² + 2·a_x,drive · ds))`,
   where `a_x,drive` uses combined slip at the current cornering load.
3. **Backward pass** — same with the braking limit, working from the end.
4. Final speed at each point is `min(forward, backward)`.
5. Lap time is `Σ ds / v_avg per segment`.

Energy per lap is the integral of tractive force × distance over driving
segments. For combustion we divide by a fixed thermal efficiency (0.30) and
the drivetrain efficiency to back out fuel volume; for EV we divide energy
by drivetrain efficiency to get battery kWh. Endurance scales the per-lap
numbers by `22 km / track_length`.

---

## 9. Sensitivity sweep

[`physics/sweep.py`](../backend/app/physics/sweep.py) clones the setup,
overrides one dotted path (e.g. `suspension.arb_front_Nm_deg`), and re-runs
skidpad + accel + static for each value in the requested list. Lap sim is
opt-in because it dominates the runtime.

---

## 10. What's *not* modeled in v1

- **Transient dynamics.** No yaw rate, no sideslip, no lag — quasi-steady
  only. Fine for setup sensitivity work; not fine for control-design work.
- **Combined-slip ellipse.** We use a circle (friction circle), not a
  Pacejka combined-slip ellipse. Real tires have slightly more lateral
  budget at modest longitudinal slip than the circle predicts.
- **Camber and toe gain.** Camber and toe are recorded for display but
  don't yet feed into the tire force model.
- **Damper effect on lap time.** Dampers contribute to ride freq/damping
  ratio in the static output but not to the QSS lap sim (which is
  velocity-independent on a per-point basis).
- **Aero ride-height map.** `CL·A` is constant; real cars lose front
  downforce at high speed/pitch.
- **AWD or four-wheel drive.** Acceleration and lap sim use rear-only
  traction. Set both axles as driven by editing
  [`longitudinal.py`](../backend/app/physics/longitudinal.py).
- **Driver model.** We assume an ideal driver — no traffic-cone penalties,
  no anticipation lag, no consistency drop over the endurance.
