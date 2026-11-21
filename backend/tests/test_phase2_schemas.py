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
    FetchMoreBackupsRequest,
    FetchMoreBackupsResponse,
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
    assert swap_req.cycle_next is False

    swap_cycle_req = StopSwapRequest(cycle_next=True, change_reason="Too crowded")
    assert swap_cycle_req.cycle_next is True

    with pytest.raises(ValidationError):
        StopSwapRequest()

    swap_resp = StopSwapResponse(
        previous_stop_id="stop-1",
        new_stop_id="stop-2",
        new_place_name="Beach Cafe",
        selected_option_index=2,
        category=StopCategory.CAFE,
        lat=16.05,
        lng=108.20,
        replaced_by_stop_id="stop-2",
        updated_at=now,
    )
    assert swap_resp.previous_stop_id == "stop-1"
    assert swap_resp.new_stop_id == "stop-2"
    assert swap_resp.selected_option_index == 2

    fetch_more_req = FetchMoreBackupsRequest(
        clarification_notes="Prefer quiet BBQ",
        dietary_filter="NON_SPICY",
        exclude_place_ref_ids=["poi-1", "poi-456"],
    )
    assert fetch_more_req.dietary_filter == "NON_SPICY"

    fetch_more_resp = FetchMoreBackupsResponse(
        stop_id="stop-2",
        backup_options=[
            BackupOption(
                option_index=4,
                place_name="Quiet BBQ Garden",
                place_ref_id="poi-999",
                category=StopCategory.RESTAURANT,
                estimated_cost=180000.0,
                distance_km=0.9,
            )
        ],
    )
    assert fetch_more_resp.backup_options[0].option_index == 4

    adapt_req = StopAdaptationRequest(
        new_place_name="Indoor Museum",
        new_place_ref_id="poi-789",
        change_reason="Rain forecast adaptation",
    )
    assert adapt_req.change_reason == "Rain forecast adaptation"

    adapt_resp = StopAdaptationResponse(
        previous_stop_id="stop-1",
        new_stop_id="stop-2",
        new_place_name="Indoor Museum",
        new_place_ref_id="poi-789",
        replaced_by_stop_id="stop-2",
        change_reason="Rain forecast adaptation",
        cloned_plan_id="plan-v3",
        updated_at=now,
    )
    assert adapt_resp.new_place_name == "Indoor Museum"
    assert adapt_resp.cloned_plan_id == "plan-v3"


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


def test_plan_stop_transit_and_lifecycle_schemas():
    from datetime import date
    from app.models.enums import StopStatus, TransportMode
    from app.schemas.plan import PlanStageHistoryResponse, PlanStatusTransitionRequest

    now = datetime.now(timezone.utc)
    stop = PlanStopResponse(
        id="stop-initial-1",
        plan_id="plan-v1",
        order=1,
        place_name="Ba Na Hills",
        address="Hoa Ninh, Hoa Vang, Da Nang",
        stop_date=date(2026, 11, 15),
        start_time=now,
        end_time=now,
        duration_minutes=180,
        estimated_cost=Decimal("900000.00"),
        transport_mode=TransportMode.TAXI_GRAB,
        transit_duration_minutes=45,
        transit_distance_km=28.5,
        transit_cost=Decimal("350000.00"),
        stop_status=StopStatus.SKIPPED_ON_TRIP,
        is_initial_stop=True,
        is_finalized_stop=True,
        replaced_by_stop_id="stop-rain-backup-1",
        change_reason="Heavy rain at mountain peak; switched to indoor cafe",
    )
    assert stop.transport_mode == TransportMode.TAXI_GRAB
    assert stop.transit_cost == Decimal("350000.00")
    assert stop.stop_status == StopStatus.SKIPPED_ON_TRIP
    assert stop.replaced_by_stop_id == "stop-rain-backup-1"

    transition = PlanStatusTransitionRequest(
        status=PlanStatus.ONGOING,
        change_summary="Trip started on schedule",
    )
    assert transition.status == PlanStatus.ONGOING

    history = PlanStageHistoryResponse(
        plan_id="plan-v1",
        event_id="ev-1",
        version_number=1,
        current_status=PlanStatus.ONGOING,
        initial_stops=[stop],
        finalized_stops=[stop],
        ongoing_stops=[],
        rejected_or_skipped_stops=[stop],
    )
    assert history.version_number == 1
    assert len(history.rejected_or_skipped_stops) == 1


def test_plan_stop_negative_transit_rejected():
    with pytest.raises(ValidationError):
        PlanStopCreate(
            order=1,
            place_name="Invalid Transit Stop",
            transit_duration_minutes=-10,
        )
    with pytest.raises(ValidationError):
        PlanStopCreate(
            order=1,
            place_name="Invalid Transit Cost",
            transit_cost=Decimal("-5000"),
        )


@pytest.mark.asyncio
async def test_plan_endpoints_501_skeletons():
    from httpx import ASGITransport, AsyncClient
    from app.main import app

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        r1 = await client.get("/api/v1/events/ev-1/plans")
        assert r1.status_code == 501

        r2 = await client.post("/api/v1/events/ev-1/plans", json={"title": "Test Plan"})
        assert r2.status_code == 501

        r3 = await client.get("/api/v1/events/ev-1/plans/p-1")
        assert r3.status_code == 501

        r4 = await client.patch(
            "/api/v1/events/ev-1/plans/p-1/stops",
            json=[{"order": 1, "place_name": "Test"}],
        )
        assert r4.status_code == 501

        r5 = await client.patch(
            "/api/v1/events/ev-1/plans/p-1/status",
            json={"status": "VOTING"},
        )
        assert r5.status_code == 501

        r6 = await client.post(
            "/api/v1/events/ev-1/plans/p-1/stops/s-1/swap",
            json={"target_backup_place_ref_id": "ref-1"},
        )
        assert r6.status_code == 501

        r7 = await client.post(
            "/api/v1/events/ev-1/plans/p-1/stops/s-1/adapt",
            json={
                "new_place_name": "Cafe",
                "new_place_ref_id": "ref-2",
                "change_reason": "rain",
            },
        )
        assert r7.status_code == 501

        r8 = await client.get("/api/v1/events/ev-1/plans/p-1/history")
        assert r8.status_code == 501


def test_pr28_pr30_extended_schemas():
    from datetime import date
    from app.models.enums import ChatMessageType
    import app.schemas as schemas_pkg
    from app.schemas import (
        ChatMessageListResponse,
        PlanCloneRequest,
        PlanGenerateRequest,
        PlanVersionSummary,
        RecommendedDishItem,
        StopDishesResponse,
        UserProfileUpdate,
    )

    now = datetime.now(timezone.utc)

    # Dish recommendations & plan generation/cloning
    dish = RecommendedDishItem(
        dish_name="Mi Quang Ech",
        estimated_price=Decimal("55000"),
        tags=["Local Specialty", "Non-spicy"],
        dietary_match=True,
    )
    dishes_resp = StopDishesResponse(
        stop_id="stop-1",
        place_name="Bep Cuon",
        recommended_dishes=[dish],
        dietary_notes_applied=["Nam: Vegetarian"],
    )
    assert dishes_resp.recommended_dishes[0].dish_name == "Mi Quang Ech"

    clone_req = PlanCloneRequest(
        target_status=PlanStatus.FINALIZED,
        change_summary="Lock final itinerary v2",
        title="Da Nang v2",
    )
    assert clone_req.target_status == PlanStatus.FINALIZED

    gen_req = PlanGenerateRequest(
        destination="Da Nang",
        start_date=date(2026, 12, 20),
        end_date=date(2026, 12, 22),
        budget_tier=BudgetTier.MODERATE,
    )
    assert gen_req.destination == "Da Nang"

    with pytest.raises(ValidationError):
        PlanGenerateRequest(
            destination="Da Nang",
            start_date=date(2026, 12, 22),
            end_date=date(2026, 12, 20),
        )

    ver_summary = PlanVersionSummary(
        id="plan-v2",
        version_number=2,
        parent_plan_id="plan-v1",
        status=PlanStatus.FINALIZED,
        is_active=True,
        total_budget=Decimal("5000000"),
        change_summary="Finalized",
        locked_at=now,
        created_at=now,
    )
    assert ver_summary.version_number == 2

    # Chat message_type, metadata alias, and pagination list
    chat_in = ChatMessageCreate(
        content="Suggest vegetarian food",
        message_type=ChatMessageType.AGENT_QA,
        metadata={"intent": "dish_qa"},
    )
    assert chat_in.message_type == ChatMessageType.AGENT_QA
    assert chat_in.metadata_ == {"intent": "dish_qa"}

    chat_out = ChatMessageResponse(
        id="msg-2",
        event_id="ev-1",
        role=ChatRole.AI,
        message_type=ChatMessageType.AGENT_QA,
        content="Try mushroom rolls.",
        metadata={"dishes_count": 2},
        created_at=now,
    )
    assert chat_out.model_dump(by_alias=True)["metadata"] == {"dishes_count": 2}
    chat_list = ChatMessageListResponse(messages=[chat_out], total=1, has_more=False)
    assert chat_list.total == 1

    # User profile & Event budget / dietary notes
    profile_upd = UserProfileUpdate(
        full_name="Ha Dang Huy",
        dietary_preferences={"no_spicy": True},
    )
    assert profile_upd.dietary_preferences == {"no_spicy": True}

    ev_with_budget = EventBase(
        name="Da Nang",
        start_date=now,
        end_date=now,
        total_budget=Decimal("10000000"),
    )
    assert ev_with_budget.total_budget == Decimal("10000000")

    member = EventMemberResponse(
        id="mem-1",
        event_id="ev-1",
        user_id="u-1",
        role=EventRole.MEMBER,
        dietary_notes="No seafood",
    )
    assert member.dietary_notes == "No seafood"
    assert hasattr(schemas_pkg, "FetchMoreBackupsRequest")



