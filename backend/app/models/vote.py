from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Enum, ForeignKey, UniqueConstraint
from typing import TYPE_CHECKING, Optional
from .base import Base
from .enums import VoteValue

if TYPE_CHECKING:
    from .stop import PlanStop
    from .user import User

    
class PlanVote(Base):
    __tablename__ = "plan_votes"

    stop_id: Mapped[str] = mapped_column(ForeignKey("plan_stops.id", ondelete="CASCADE"))
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    # PR #35: Candidate Multi-Choice Voting (replaces legacy UP/DOWN vote_value)
    candidate_id: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    candidate_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    value: Mapped[Optional[VoteValue]] = mapped_column(Enum(VoteValue), nullable=True)
    comment: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    stop: Mapped["PlanStop"] = relationship("PlanStop", back_populates="votes")
    user: Mapped["User"] = relationship("User")

    __table_args__ = (
        UniqueConstraint('stop_id', 'user_id', name='uq_stop_user_vote'),
    )
