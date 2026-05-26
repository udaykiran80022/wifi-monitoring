"""
WebSocket connection manager.
Maintains list of active connections and broadcasts data to all clients.
Handles dead connections gracefully.
"""

from fastapi import WebSocket
import json
import logging

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages WebSocket connections and broadcasts messages to all clients."""

    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        """Accept and register a new WebSocket connection."""
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket client connected. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection from the active list."""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(f"WebSocket client disconnected. Total: {len(self.active_connections)}")

    async def broadcast(self, data: dict):
        """
        Send JSON data to all connected WebSocket clients.
        Automatically removes dead connections that fail to receive.
        """
        if not self.active_connections:
            return

        message = json.dumps(data, default=str)
        dead: list[WebSocket] = []

        for ws in self.active_connections:
            try:
                await ws.send_text(message)
            except Exception:
                dead.append(ws)

        for ws in dead:
            if ws in self.active_connections:
                self.active_connections.remove(ws)

        if dead:
            logger.debug(f"Removed {len(dead)} dead WebSocket connections")

    @property
    def client_count(self) -> int:
        """Return the number of active WebSocket connections."""
        return len(self.active_connections)


# Global singleton instance
manager = ConnectionManager()
