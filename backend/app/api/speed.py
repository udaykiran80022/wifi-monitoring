"""
Speed test API endpoints.
"""

from datetime import timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, desc, cast, Date
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.models.tables import SpeedTestLog, now_ist
from app.schemas.pydantic_models import SpeedTestResponse, SpeedAverageResponse

router = APIRouter()


@router.get("/latest", response_model=SpeedTestResponse | None)
async def get_latest_speed(session: AsyncSession = Depends(get_db_session)):
    """Get the most recent speed test result."""
    result = await session.execute(
        select(SpeedTestLog).order_by(desc(SpeedTestLog.id)).limit(1)
    )
    return result.scalar_one_or_none()


@router.get("/history", response_model=list[SpeedTestResponse])
async def get_speed_history(
    days: int = Query(default=7, ge=1, le=365),
    session: AsyncSession = Depends(get_db_session),
):
    """Get speed test history for the last N days."""
    since = now_ist() - timedelta(days=days)
    result = await session.execute(
        select(SpeedTestLog)
        .where(SpeedTestLog.timestamp >= since)
        .order_by(desc(SpeedTestLog.timestamp))
    )
    return result.scalars().all()


@router.get("/averages", response_model=list[SpeedAverageResponse])
async def get_speed_averages(
    days: int = Query(default=7, ge=1, le=365),
    session: AsyncSession = Depends(get_db_session),
):
    """Get average download/upload/ping per day for the last N days."""
    since = now_ist() - timedelta(days=days)

    # Group by date and compute averages
    date_col = func.date(SpeedTestLog.timestamp).label("date")
    result = await session.execute(
        select(
            date_col,
            func.avg(SpeedTestLog.download_mbps).label("avg_download"),
            func.avg(SpeedTestLog.upload_mbps).label("avg_upload"),
            func.avg(SpeedTestLog.ping_ms).label("avg_ping"),
        )
        .where(SpeedTestLog.timestamp >= since)
        .group_by(date_col)
        .order_by(date_col)
    )

    rows = result.all()
    return [
        SpeedAverageResponse(
            date=str(row.date),
            avg_download=round(row.avg_download, 2) if row.avg_download else None,
            avg_upload=round(row.avg_upload, 2) if row.avg_upload else None,
            avg_ping=round(row.avg_ping, 2) if row.avg_ping else None,
        )
        for row in rows
    ]
