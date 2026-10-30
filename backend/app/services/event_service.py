from typing import List
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.event import Event, EventMember
from app.models.enums import EventRole
from app.schemas.event import EventCreate, EventUpdate


class EventService:
    """
    Service quản lý logic nghiệp vụ cho Room / Event (TASK-202).
    """

    @staticmethod
    async def create_event(
        db: AsyncSession,
        event_in: EventCreate,
        creator_id: str,
    ) -> Event:
        """
        Tạo phòng kế hoạch mới và tự động gán creator làm HOST (Trưởng nhóm).

        Args:
            db: AsyncSession database.
            event_in: Schema thông tin tạo phòng.
            creator_id: ID của người dùng tạo phòng.

        Returns:
            Event: Đối tượng phòng vừa được tạo kèm danh sách thành viên.
        """
        # 1. Tạo bản ghi Event mới
        new_event = Event(
            name=event_in.name,
            description=event_in.description,
            type=event_in.type,
            scope=event_in.scope,
            destination=event_in.destination,
            location=event_in.location,
            budget_tier=event_in.budget_tier,
            start_date=event_in.start_date,
            end_date=event_in.end_date,
            created_by=creator_id,
        )
        db.add(new_event)
        await db.flush()  # Sinh new_event.id trước khi tạo member

        # 2. Tự động gán người tạo phòng làm HOST trong event_members
        host_member = EventMember(
            event_id=new_event.id,
            user_id=creator_id,
            role=EventRole.HOST,
        )
        db.add(host_member)

        await db.commit()

        # 3. Nạp lại quan hệ members để trả về đầy đủ
        stmt = (
            select(Event)
            .options(selectinload(Event.members))
            .where(Event.id == new_event.id)
        )
        res = await db.execute(stmt)
        return res.scalar_one()

    @staticmethod
    async def list_user_events(
        db: AsyncSession,
        user_id: str,
    ) -> List[Event]:
        """
        Lấy danh sách các phòng mà người dùng hiện tại đang tham gia.

        Args:
            db: AsyncSession database.
            user_id: ID của người dùng.

        Returns:
            List[Event]: Danh sách các phòng sắp xếp theo thời gian tạo mới nhất.
        """
        stmt = (
            select(Event)
            .join(EventMember, EventMember.event_id == Event.id)
            .where(EventMember.user_id == user_id)
            .order_by(Event.created_at.desc())
        )
        res = await db.execute(stmt)
        return list(res.scalars().all())

    @staticmethod
    async def get_event_by_id(
        db: AsyncSession,
        event_id: str,
    ) -> Event:
        """
        Lấy thông tin chi tiết một phòng theo ID kèm danh sách thành viên.

        Args:
            db: AsyncSession database.
            event_id: ID của phòng cần lấy.

        Returns:
            Event: Bản ghi phòng tìm thấy.

        Raises:
            HTTPException: 404 nếu không tìm thấy phòng.
        """
        stmt = (
            select(Event)
            .options(selectinload(Event.members))
            .where(Event.id == event_id)
        )
        res = await db.execute(stmt)
        event = res.scalar_one_or_none()
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Không tìm thấy phòng chuyến đi với mã: {event_id}",
            )
        return event

    @staticmethod
    async def update_event(
        db: AsyncSession,
        event_id: str,
        event_update: EventUpdate,
    ) -> Event:
        """
        Cập nhật thông tin phòng kế hoạch.

        Args:
            db: AsyncSession database.
            event_id: ID của phòng.
            event_update: Schema chứa các trường cần cập nhật.

        Returns:
            Event: Bản ghi phòng sau khi cập nhật.
        """
        event = await EventService.get_event_by_id(db, event_id)

        update_data = event_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(event, field, value)

        event.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(event)
        return event

    @staticmethod
    async def delete_event(
        db: AsyncSession,
        event_id: str,
    ) -> bool:
        """
        Xóa phòng kế hoạch.

        Args:
            db: AsyncSession database.
            event_id: ID của phòng.

        Returns:
            bool: True nếu xóa thành công.
        """
        event = await EventService.get_event_by_id(db, event_id)
        await db.delete(event)
        await db.commit()
        return True
