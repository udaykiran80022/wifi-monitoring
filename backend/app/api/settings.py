"""
Settings API endpoints for threshold configuration.
"""

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.models.tables import Settings
from app.schemas.pydantic_models import SettingsResponse, SettingsUpdateRequest

router = APIRouter()


@router.get("", response_model=SettingsResponse)
async def get_settings(session: AsyncSession = Depends(get_db_session)):
    """Get current threshold settings."""
    result = await session.execute(select(Settings).where(Settings.id == 1))
    row = result.scalar_one_or_none()

    if not row:
        raise HTTPException(status_code=500, detail="Settings not initialized")

    return row


@router.put("", response_model=SettingsResponse)
async def update_settings(
    data: SettingsUpdateRequest,
    session: AsyncSession = Depends(get_db_session),
):
    """
    Update threshold settings. All provided values must be positive.
    Only updates fields that are provided (non-None).
    """
    result = await session.execute(select(Settings).where(Settings.id == 1))
    row = result.scalar_one_or_none()

    if not row:
        raise HTTPException(status_code=500, detail="Settings not initialized")

    # Validate all provided values are positive
    update_data = data.model_dump(exclude_none=True)
    for key, value in update_data.items():
        if isinstance(value, (int, float)) and value <= 0:
            raise HTTPException(
                status_code=400,
                detail=f"{key} must be a positive value, got {value}",
            )

    # Apply updates
    for key, value in update_data.items():
        setattr(row, key, value)

    row.updated_at = datetime.utcnow()
    await session.commit()
    await session.refresh(row)

    return row
