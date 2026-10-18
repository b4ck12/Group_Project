from __future__ import annotations
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, Any, Dict, List
from datetime import datetime
from decimal import Decimal
from app.models.enums import PlanStatus, StopCategory, TimeSlot
from app.schemas.consensus import BackupOption

# --- PlanStop ---
class PlanStopBase(BaseModel):
    order_index: int = Field(..., alias="order")
    place_name: str
    place_ref_id: Optional[str] = None
    day_number: int = 1
    time_slot: Optional[TimeSlot] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    note: Optional[str] = None

    # Decimal cost precision
    estimated_cost: Optional[Decimal] = Field(None, ge=0)

    category: Optional[StopCategory] = None
    start_time: Optional[datetime] = None
    duration_minutes: Optional[int] = None

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
    total_budget: Optional[Decimal] = Field(None, ge=0)

class PlanCreate(PlanBase):
    is_ai_generated: bool = False

class PlanResponse(PlanBase):
    id: str
    event_id: str
    status: PlanStatus = PlanStatus.DRAFT
    is_ai_generated: bool
    created_by_id: Optional[str] = None
    created_at: datetime
    macro_roadmap: Optional[List[Dict[str, Any]]] = None

    # Nested stops timeline
    stops: List[PlanStopResponse] = []

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

PlanResponse.model_rebuild()
