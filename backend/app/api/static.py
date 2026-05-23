from fastapi import APIRouter

from app.models import StaticAnalysis, VehicleSetup
from app.physics import static_analysis

router = APIRouter(prefix="/static", tags=["static"])


@router.post("", response_model=StaticAnalysis)
def post_static(setup: VehicleSetup) -> StaticAnalysis:
    return static_analysis.compute(setup)
