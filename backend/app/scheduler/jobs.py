"""
APScheduler job definitions for periodic monitoring tasks.
Defines three jobs: fast check (5s), speed test (15min), public IP (5min).
Tracks internet state transitions for DISCONNECTED/RECONNECTED alerts.
"""

import logging
from datetime import datetime

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy import select

from app.config import settings
from app.db.session import get_session
from app.models.tables import InternetStatusLog, SpeedTestLog, Settings as SettingsModel, now_ist
from app.monitoring.ping_monitor import check_internet_ping
from app.monitoring.wifi_monitor import get_wifi_info
from app.monitoring.speed_monitor import run_speed_test
from app.monitoring.ip_monitor import get_local_ip, get_public_ip
from app.alerts.engine import (
    check_and_create_alert,
    evaluate_ping_thresholds,
    evaluate_speed_thresholds,
)
from app.ws.broadcaster import broadcast_status_update, broadcast_speed_update

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()

# Module-level state trackers
_last_internet_state: bool | None = None
_public_ip_cache: str | None = None


async def _get_db_settings() -> dict:
    """Load current threshold settings from the database."""
    async with get_session() as session:
        result = await session.execute(select(SettingsModel).where(SettingsModel.id == 1))
        row = result.scalar_one_or_none()
        if row:
            return {
                "low_download_mbps": row.low_download_mbps,
                "low_upload_mbps": row.low_upload_mbps,
                "high_ping_ms": row.high_ping_ms,
                "high_packet_loss_pct": row.high_packet_loss_pct,
                "ping_interval_sec": row.ping_interval_sec,
                "speed_test_interval_sec": row.speed_test_interval_sec,
            }
    return {
        "low_download_mbps": settings.LOW_DOWNLOAD_MBPS,
        "low_upload_mbps": settings.LOW_UPLOAD_MBPS,
        "high_ping_ms": settings.HIGH_PING_MS,
        "high_packet_loss_pct": settings.HIGH_PACKET_LOSS_PCT,
        "ping_interval_sec": settings.PING_INTERVAL,
        "speed_test_interval_sec": settings.SPEED_TEST_INTERVAL,
    }


async def fast_check_job():
    """
    Fast monitoring job that runs every 5 seconds.
    1. Pings configured hosts for connectivity + latency
    2. Gets WiFi info via netsh
    3. Gets local IP
    4. Saves status to database
    5. Detects connectivity state changes → creates DISCONNECTED/RECONNECTED alerts
    6. Evaluates ping/packet loss thresholds → creates alerts
    7. Broadcasts live data to all WebSocket clients
    """
    global _last_internet_state, _public_ip_cache

    try:
        # Run ping check and wifi check concurrently
        import asyncio
        ping_result, wifi_info = await asyncio.gather(
            check_internet_ping(),
            get_wifi_info(),
        )

        # Get local IP (fast, sync)
        local_ip = get_local_ip()

        is_connected = ping_result["is_connected"]
        ping_ms = ping_result["avg_ms"]
        packet_loss = ping_result["packet_loss_pct"]

        now = now_ist()

        # Save to database
        async with get_session() as session:
            log_entry = InternetStatusLog(
                timestamp=now,
                is_connected=is_connected,
                ping_ms=ping_ms,
                packet_loss=packet_loss,
                wifi_ssid=wifi_info["ssid"],
                wifi_signal=wifi_info["signal_pct"],
                local_ip=local_ip,
                public_ip=_public_ip_cache,
            )
            session.add(log_entry)
            await session.commit()

        # Detect state transitions
        if _last_internet_state is not None and _last_internet_state != is_connected:
            if not is_connected:
                await check_and_create_alert(
                    "DISCONNECTED",
                    "Internet connection lost",
                    "critical",
                )
            else:
                await check_and_create_alert(
                    "RECONNECTED",
                    "Internet connection restored",
                    "info",
                )

        _last_internet_state = is_connected

        # Evaluate thresholds (only when connected)
        if is_connected:
            db_settings = await _get_db_settings()
            await evaluate_ping_thresholds(
                ping_ms,
                packet_loss,
                db_settings["high_ping_ms"],
                db_settings["high_packet_loss_pct"],
            )

        # Broadcast to WebSocket clients
        await broadcast_status_update({
            "timestamp": now.isoformat(),
            "is_connected": is_connected,
            "ping_ms": ping_ms,
            "packet_loss": packet_loss,
            "wifi_ssid": wifi_info["ssid"],
            "wifi_signal": wifi_info["signal_pct"],
            "local_ip": local_ip,
            "public_ip": _public_ip_cache,
        })

    except Exception as e:
        logger.error(f"Fast check job error: {e}", exc_info=True)


async def speed_test_job():
    """
    Speed test job that runs every 15 minutes.
    1. Runs Ookla speedtest.exe
    2. Saves result to database
    3. Evaluates speed thresholds → creates alerts
    4. Broadcasts speed update to WebSocket clients
    """
    try:
        result = await run_speed_test()
        if result is None:
            logger.warning("Speed test returned no results")
            return

        now = now_ist()

        # Save to database
        async with get_session() as session:
            log_entry = SpeedTestLog(
                timestamp=now,
                download_mbps=result["download_mbps"],
                upload_mbps=result["upload_mbps"],
                ping_ms=result["ping_ms"],
                server_name=result["server_name"],
                server_location=result["server_location"],
                result_url=result["result_url"],
            )
            session.add(log_entry)
            await session.commit()

        # Evaluate speed thresholds
        db_settings = await _get_db_settings()
        await evaluate_speed_thresholds(
            result["download_mbps"],
            result["upload_mbps"],
            db_settings["low_download_mbps"],
            db_settings["low_upload_mbps"],
        )

        # Broadcast to WebSocket clients
        await broadcast_speed_update({
            "timestamp": now.isoformat(),
            "download_mbps": result["download_mbps"],
            "upload_mbps": result["upload_mbps"],
            "ping_ms": result["ping_ms"],
            "server_name": result["server_name"],
            "server_location": result["server_location"],
        })

        logger.info(
            f"Speed test: ↓{result['download_mbps']}Mbps ↑{result['upload_mbps']}Mbps "
            f"Ping:{result['ping_ms']}ms"
        )

    except Exception as e:
        logger.error(f"Speed test job error: {e}", exc_info=True)


async def public_ip_job():
    """
    Public IP refresh job that runs every 5 minutes.
    Caches the result for use in fast_check_job broadcasts.
    """
    global _public_ip_cache
    try:
        _public_ip_cache = await get_public_ip()
        logger.debug(f"Public IP updated: {_public_ip_cache}")
    except Exception as e:
        logger.error(f"Public IP job error: {e}", exc_info=True)


def start_scheduler():
    """Configure and start all scheduled monitoring jobs."""
    scheduler.add_job(
        fast_check_job,
        "interval",
        seconds=settings.PING_INTERVAL,
        id="fast_check",
        replace_existing=True,
        max_instances=1,
    )
    scheduler.add_job(
        speed_test_job,
        "interval",
        seconds=settings.SPEED_TEST_INTERVAL,
        id="speed_test",
        replace_existing=True,
        max_instances=1,
    )
    scheduler.add_job(
        public_ip_job,
        "interval",
        seconds=300,
        id="public_ip",
        replace_existing=True,
        max_instances=1,
    )

    # Run public IP check immediately on startup
    scheduler.add_job(
        public_ip_job,
        id="public_ip_startup",
        replace_existing=True,
    )

    # Run first fast check immediately
    scheduler.add_job(
        fast_check_job,
        id="fast_check_startup",
        replace_existing=True,
    )

    scheduler.start()
    logger.info("Scheduler started with all monitoring jobs")
