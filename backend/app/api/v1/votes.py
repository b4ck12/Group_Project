from typing import List
from fastapi import APIRouter, HTTPException

from app.schemas.consensus import StopVoteRequest, StopVoteResponse
from app.schemas.vote import PlanVoteResponse

router = APIRouter(tags=["votes"])


@router.post(
    "/events/{event_id}/plans/{plan_id}/stops/{stop_id}/vote",
    response_model=StopVoteResponse,
)
async def vote_stop_candidate(
    event_id: str, plan_id: str, stop_id: str, vote: StopVoteRequest
):
    """Vote for a candidate option on a stop; unlocks next stop on quorum >= 60% (501 skeleton)."""
    raise HTTPException(status_code=501, detail="Not Implemented")


@router.get(
    "/events/{event_id}/plans/{plan_id}/votes",
    response_model=List[PlanVoteResponse],
)
async def list_plan_votes(event_id: str, plan_id: str):
    """List all candidate votes and comments across stops in a plan version (501 skeleton)."""
    raise HTTPException(status_code=501, detail="Not Implemented")
