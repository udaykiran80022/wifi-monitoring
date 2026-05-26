"""
Alert engine for threshold checking and alert creation.
Evaluates current metrics against configured thresholds and creates alerts.
"""

import logging
import asyncio

from winotify import Notification, audio

from app.models.tables import Alert
from app.db.session import get_session
from app.ws.broadcaster import broadcast_alert
from app.utils.timezone import now_ist

logger = logging.getLogger(__name__)

# Simple in-memory tracker for alert states
_active_alerts = {}


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

        # Send Windows Toast Notification in a background thread only for critical alerts
        if severity == "critical":
            def _send_toast():
                try:
                    toast = Notification(
                        app_id="WiFi Monitor",
                        title=f"❌ {alert_type.replace('_', ' ').title()}",
                        msg=message,
                        duration="short"
                    )
                    toast.set_audio(audio.LoopingAlarm, loop=False)
                    toast.show()
                except Exception as e:
                    logger.error(f"Failed to send Windows Toast: {e}")

            asyncio.create_task(asyncio.to_thread(_send_toast))


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
    global _active_alerts

    if ping_ms is not None and ping_ms > high_ping_ms:
        if not _active_alerts.get("HIGH_PING"):
            _active_alerts["HIGH_PING"] = True
            await check_and_create_alert(
                "HIGH_PING",
                f"Ping is {ping_ms}ms (threshold: {high_ping_ms}ms)",
                "warning",
            )
    else:
        if _active_alerts.get("HIGH_PING"):
            _active_alerts["HIGH_PING"] = False
            await check_and_create_alert(
                "PING_RECOVERED",
                "Ping has recovered to normal levels",
                "info",
            )

    if packet_loss > high_packet_loss_pct:
        if not _active_alerts.get("HIGH_PACKET_LOSS"):
            _active_alerts["HIGH_PACKET_LOSS"] = True
            await check_and_create_alert(
                "HIGH_PACKET_LOSS",
                f"Packet loss is {packet_loss}% (threshold: {high_packet_loss_pct}%)",
                "warning",
            )
    else:
        if _active_alerts.get("HIGH_PACKET_LOSS"):
            _active_alerts["HIGH_PACKET_LOSS"] = False
            await check_and_create_alert(
                "PACKET_LOSS_RECOVERED",
                "Packet loss has recovered to normal levels",
                "info",
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
    global _active_alerts

    if download < low_download_mbps:
        if not _active_alerts.get("LOW_DOWNLOAD"):
            _active_alerts["LOW_DOWNLOAD"] = True
            await check_and_create_alert(
                "LOW_DOWNLOAD",
                f"Download speed {download} Mbps is below threshold ({low_download_mbps} Mbps)",
                "warning",
            )
    else:
        if _active_alerts.get("LOW_DOWNLOAD"):
            _active_alerts["LOW_DOWNLOAD"] = False
            await check_and_create_alert(
                "DOWNLOAD_RECOVERED",
                f"Download speed {download} Mbps has recovered",
                "info",
            )

    if upload < low_upload_mbps:
        if not _active_alerts.get("LOW_UPLOAD"):
            _active_alerts["LOW_UPLOAD"] = True
            await check_and_create_alert(
                "LOW_UPLOAD",
                f"Upload speed {upload} Mbps is below threshold ({low_upload_mbps} Mbps)",
                "warning",
            )
    else:
        if _active_alerts.get("LOW_UPLOAD"):
            _active_alerts["LOW_UPLOAD"] = False
            await check_and_create_alert(
                "UPLOAD_RECOVERED",
                f"Upload speed {upload} Mbps has recovered",
                "info",
            )
