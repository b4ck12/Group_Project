"""
API v1 Dependencies and RolesGuard (TASK-204).
Author: Ta Quang Huy (Person 1 - Backend Core Dev A).

Bao gồm:
- get_current_user_id: Xác định ID người dùng hiện tại (hỗ trợ Header X-User-Id và dev fallback).
- get_event_membership: Xác thực tư cách thành viên trong một phòng chuyến đi.
- require_host: RolesGuard bắt buộc quyền Trưởng nhóm (Host), chặn 403 Forbidden nếu không phải.
- require_member: Bắt buộc quyền thành viên (Host hoặc Member), chặn người xem (Viewer) hoặc người ngoài.
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

    # TẦNG 2: Kích hoạt khi KHÔNG có Header (Dành riêng cho Dev test Swagger UI)
    stmt = select(User).limit(1)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if user:
        return user.id

    # TẦNG 3: Khi Database hoàn toàn trống rỗng (vừa cài mới DB)
    dev_user = User(
        email="huytq@tripmate.ai",
        full_name="Ta Quang Huy",
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


async def require_host(
    member: EventMember = Depends(get_event_membership),
) -> EventMember:
    """
    RolesGuard: Enforce that caller holds the HOST role.

    Áp dụng cho các thao tác nhạy cảm:
    - Sửa thông tin chuyến đi (PATCH /api/v1/events/{id})
    - Xóa phòng chuyến đi (DELETE /api/v1/events/{id})
    - Khóa lộ trình vĩ mô (POST /api/v1/events/{id}/macro-lock)
    - Chốt kế hoạch chính thức (POST /api/v1/events/{id}/final-lock)

    Raises:
        HTTPException 403: If member is not a HOST.
    """
    if member.role != EventRole.HOST:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This action requires Host privileges.",
        )
    return member


async def require_member(
    member: EventMember = Depends(get_event_membership),
) -> EventMember:
    """
    RolesGuard: Enforce that caller is an active participant (HOST or MEMBER).

    Raises:
        HTTPException 403: If member has VIEWER (read-only) role.
    """
    if member.role not in (EventRole.HOST, EventRole.MEMBER):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Viewers cannot perform this action.",
        )
    return member
