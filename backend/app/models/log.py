from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer, ForeignKey
from typing import Optional
from .base import Base

class AgentLog(Base):
    __tablename__ = "agent_logs"

    agent_name: Mapped[str] = mapped_column(String)
    user_id: Mapped[Optional[str]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    event_id: Mapped[Optional[str]] = mapped_column(ForeignKey("events.id", ondelete="SET NULL"), nullable=True)
    plan_id: Mapped[Optional[str]] = mapped_column(ForeignKey("plans.id", ondelete="SET NULL"), nullable=True)
    input_tokens: Mapped[int] = mapped_column(Integer, default=0)
    output_tokens: Mapped[int] = mapped_column(Integer, default=0)
    duration_ms: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String)