from typing import Any, Dict, Optional
from sqlalchemy import Text, ForeignKey, Index, Enum, JSON
from sqlalchemy.orm import Mapped, mapped_column
from .base import Base
from .enums import ChatRole, ChatMessageType


class ChatMessage(Base):
    __tablename__ = "chat_messages"
    __table_args__ = (
        Index('idx_chat_event_time', 'event_id', 'created_at'),
    )

    event_id: Mapped[str] = mapped_column(ForeignKey("events.id", ondelete="CASCADE"))
    user_id: Mapped[Optional[str]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    role: Mapped[ChatRole] = mapped_column(Enum(ChatRole), default=ChatRole.USER)
    message_type: Mapped[ChatMessageType] = mapped_column(
        Enum(ChatMessageType), default=ChatMessageType.CHAT, nullable=False
    )
    content: Mapped[str] = mapped_column(Text)
    metadata_: Mapped[Optional[Dict[str, Any]]] = mapped_column("metadata", JSON, nullable=True)
