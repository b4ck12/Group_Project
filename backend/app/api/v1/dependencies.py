"""
API v1 Dependencies and RolesGuard (TASK-204).
Author: Ta Quang Huy (Person 1 - Backend Core Dev A).

Contains:
- get_current_user_id: Identifies current user (Header X-User-Id with dev fallback).
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
