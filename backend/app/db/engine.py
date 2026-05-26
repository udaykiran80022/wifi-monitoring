"""
Async PostgreSQL database engine setup using SQLAlchemy + asyncpg.
"""

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import DeclarativeBase

from app.config import settings


engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    pool_size=10,
    max_overflow=20,
    connect_args={"server_settings": {"timezone": "Asia/Kolkata"}}
)


class Base(DeclarativeBase):
    """Base class for all ORM models."""
    pass


async def init_db():
    """Create all database tables if they don't exist, then run migrations."""
    from sqlalchemy import text

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Run automatic schema migrations for new columns
    async with engine.begin() as conn:
        # internet_status_logs — check for new columns
        result = await conn.execute(text(
            "SELECT column_name FROM information_schema.columns "
            "WHERE table_name = 'internet_status_logs'"
        ))
        cols = [row[0] for row in result.fetchall()]

        if "jitter_ms" not in cols:
            await conn.execute(text("ALTER TABLE internet_status_logs ADD COLUMN jitter_ms FLOAT"))
        if "ipv6_address" not in cols:
            await conn.execute(text("ALTER TABLE internet_status_logs ADD COLUMN ipv6_address VARCHAR(45)"))
        if "adapter_name" not in cols:
            await conn.execute(text("ALTER TABLE internet_status_logs ADD COLUMN adapter_name VARCHAR(100)"))

        # settings — check for new columns
        result = await conn.execute(text(
            "SELECT column_name FROM information_schema.columns "
            "WHERE table_name = 'settings'"
        ))
        cols = [row[0] for row in result.fetchall()]

        if "smtp_server" not in cols:
            await conn.execute(text("ALTER TABLE settings ADD COLUMN smtp_server VARCHAR(200)"))
        if "smtp_user" not in cols:
            await conn.execute(text("ALTER TABLE settings ADD COLUMN smtp_user VARCHAR(100)"))
        if "smtp_pass" not in cols:
            await conn.execute(text("ALTER TABLE settings ADD COLUMN smtp_pass VARCHAR(100)"))
        if "webhook_url" not in cols:
            await conn.execute(text("ALTER TABLE settings ADD COLUMN webhook_url VARCHAR(500)"))
        if "speed_provider" not in cols:
            await conn.execute(text("ALTER TABLE settings ADD COLUMN speed_provider VARCHAR(50) NOT NULL DEFAULT 'ookla'"))

    # Ensure the settings row exists (id=1)
    async with engine.begin() as conn:
        await conn.execute(
            text(
                "INSERT INTO settings (id, low_download_mbps, low_upload_mbps, "
                "high_ping_ms, high_packet_loss_pct, ping_interval_sec, speed_test_interval_sec, speed_provider) "
                "VALUES (:id, :dl, :ul, :ping, :loss, :ping_int, :speed_int, 'ookla') "
                "ON CONFLICT (id) DO NOTHING"
            ),
            {
                "id": 1,
                "dl": settings.LOW_DOWNLOAD_MBPS,
                "ul": settings.LOW_UPLOAD_MBPS,
                "ping": settings.HIGH_PING_MS,
                "loss": settings.HIGH_PACKET_LOSS_PCT,
                "ping_int": settings.PING_INTERVAL,
                "speed_int": settings.SPEED_TEST_INTERVAL,
            },
        )
