# FSAE-Sim backend

FastAPI app + physics modules. Managed by [uv](https://docs.astral.sh/uv/).

## Run

```powershell
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

Then open `http://localhost:8000/docs` for the auto-generated Swagger UI.

## Test

```powershell
uv run pytest
```

## Layout

```
app/
  main.py            FastAPI app + CORS + router registration
  models/
    vehicle.py       VehicleSetup Pydantic schema (the input)
    outputs.py       Result schemas (one per endpoint)
  physics/
    tire.py          Load-sensitive linear / simplified Pacejka
    suspension.py    Wheel rates, roll stiffness, TLLTD, anti-dive/squat
    aero.py          Downforce, drag, balance shift with speed
    powertrain.py    Torque curve → wheel force, gearing
    static_analysis.py
    longitudinal.py  Acceleration sim (75 m)
    lateral.py       Skidpad (steady-state)
    gg.py            G-G diagram envelope at multiple speeds
    lapsim.py        Quasi-steady-state lap sim
    sweep.py         One-parameter sensitivity sweep
  api/
    *.py             One router file per endpoint group
```

Physics derivations live in [`../docs/physics.md`](../docs/physics.md).
