"""
Async session factory for database operations.
"""

from contextlib import asynccontextmanager
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.db.engine import engine

async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


@asynccontextmanager
async def get_session():
    """Provide an async database session via context manager."""
    async with async_session_factory() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def get_db_session() -> AsyncSession:
    """FastAPI dependency for getting a database session."""
    async with async_session_factory() as session:
        try:
            yield session
        finally:
            await session.close()
