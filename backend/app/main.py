"""
FastAPI application entry point with lifespan management.
Sets up CORS, includes all API routes, and provides the WebSocket endpoint.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.db.engine import init_db
from app.scheduler.jobs import start_scheduler
from app.scheduler.queue import queue_manager
from app.api.router import api_router
from app.ws.manager import manager
from app.api.auth import verify_api_key
from fastapi import Depends

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: initialize DB and start scheduler on startup, shutdown scheduler on exit."""
    logger.info("Starting WiFi Monitor backend...")

    # Initialize database tables
    await init_db()
    logger.info("Database initialized")

    # Start the monitoring scheduler
    start_scheduler()
    logger.info("Scheduler started")

    yield

    # Shutdown
    queue_manager.shutdown()
    logger.info("Task queue shut down")


app = FastAPI(
    title="WiFi Monitor",
    description="Real-time WiFi and Internet monitoring API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all API routes with auth
app.include_router(api_router, prefix="/api", dependencies=[Depends(verify_api_key)])


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time data streaming.
    Clients connect here to receive live status and speed updates.
    """
    token = websocket.query_params.get("token")
    from app.config import settings
    if token != settings.API_TOKEN:
        await websocket.close(code=1008)
        return

    await manager.connect(websocket)
    try:
        while True:
            # Keep the connection alive by waiting for client messages
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "websocket_clients": manager.client_count,
    }
