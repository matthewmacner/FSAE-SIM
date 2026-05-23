"""Smoke test — load the combustion preset and run every physics module.

These aren't tight regression tests; they assert that results land in the
physical sane-range for an FS car so a bad refactor gets caught quickly.
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from app.models import VehicleSetup
from app.physics import gg, lapsim, lateral, longitudinal, static_analysis, sweep

PRESETS = Path(__file__).resolve().parents[2] / "presets"


@pytest.fixture
def combustion() -> VehicleSetup:
    raw = json.loads((PRESETS / "combustion_200kg.json").read_text(encoding="utf-8"))
    return VehicleSetup.model_validate(raw)


@pytest.fixture
def ev() -> VehicleSetup:
    raw = json.loads((PRESETS / "ev_180kg.json").read_text(encoding="utf-8"))
    return VehicleSetup.model_validate(raw)


def test_static_combustion(combustion: VehicleSetup) -> None:
    s = static_analysis.compute(combustion)
    # Front + rear axle load ≈ mg (within floating-point fuzz).
    total = s.front_axle_load_N + s.rear_axle_load_N
    assert abs(total - combustion.mass_geometry.total_mass_kg * 9.81) < 1.0
    # TLLTD typically 45–65% on a FS car with these params.
    assert 40 < s.tlltd_front_pct < 75
    # Roll gradient typically 0.3–1.5 deg/g.
    assert 0.2 < s.roll_gradient_deg_g < 2.5
    # Ride frequencies in the 2–4 Hz ballpark.
    assert 1.5 < s.front_ride_freq_hz < 5.0
    assert 1.5 < s.rear_ride_freq_hz < 5.0


def test_skidpad(combustion: VehicleSetup) -> None:
    r = lateral.skidpad(combustion)
    # FS skidpad times are around 4.5–5.5 s.
    assert 3.5 < r.lap_time_s < 6.5
    assert 1.2 < r.lat_g < 2.2


def test_accel(combustion: VehicleSetup) -> None:
    r = longitudinal.simulate(combustion)
    # FS 75 m is typically 3.5–5 s.
    assert 3.0 < r.time_75m_s < 6.0
    assert r.top_speed_75m_ms > 15.0
    assert len(r.trace) > 50


def test_gg(combustion: VehicleSetup) -> None:
    r = gg.compute(combustion)
    assert len(r.envelopes) >= 3
    assert r.peak_lat_g > 1.0
    assert r.peak_long_accel_g > 0.5
    assert r.peak_long_brake_g > 1.0


def test_lap(combustion: VehicleSetup) -> None:
    r = lapsim.simulate(combustion)
    # Stylized track should be ~1 km; lap times in the 65–90 s window.
    assert 800 < r.track_length_m < 1300
    assert 50 < r.lap_time_s < 120
    assert r.endurance_fuel_l is not None
    assert 1.0 < r.endurance_fuel_l < 12.0


def test_ev_battery(ev: VehicleSetup) -> None:
    r = lapsim.simulate(ev)
    assert r.endurance_battery_kwh is not None
    assert 1.0 < r.endurance_battery_kwh < 15.0


def test_sweep_arb(combustion: VehicleSetup) -> None:
    r = sweep.run(
        combustion,
        "suspension.arb_front_Nm_deg",
        values=[40.0, 80.0, 120.0],
        include_lap=False,
    )
    assert len(r.points) == 3
    # Increasing front ARB should push TLLTD up monotonically.
    tlltds = [p.tlltd_front_pct for p in r.points]
    assert tlltds[0] < tlltds[1] < tlltds[2]
