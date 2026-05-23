from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.models import SweepResult, VehicleSetup
from app.physics import sweep

router = APIRouter(prefix="/sweep", tags=["sweep"])


class SweepRequest(BaseModel):
    setup: VehicleSetup
    parameter_path: str = Field(
        description="Dot-separated path into the setup, e.g. 'suspension.arb_front_Nm_deg'."
    )
    values: list[float]
    include_lap: bool = True


@router.post("", response_model=SweepResult)
def post_sweep(req: SweepRequest) -> SweepResult:
    try:
        return sweep.run(req.setup, req.parameter_path, req.values, include_lap=req.include_lap)
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Bad parameter path: {e}") from e
