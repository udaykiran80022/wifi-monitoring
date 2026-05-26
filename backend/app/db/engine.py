"""
Async SQLite database engine setup using SQLAlchemy + aiosqlite.
"""

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import DeclarativeBase

from app.config import settings


DATABASE_URL = f"sqlite+aiosqlite:///{settings.DB_PATH}"

engine = create_async_engine(DATABASE_URL, echo=False)


class Base(DeclarativeBase):
    """Base class for all ORM models."""
    pass


async def init_db():
    """Create all database tables if they don't exist."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Ensure the settings row exists (id=1)
    from sqlalchemy import text
    async with engine.begin() as conn:
        await conn.execute(
            text(
                "INSERT OR IGNORE INTO settings (id, low_download_mbps, low_upload_mbps, "
                "high_ping_ms, high_packet_loss_pct, ping_interval_sec, speed_test_interval_sec) "
                "VALUES (1, :dl, :ul, :ping, :loss, :ping_int, :speed_int)"
            ),
            {
                "dl": settings.LOW_DOWNLOAD_MBPS,
                "ul": settings.LOW_UPLOAD_MBPS,
                "ping": settings.HIGH_PING_MS,
                "loss": settings.HIGH_PACKET_LOSS_PCT,
                "ping_int": settings.PING_INTERVAL,
                "speed_int": settings.SPEED_TEST_INTERVAL,
            },
        )
