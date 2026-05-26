"""
Status API endpoints for internet connectivity and WiFi status.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import timedelta

from app.db.session import get_db_session
from app.utils.timezone import now_ist
from app.models.tables import InternetStatusLog
from app.schemas.pydantic_models import StatusLogResponse, UptimeResponse

router = APIRouter()


@router.get("/current", response_model=StatusLogResponse | None)
async def get_current_status(session: AsyncSession = Depends(get_db_session)):
    """Get the latest internet status log entry."""
    result = await session.execute(
        select(InternetStatusLog).order_by(desc(InternetStatusLog.id)).limit(1)
    )
    row = result.scalar_one_or_none()
    return row


@router.get("/history", response_model=list[StatusLogResponse])
async def get_status_history(
    hours: int = Query(default=24, ge=1, le=168),
    session: AsyncSession = Depends(get_db_session),
):
    """Get status history for the last N hours."""
    since = now_ist() - timedelta(hours=hours)
    result = await session.execute(
        select(InternetStatusLog)
        .where(InternetStatusLog.timestamp >= since)
        .order_by(desc(InternetStatusLog.timestamp))
    )
    return result.scalars().all()


@router.get("/uptime", response_model=UptimeResponse)
async def get_uptime(
    hours: int = Query(default=24, ge=1, le=720),
    session: AsyncSession = Depends(get_db_session),
):
    """Calculate uptime percentage over the last N hours."""
    since = now_ist() - timedelta(hours=hours)

    # Total checks in the period
    total_result = await session.execute(
        select(func.count(InternetStatusLog.id)).where(
            InternetStatusLog.timestamp >= since
        )
    )
    total_checks = total_result.scalar() or 0

    # Connected checks in the period
    connected_result = await session.execute(
        select(func.count(InternetStatusLog.id)).where(
            InternetStatusLog.timestamp >= since,
            InternetStatusLog.is_connected == True,
        )
    )
    connected_checks = connected_result.scalar() or 0

    uptime_percent = (connected_checks / total_checks * 100) if total_checks > 0 else 100.0

    return UptimeResponse(
        hours=hours,
        total_checks=total_checks,
        connected_checks=connected_checks,
        uptime_percent=round(uptime_percent, 2),
    )
