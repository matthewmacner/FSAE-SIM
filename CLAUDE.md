# FSAE-Sim — project context

Context for any future Claude session in this repo. Read this before making
structural or visual changes.

## What this is

A vehicle-dynamics and setup-analysis web app for Formula Student / FSAE
teams. Takes a car setup as input (mass, suspension, tires, aero, powertrain,
brakes), runs quasi-steady-state simulations, and predicts performance across
the dynamic events: skidpad, 75 m acceleration, autocross / lap sim, and the
22 km endurance.

Owner: Matt (also runs the Althea/CPAP project in a sibling repo).

## Stack

- **Backend**: FastAPI + Pydantic v2 + NumPy/SciPy, managed by `uv`.
- **Frontend**: React 18 + Vite + TypeScript + Tailwind + Zustand + Plotly.

System Python is 3.14.5 on this Windows box. `uv`'s managed-Python install
fails here with *"Missing expected target directory for Python minor version
link"* — falls back to system Python via
`uv sync --python <path> --python-preference only-system`. If the bug ever
clears, the pyproject `requires-python = ">=3.11"` is permissive enough.

## How to run

Two terminals.

```powershell
# Terminal 1 — backend
cd backend
$env:Path = "C:\Users\matth\.local\bin;$env:Path"   # only if uv isn't on PATH yet
uv run uvicorn app.main:app --reload --port 8000
```

```powershell
# Terminal 2 — frontend
cd frontend
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api/*` to `localhost:8000`.

Smoke test the backend with `uv run pytest` (7 tests cover both presets end
to end).

## Layout

```
backend/
  pyproject.toml            uv project, system-Python pinned
  app/
    main.py                 FastAPI app + CORS + router registration
    models/
      vehicle.py            VehicleSetup Pydantic schema (the input)
      outputs.py            Result schemas (one per endpoint)
    physics/
      tire.py               Load-sensitive linear (default) + optional Pacejka
      suspension.py         Wheel rates, roll stiffness, TLLTD with full
                            elastic/geometric/unsprung decomposition
      aero.py               v² downforce + drag (no ride-height map yet)
      powertrain.py         Torque curve → wheel force, with clutch-slip launch
      static_analysis.py    Aggregates the steady-state outputs
      longitudinal.py       75 m accel forward Euler with weight transfer (RWD)
      lateral.py            Skidpad steady-state + general max_lat_g_at_speed
      gg.py                 G-G envelope at multiple speeds (λ sweep)
      lapsim.py             Quasi-steady-state lap simulator
      sweep.py              One-parameter sensitivity sweep
    api/                    Thin FastAPI routers, one per physics module
  tests/test_smoke.py       End-to-end sanity tests (7 passing)
frontend/
  src/
    App.tsx                 Three-column layout
    store.ts                Zustand single-source-of-truth
    api.ts                  Typed wrappers for backend endpoints
    types.ts                Mirror of backend Pydantic schemas
    format.ts               Display formatters + units toggle
    panels/                 One per param group: MassGeometry, Suspension,
                            Tire, Aero, Powertrain, Brakes
    components/             TopBar, ParameterPanel, ParamSlider, Tooltip,
                            BalanceSummary, ResultsTabs, Plot
    components/tabs/        StaticTab, GGTab, SkidpadTab, AccelTab,
                            LapSimTab, SweepTab
presets/                    JSON setups (combustion_200kg, ev_180kg)
docs/physics.md             Every formula and assumption — source of truth
```

## Design rules

- **Dark mode primary.** Canvas `#0b1015`, panels `#141a22` / `#1c242f`.
- **Palette**: teal accent `#5ee0c4` is the primary action / chart-line color.
  Amber `#ffb86b` for secondary series. Blue `#7eb6ff` for neutral info.
  Red `#ff5d6c` only for true alerts.
- **Typography**: Inter for UI, JetBrains Mono for tabular numerics. `stat`
  utility class enables tabular numerics on numeric displays.
- **Charts** use Plotly's basic dist (~1 MB) wrapped in `components/Plot.tsx`
  with our theme baked in. Always extend `baseLayout` rather than passing a
  full layout from scratch.

## Known limitations (intentional for v1)

Documented in detail in [`docs/physics.md`](docs/physics.md):

- Quasi-steady-state only — no transient yaw / sideslip dynamics.
- Friction circle, not a Pacejka combined-slip ellipse.
- No aero ride-height map.
- RWD-only acceleration and lap sim (the dominant FSAE layout).
- Camber and toe are recorded but don't feed the tire force model yet.
- Dampers contribute to ride-freq / damping-ratio readouts but not to the
  QSS lap sim.

Don't pretend these are bugs and "fix" them silently — they're scope
decisions. If you reach for one of them, scope it as a v2 feature.

## Footguns

- `uv`'s managed Python install errors on this machine. Always use system
  Python (`--python-preference only-system`).
- `app` is not installed as a package (`[tool.uv] package = false`). Running
  `uv run uvicorn app.main:app` requires CWD to be `backend/`. Setting
  `$env:PYTHONPATH = ".../backend"` works for one-shot scripts.
- Vite uses `plotly.js-basic-dist-min` which has no types — there's a manual
  shim in `frontend/src/types-shims.d.ts`. Don't switch to the full plotly
  dist without verifying bundle-size budget.
- Frontend dev server proxies `/api` to `localhost:8000`. If you rename a
  backend port, update `vite.config.ts` too.
- Backend tire model expects `peak_mu * Fz_ref * (Fz/Fz_ref)^n`. Changing
  the load-sensitivity exponent moves *all* event predictions together —
  it's the single most leveraged tire parameter.
