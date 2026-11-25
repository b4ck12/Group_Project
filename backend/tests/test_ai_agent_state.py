"""Unit tests for TASK-003 AgentState schema and mock fixture validation."""

import json
from datetime import date, datetime, timezone
from decimal import Decimal
from pathlib import Path

import pytest
from pydantic import ValidationError

from app.ai_agents.state import (
    AgentPhase,
    AgentState,
    BudgetBreakdownDTO,
    DailyThemeDTO,
    PlaceStopDTO,
    TransitInfoDTO,
)
from app.models.enums import StopCategory, TimeSlot
from app.models.stop import PlanStop
from app.schemas.consensus import RoadmapTheme
from app.schemas.place import POIItem
from app.schemas.plan import PlanStopCreate

FIXTURES_DIR = Path(__file__).resolve().parent.parent / "app" / "ai_agents" / "fixtures"


def test_mock_places_fixture_validates_with_poi_item():
    raw_places = json.loads((FIXTURES_DIR / "mock_places.json").read_text(encoding="utf-8"))
    assert len(raw_places) >= 8

    items = [POIItem.model_validate(entry) for entry in raw_places]
    assert all(item.place_id and item.name for item in items)

    compact = items[1].to_llm_compact_dict()
    assert "photo_url" not in compact
    assert "website_uri" not in compact
    assert "phone_number" not in compact
    assert "metadata" not in compact
    assert compact["place_id"] == items[1].place_id


def test_mock_roadmaps_fixture_validates_with_agent_state_and_plan_models():
    payload = json.loads((FIXTURES_DIR / "mock_roadmaps.json").read_text(encoding="utf-8"))
    scenarios = payload["scenarios"]
    assert len(scenarios) == 2

    for scenario in scenarios:
        state = AgentState.model_validate(scenario)
        assert state.running_cost == state.recalculate_running_cost()

        # Verify daily themes map cleanly to consensus.RoadmapTheme
        for theme in state.daily_themes:
            roadmap_theme = theme.to_roadmap_theme()
            assert isinstance(roadmap_theme, RoadmapTheme)

        # Verify every stop maps cleanly to PlanStopCreate and SQLAlchemy PlanStop
        for stop in state.plan_stops:
            create_dto = stop.to_plan_stop_create()
            assert isinstance(create_dto, PlanStopCreate)

            orm_stop = PlanStop(
                plan_id="plan-fixture-test",
                **create_dto.model_dump(),
                backup_options=[opt.model_dump() for opt in stop.backup_options],
            )
            assert orm_stop.place_name == stop.place_name
            assert orm_stop.place_ref_id == stop.place_ref_id
            assert orm_stop.order_index == stop.order_index


def test_agent_state_checkpoint_jsonb_roundtrip():
    payload = json.loads((FIXTURES_DIR / "mock_roadmaps.json").read_text(encoding="utf-8"))
    original = AgentState.model_validate(payload["scenarios"][0])

    dumped_json = json.dumps(original.to_checkpoint_dict())
    restored = AgentState.from_checkpoint_dict(json.loads(dumped_json))

    assert restored == original
    assert restored.phase == AgentPhase.MICRO_CURATION
    assert isinstance(restored.running_cost, Decimal)


def test_agent_state_rejects_final_locked_without_macro_locked():
    with pytest.raises(ValidationError, match="final_locked"):
        AgentState(
            event_id="evt-invalid-lock",
            destination="Đà Nẵng",
            macro_locked=False,
            final_locked=True,
        )


def test_agent_state_rejects_end_date_before_start_date():
    with pytest.raises(ValidationError, match="end_date"):
        AgentState(
            event_id="evt-invalid-dates",
            destination="Đà Nẵng",
            start_date=date(2026, 12, 20),
            end_date=date(2026, 12, 18),
        )


def test_place_stop_dto_validates_time_window_and_price_level():
    base_kwargs = {
        "day_number": 1,
        "stop_date": date(2026, 12, 18),
        "time_slot": TimeSlot.MORNING,
        "order_index": 1,
        "start_time": datetime(2026, 12, 18, 10, 0, tzinfo=timezone.utc),
        "end_time": datetime(2026, 12, 18, 9, 0, tzinfo=timezone.utc),
        "duration_minutes": 60,
        "place_name": "Invalid Time Stop",
        "place_ref_id": "place_1",
        "address": "123 Test Street",
        "category": StopCategory.CAFE,
        "lat": 16.05,
        "lng": 108.24,
    }
    with pytest.raises(ValidationError, match="end_time"):
        PlaceStopDTO(**base_kwargs)

    base_kwargs["end_time"] = datetime(2026, 12, 18, 11, 0, tzinfo=timezone.utc)
    base_kwargs["price_level"] = 5
    with pytest.raises(ValidationError):
        PlaceStopDTO(**base_kwargs)


def test_budget_breakdown_dto_invariants():
    with pytest.raises(ValidationError, match="intercity_transit_budget"):
        BudgetBreakdownDTO(
            total_budget=Decimal("1000000"),
            is_transit_prebooked=True,
            intercity_transit_budget=Decimal("200000"),
            land_budget=Decimal("800000"),
        )

    with pytest.raises(ValidationError, match="land_budget"):
        BudgetBreakdownDTO(
            total_budget=Decimal("1000000"),
            is_transit_prebooked=True,
            intercity_transit_budget=Decimal("0"),
            land_budget=Decimal("1000000"),
            accommodation_budget=Decimal("600000"),
            dining_budget=Decimal("500000"),
        )


def test_recalculate_running_cost_respects_prebooked_transit():
    state = AgentState(
        event_id="evt-cost",
        destination="Hà Nội",
        transit_info=TransitInfoDTO(
            is_prebooked=True,
            transit_mode="FLIGHT",
            total_transit_cost=Decimal("2000000"),
        ),
        daily_themes=[DailyThemeDTO(day=1, theme="Phố cổ")],
        plan_stops=[
            PlaceStopDTO(
                day_number=1,
                stop_date=date(2026, 12, 12),
                time_slot=TimeSlot.AFTERNOON,
                order_index=1,
                start_time=datetime(2026, 12, 12, 14, 0, tzinfo=timezone.utc),
                end_time=datetime(2026, 12, 12, 15, 0, tzinfo=timezone.utc),
                duration_minutes=60,
                place_name="Cà phê Giảng",
                place_ref_id="ChIJ_hn_cafe_giang",
                address="39 Nguyễn Hữu Huân",
                category=StopCategory.CAFE,
                lat=21.0338,
                lng=105.8534,
                estimated_cost=Decimal("180000"),
                transit_cost=Decimal("20000"),
            )
        ],
    )
    assert state.recalculate_running_cost() == Decimal("200000")
