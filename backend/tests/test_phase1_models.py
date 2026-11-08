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


def test_event_to_plan_one_to_many_versioning():
    from app.models.enums import PlanStatus

    assert PlanStatus.INITIAL == "INITIAL"
    assert PlanStatus.VOTING == "VOTING"
    assert PlanStatus.FINALIZED == "FINALIZED"
    assert PlanStatus.ONGOING == "ONGOING"

    assert "plans" in Event.__mapper__.relationships
    assert "event" in Plan.__mapper__.relationships

    plan_cols = Plan.__table__.columns
    assert "version_number" in plan_cols
    assert "parent_plan_id" in plan_cols
    assert "is_active" in plan_cols
    assert "locked_at" in plan_cols
    assert "change_summary" in plan_cols

    constraint_names = {c.name for c in Plan.__table__.constraints if c.name}
    assert "uq_event_plan_version" in constraint_names

    parent_fks = [fk.target_fullname for fk in plan_cols["parent_plan_id"].foreign_keys]
    assert any("plans.id" in target for target in parent_fks)


def test_plan_stop_transit_and_lifecycle_columns():
    from app.models.enums import StopStatus, TransportMode

    assert TransportMode.MOTORBIKE == "MOTORBIKE"
    assert TransportMode.TAXI_GRAB == "TAXI_GRAB"
    assert StopStatus.INITIAL_PROPOSED == "INITIAL_PROPOSED"
    assert StopStatus.REJECTED_IN_VOTE == "REJECTED_IN_VOTE"
    assert StopStatus.FINALIZED_LOCKED == "FINALIZED_LOCKED"
    assert StopStatus.ADAPTED_ON_TRIP == "ADAPTED_ON_TRIP"
    assert StopStatus.SKIPPED_ON_TRIP == "SKIPPED_ON_TRIP"

    stop_cols = PlanStop.__table__.columns
    # Item 2.4: Date, location address, specific times, cost, transport mode
    assert "stop_date" in stop_cols
    assert "start_time" in stop_cols
    assert "end_time" in stop_cols
    assert "address" in stop_cols
    assert "transport_mode" in stop_cols
    assert "transit_duration_minutes" in stop_cols
    assert "transit_distance_km" in stop_cols
    assert "transit_cost" in stop_cols

    # Item 2.5: Non-destructive lifecycle & history tracking
    assert "stop_status" in stop_cols
    assert "is_initial_stop" in stop_cols
    assert "is_finalized_stop" in stop_cols
    assert "replaced_by_stop_id" in stop_cols
    assert "change_reason" in stop_cols
    assert "locked_at" in stop_cols

    replaced_fks = [fk.target_fullname for fk in stop_cols["replaced_by_stop_id"].foreign_keys]
    assert any("plan_stops.id" in target for target in replaced_fks)


