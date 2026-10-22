from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Enum, ForeignKey, UniqueConstraint, DateTime, Boolean
from typing import TYPE_CHECKING, List, Optional
from datetime import datetime, timezone
from .base import Base
from .enums import EventType, EventRole, EventScope, BudgetTier

if TYPE_CHECKING:
    from .user import User

class Event(Base):
    __tablename__ = "events"

    name: Mapped[str] = mapped_column(String)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    type: Mapped[EventType] = mapped_column(Enum(EventType), default=EventType.TRAVEL)
    scope: Mapped[EventScope] = mapped_column(Enum(EventScope), default=EventScope.VACATION)
    destination: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    location: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    budget_tier: Mapped[Optional[BudgetTier]] = mapped_column(Enum(BudgetTier), nullable=True)
    start_date: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    end_date: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    macro_locked: Mapped[bool] = mapped_column(Boolean, default=False)
    final_locked: Mapped[bool] = mapped_column(Boolean, default=False)
    created_by: Mapped[Optional[str]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    members: Mapped[List["EventMember"]] = relationship("EventMember", back_populates="event", cascade="all, delete-orphan")

class EventMember(Base):
    __tablename__ = "event_members"
    event_id: Mapped[str] = mapped_column(ForeignKey("events.id", ondelete="CASCADE"))
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    role: Mapped[EventRole] = mapped_column(Enum(EventRole), default=EventRole.MEMBER)

    event: Mapped["Event"] = relationship("Event", back_populates="members")
    user: Mapped["User"] = relationship("User", back_populates="event_members")

    __table_args__ = (
        UniqueConstraint('event_id', 'user_id', name='uq_event_user'),
    )   
