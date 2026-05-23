"""FastAPI entry point.

Run with:
    uv run uvicorn app.main:app --reload --port 8000

Routes are mounted from app.api.*; each physics module is wrapped by a thin
router that takes a VehicleSetup and returns the corresponding result schema.
"""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import accel, gg, lap, presets, skidpad, static, sweep

app = FastAPI(
    title="FSAE-Sim",
    description="Vehicle dynamics + setup analysis for Formula Student.",
    version="0.1.0",
)

# In dev the Vite frontend lives on a different port. Allow everything here;
# production deploy can tighten this.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(static.router)
app.include_router(gg.router)
app.include_router(skidpad.router)
app.include_router(accel.router)
app.include_router(lap.router)
app.include_router(sweep.router)
app.include_router(presets.router)
