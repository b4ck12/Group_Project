"""
Tests for Phase 1: Database Models Alignment with Design Docs.
"""
import pytest
from app.models.enums import EventRole, EventScope, BudgetTier, TimeSlot, ChatRole
from app.models.base import Base
from app.models.event import Event, EventMember
from app.models.plan import Plan, PlanStop
from app.models.vote import PlanVote
from app.models.user import User
from app.models.log import AgentLog
from app.models.chat_message import ChatMessage

def test_enums():
    assert EventRole.HOST == "HOST"
    assert EventScope.DAY_HANGOUT == "DAY_HANGOUT"
    assert EventScope.VACATION == "VACATION"
    assert BudgetTier.BUDGET == "BUDGET"
    assert BudgetTier.MODERATE == "MODERATE"
    assert BudgetTier.LUXURY == "LUXURY"
    assert TimeSlot.MORNING == "MORNING"
    assert TimeSlot.AFTERNOON == "AFTERNOON"
    assert TimeSlot.EVENING == "EVENING"
    assert ChatRole.USER == "USER"
    assert ChatRole.AI == "AI"
    assert ChatRole.SYSTEM == "SYSTEM"

def test_schema_isolation_on_base():
    assert Base.metadata.schema == "core"

def test_event_model_fields():
    cols = Event.__table__.columns
    assert "scope" in cols
    assert "destination" in cols
    assert "budget_tier" in cols
    assert "macro_locked" in cols
    assert "final_locked" in cols
    assert "created_by" in cols
    assert "updated_at" in cols

def test_plan_and_stop_model_fields():
    plan_cols = Plan.__table__.columns
    assert "status" in plan_cols
    assert "macro_roadmap" in plan_cols

    stop_cols = PlanStop.__table__.columns
    assert "day_number" in stop_cols
    assert "time_slot" in stop_cols
    assert "order_index" in stop_cols
    assert "up_votes" in stop_cols
    assert "down_votes" in stop_cols
    assert "backup_options" in stop_cols

def test_plan_vote_stop_id_fk():
    vote_cols = PlanVote.__table__.columns
    assert "stop_id" in vote_cols
    assert "plan_id" not in vote_cols
    fks = list(PlanVote.__table__.foreign_keys)
    fk_targets = [fk.target_fullname for fk in fks]
    assert any("plan_stops.id" in target for target in fk_targets)

def test_user_model_updated_at():
    cols = User.__table__.columns
    assert "updated_at" in cols

def test_agent_log_foreign_keys():
    fks = list(AgentLog.__table__.foreign_keys)
    fk_targets = [fk.target_fullname for fk in fks]
    assert any("users.id" in target for target in fk_targets)
    assert any("events.id" in target for target in fk_targets)
    assert any("plans.id" in target for target in fk_targets)

def test_chat_message_model():
    cols = ChatMessage.__table__.columns
    assert "event_id" in cols
    assert "user_id" in cols
    assert "role" in cols
    assert "content" in cols
    assert ChatMessage.__tablename__ == "chat_messages"


def test_expense_and_settlement_removed():
    import app.models as models_pkg
    import app.schemas as schemas_pkg
    from app.models import enums as enums_mod

    registered_tables = set(Base.metadata.tables.keys())
    assert "core.expenses" not in registered_tables
    assert "core.expense_splits" not in registered_tables
    assert "core.settlements" not in registered_tables

    assert not hasattr(models_pkg, "Expense")
    assert not hasattr(models_pkg, "ExpenseSplit")
    assert not hasattr(models_pkg, "Settlement")
    assert not hasattr(schemas_pkg, "ExpenseCreate")
    assert not hasattr(schemas_pkg, "SettlementCreate")
    assert not hasattr(enums_mod, "ExpenseType")
    assert not hasattr(enums_mod, "SplitType")

