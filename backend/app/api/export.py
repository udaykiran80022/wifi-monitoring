"""
Export API endpoints for downloading historical data.
"""

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import csv
import io
import json

from app.db.session import get_db_session
from app.models.tables import InternetStatusLog, SpeedTestLog

router = APIRouter()

@router.get("/csv")
async def export_csv(session: AsyncSession = Depends(get_db_session)):
    """Export all internet status logs as CSV."""
    result = await session.execute(
        select(InternetStatusLog).order_by(InternetStatusLog.timestamp.desc())
    )
    logs = result.scalars().all()

    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow([
        "ID", "Timestamp", "Connected", "Ping (ms)", "Jitter (ms)", 
        "Packet Loss (%)", "WiFi SSID", "Signal (%)", "Local IPv4", 
        "Local IPv6", "Public IP", "Adapter Name"
    ])
    
    # Write rows
    for log in logs:
        writer.writerow([
            log.id,
            log.timestamp.isoformat(),
            log.is_connected,
            log.ping_ms,
            log.jitter_ms,
            log.packet_loss,
            log.wifi_ssid,
            log.wifi_signal,
            log.local_ip,
            log.ipv6_address,
            log.public_ip,
            log.adapter_name
        ])
        
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=wifi_monitor_export.csv"}
    )

@router.get("/json")
async def export_json(session: AsyncSession = Depends(get_db_session)):
    """Export all logs as JSON."""
    status_result = await session.execute(select(InternetStatusLog).order_by(InternetStatusLog.timestamp.desc()))
    speed_result = await session.execute(select(SpeedTestLog).order_by(SpeedTestLog.timestamp.desc()))
    
    status_logs = status_result.scalars().all()
    speed_logs = speed_result.scalars().all()
    
    data = {
        "status_logs": [
            {
                "timestamp": l.timestamp.isoformat(),
                "is_connected": l.is_connected,
                "ping_ms": l.ping_ms,
                "jitter_ms": l.jitter_ms,
                "packet_loss": l.packet_loss,
                "wifi_ssid": l.wifi_ssid,
                "wifi_signal": l.wifi_signal,
                "local_ip": l.local_ip,
                "ipv6_address": l.ipv6_address,
                "public_ip": l.public_ip,
                "adapter_name": l.adapter_name
            }
            for l in status_logs
        ],
        "speed_logs": [
            {
                "timestamp": l.timestamp.isoformat(),
                "download_mbps": l.download_mbps,
                "upload_mbps": l.upload_mbps,
                "ping_ms": l.ping_ms,
                "server_name": l.server_name
            }
            for l in speed_logs
        ]
    }
    
    json_data = json.dumps(data)
    
    return StreamingResponse(
        iter([json_data]),
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=wifi_monitor_export.json"}
    )
