from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime
from app.models.enums import VoteValue


class PlanVoteBase(BaseModel):
    candidate_id: str = Field(..., min_length=1, max_length=100)
    candidate_name: Optional[str] = None
    value: Optional[VoteValue] = None
    comment: Optional[str] = None


class PlanVoteCreate(PlanVoteBase):
    stop_id: str


class PlanVoteResponse(PlanVoteBase):
    id: str
    stop_id: str
    user_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)