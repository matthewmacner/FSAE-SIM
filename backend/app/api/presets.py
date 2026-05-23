"""Preset loader.

Reads JSON files from ../presets relative to the backend dir. The schema
inferred from the JSON is validated against VehicleSetup so a bad preset
fails loud instead of polluting the UI with NaNs.
"""

from __future__ import annotations

import json
from pathlib import Path

from fastapi import APIRouter, HTTPException

from app.models import VehicleSetup

router = APIRouter(prefix="/presets", tags=["presets"])

# backend/app/api/presets.py → backend/ → repo root → /presets
_PRESETS_DIR = Path(__file__).resolve().parents[3] / "presets"


def _list_files() -> list[Path]:
    if not _PRESETS_DIR.is_dir():
        return []
    return sorted(_PRESETS_DIR.glob("*.json"))


@router.get("")
def list_presets() -> dict[str, list[dict[str, str]]]:
    return {
        "presets": [
            {"name": p.stem, "filename": p.name} for p in _list_files()
        ]
    }


@router.get("/{name}", response_model=VehicleSetup)
def get_preset(name: str) -> VehicleSetup:
    path = _PRESETS_DIR / f"{name}.json"
    if not path.is_file():
        raise HTTPException(status_code=404, detail=f"Preset '{name}' not found")
    raw = json.loads(path.read_text(encoding="utf-8"))
    try:
        return VehicleSetup.model_validate(raw)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Preset failed schema validation: {e}") from e
