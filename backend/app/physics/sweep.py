"""One-parameter sensitivity sweep.

Pick any path into the VehicleSetup tree (e.g. `suspension.arb_front_Nm_deg`)
and sweep it across a list of values. For each value we re-run skidpad,
acceleration, lap sim, and static so the user can see how every event-level
number moves together.
"""

from __future__ import annotations

import copy
from typing import Any

from app.models import SweepPoint, SweepResult, VehicleSetup
from app.physics import lapsim, lateral, longitudinal, static_analysis


def _set_path(d: dict[str, Any], path: str, value: float) -> None:
    parts = path.split(".")
    cursor: Any = d
    for p in parts[:-1]:
        if p not in cursor:
            raise KeyError(f"Parameter path segment '{p}' not found in setup")
        cursor = cursor[p]
    last = parts[-1]
    if last not in cursor:
        raise KeyError(f"Parameter path segment '{last}' not found in setup")
    cursor[last] = value


def _get_path(d: dict[str, Any], path: str) -> Any:
    cursor: Any = d
    for p in path.split("."):
        cursor = cursor[p]
    return cursor


def run(
    setup: VehicleSetup,
    parameter_path: str,
    values: list[float],
    include_lap: bool = True,
) -> SweepResult:
    base_dict = setup.model_dump()
    baseline = _get_path(base_dict, parameter_path)

    points: list[SweepPoint] = []
    for v in values:
        modified = copy.deepcopy(base_dict)
        _set_path(modified, parameter_path, v)
        modified_setup = VehicleSetup.model_validate(modified)

        skid = lateral.skidpad(modified_setup)
        accel = longitudinal.simulate(modified_setup)
        stat = static_analysis.compute(modified_setup)

        lap_time: float | None = None
        if include_lap:
            lap = lapsim.simulate(modified_setup)
            lap_time = lap.lap_time_s

        points.append(
            SweepPoint(
                value=v,
                lap_time_s=lap_time,
                skidpad_time_s=skid.lap_time_s,
                accel_75m_s=accel.time_75m_s,
                tlltd_front_pct=stat.tlltd_front_pct,
                understeer_gradient_deg_g=stat.understeer_gradient_deg_g,
            )
        )

    return SweepResult(
        parameter_path=parameter_path,
        baseline_value=float(baseline),
        sweep_values=values,
        points=points,
    )
