"""
API v1 Dependencies and RolesGuard (TASK-204).
Author: Ta Quang Huy (Person 1 - Backend Core Dev A).

Contains:
- get_current_user_id: Identifies current user (Header X-User-Id with dev fallback).
- get_event_membership: Verifies user membership within an event room.
"""

from typing import Optional
from fastapi import Depends, Header, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.enums import EventRole
from app.models.event import EventMember
from app.models.user import User


async def get_current_user_id(
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    db: AsyncSession = Depends(get_db),
) -> str:
    """
    Resolve caller user ID.
    Prefers 'X-User-Id' header; falls back to the first DB user or creates a dev user for local Swagger UI testing.
    """
    if x_user_id:
        return x_user_id

    # Fallback for dev environment when testing via Swagger UI (/docs)
    stmt = select(User).limit(1)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if user:
        return user.id

    dev_user = User(
        email="huytq@tripmate.ai",
        full_name="Ta Quang Huy (Dev)",
    )
    db.add(dev_user)
    await db.commit()
    await db.refresh(dev_user)
    return dev_user.id


async def get_event_membership(
    event_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> EventMember:
    """
    Validate that the current user belongs to the specified event room.

    Raises:
        HTTPException 403: If user is not an enrolled member of the event.
    """
    stmt = select(EventMember).where(
        EventMember.event_id == event_id,
        EventMember.user_id == user_id,
    )
    res = await db.execute(stmt)
    member = res.scalar_one_or_none()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this trip room.",
        )
    return member
