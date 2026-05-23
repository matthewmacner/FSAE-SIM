from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.models import LapResult, VehicleSetup
from app.physics import lapsim

router = APIRouter(prefix="/lap", tags=["lap"])


class TrackInput(BaseModel):
    distance_m: list[float]
    curvature_1_m: list[float]


class LapRequest(BaseModel):
    setup: VehicleSetup
    track: TrackInput | None = Field(default=None, description="Override default FS autocross track.")


@router.post("", response_model=LapResult)
def post_lap(req: LapRequest) -> LapResult:
    if req.track is None:
        return lapsim.simulate(req.setup)
    custom_track = lapsim.Track(
        distance_m=req.track.distance_m,
        curvature_1_m=req.track.curvature_1_m,
    )
    return lapsim.simulate(req.setup, custom_track)
