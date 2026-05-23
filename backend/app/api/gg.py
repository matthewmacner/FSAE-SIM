from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.models import GGDiagram, VehicleSetup
from app.physics import gg

router = APIRouter(prefix="/gg", tags=["gg"])


class GGRequest(BaseModel):
    setup: VehicleSetup
    speeds_ms: list[float] | None = Field(
        default=None,
        description="Speeds at which to compute envelopes. Default: 30, 50, 80 km/h.",
    )


@router.post("", response_model=GGDiagram)
def post_gg(req: GGRequest) -> GGDiagram:
    return gg.compute(req.setup, req.speeds_ms)
