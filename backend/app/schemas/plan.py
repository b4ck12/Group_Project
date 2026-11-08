from __future__ import annotations
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, Any, Dict, List
from datetime import datetime, date
from decimal import Decimal
from app.models.enums import (
    PlanStatus,
    StopCategory,
    TimeSlot,
    StopStatus,
    TransportMode,
)
from app.schemas.consensus import BackupOption

# --- PlanStop ---
class PlanStopBase(BaseModel):
    order_index: int = Field(..., alias="order")
    place_name: str
    place_ref_id: Optional[str] = None
    day_number: int = 1
    stop_date: Optional[date] = None
    time_slot: Optional[TimeSlot] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    address: Optional[str] = None
    note: Optional[str] = None

    # Decimal cost precision
    estimated_cost: Optional[Decimal] = Field(None, ge=0)

    category: Optional[StopCategory] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    duration_minutes: Optional[int] = Field(None, ge=0)

    # Item 2.4: Transit attributes
    transport_mode: Optional[TransportMode] = None
    transit_duration_minutes: Optional[int] = Field(None, ge=0)
    transit_distance_km: Optional[float] = Field(None, ge=0)
    transit_cost: Optional[Decimal] = Field(None, ge=0)

    # Item 2.5: Non-destructive lifecycle & history tracking
    stop_status: StopStatus = StopStatus.INITIAL_PROPOSED
    is_initial_stop: bool = True
    is_finalized_stop: bool = False
    replaced_by_stop_id: Optional[str] = None
    change_reason: Optional[str] = None
    locked_at: Optional[datetime] = None

    # Re-maps the frontend 'metadata' to the backend 'metadata_'
    metadata_: Optional[Dict[str, Any]] = Field(None, alias="metadata")

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

class PlanStopCreate(PlanStopBase):
    pass

class PlanStopResponse(PlanStopBase):
    id: str
    plan_id: str
    up_votes: int = 0
    down_votes: int = 0
    backup_options: Optional[List[BackupOption]] = None

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

# --- Plan ---
class PlanBase(BaseModel):
    title: str
    version_number: int = Field(default=1, ge=1)
    total_budget: Optional[Decimal] = Field(None, ge=0)
    parent_plan_id: Optional[str] = None
    is_active: bool = True
    change_summary: Optional[str] = None

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

class PlanCreate(PlanBase):
    is_ai_generated: bool = False

class PlanResponse(PlanBase):
    id: str
    event_id: str
    status: PlanStatus = PlanStatus.INITIAL
    is_ai_generated: bool
    created_by_id: Optional[str] = None
    created_at: datetime
    locked_at: Optional[datetime] = None
    macro_roadmap: Optional[List[Dict[str, Any]]] = None

    # Nested stops timeline
    stops: List[PlanStopResponse] = []

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

class PlanStatusTransitionRequest(BaseModel):
    status: PlanStatus
    change_summary: Optional[str] = None

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

class PlanStageHistoryResponse(BaseModel):
    plan_id: str
    event_id: str
    version_number: int
    current_status: PlanStatus
    initial_stops: List[PlanStopResponse] = []
    finalized_stops: List[PlanStopResponse] = []
    ongoing_stops: List[PlanStopResponse] = []
    rejected_or_skipped_stops: List[PlanStopResponse] = []

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

PlanResponse.model_rebuild()

