"""
Analytics API endpoints.
Provides aggregated daily and hourly statistics.
"""

from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, cast, Integer, Date
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.models.tables import InternetStatusLog, SpeedTestLog
from app.schemas.pydantic_models import DailyAnalyticsResponse, HourlyAnalyticsResponse, BaselineResponse, HeatmapResponse

router = APIRouter()


@router.get("/daily", response_model=list[DailyAnalyticsResponse])
async def get_daily_analytics(
    days: int = Query(default=30, ge=1, le=365),
    session: AsyncSession = Depends(get_db_session),
):
    """
    Get per-day analytics for the last N days.
    Includes average speeds, ping, downtime minutes, and outage count.
    """
    since = datetime.utcnow() - timedelta(days=days)
    date_col = cast(SpeedTestLog.timestamp, Date).label("date")

    # Speed averages per day
    speed_result = await session.execute(
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
    speed_by_date = {str(r.date): r for r in speed_result.all()}

    # Status logs for downtime computation
    status_result = await session.execute(
        select(InternetStatusLog)
        .where(InternetStatusLog.timestamp >= since)
        .order_by(InternetStatusLog.timestamp)
    )
    status_logs = status_result.scalars().all()

    # Group status logs by date and compute downtime
    daily_downtime: dict[str, dict] = {}
    for log in status_logs:
        date_str = log.timestamp.strftime("%Y-%m-%d")
        if date_str not in daily_downtime:
            daily_downtime[date_str] = {"disconnected_count": 0, "total_count": 0, "outage_starts": 0, "prev_connected": True}
        daily_downtime[date_str]["total_count"] += 1
        if not log.is_connected:
            daily_downtime[date_str]["disconnected_count"] += 1
            if daily_downtime[date_str]["prev_connected"]:
                daily_downtime[date_str]["outage_starts"] += 1
        daily_downtime[date_str]["prev_connected"] = log.is_connected

    # Compute check interval (assume ~5 seconds per check)
    check_interval_min = 5 / 60.0

    # Build response combining speed and status data
    all_dates = sorted(set(list(speed_by_date.keys()) + list(daily_downtime.keys())))
    analytics = []

    for date_str in all_dates:
        speed = speed_by_date.get(date_str)
        downtime = daily_downtime.get(date_str, {"disconnected_count": 0, "outage_starts": 0})

        analytics.append(DailyAnalyticsResponse(
            date=date_str,
            avg_download=round(speed.avg_download, 2) if speed and speed.avg_download else None,
            avg_upload=round(speed.avg_upload, 2) if speed and speed.avg_upload else None,
            avg_ping=round(speed.avg_ping, 2) if speed and speed.avg_ping else None,
            downtime_minutes=round(downtime["disconnected_count"] * check_interval_min, 2),
            outage_count=downtime["outage_starts"],
        ))

    return analytics


@router.get("/hourly", response_model=list[HourlyAnalyticsResponse])
async def get_hourly_analytics(
    hours: int = Query(default=24, ge=1, le=168),
    session: AsyncSession = Depends(get_db_session),
):
    """
    Get per-hour averages for the last N hours.
    Returns average ping and packet loss per hour.
    """
    since = datetime.utcnow() - timedelta(hours=hours)

    # Use date_trunc for hour grouping in PostgreSQL
    hour_col = func.date_trunc("hour", InternetStatusLog.timestamp).label("hour")

    result = await session.execute(
        select(
            hour_col,
            func.avg(InternetStatusLog.ping_ms).label("avg_ping"),
            func.avg(InternetStatusLog.packet_loss).label("avg_packet_loss"),
            func.count(InternetStatusLog.id).label("check_count"),
        )
        .where(InternetStatusLog.timestamp >= since)
        .group_by(hour_col)
        .order_by(hour_col)
    )

    rows = result.all()
    return [
        HourlyAnalyticsResponse(
            hour=str(row.hour.strftime("%Y-%m-%d %H:00")) if row.hour else str(row.hour),
            avg_ping=round(row.avg_ping, 2) if row.avg_ping else None,
            avg_packet_loss=round(row.avg_packet_loss, 2) if row.avg_packet_loss else None,
            check_count=row.check_count,
        )
        for row in rows
    ]


@router.get("/baseline", response_model=BaselineResponse)
async def get_speed_baseline(session: AsyncSession = Depends(get_db_session)):
    """
    Get the baseline speed based on the first 10 speed tests.
    """
    result = await session.execute(
        select(SpeedTestLog)
        .order_by(SpeedTestLog.timestamp.asc())
        .limit(10)
    )
    logs = result.scalars().all()
    
    if not logs:
        return BaselineResponse()
        
    avg_dl = sum(l.download_mbps for l in logs) / len(logs)
    avg_ul = sum(l.upload_mbps for l in logs) / len(logs)
    avg_ping = sum(l.ping_ms for l in logs) / len(logs)
    
    return BaselineResponse(
        download_mbps=round(avg_dl, 2),
        upload_mbps=round(avg_ul, 2),
        ping_ms=round(avg_ping, 2)
    )


@router.get("/heatmap", response_model=list[HeatmapResponse])
async def get_heatmap(session: AsyncSession = Depends(get_db_session)):
    """
    Get connection quality grouped by day of week (0-6, Sunday=0) and hour (0-23).
    """
    # PostgreSQL extract('dow') returns 0=Sunday, 1=Monday ... 6=Saturday
    # PostgreSQL extract('hour') returns 0-23
    day_col = cast(func.extract("dow", InternetStatusLog.timestamp), Integer).label("day_of_week")
    hour_col = cast(func.extract("hour", InternetStatusLog.timestamp), Integer).label("hour")
    
    result = await session.execute(
        select(
            day_col,
            hour_col,
            func.avg(InternetStatusLog.ping_ms).label("avg_ping"),
            func.sum(
                1 - cast(InternetStatusLog.is_connected, Integer)
            ).label("disconnected_count")
        )
        .group_by(day_col, hour_col)
    )
    
    rows = result.all()
    return [
        HeatmapResponse(
            day_of_week=row.day_of_week,
            hour=row.hour,
            avg_ping=round(row.avg_ping, 2) if row.avg_ping else None,
            disconnected_count=row.disconnected_count or 0
        )
        for row in rows
        if row.day_of_week is not None and row.hour is not None
    ]
