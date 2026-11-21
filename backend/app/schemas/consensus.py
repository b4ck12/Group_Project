from __future__ import annotations
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field, model_validator
from app.models.enums import StopCategory, StopStatus, VoteValue


# Initial pool size seeded per stop; multi-option swap allows cycling & fetching more (PR #30).
DEFAULT_INITIAL_BACKUP_OPTIONS = 2
MAX_BACKUP_OPTIONS = DEFAULT_INITIAL_BACKUP_OPTIONS


class RoadmapTheme(BaseModel):
    day: int
    theme: str

    model_config = ConfigDict(from_attributes=True)


class BackupOption(BaseModel):
    option_index: int = Field(default=2, ge=2)
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
    target_backup_place_ref_id: Optional[str] = None
    cycle_next: bool = False
    change_reason: Optional[str] = None

    @model_validator(mode="after")
    def validate_target_or_cycle(self) -> "StopSwapRequest":
        if not self.cycle_next and not self.target_backup_place_ref_id:
            raise ValueError(
                "Provide either 'target_backup_place_ref_id' or set 'cycle_next=True'."
            )
        return self


class StopSwapResponse(BaseModel):
    previous_stop_id: str
    new_stop_id: str
    new_place_name: str
    selected_option_index: int = Field(default=2, ge=2)
    category: StopCategory
    lat: float
    lng: float
    stop_status: StopStatus = StopStatus.SELECTED_AFTER_VOTE
    replaced_by_stop_id: str
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FetchMoreBackupsRequest(BaseModel):
    clarification_notes: Optional[str] = None
    dietary_filter: Optional[str] = None
    exclude_place_ref_ids: List[str] = Field(default_factory=list)


class FetchMoreBackupsResponse(BaseModel):
    stop_id: str
    backup_options: List[BackupOption] = Field(default_factory=list)
    needs_clarification: bool = False
    clarification_question: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class StopAdaptationRequest(BaseModel):
    new_place_name: str
    new_place_ref_id: str
    change_reason: str = Field(..., min_length=1, max_length=500)


class StopAdaptationResponse(BaseModel):
    previous_stop_id: str
    new_stop_id: str
    new_place_name: str
    new_place_ref_id: str
    stop_status: StopStatus = StopStatus.ADAPTED_ON_TRIP
    replaced_by_stop_id: str
    change_reason: str
    cloned_plan_id: Optional[str] = None
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
