from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.plan import (
    PlanCreate,
    PlanResponse,
    PlanStopCreate,
    PlanStopResponse,
    PlanStatusTransitionRequest,
    PlanStageHistoryResponse,
)
from app.schemas.consensus import (
    StopSwapRequest,
    StopSwapResponse,
    StopAdaptationRequest,
    StopAdaptationResponse,
)
from app.models.enums import PlanStatus

router = APIRouter(tags=["plans"])


@router.get("/events/{event_id}/plans", response_model=List[PlanResponse])
async def list_plans(event_id: str):
    """List all versioned plans for an event room (501 skeleton)."""
    raise HTTPException(status_code=501, detail="Not Implemented")


@router.post("/events/{event_id}/plans", response_model=PlanResponse)
async def create_plan(event_id: str, plan: PlanCreate):
    """Create a new plan version for an event room (501 skeleton)."""
    raise HTTPException(status_code=501, detail="Not Implemented")


@router.get("/events/{event_id}/plans/{plan_id}", response_model=PlanResponse)
async def get_plan(event_id: str, plan_id: str):
    """Get plan detail with stops (501 skeleton)."""
    raise HTTPException(status_code=501, detail="Not Implemented")


@router.patch("/events/{event_id}/plans/{plan_id}/stops", response_model=List[PlanStopResponse])
async def update_plan_stops(event_id: str, plan_id: str, stops: List[PlanStopCreate]):
    """Update stops of a plan (501 skeleton)."""
    raise HTTPException(status_code=501, detail="Not Implemented")


@router.patch("/events/{event_id}/plans/{plan_id}/status", response_model=PlanResponse)
async def update_plan_status(event_id: str, plan_id: str, transition: PlanStatusTransitionRequest):
    """Transition plan stage (INITIAL -> VOTING -> FINALIZED -> ONGOING) (501 skeleton)."""
    raise HTTPException(status_code=501, detail="Not Implemented")


@router.post("/events/{event_id}/plans/{plan_id}/stops/{stop_id}/swap", response_model=StopSwapResponse)
async def swap_plan_stop(event_id: str, plan_id: str, stop_id: str, request: StopSwapRequest):
    """Non-destructively swap a stop with backup POI, marking old stop REJECTED_IN_VOTE (501 skeleton)."""
    raise HTTPException(status_code=501, detail="Not Implemented")


@router.post("/events/{event_id}/plans/{plan_id}/stops/{stop_id}/adapt", response_model=StopAdaptationResponse)
async def adapt_plan_stop(event_id: str, plan_id: str, stop_id: str, request: StopAdaptationRequest):
    """Non-destructively adapt a stop on-the-go (rainy day), marking old stop SKIPPED_ON_TRIP (501 skeleton)."""
    raise HTTPException(status_code=501, detail="Not Implemented")


@router.get("/events/{event_id}/plans/{plan_id}/history", response_model=PlanStageHistoryResponse)
async def get_plan_stage_history(event_id: str, plan_id: str):
    """Retrieve 4-stage non-destructive history: Initial vs Finalized vs Ongoing vs Rejected (501 skeleton)."""
    raise HTTPException(status_code=501, detail="Not Implemented")

