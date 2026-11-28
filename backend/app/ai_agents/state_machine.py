"""Pure Python AsyncIO Two-Phase State Machine for TripMate AI (TASK-109, ADR-001)."""

from __future__ import annotations

import json
from typing import Any, Awaitable, Callable, Dict, List, Literal, Optional, Type, Union
import uuid

from pydantic import BaseModel, Field

from app.ai_agents.model_abstraction import (
    AgentEvent,
    ContentItem,
    LLMModelAbstraction,
    LlmRequest,
    LlmResponse,
    Message,
    ToolCall,
    ToolResult,
)
from app.ai_agents.state import AgentMessageDTO, AgentPhase, AgentState
from app.ai_agents.tools import BaseTool, FunctionTool, format_tool_definition
from app.core.config import settings

PhaseHandler = Callable[[AgentState, str, List[BaseTool]], Awaitable[AgentState]]

DEFAULT_MACRO_INSTRUCTIONS = (
    "You are TripMate AI in Phase 1 (Macro Planning). "
    "Draft trip days, pacing, daily themes, and high-level budget breakdown without calling "
    "external travel APIs. Wait for Host macro consensus before venue grounding."
)

DEFAULT_MICRO_INSTRUCTIONS = (
    "You are TripMate AI in Phase 2 (Micro Curation). "
    "Use grounded travel and weather tools to verify real places, enforce <=2.5km clustering, "
    "respect budget and dietary preferences, and prepare backup options."
)


class AgentExecutionResult(BaseModel):
    """Output envelope returned by TwoPhaseStateMachine.run()."""

    state: AgentState
    output: Optional[Any] = None
    status: Literal[
        "completed",
        "awaiting_macro_lock",
        "awaiting_final_lock",
        "max_steps_reached",
        "finalized",
    ] = "completed"
    events: List[AgentEvent] = Field(default_factory=list)
    usage_records: List[Dict[str, Any]] = Field(default_factory=list)


def build_structured_output_tool(
    output_model: Type[BaseModel],
    name: str = "final_answer",
) -> FunctionTool:
    """Create a strict validation tool preserving `$defs` for nested Pydantic schemas."""
    output_schema = output_model.model_json_schema()
    output_schema.pop("title", None)
    defs = output_schema.pop("$defs", None)

    parameters: Dict[str, Any] = {
        "type": "object",
        "properties": {"output": output_schema},
        "required": ["output"],
    }
    if defs is not None:
        parameters["$defs"] = defs

    tool_definition = format_tool_definition(
        name=name,
        description=f"Return final structured output matching {output_model.__name__}.",
        parameters=parameters,
    )

    def _validate_output(output: Dict[str, Any]) -> Dict[str, Any]:
        validated = output_model.model_validate(output)
        return validated.model_dump(mode="json")

    return FunctionTool(
        func=_validate_output,
        name=name,
        description=f"Return final structured output matching {output_model.__name__}.",
        tool_definition=tool_definition,
    )


class TwoPhaseStateMachine:
    """Explicit AsyncIO state machine orchestrating Phase 1 Macro and Phase 2 Micro flows."""

    def __init__(
        self,
        model: LLMModelAbstraction,
        tools: Optional[List[Union[BaseTool, Callable[..., Any]]]] = None,
        max_steps: Optional[int] = None,
        macro_instructions: str = DEFAULT_MACRO_INSTRUCTIONS,
        micro_instructions: str = DEFAULT_MICRO_INSTRUCTIONS,
        macro_handler: Optional[PhaseHandler] = None,
        micro_handler: Optional[PhaseHandler] = None,
        finalized_handler: Optional[PhaseHandler] = None,
    ):
        self.model = model
        self.tools: List[BaseTool] = [
            t if isinstance(t, BaseTool) else FunctionTool(t)
            for t in (tools or [])
        ]
        self.max_steps = (
            max_steps if max_steps is not None else settings.AI_MAX_STEPS_PER_SESSION
        )
        self.macro_instructions = macro_instructions
        self.micro_instructions = micro_instructions
        self.macro_handler = macro_handler
        self.micro_handler = micro_handler
        self.finalized_handler = finalized_handler

    def resolve_phase(self, state: AgentState) -> AgentPhase:
        """Determine active phase strictly from Host-controlled lock flags."""
        if state.final_locked:
            return AgentPhase.FINALIZED
        if state.macro_locked:
            return AgentPhase.MICRO_CURATION
        return AgentPhase.MACRO_PLANNING

    async def run(
        self,
        state: AgentState,
        user_input: Optional[str] = None,
    ) -> AgentExecutionResult:
        """Execute the active phase on `state`, respecting step caps and lock invariants."""
        initial_macro_locked = state.macro_locked
        initial_final_locked = state.final_locked

        execution_id = f"{state.event_id}:{uuid.uuid4().hex[:8]}"
        events: List[AgentEvent] = []
        usage_records: List[Dict[str, Any]] = []

        state.phase = self.resolve_phase(state)

        if user_input:
            state.messages.append(AgentMessageDTO(role="user", content=user_input))
            events.append(
                AgentEvent(
                    execution_id=execution_id,
                    author="user",
                    content=[Message(role="user", content=user_input)],
                )
            )

        if state.phase == AgentPhase.FINALIZED:
            if self.finalized_handler is not None:
                state = await self.finalized_handler(state, user_input or "", self.tools)
            self._enforce_lock_invariants(state, initial_macro_locked, initial_final_locked)
            return AgentExecutionResult(
                state=state,
                output=None,
                status="finalized",
                events=events,
                usage_records=usage_records,
            )

        if state.step_count >= self.max_steps:
            self._enforce_lock_invariants(state, initial_macro_locked, initial_final_locked)
            return AgentExecutionResult(
                state=state,
                output=None,
                status="max_steps_reached",
                events=events,
                usage_records=usage_records,
            )

        if state.phase == AgentPhase.MACRO_PLANNING:
            # Phase 1 never exposes external travel APIs to save tokens before Macro Lock.
            if self.macro_handler is not None:
                state = await self.macro_handler(state, user_input or "", [])
                state.step_count += 1
                self._enforce_lock_invariants(state, initial_macro_locked, initial_final_locked)
                return AgentExecutionResult(
                    state=state,
                    output=state.messages[-1].content if state.messages else None,
                    status="awaiting_macro_lock",
                    events=events,
                    usage_records=usage_records,
                )

            output, completed = await self._run_phase_loop(
                state=state,
                execution_id=execution_id,
                events=events,
                active_tools=[],
                instructions=self.macro_instructions,
                usage_records=usage_records,
            )
            self._enforce_lock_invariants(state, initial_macro_locked, initial_final_locked)
            return AgentExecutionResult(
                state=state,
                output=output,
                status="awaiting_macro_lock" if completed else "max_steps_reached",
                events=events,
                usage_records=usage_records,
            )

        # Phase 2: MICRO_CURATION
        if self.micro_handler is not None:
            state = await self.micro_handler(state, user_input or "", self.tools)
            state.step_count += 1
            self._enforce_lock_invariants(state, initial_macro_locked, initial_final_locked)
            return AgentExecutionResult(
                state=state,
                output=state.messages[-1].content if state.messages else None,
                status="awaiting_final_lock",
                events=events,
                usage_records=usage_records,
            )

        output, completed = await self._run_phase_loop(
            state=state,
            execution_id=execution_id,
            events=events,
            active_tools=self.tools,
            instructions=self.micro_instructions,
            usage_records=usage_records,
        )
        self._enforce_lock_invariants(state, initial_macro_locked, initial_final_locked)
        return AgentExecutionResult(
            state=state,
            output=output,
            status="awaiting_final_lock" if completed else "max_steps_reached",
            events=events,
            usage_records=usage_records,
        )

    async def _run_phase_loop(
        self,
        state: AgentState,
        execution_id: str,
        events: List[AgentEvent],
        active_tools: List[BaseTool],
        instructions: str,
        usage_records: List[Dict[str, Any]],
    ) -> tuple[Optional[str], bool]:
        """Run bounded think-act steps until final assistant response or max_steps."""
        while state.step_count < self.max_steps:
            final_text = await self.step(
                state=state,
                execution_id=execution_id,
                events=events,
                active_tools=active_tools,
                instructions=instructions,
                usage_records=usage_records,
            )
            if final_text is not None:
                return final_text, True
        return None, False

    async def step(
        self,
        state: AgentState,
        execution_id: str,
        events: List[AgentEvent],
        active_tools: List[BaseTool],
        instructions: str,
        usage_records: List[Dict[str, Any]],
    ) -> Optional[str]:
        """Execute one think-act cycle and increment `state.step_count`."""
        llm_request = self._build_llm_request(state, events, active_tools, instructions)
        llm_response = await self.think(llm_request)
        if llm_response.usage_metadata:
            usage_records.append(llm_response.usage_metadata)

        events.append(
            AgentEvent(
                execution_id=execution_id,
                author=f"tripmate_{state.phase.value.lower()}",
                content=llm_response.content,
            )
        )

        tool_calls = [c for c in llm_response.content if isinstance(c, ToolCall)]
        if tool_calls:
            tool_results = await self.act(state, tool_calls, active_tools)
            events.append(
                AgentEvent(
                    execution_id=execution_id,
                    author="tool_runner",
                    content=list(tool_results),
                )
            )
            state.step_count += 1
            return None

        state.step_count += 1
        final_text = self._extract_assistant_text(llm_response.content)
        if final_text is not None:
            state.messages.append(AgentMessageDTO(role="assistant", content=final_text))
        return final_text

    async def think(self, llm_request: LlmRequest) -> LlmResponse:
        """Delegate reasoning step to the configured LLMModelAbstraction."""
        return await self.model.generate(llm_request)

    async def act(
        self,
        state: AgentState,
        tool_calls: List[ToolCall],
        active_tools: List[BaseTool],
    ) -> List[ToolResult]:
        """Execute requested tools, capturing unknown/failed calls cleanly as ToolResult."""
        tools_by_name = {t.name: t for t in active_tools}
        results: List[ToolResult] = []

        for tc in tool_calls:
            tool_obj = tools_by_name.get(tc.name)
            if tool_obj is None:
                results.append(
                    ToolResult(
                        tool_call_id=tc.tool_call_id,
                        name=tc.name,
                        status="error",
                        content=[f"Tool '{tc.name}' not found or disabled in current phase."],
                    )
                )
                continue

            try:
                output = await tool_obj(state, **tc.arguments)
                results.append(
                    ToolResult(
                        tool_call_id=tc.tool_call_id,
                        name=tc.name,
                        status="success",
                        content=[output],
                    )
                )
            except Exception as exc:
                results.append(
                    ToolResult(
                        tool_call_id=tc.tool_call_id,
                        name=tc.name,
                        status="error",
                        content=[f"Error executing '{tc.name}': {exc}"],
                    )
                )

        return results

    def _build_llm_request(
        self,
        state: AgentState,
        events: List[AgentEvent],
        active_tools: List[BaseTool],
        instructions: str,
    ) -> LlmRequest:
        """Assemble system instructions, state summary, history, and tool schemas."""
        state_context = json.dumps(
            {
                "event_id": state.event_id,
                "phase": state.phase.value,
                "destination": state.destination,
                "scope": state.scope.value,
                "group_size": state.group_size,
                "budget_tier": state.budget_tier.value,
                "macro_locked": state.macro_locked,
                "final_locked": state.final_locked,
                "dietary_preferences": state.dietary_preferences,
            },
            ensure_ascii=False,
        )

        contents: List[ContentItem] = []
        if events:
            for ev in events:
                contents.extend(ev.content)
        else:
            for msg in state.messages:
                if msg.role in ("system", "user", "assistant"):
                    contents.append(Message(role=msg.role, content=msg.content))

        tool_defs = [
            t.tool_definition for t in active_tools if t.tool_definition is not None
        ]

        return LlmRequest(
            instructions=[
                instructions,
                f"Current TripMate AgentState Context:\n{state_context}",
            ],
            contents=contents,
            tools=tool_defs,
            tool_choice="auto" if tool_defs else None,
        )

    @staticmethod
    def _extract_assistant_text(content: List[ContentItem]) -> Optional[str]:
        for item in content:
            if isinstance(item, Message) and item.role == "assistant":
                return item.content
        return None

    @staticmethod
    def _enforce_lock_invariants(
        state: AgentState,
        macro_locked: bool,
        final_locked: bool,
    ) -> None:
        """Human-in-the-loop guarantee: agent execution never auto-locks Host consensus."""
        state.macro_locked = macro_locked
        state.final_locked = final_locked
        if state.final_locked:
            state.phase = AgentPhase.FINALIZED
        elif state.macro_locked:
            state.phase = AgentPhase.MICRO_CURATION
        else:
            state.phase = AgentPhase.MACRO_PLANNING
