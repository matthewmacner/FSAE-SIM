from fastapi import APIRouter

from app.models import AccelResult, VehicleSetup
from app.physics import longitudinal

router = APIRouter(prefix="/accel", tags=["accel"])


@router.post("", response_model=AccelResult)
def post_accel(setup: VehicleSetup) -> AccelResult:
    return longitudinal.simulate(setup)
