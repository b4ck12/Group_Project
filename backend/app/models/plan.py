from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import (
    String,
    Enum,
    ForeignKey,
    Boolean,
    Numeric,
    Float,
    JSON,
    DateTime,
    Date,
    Integer,
    UniqueConstraint,
)
from typing import TYPE_CHECKING, List, Optional, Any, Dict
from datetime import datetime, date
from .base import Base
from .enums import StopCategory, PlanStatus, TimeSlot, StopStatus, TransportMode

if TYPE_CHECKING:
    from .vote import PlanVote
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
    stops: Mapped[List["PlanStop"]] = relationship(
        "PlanStop", back_populates="plan", cascade="all, delete-orphan"
    )

    __table_args__ = (
        UniqueConstraint("event_id", "version_number", name="uq_event_plan_version"),
    )


class PlanStop(Base):
    __tablename__ = "plan_stops"

    plan_id: Mapped[str] = mapped_column(ForeignKey("plans.id", ondelete="CASCADE"))
    day_number: Mapped[int] = mapped_column(Integer, default=1)
    stop_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    time_slot: Mapped[Optional[TimeSlot]] = mapped_column(Enum(TimeSlot), nullable=True)
    order_index: Mapped[int] = mapped_column(Integer)
    place_name: Mapped[str] = mapped_column(String)
    place_ref_id: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    address: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    lat: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    lng: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    category: Mapped[Optional[StopCategory]] = mapped_column(Enum(StopCategory), nullable=True)
    start_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    end_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    duration_minutes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    estimated_cost: Mapped[Optional[float]] = mapped_column(Numeric(10, 2), nullable=True)

    # Item 2.4: Transit attributes
    transport_mode: Mapped[Optional[TransportMode]] = mapped_column(
        Enum(TransportMode), nullable=True
    )
    transit_duration_minutes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    transit_distance_km: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    transit_cost: Mapped[Optional[float]] = mapped_column(Numeric(10, 2), nullable=True)

    # Item 2.5: Non-destructive lifecycle & history tracking
    stop_status: Mapped[StopStatus] = mapped_column(
        Enum(StopStatus), default=StopStatus.INITIAL_PROPOSED
    )
    is_initial_stop: Mapped[bool] = mapped_column(Boolean, default=True)
    is_finalized_stop: Mapped[bool] = mapped_column(Boolean, default=False)
    replaced_by_stop_id: Mapped[Optional[str]] = mapped_column(
        ForeignKey("plan_stops.id", ondelete="SET NULL"), nullable=True
    )
    change_reason: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    locked_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    up_votes: Mapped[int] = mapped_column(Integer, default=0)
    down_votes: Mapped[int] = mapped_column(Integer, default=0)
    backup_options: Mapped[Optional[List[Dict[str, Any]]]] = mapped_column(JSON, nullable=True)
    note: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    metadata_: Mapped[Optional[Dict[str, Any]]] = mapped_column("metadata", JSON, nullable=True)

    # Allows accessing all votes cast on a specific itinerary stop
    votes: Mapped[List["PlanVote"]] = relationship("PlanVote", cascade="all, delete-orphan")
    plan: Mapped["Plan"] = relationship("Plan", back_populates="stops")
