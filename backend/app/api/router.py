"""
API router that registers all endpoint groups.
"""

from fastapi import APIRouter

from app.api.status import router as status_router
from app.api.speed import router as speed_router
from app.api.alerts import router as alerts_router
from app.api.downtime import router as downtime_router
from app.api.analytics import router as analytics_router
from app.api.settings import router as settings_router

api_router = APIRouter()

api_router.include_router(status_router, prefix="/status", tags=["Status"])
api_router.include_router(speed_router, prefix="/speed", tags=["Speed"])
api_router.include_router(alerts_router, prefix="/alerts", tags=["Alerts"])
api_router.include_router(downtime_router, prefix="/downtime", tags=["Downtime"])
api_router.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(settings_router, prefix="/settings", tags=["Settings"])
