"""
Tests for Phase 2: Pydantic Schemas Validation and Alignment with Frontend Contracts.
"""
from datetime import datetime, timezone
from decimal import Decimal
import pytest
from pydantic import ValidationError

from app.models.enums import (
    EventType,
    EventScope,
    EventRole,
    BudgetTier,
    TimeSlot,
    StopCategory,
    VoteValue,
    ChatRole,
    InvitationStatus,
    PlanStatus,
)
from app.schemas.event import (
    EventBase,
    EventCreate,
    EventUpdate,
    EventResponse,
    EventMemberResponse,
)
from app.schemas.plan import (
    PlanStopBase,
    PlanStopCreate,
    PlanStopResponse,
    PlanBase,
    PlanCreate,
    PlanResponse,
)
from app.schemas.vote import (
    PlanVoteBase,
    PlanVoteCreate,
    PlanVoteResponse,
)
from app.schemas.user import (
    UserBase,
    UserCreate,
    UserResponse,
    LoginRequest,
    TokenResponse,
    ResetPasswordRequest,
    ForgotPasswordRequest,
    GoogleLoginRequest,
)
from app.schemas.invitation import (
    InvitationBase,
    InvitationCreate,
    InvitationUpdate,
    InvitationResponse,
)
from app.schemas.consensus import (
    RoadmapTheme,
    BackupOption,
    MacroLockRequest,
    MacroLockResponse,
    FinalLockRequest,
    FinalLockResponse,
    StopVoteRequest,
    StopVoteResponse,
    StopSwapRequest,
    StopSwapResponse,
    StopAdaptationRequest,
    StopAdaptationResponse,
)
from app.schemas.chat import (
    ChatMessageCreate,
    ChatMessageResponse,
)


def test_event_schemas():
    now = datetime.now(timezone.utc)
    ev = EventBase(
        name="Trip to Da Nang",
        start_date=now,
        end_date=now,
        scope=EventScope.VACATION,
        destination="Da Nang",
        budget_tier=BudgetTier.MODERATE,
    )
    assert ev.scope == EventScope.VACATION
    assert ev.destination == "Da Nang"
    assert ev.budget_tier == BudgetTier.MODERATE

    ev_resp = EventResponse(
        id="ev-123",
        name="Trip to Da Nang",
        start_date=now,
        end_date=now,
        scope=EventScope.VACATION,
        created_at=now,
        macro_locked=True,
        final_locked=False,
    )
    assert ev_resp.macro_locked is True
    assert ev_resp.final_locked is False

    ev_update = EventUpdate(destination="Hoi An", macro_locked=True)
    assert ev_update.destination == "Hoi An"
    assert ev_update.macro_locked is True
    assert ev_update.name is None


def test_plan_and_stop_schemas():
    now = datetime.now(timezone.utc)
    stop = PlanStopBase(
        order=1,
        place_name="Dragon Bridge",
        day_number=2,
        time_slot=TimeSlot.EVENING,
        category=StopCategory.ATTRACTION,
        estimated_cost=Decimal("150000"),
    )
    # verify alias support for order / order_index
    assert stop.order_index == 1
    assert stop.day_number == 2
    assert stop.time_slot == TimeSlot.EVENING

    stop_resp = PlanStopResponse(
        id="stop-1",
        plan_id="plan-1",
        order=1,
        place_name="Dragon Bridge",
        up_votes=3,
        down_votes=1,
        backup_options=[
            BackupOption(
                place_name="Han River Bridge",
                place_ref_id="ref-123",
                category=StopCategory.ATTRACTION,
                estimated_cost=0.0,
                distance_km=1.2,
            )
        ],
    )
    assert stop_resp.up_votes == 3
    assert len(stop_resp.backup_options) == 1

    plan_resp = PlanResponse(
        id="plan-1",
        event_id="ev-1",
        title="Draft Itinerary",
        status=PlanStatus.VOTING,
        is_ai_generated=True,
        created_by_id="u-1",
        created_at=now,
        macro_roadmap=[{"day": 1, "theme": "City Highlights"}],
        stops=[stop_resp],
    )
    assert plan_resp.status == PlanStatus.VOTING
    assert len(plan_resp.stops) == 1
    assert plan_resp.macro_roadmap == [{"day": 1, "theme": "City Highlights"}]


def test_vote_schema_uses_stop_id():
    now = datetime.now(timezone.utc)
    vote_resp = PlanVoteResponse(
        id="v-1",
        stop_id="stop-1",
        user_id="u-1",
        value=VoteValue.UP,
        created_at=now,
    )
    assert vote_resp.stop_id == "stop-1"


def test_user_schemas_and_auth_dtos():
    now = datetime.now(timezone.utc)
    u_create = UserCreate(
        email="test@example.com",
        password="securePassword123",
        full_name="Tester",
    )
    assert not hasattr(u_create, "role")

    login = LoginRequest(email="test@example.com", password="securePassword123")
    assert login.email == "test@example.com"

    token = TokenResponse(access_token="acc", refresh_token="ref")
    assert token.token_type == "bearer"

    reset = ResetPasswordRequest(token="tok-123", new_password="newPassword456")
    assert reset.token == "tok-123"

    forgot = ForgotPasswordRequest(email="test@example.com")
    assert forgot.email == "test@example.com"

    google = GoogleLoginRequest(code="auth_code_123")
    assert google.code == "auth_code_123"


def test_invitation_update_schema():
    up = InvitationUpdate(status=InvitationStatus.ACCEPTED)
    assert up.status == InvitationStatus.ACCEPTED


def test_consensus_schemas():
    now = datetime.now(timezone.utc)
    theme = RoadmapTheme(day=1, theme="Coastal Exploration")
    macro_resp = MacroLockResponse(
        event_id="ev-1",
        macro_locked=True,
        locked_at=now,
        roadmap_themes=[theme],
    )
    assert macro_resp.macro_locked is True

    final_resp = FinalLockResponse(
        event_id="ev-1",
        final_locked=True,
        locked_at=now,
        total_stops=8,
        total_budget="2500000",
    )
    assert final_resp.final_locked is True
    assert final_resp.total_stops == 8

    swap_req = StopSwapRequest(target_backup_place_ref_id="poi-456")
    assert swap_req.target_backup_place_ref_id == "poi-456"

    swap_resp = StopSwapResponse(
        swapped_stop_id="stop-1",
        new_place_name="Beach Cafe",
        category=StopCategory.CAFE,
        lat=16.05,
        lng=108.20,
        updated_at=now,
    )
    assert swap_resp.swapped_stop_id == "stop-1"

    adapt_req = StopAdaptationRequest(
        place_name="Indoor Museum",
        place_ref_id="poi-789",
        note="Rain forecast adaptation",
    )
    assert adapt_req.note == "Rain forecast adaptation"

    adapt_resp = StopAdaptationResponse(
        stop_id="stop-1",
        place_name="Indoor Museum",
        place_ref_id="poi-789",
        note="Rain forecast adaptation",
        updated_at=now,
    )
    assert adapt_resp.place_name == "Indoor Museum"


def test_chat_schemas():
    now = datetime.now(timezone.utc)
    msg_create = ChatMessageCreate(content="Hello team!", role=ChatRole.USER)
    assert msg_create.content == "Hello team!"

    msg_resp = ChatMessageResponse(
        id="msg-1",
        event_id="ev-1",
        role=ChatRole.AI,
        content="Here is a suggestion for Day 1.",
        created_at=now,
    )
    assert msg_resp.role == ChatRole.AI
