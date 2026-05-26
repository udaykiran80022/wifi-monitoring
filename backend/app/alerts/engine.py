"""
Alert engine for threshold checking and alert creation.
Evaluates current metrics against configured thresholds and creates alerts.
"""

import logging
from app.models.tables import Alert, now_ist

from app.models.tables import Alert
from app.db.session import get_session
from app.ws.broadcaster import broadcast_alert

logger = logging.getLogger(__name__)


async def check_and_create_alert(alert_type: str, message: str, severity: str):
    """
    Insert a new alert into the database and broadcast it via WebSocket.

    Args:
        alert_type: Type of alert (e.g. "HIGH_PING", "DISCONNECTED")
        message: Human-readable alert message
        severity: One of "info", "warning", "critical"
    """
    async with get_session() as session:
        alert = Alert(
            alert_type=alert_type,
            message=message,
            severity=severity,
            timestamp=now_ist(),
        )
        session.add(alert)
        await session.commit()
        await session.refresh(alert)

        # Broadcast the new alert to all WebSocket clients
        await broadcast_alert({
            "id": alert.id,
            "timestamp": alert.timestamp.isoformat(),
            "alert_type": alert.alert_type,
            "message": alert.message,
            "severity": alert.severity,
            "is_read": alert.is_read,
        })

        logger.info(f"Alert created: [{severity.upper()}] {alert_type} - {message}")


async def evaluate_ping_thresholds(
    ping_ms: float | None,
    packet_loss: float,
    high_ping_ms: float,
    high_packet_loss_pct: float,
):
    """
    Check ping and packet loss against thresholds and create alerts if exceeded.

    Args:
        ping_ms: Current average ping in milliseconds
        packet_loss: Current packet loss percentage
        high_ping_ms: Threshold for high ping alert
        high_packet_loss_pct: Threshold for high packet loss alert
    """
    if ping_ms is not None and ping_ms > high_ping_ms:
        await check_and_create_alert(
            "HIGH_PING",
            f"Ping is {ping_ms}ms (threshold: {high_ping_ms}ms)",
            "warning",
        )

    if packet_loss > high_packet_loss_pct:
        await check_and_create_alert(
            "HIGH_PACKET_LOSS",
            f"Packet loss is {packet_loss}% (threshold: {high_packet_loss_pct}%)",
            "warning",
        )


async def evaluate_speed_thresholds(
    download: float,
    upload: float,
    low_download_mbps: float,
    low_upload_mbps: float,
):
    """
    Check speed test results against thresholds and create alerts if below.

    Args:
        download: Download speed in Mbps
        upload: Upload speed in Mbps
        low_download_mbps: Threshold for low download alert
        low_upload_mbps: Threshold for low upload alert
    """
    if download < low_download_mbps:
        await check_and_create_alert(
            "LOW_DOWNLOAD",
            f"Download speed {download} Mbps is below threshold ({low_download_mbps} Mbps)",
            "warning",
        )

    if upload < low_upload_mbps:
        await check_and_create_alert(
            "LOW_UPLOAD",
            f"Upload speed {upload} Mbps is below threshold ({low_upload_mbps} Mbps)",
            "warning",
        )
