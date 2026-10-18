from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from app.models.enums import ChatRole

class ChatMessageCreate(BaseModel):
    content: str
    role: ChatRole = ChatRole.USER

class ChatMessageResponse(BaseModel):
    id: str
    event_id: str
    user_id: Optional[str] = None
    role: ChatRole
    content: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
