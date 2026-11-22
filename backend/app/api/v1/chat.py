from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException, Query

from app.schemas.chat import (
    ChatMessageCreate,
    ChatMessageListResponse,
    ChatMessageResponse,
)

router = APIRouter(tags=["chat"])


@router.get("/events/{event_id}/chat", response_model=ChatMessageListResponse)
async def list_event_chat_messages(
    event_id: str,
    limit: int = Query(50, ge=1, le=200),
    before: Optional[datetime] = None,
):
    """Retrieve paginated group room chat messages (501 skeleton — Owner: BE-Services)."""
    raise HTTPException(status_code=501, detail="Not Implemented")


@router.post("/events/{event_id}/chat", response_model=ChatMessageResponse)
async def create_event_chat_message(event_id: str, message: ChatMessageCreate):
    """Send a group chat message routed through Gateway Input Filter (501 skeleton — Owner: BE-Services)."""
    raise HTTPException(status_code=501, detail="Not Implemented")
