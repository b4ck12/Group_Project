"""
Unit tests for TASK-301: Normalized plan_stops & plan_votes Database Models.
Owner: Ta Quang Huy (Backend Core Dev & Two-Stage Consensus Architect).
"""

import pytest
from sqlalchemy import inspect
from app.models.base import Base
from app.models.plan import Plan, PlanStop as PlanStopFromPlan
from app.models.stop import PlanStop
from app.models.vote import PlanVote
from app.models.enums import StopCategory, TimeSlot, StopStatus, TransportMode, VoteValue


class TestPlanStopModel:
    """Verifies PlanStop normalization, column types, and constraints."""

    def test_plan_stop_table_and_schema(self):
        assert PlanStop.__tablename__ == "plan_stops"
        assert Base.metadata.schema == "core"

    def test_plan_stop_core_columns_exist(self):
        columns = PlanStop.__table__.columns
        assert "id" in columns
        assert "plan_id" in columns
        assert "day_number" in columns
        assert "time_slot" in columns
        assert "order_index" in columns
        assert "place_name" in columns
        assert "place_ref_id" in columns
        assert "address" in columns
        assert "lat" in columns
        assert "lng" in columns
        assert "category" in columns
        assert "estimated_cost" in columns

    def test_plan_stop_backup_and_voting_columns(self):
        columns = PlanStop.__table__.columns
        # 1-Click Swap & Backup POIs JSONB
        assert "backup_options" in columns
        # Atomic counter columns
        assert "up_votes" in columns
        assert "down_votes" in columns
        # Defaults
        assert columns["up_votes"].default.arg == 0
        assert columns["down_votes"].default.arg == 0

    def test_plan_stop_lifecycle_and_history_columns(self):
        columns = PlanStop.__table__.columns
        assert "stop_status" in columns
        assert "is_initial_stop" in columns
        assert "is_finalized_stop" in columns
        assert "replaced_by_stop_id" in columns
        assert "change_reason" in columns
        assert "locked_at" in columns

    def test_plan_stop_foreign_keys(self):
        fks = list(PlanStop.__table__.foreign_keys)
        fk_targets = [fk.target_fullname for fk in fks]
        # Must reference core.plans.id
        assert any("plans.id" in target for target in fk_targets)
        # Must reference core.plan_stops.id for non-destructive replacement
        assert any("plan_stops.id" in target for target in fk_targets)

    def test_backward_compatibility_reexport(self):
        """Ensure importing PlanStop from app.models.plan works identically."""
        assert PlanStop is PlanStopFromPlan


class TestPlanVoteModel:
    """Verifies PlanVote normalization and unique voting constraints."""

    def test_plan_vote_table_and_columns(self):
        columns = PlanVote.__table__.columns
        assert "stop_id" in columns
        assert "user_id" in columns
        assert "value" in columns
        assert "comment" in columns

    def test_plan_vote_foreign_keys(self):
        fks = list(PlanVote.__table__.foreign_keys)
        fk_targets = [fk.target_fullname for fk in fks]
        assert any("plan_stops.id" in target for target in fk_targets)
        assert any("users.id" in target for target in fk_targets)

    def test_unique_constraint_stop_user_vote(self):
        """Must have unique constraint on (stop_id, user_id) to prevent duplicate votes."""
        constraints = PlanVote.__table__.constraints
        unique_constraints = [c for c in constraints if c.__class__.__name__ == "UniqueConstraint"]
        uq_names = [c.name for c in unique_constraints]
        assert "uq_stop_user_vote" in uq_names

        target_uq = next(c for c in unique_constraints if c.name == "uq_stop_user_vote")
        col_names = [col.name for col in target_uq.columns]
        assert "stop_id" in col_names
        assert "user_id" in col_names


class TestRelationshipsAndEnums:
    """Verifies ORM mapper relationships and Enums alignment."""

    def test_relationships_mapped_cleanly(self):
        plan_insp = inspect(Plan)
        stop_insp = inspect(PlanStop)
        vote_insp = inspect(PlanVote)

        assert "stops" in plan_insp.relationships
        assert "plan" in stop_insp.relationships
        assert "votes" in stop_insp.relationships
        assert "stop" in vote_insp.relationships
        assert "user" in vote_insp.relationships

    def test_enums_alignment(self):
        assert StopCategory.RESTAURANT == "RESTAURANT"
        assert StopCategory.CAFE == "CAFE"
        assert StopCategory.ATTRACTION == "ATTRACTION"
        assert TimeSlot.MORNING == "MORNING"
        assert StopStatus.INITIAL_PROPOSED == "INITIAL_PROPOSED"
        assert StopStatus.REJECTED_IN_VOTE == "REJECTED_IN_VOTE"
        assert VoteValue.UP == "UP"
        assert VoteValue.DOWN == "DOWN"
        assert TransportMode.TAXI_GRAB == "TAXI_GRAB"
