from fastapi import APIRouter

from app.models import SkidpadResult, VehicleSetup
from app.physics import lateral

router = APIRouter(prefix="/skidpad", tags=["skidpad"])


@router.post("", response_model=SkidpadResult)
def post_skidpad(setup: VehicleSetup) -> SkidpadResult:
    return lateral.skidpad(setup)
