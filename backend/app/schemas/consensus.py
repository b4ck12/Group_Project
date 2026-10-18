from __future__ import annotations
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from app.models.enums import StopCategory, VoteValue


MAX_BACKUP_OPTIONS = 2


class RoadmapTheme(BaseModel):
    day: int
    theme: str

    model_config = ConfigDict(from_attributes=True)


class BackupOption(BaseModel):
    place_name: str
    place_ref_id: str
    category: StopCategory
    estimated_cost: float
    distance_km: float

    model_config = ConfigDict(from_attributes=True)


class MacroLockRequest(BaseModel):
    pass


class MacroLockResponse(BaseModel):
    event_id: str
    macro_locked: bool
    locked_at: datetime
    roadmap_themes: List[RoadmapTheme] = []

    model_config = ConfigDict(from_attributes=True)


class FinalLockRequest(BaseModel):
    pass


class FinalLockResponse(BaseModel):
    event_id: str
    final_locked: bool
    locked_at: datetime
    total_stops: int
    total_budget: str

    model_config = ConfigDict(from_attributes=True)


class StopVoteRequest(BaseModel):
    vote_value: VoteValue
    comment: Optional[str] = None


class StopVoteResponse(BaseModel):
    stop_id: str
    up_votes: int
    down_votes: int
    recommend_swap: bool
    backup_options: List[BackupOption] = []

    model_config = ConfigDict(from_attributes=True)


class StopSwapRequest(BaseModel):
    target_backup_place_ref_id: str


class StopSwapResponse(BaseModel):
    swapped_stop_id: str
    new_place_name: str
    category: StopCategory
    lat: float
    lng: float
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class StopAdaptationRequest(BaseModel):
    place_name: str
    place_ref_id: str
    note: Optional[str] = None


class StopAdaptationResponse(BaseModel):
    stop_id: str
    place_name: str
    place_ref_id: str
    note: str
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
