from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import (
    String,
    Enum,
    ForeignKey,
    Boolean,
    Numeric,
    JSON,
    DateTime,
    Integer,
    UniqueConstraint,
)
from typing import TYPE_CHECKING, List, Optional, Any, Dict
from datetime import datetime
from .base import Base
from .enums import PlanStatus
from .stop import PlanStop

if TYPE_CHECKING:
    from .event import Event


class Plan(Base):
    __tablename__ = "plans"

    event_id: Mapped[str] = mapped_column(ForeignKey("events.id", ondelete="CASCADE"))
    version_number: Mapped[int] = mapped_column(Integer, default=1)
    parent_plan_id: Mapped[Optional[str]] = mapped_column(
        ForeignKey("plans.id", ondelete="SET NULL"), nullable=True
    )
    title: Mapped[str] = mapped_column(String)
    status: Mapped[PlanStatus] = mapped_column(Enum(PlanStatus), default=PlanStatus.INITIAL)
    is_ai_generated: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    total_budget: Mapped[Optional[float]] = mapped_column(Numeric(10, 2), nullable=True)
    created_by_id: Mapped[Optional[str]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    macro_roadmap: Mapped[Optional[List[Dict[str, Any]]]] = mapped_column(JSON, nullable=True)
    change_summary: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    locked_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    event: Mapped["Event"] = relationship("Event", back_populates="plans")
    stops: Mapped[List[PlanStop]] = relationship(
        "PlanStop", back_populates="plan", cascade="all, delete-orphan"
    )

    __table_args__ = (
        UniqueConstraint("event_id", "version_number", name="uq_event_plan_version"),
    )
