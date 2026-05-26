"""
Downtime API endpoints.
Processes internet_status_logs to find contiguous disconnected periods.
"""

from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.models.tables import InternetStatusLog
from app.schemas.pydantic_models import DowntimePeriodResponse, DowntimeSummaryResponse

router = APIRouter()


def _compute_outage_periods(logs: list) -> list[dict]:
    """
    Process a chronologically sorted list of status logs to find
    contiguous disconnected periods.

    Args:
        logs: List of InternetStatusLog records sorted by timestamp ASC.

    Returns:
        List of dicts with started_at, ended_at, duration_minutes.
    """
    outages = []
    current_outage_start = None

    for log in logs:
        if not log.is_connected:
            if current_outage_start is None:
                current_outage_start = log.timestamp
        else:
            if current_outage_start is not None:
                duration = (log.timestamp - current_outage_start).total_seconds() / 60
                outages.append({
                    "started_at": current_outage_start,
                    "ended_at": log.timestamp,
                    "duration_minutes": round(duration, 2),
                })
                current_outage_start = None

    # Handle ongoing outage (still disconnected)
    if current_outage_start is not None:
        duration = (datetime.utcnow() - current_outage_start).total_seconds() / 60
        outages.append({
            "started_at": current_outage_start,
            "ended_at": None,
            "duration_minutes": round(duration, 2),
        })

    return outages


@router.get("/logs", response_model=list[DowntimePeriodResponse])
async def get_downtime_logs(
    days: int = Query(default=30, ge=1, le=365),
    session: AsyncSession = Depends(get_db_session),
):
    """
    Get all outage periods for the last N days.
    Returns start time, end time, and duration of each outage.
    """
    since = datetime.utcnow() - timedelta(days=days)

    result = await session.execute(
        select(InternetStatusLog)
        .where(InternetStatusLog.timestamp >= since)
        .order_by(InternetStatusLog.timestamp)
    )
    logs = result.scalars().all()

    outages = _compute_outage_periods(logs)
    # Return newest first
    outages.reverse()
    return outages


@router.get("/summary", response_model=DowntimeSummaryResponse)
async def get_downtime_summary(
    days: int = Query(default=30, ge=1, le=365),
    session: AsyncSession = Depends(get_db_session),
):
    """
    Get downtime summary statistics for the last N days.
    Returns total downtime minutes and number of outage periods.
    """
    since = datetime.utcnow() - timedelta(days=days)

    result = await session.execute(
        select(InternetStatusLog)
        .where(InternetStatusLog.timestamp >= since)
        .order_by(InternetStatusLog.timestamp)
    )
    logs = result.scalars().all()

    outages = _compute_outage_periods(logs)

    total_downtime = sum(o["duration_minutes"] for o in outages)

    return DowntimeSummaryResponse(
        days=days,
        total_downtime_minutes=round(total_downtime, 2),
        outage_count=len(outages),
    )
