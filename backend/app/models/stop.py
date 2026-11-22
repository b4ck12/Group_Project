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
)
from typing import TYPE_CHECKING, List, Optional, Any, Dict
from datetime import datetime, date
from .base import Base
from .enums import StopCategory, TimeSlot, StopStatus, TransportMode

if TYPE_CHECKING:
    from .vote import PlanVote
    from .plan import Plan


class PlanStop(Base):
    """
    Normalized PlanStop entity representing an itinerary stop (TASK-301).
    Supports:
    - 100% verified Google Place ID (`place_ref_id`)
    - Lat/Lng Geo coordinates
    - 1-Click Swap backup POIs JSONB (`backup_options`)
    - In-venue dish recommendations JSONB (`recommended_dishes`)
    - Non-destructive history tracking (`replaced_by_stop_id`, `stop_status`)
    - Atomic voting counters (`up_votes`, `down_votes`)
    """
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

    # Transit attributes
    transport_mode: Mapped[Optional[TransportMode]] = mapped_column(
        Enum(TransportMode), nullable=True
    )
    transit_duration_minutes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    transit_distance_km: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    transit_cost: Mapped[Optional[float]] = mapped_column(Numeric(10, 2), nullable=True)

    # PR #28: In-venue dish recommendations tailored to group dietary preferences
    recommended_dishes: Mapped[Optional[List[Dict[str, Any]]]] = mapped_column(JSON, nullable=True)

    # Non-destructive lifecycle & history tracking
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

    # Deprecated by PR #35 candidate voting; kept for backward compatibility with TASK-301 tests
    up_votes: Mapped[int] = mapped_column(Integer, default=0)
    down_votes: Mapped[int] = mapped_column(Integer, default=0)
    # PR #35: Candidate Venues Multi-Choice Voting & Progressive Unlock
    candidate_options: Mapped[Optional[List[Dict[str, Any]]]] = mapped_column(JSON, nullable=True)
    selected_candidate_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    backup_options: Mapped[Optional[List[Dict[str, Any]]]] = mapped_column(JSON, nullable=True)
    note: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    metadata_: Mapped[Optional[Dict[str, Any]]] = mapped_column("metadata", JSON, nullable=True)

    # Relationships
    votes: Mapped[List["PlanVote"]] = relationship("PlanVote", back_populates="stop", cascade="all, delete-orphan")
    plan: Mapped["Plan"] = relationship("Plan", back_populates="stops")
