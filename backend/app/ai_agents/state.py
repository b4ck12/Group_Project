"""Typed state schema and Tier-1 grounding DTOs for the TripMate AI Agent"""

from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from enum import Enum
from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models.enums import (
    BudgetTier,
    EventScope,
    StopCategory,
    StopStatus,
    TimeSlot,
    TransportMode,
)
from app.schemas.consensus import BackupOption, CandidateOption, RoadmapTheme
from app.schemas.plan import PlanStopCreate, RecommendedDishItem


class AgentPhase(str, Enum):
    """Execution phase of the unified two-phase AI Agent state machine"""

    MACRO_PLANNING = "MACRO_PLANNING"
    MICRO_CURATION = "MICRO_CURATION"
    FINALIZED = "FINALIZED"

# Data Transfer Objects

class TransitInfoDTO(BaseModel):
    """Intercity transit cost estimation and pre-booking status (Tier 1 transit budget)."""

    model_config = ConfigDict(from_attributes=True)

    is_prebooked: bool = False
    transit_mode: Literal["FLIGHT", "TRAIN", "INTERCITY_BUS", "NONE"] = "FLIGHT"
    carrier_hint: Optional[str] = None
    origin_city: Optional[str] = None
    destination_city: Optional[str] = None
    roundtrip_cost_per_person: Decimal = Field(default=Decimal("0"), ge=0)
    total_transit_cost: Decimal = Field(default=Decimal("0"), ge=0)


class BudgetBreakdownDTO(BaseModel):
    """Two-tier budget allocation separating intercity transit from destination land budget."""

    model_config = ConfigDict(from_attributes=True)

    total_budget: Decimal = Field(..., ge=0)
    is_transit_prebooked: bool = False
    intercity_transit_budget: Decimal = Field(default=Decimal("0"), ge=0)
    land_budget: Decimal = Field(..., ge=0)
    accommodation_budget: Decimal = Field(default=Decimal("0"), ge=0)
    dining_budget: Decimal = Field(default=Decimal("0"), ge=0)
    attraction_budget: Decimal = Field(default=Decimal("0"), ge=0)
    local_transport_budget: Decimal = Field(default=Decimal("0"), ge=0)
    contingency_buffer: Decimal = Field(default=Decimal("0"), ge=0)

    @model_validator(mode="after")
    def validate_budget_allocations(self) -> BudgetBreakdownDTO:
        """Ensure intercity transit and land category buckets stay within their ceilings."""
        if self.is_transit_prebooked and self.intercity_transit_budget != Decimal("0"):
            raise ValueError(
                "intercity_transit_budget must be 0 when is_transit_prebooked is True."
            )
        if self.intercity_transit_budget + self.land_budget > self.total_budget:
            raise ValueError(
                "intercity_transit_budget + land_budget cannot exceed total_budget."
            )
        land_allocated = (
            self.accommodation_budget
            + self.dining_budget
            + self.attraction_budget
            + self.local_transport_budget
            + self.contingency_buffer
        )
        if land_allocated > self.land_budget:
            raise ValueError("Sum of land budget categories cannot exceed land_budget.")
        return self


class DailyThemeDTO(BaseModel):
    """Macro-phase daily theme outline generated before external travel API calls."""

    model_config = ConfigDict(from_attributes=True)

    day: int = Field(..., ge=1)
    theme: str = Field(..., min_length=1, max_length=255)
    summary: Optional[str] = None
    pacing: Literal["RELAXED", "BALANCED", "PACKED"] = "BALANCED"
    morning_focus: Optional[str] = None
    afternoon_focus: Optional[str] = None
    evening_focus: Optional[str] = None

    def to_roadmap_theme(self) -> RoadmapTheme:
        """Convert to the consensus API RoadmapTheme schema."""
        return RoadmapTheme(day=self.day, theme=self.theme)


class PlaceStopDTO(BaseModel):
    """Strict Tier-1 grounding schema for a curated itinerary stop before DB persistence."""

    model_config = ConfigDict(from_attributes=True)

    day_number: int = Field(..., ge=1)
    stop_date: date
    time_slot: TimeSlot
    order_index: int = Field(..., ge=1)
    start_time: datetime
    end_time: datetime
    duration_minutes: int = Field(..., gt=0)
    place_name: str = Field(..., min_length=1, max_length=255)
    place_ref_id: str = Field(..., min_length=1, max_length=255)
    address: str = Field(..., min_length=1, max_length=500)
    category: StopCategory
    lat: float = Field(..., ge=-90.0, le=90.0)
    lng: float = Field(..., ge=-180.0, le=180.0)
    price_level: int = Field(default=1, ge=0, le=4)
    estimated_cost: Decimal = Field(default=Decimal("0"), ge=0)
    cost_per_person: Decimal = Field(default=Decimal("0"), ge=0)

    # Mandatory transit attributes (Supervisor Item 2.4)
    transport_mode: TransportMode = TransportMode.TAXI_GRAB
    transit_duration_minutes: Optional[int] = Field(default=15, ge=0)
    transit_distance_km: Optional[float] = Field(default=2.0, ge=0.0)
    transit_cost: Decimal = Field(default=Decimal("0"), ge=0)

    # Non-destructive lifecycle tracking (Supervisor Item 2.5)
    stop_status: StopStatus = StopStatus.INITIAL_PROPOSED
    is_initial_stop: bool = True
    is_finalized_stop: bool = False

    # Dish suggestions, candidate voting pool, and 1-click swap backups
    recommended_dishes: List[RecommendedDishItem] = Field(default_factory=list)
    candidate_options: List[CandidateOption] = Field(default_factory=list)
    selected_candidate_id: Optional[str] = None
    backup_options: List[BackupOption] = Field(default_factory=list)
    note: Optional[str] = None

    @model_validator(mode="after")
    def validate_time_window(self) -> PlaceStopDTO:
        """Ensure end_time occurs strictly after start_time."""
        if self.end_time <= self.start_time:
            raise ValueError("end_time must be strictly after start_time.")
        return self

    def to_plan_stop_create(self) -> PlanStopCreate:
        """Map validated AI output into a PlanStopCreate DTO for SQLAlchemy persistence.

        Stores AI-specific pricing metadata (`price_level`, `cost_per_person`) inside
        `metadata_` so no grounding attributes are dropped by `core.plan_stops`.
        """
        return PlanStopCreate(
            order_index=self.order_index,
            place_name=self.place_name,
            place_ref_id=self.place_ref_id,
            day_number=self.day_number,
            stop_date=self.stop_date,
            time_slot=self.time_slot,
            lat=self.lat,
            lng=self.lng,
            address=self.address,
            note=self.note,
            estimated_cost=self.estimated_cost,
            category=self.category,
            start_time=self.start_time,
            end_time=self.end_time,
            duration_minutes=self.duration_minutes,
            transport_mode=self.transport_mode,
            transit_duration_minutes=self.transit_duration_minutes,
            transit_distance_km=self.transit_distance_km,
            transit_cost=self.transit_cost,
            stop_status=self.stop_status,
            is_initial_stop=self.is_initial_stop,
            is_finalized_stop=self.is_finalized_stop,
            recommended_dishes=self.recommended_dishes,
            candidate_options=self.candidate_options,
            selected_candidate_id=self.selected_candidate_id,
            metadata_={
                "price_level": self.price_level,
                "cost_per_person": str(self.cost_per_person),
            },
        )


class AgentMessageDTO(BaseModel):
    """OpenAI Chat Completions compatible message entry stored in AgentState."""

    model_config = ConfigDict(from_attributes=True)

    role: Literal["system", "user", "assistant", "tool"]
    content: str
    name: Optional[str] = None
    tool_call_id: Optional[str] = None


class AgentState(BaseModel):
    """Serializable state snapshot for the Pure Python AsyncIO + OpenAI SDK AI Agent."""

    model_config = ConfigDict(from_attributes=True)

    event_id: str = Field(..., min_length=1, max_length=255)
    phase: AgentPhase = AgentPhase.MACRO_PLANNING
    step_count: int = Field(default=0, ge=0)
    macro_locked: bool = False
    final_locked: bool = False
    scope: EventScope = EventScope.VACATION
    destination: str = Field(..., min_length=1, max_length=255)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    group_size: int = Field(default=2, ge=1, le=50)
    budget_tier: BudgetTier = BudgetTier.MODERATE
    transit_info: Optional[TransitInfoDTO] = None
    budget_breakdown: Optional[BudgetBreakdownDTO] = None
    running_cost: Decimal = Field(default=Decimal("0"), ge=0)
    daily_themes: List[DailyThemeDTO] = Field(default_factory=list)
    plan_stops: List[PlaceStopDTO] = Field(default_factory=list)
    user_desires: Dict[str, Any] = Field(default_factory=dict)
    dietary_preferences: Dict[str, Any] = Field(default_factory=dict)
    messages: List[AgentMessageDTO] = Field(default_factory=list)

    @model_validator(mode="after")
    def validate_state_invariants(self) -> AgentState:
        """Enforce consensus ordering and trip date invariants."""
        if self.final_locked and not self.macro_locked:
            raise ValueError("final_locked cannot be True while macro_locked is False.")
        if self.start_date and self.end_date and self.end_date < self.start_date:
            raise ValueError("end_date must be on or after start_date.")
        return self

    def recalculate_running_cost(self) -> Decimal:
        """Compute total allocated cost across unbooked intercity transit and curated stops."""
        total = Decimal("0")
        if self.transit_info and not self.transit_info.is_prebooked:
            total += self.transit_info.total_transit_cost
        for stop in self.plan_stops:
            total += stop.estimated_cost + stop.transit_cost
        return total

    def to_checkpoint_dict(self) -> Dict[str, Any]:
        """Serialize state to a JSON-safe dict for PostgreSQL JSONB checkpointing."""
        return self.model_dump(mode="json")

    @classmethod
    def from_checkpoint_dict(cls, payload: Dict[str, Any]) -> AgentState:
        """Rehydrate and validate AgentState from a PostgreSQL JSONB checkpoint payload."""
        return cls.model_validate(payload)
