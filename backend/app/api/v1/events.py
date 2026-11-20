from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.event import EventMember
from app.api.v1.dependencies import get_current_user_id, require_host
from app.schemas.event import (
    EventCreate,
    EventUpdate,
    EventResponse,
    EventDetailResponse,
)
from app.services.event_service import EventService

router = APIRouter(prefix="/events", tags=["events"])


@router.get("", response_model=List[EventResponse])
async def list_events(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """
    Lấy danh sách các phòng kế hoạch chuyến đi của người dùng hiện tại (TASK-202).
    """
    return await EventService.list_user_events(db, user_id)


@router.post("", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def create_event(
    event: EventCreate,
    creator_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """
    Tạo phòng kế hoạch mới (Day Hangout hoặc Vacation) (TASK-202).
    Hệ thống sẽ tự động gán người tạo phòng làm HOST trong event_members.
    """
    return await EventService.create_event(db, event, creator_id)


@router.get("/{event_id}", response_model=EventDetailResponse)
async def get_event(
    event_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Lấy thông tin chi tiết phòng chuyến đi kèm danh sách thành viên (TASK-202).
    """
    return await EventService.get_event_by_id(db, event_id)


@router.patch("/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: str,
    event_update: EventUpdate,
    _host: EventMember = Depends(require_host),
    db: AsyncSession = Depends(get_db),
):
    """
    Cập nhật thông tin phòng chuyến đi (tên, ngày đi, ngân sách,...) (TASK-202).
    RolesGuard: Chỉ Trưởng nhóm (HOST) mới có quyền cập nhật (TASK-204).
    """
    return await EventService.update_event(db, event_id, event_update)


@router.delete("/{event_id}")
async def delete_event(
    event_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Xóa phòng kế hoạch (TASK-202).
    """
    await EventService.delete_event(db, event_id)
    return {"message": "Đã xóa phòng thành công", "event_id": event_id}
