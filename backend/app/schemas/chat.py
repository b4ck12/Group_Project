from pydantic import BaseModel, ConfigDict, Field
from typing import Any, Dict, List, Optional
from datetime import datetime
from app.models.enums import ChatRole, ChatMessageType


class ChatMessageCreate(BaseModel):
    content: str
    role: ChatRole = ChatRole.USER
    message_type: ChatMessageType = ChatMessageType.CHAT
    metadata_: Optional[Dict[str, Any]] = Field(None, alias="metadata")

    model_config = ConfigDict(populate_by_name=True)


class ChatMessageResponse(BaseModel):
    id: str
    event_id: str
    user_id: Optional[str] = None
    role: ChatRole
    message_type: ChatMessageType = ChatMessageType.CHAT
    content: str
    metadata_: Optional[Dict[str, Any]] = Field(None, alias="metadata")
    created_at: datetime

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class ChatMessageListResponse(BaseModel):
    messages: List[ChatMessageResponse] = Field(default_factory=list)
    total: int = Field(default=0, ge=0)
    has_more: bool = False

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)
