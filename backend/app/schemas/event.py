from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from app.models.enums import EventType, EventRole, EventScope, BudgetTier

class EventBase(BaseModel):
    name: str
    description: Optional[str] = None
    type: EventType = EventType.TRAVEL
    scope: EventScope = EventScope.VACATION
    destination: Optional[str] = None
    location: Optional[str] = None
    budget_tier: Optional[BudgetTier] = None
    total_budget: Optional[Decimal] = Field(None, ge=0)
    start_date: datetime
    end_date: datetime

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    type: Optional[EventType] = None
    scope: Optional[EventScope] = None
    destination: Optional[str] = None
    location: Optional[str] = None
    budget_tier: Optional[BudgetTier] = None
    total_budget: Optional[Decimal] = Field(None, ge=0)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    macro_locked: Optional[bool] = None
    final_locked: Optional[bool] = None

    model_config = ConfigDict(from_attributes=True)

class EventResponse(EventBase):
    id: str
    macro_locked: bool = False
    final_locked: bool = False
    created_by: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class EventMemberResponse(BaseModel):
    id: str
    event_id: str
    user_id: str
    role: EventRole
    dietary_notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class EventDetailResponse(EventResponse):
    members: List[EventMemberResponse] = []

    model_config = ConfigDict(from_attributes=True)
