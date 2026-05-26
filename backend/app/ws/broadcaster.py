"""
WebSocket broadcaster utilities.
Helper functions for sending typed messages to all connected clients.
"""

from app.ws.manager import manager


async def broadcast_status_update(data: dict):
    """Broadcast a status update message to all WebSocket clients."""
    message = {
        "type": "status_update",
        **data,
    }
    await manager.broadcast(message)


async def broadcast_speed_update(data: dict):
    """Broadcast a speed test result to all WebSocket clients."""
    message = {
        "type": "speed_update",
        **data,
    }
    await manager.broadcast(message)


async def broadcast_alert(alert_data: dict):
    """Broadcast a new alert notification to all WebSocket clients."""
    message = {
        "type": "alert",
        **alert_data,
    }
    await manager.broadcast(message)
