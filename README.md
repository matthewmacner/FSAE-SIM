# FSAE-Sim

Vehicle dynamics and setup analysis for Formula Student cars. Predicts performance
across the dynamic events (skidpad, acceleration, autocross, endurance) from a
parameter sheet, and lets you sweep one variable at a time to see what it does
to lap time.

> Status: v1 scaffold. Static analysis, G-G, skidpad, and acceleration are
> fully wired. Lap sim and sweep are functional but conservative — see the
> physics docs for the assumptions baked in.

![screenshot placeholder](docs/screenshot.png)

---

## Quick start

You need Python 3.11+ and Node 20+. The backend uses [`uv`](https://docs.astral.sh/uv/);
install it once with `irm https://astral.sh/uv/install.ps1 | iex` (Windows) or
`curl -LsSf https://astral.sh/uv/install.sh | sh` (mac/linux).

**Terminal 1 — backend:**

```powershell
cd backend
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — frontend:**

```powershell
cd frontend
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). The frontend talks
to the backend on `localhost:8000` by default — override with
`VITE_API_BASE` in a `.env` file if you need to.

---

## What's in the box

**Vehicle parameters** are grouped into six collapsible panels on the left:
mass & geometry, suspension, tires, aero, powertrain, brakes. Every slider has
a tooltip explaining what the number means and a realistic FS range.

**Results tabs** in the center:

| Tab | What it shows |
|---|---|
| Static | Corner weights, cross-weight %, TLLTD, roll/pitch gradients, natural frequencies, aero vs mechanical balance at speed. |
| G-G | Predicted combined lateral/longitudinal envelope at multiple speeds, accounting for downforce-loaded grip. |
| Skidpad | Steady-state lateral g and per-tire load on the FS 15.25 m radius circle, with predicted lap time. |
| Acceleration | 75 m straight-line trace with traction-limited and power-limited regions highlighted. |
| Lap Sim | Quasi-steady-state lap on a configurable track (default = FS autocross). Speed + g + tire-load traces. |
| Sweep | Pick one parameter, sweep it across a range, see lap/skidpad/accel/balance deltas. |

**Balance summary** on the right keeps the three numbers you most often want
to see when changing something: TLLTD, aero balance at 60 km/h, and predicted
understeer gradient.

**Save / load / compare:** Export the current setup as JSON, drop it back in
later, or load two and see only the params that differ.

---

## Physics in 30 seconds

The simulator uses a quasi-steady-state approach — at every point on a track,
solve the steady-state force balance to find the max speed the tires can hold,
then forward/backward integrate for acceleration and braking limits. This is
the standard approach for FS-scale lap simulation and is plenty for setup work.

Load transfer is decomposed into sprung (springs + ARB elastic), geometric
(roll center), and unsprung components. The tire model is a load-sensitive
linear model by default with an optional simplified Pacejka curve. Downforce
scales with v² and feeds back into tire normal load.

Full details and assumptions are in [docs/physics.md](docs/physics.md).

---

## Project layout

```
backend/   FastAPI + physics modules (uv-managed Python project)
frontend/  React + Vite + TS + Tailwind + Zustand + Plotly
presets/   Example FS car setups (combustion 200 kg, EV 180 kg)
docs/      Physics derivations and assumptions
```

## License

MIT.
