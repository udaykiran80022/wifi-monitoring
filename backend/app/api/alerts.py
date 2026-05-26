"""
Alerts API endpoints.
"""

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import select, desc, update, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.models.tables import Alert
from app.schemas.pydantic_models import AlertResponse

router = APIRouter()


@router.get("", response_model=list[AlertResponse])
async def get_alerts(
    limit: int = Query(default=50, ge=1, le=500),
    unread_only: bool = Query(default=False),
    session: AsyncSession = Depends(get_db_session),
):
    """Get alerts list with optional filtering."""
    query = select(Alert)

    if unread_only:
        query = query.where(Alert.is_read == False)

    query = query.order_by(desc(Alert.timestamp)).limit(limit)
    result = await session.execute(query)
    return result.scalars().all()


@router.get("/count")
async def get_unread_count(session: AsyncSession = Depends(get_db_session)):
    """Get the count of unread alerts."""
    result = await session.execute(
        select(func.count(Alert.id)).where(Alert.is_read == False)
    )
    count = result.scalar() or 0
    return {"unread_count": count}


@router.post("/{alert_id}/read")
async def mark_alert_read(
    alert_id: int,
    session: AsyncSession = Depends(get_db_session),
):
    """Mark a single alert as read."""
    result = await session.execute(select(Alert).where(Alert.id == alert_id))
    alert = result.scalar_one_or_none()

    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.is_read = True
    await session.commit()
    return {"status": "ok"}


@router.post("/read-all")
async def mark_all_read(session: AsyncSession = Depends(get_db_session)):
    """Mark all alerts as read."""
    await session.execute(
        update(Alert).where(Alert.is_read == False).values(is_read=True)
    )
    await session.commit()
    return {"status": "ok"}


@router.delete("/{alert_id}")
async def delete_alert(
    alert_id: int,
    session: AsyncSession = Depends(get_db_session),
):
    """Delete a single alert."""
    result = await session.execute(select(Alert).where(Alert.id == alert_id))
    alert = result.scalar_one_or_none()

    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    await session.delete(alert)
    await session.commit()
    return {"status": "ok"}
