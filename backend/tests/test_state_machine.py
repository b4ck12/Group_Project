"""Unit tests for TASK-109 Two-Phase State Machine and lean tool wrapper."""

from typing import Optional
from unittest.mock import AsyncMock

import pytest

from app.ai_agents.model_abstraction import (
    LLMModelAbstraction,
    LlmRequest,
    LlmResponse,
    Message,
    ToolCall,
    ToolResult,
)
from app.ai_agents.state import AgentPhase, AgentState, DailyThemeDTO, PlaceStopDTO
from app.ai_agents.state_machine import TwoPhaseStateMachine, build_structured_output_tool
from app.ai_agents.tools import tool
from app.core.config import settings


def _make_state(macro_locked: bool = False, final_locked: bool = False) -> AgentState:
    return AgentState(
        event_id="evt_test_109",
        destination="Đà Nẵng",
        macro_locked=macro_locked,
        final_locked=final_locked,
    )


def test_resolve_phase_routing():
    model = LLMModelAbstraction(providers=[])
    sm = TwoPhaseStateMachine(model=model)

    assert sm.resolve_phase(_make_state(False, False)) == AgentPhase.MACRO_PLANNING
    assert sm.resolve_phase(_make_state(True, False)) == AgentPhase.MICRO_CURATION
    assert sm.resolve_phase(_make_state(True, True)) == AgentPhase.FINALIZED


@pytest.mark.asyncio
async def test_phase1_macro_enforces_zero_external_tools_and_preserves_lock():
    @tool
    async def search_places(keyword: str, lat: Optional[float] = None) -> dict:
        """Search places."""
        return {"keyword": keyword, "lat": lat}

    captured_requests: list[LlmRequest] = []

    async def fake_generate(req: LlmRequest) -> LlmResponse:
        captured_requests.append(req)
        return LlmResponse(
            content=[Message(role="assistant", content="Macro 3-day Da Nang draft")],
            provider="deepseek",
            model="deepseek-chat",
            usage_metadata={"input_tokens": 50, "output_tokens": 25},
        )

    mock_model = AsyncMock(spec=LLMModelAbstraction)
    mock_model.generate = AsyncMock(side_effect=fake_generate)

    sm = TwoPhaseStateMachine(model=mock_model, tools=[search_places])
    assert sm.max_steps == settings.AI_MAX_STEPS_PER_SESSION == 15

    state = _make_state(macro_locked=False, final_locked=False)
    result = await sm.run(state, user_input="Lên lịch Đà Nẵng 3 ngày")

    assert result.status == "awaiting_macro_lock"
    assert result.output == "Macro 3-day Da Nang draft"
    assert result.state.phase == AgentPhase.MACRO_PLANNING
    assert result.state.macro_locked is False
    assert result.state.step_count == 1
    assert len(result.usage_records) == 1
    assert captured_requests[0].tools == []
    assert captured_requests[0].tool_choice is None


@pytest.mark.asyncio
async def test_phase2_micro_executes_tool_loop_with_optional_schema():
    @tool
    async def search_places(keyword: str, lat: Optional[float] = None) -> dict:
        """Search verified places near coordinates."""
        return {"places": [{"name": "Bep Cuon", "keyword": keyword, "lat": lat}]}

    # Verify Optional[float] unwraps cleanly to "number" instead of "string"
    params = search_places.tool_definition["function"]["parameters"]
    assert params["properties"]["lat"]["type"] == "number"
    assert params["required"] == ["keyword"]

    responses = [
        LlmResponse(
            content=[
                ToolCall(
                    tool_call_id="tc_1",
                    name="search_places",
                    arguments={"keyword": "Bep Cuon", "lat": 16.05},
                )
            ],
            usage_metadata={"input_tokens": 80, "output_tokens": 20},
        ),
        LlmResponse(
            content=[Message(role="assistant", content="Curated Bep Cuon stop.")],
            usage_metadata={"input_tokens": 110, "output_tokens": 30},
        ),
    ]

    mock_model = AsyncMock(spec=LLMModelAbstraction)
    mock_model.generate = AsyncMock(side_effect=responses)

    sm = TwoPhaseStateMachine(model=mock_model, tools=[search_places])
    state = _make_state(macro_locked=True, final_locked=False)
    result = await sm.run(state, user_input="Tìm quán ăn ở Đà Nẵng")

    assert result.status == "awaiting_final_lock"
    assert result.output == "Curated Bep Cuon stop."
    assert result.state.phase == AgentPhase.MICRO_CURATION
    assert result.state.macro_locked is True
    assert result.state.final_locked is False
    assert result.state.step_count == 2
    assert len(result.usage_records) == 2
    assert mock_model.generate.await_count == 2


@pytest.mark.asyncio
async def test_phase2_tool_errors_and_unknown_tools_recover_via_tool_result():
    @tool
    async def unstable_tool(x: int) -> int:
        """Fails intentionally."""
        raise RuntimeError(f"boom-{x}")

    responses = [
        LlmResponse(
            content=[
                ToolCall(tool_call_id="tc_missing", name="nonexistent", arguments={}),
                ToolCall(tool_call_id="tc_fail", name="unstable_tool", arguments={"x": 1}),
            ],
        ),
        LlmResponse(
            content=[Message(role="assistant", content="Recovered safely")],
        ),
    ]
    mock_model = AsyncMock(spec=LLMModelAbstraction)
    mock_model.generate = AsyncMock(side_effect=responses)

    sm = TwoPhaseStateMachine(model=mock_model, tools=[unstable_tool])
    result = await sm.run(_make_state(macro_locked=True), user_input="Run tools")

    assert result.status == "awaiting_final_lock"
    assert result.output == "Recovered safely"
    tool_events = [ev for ev in result.events if ev.author == "tool_runner"]
    assert len(tool_events) == 1
    assert all(isinstance(r, ToolResult) and r.status == "error" for r in tool_events[0].content)


@pytest.mark.asyncio
async def test_max_steps_bound_stops_infinite_tool_loops():
    @tool
    def ping() -> str:
        """Ping tool."""
        return "pong"

    mock_model = AsyncMock(spec=LLMModelAbstraction)
    mock_model.generate = AsyncMock(
        return_value=LlmResponse(
            content=[ToolCall(tool_call_id="tc_loop", name="ping", arguments={})]
        )
    )

    sm = TwoPhaseStateMachine(model=mock_model, tools=[ping], max_steps=3)
    result = await sm.run(_make_state(macro_locked=True), user_input="Loop forever")

    assert result.status == "max_steps_reached"
    assert result.state.step_count == 3
    assert mock_model.generate.await_count == 3


@pytest.mark.asyncio
async def test_custom_handlers_and_human_in_the_loop_lock_protection():
    async def sneaky_macro_handler(state: AgentState, _user_input: str, tools: list) -> AgentState:
        assert tools == []
        state.daily_themes.append(DailyThemeDTO(day=1, theme="Biển Mỹ Khê"))
        # Attempt to auto-lock (must be blocked by Human-in-the-Loop guard)
        state.macro_locked = True
        state.final_locked = True
        return state

    sm = TwoPhaseStateMachine(
        model=LLMModelAbstraction(providers=[]),
        macro_handler=sneaky_macro_handler,
    )

    res1 = await sm.run(_make_state(macro_locked=False, final_locked=False), user_input="Draft")
    assert res1.status == "awaiting_macro_lock"
    assert res1.state.macro_locked is False
    assert res1.state.final_locked is False
    assert res1.state.phase == AgentPhase.MACRO_PLANNING
    assert len(res1.state.daily_themes) == 1

    res_final = await sm.run(_make_state(macro_locked=True, final_locked=True))
    assert res_final.status == "finalized"
    assert res_final.state.phase == AgentPhase.FINALIZED


def test_build_structured_output_tool_preserves_nested_defs():
    structured_tool = build_structured_output_tool(PlaceStopDTO)
    params = structured_tool.tool_definition["function"]["parameters"]

    assert "$defs" in params
    assert "RecommendedDishItem" in params["$defs"]
    assert "CandidateOption" in params["$defs"]
    assert "BackupOption" in params["$defs"]
