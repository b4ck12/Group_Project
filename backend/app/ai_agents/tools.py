"""Lean async tool abstraction and OpenAI schema generator (TASK-109, ADR-001)."""

from __future__ import annotations

from abc import ABC, abstractmethod
import inspect
import types
from typing import Any, Callable, Dict, List, Optional, Union, get_args, get_origin, get_type_hints

from pydantic import BaseModel

from app.ai_agents.state import AgentState


def _unwrap_optional(hint: Any) -> Any:
    """Unwrap `Optional[T]` or `T | None` into `T` for JSON Schema mapping."""
    origin = get_origin(hint)
    if origin is Union or isinstance(hint, types.UnionType):
        non_none_args = [arg for arg in get_args(hint) if arg is not type(None)]
        if len(non_none_args) == 1:
            return non_none_args[0]
    return hint


def _map_type_to_schema(hint: Any) -> Dict[str, Any]:
    """Map a Python type annotation to a JSON Schema property dict."""
    hint = _unwrap_optional(hint)
    origin = get_origin(hint)

    if hint is str:
        return {"type": "string"}
    if hint is int:
        return {"type": "integer"}
    if hint is float:
        return {"type": "number"}
    if hint is bool:
        return {"type": "boolean"}
    if hint is dict or origin is dict:
        return {"type": "object"}
    if hint is list or origin is list:
        schema: Dict[str, Any] = {"type": "array"}
        args = get_args(hint)
        if args:
            schema["items"] = _map_type_to_schema(args[0])
        return schema
    if isinstance(hint, type) and issubclass(hint, BaseModel):
        return hint.model_json_schema()
    return {"type": "string"}


def function_to_input_schema(func: Callable[..., Any]) -> Dict[str, Any]:
    """Convert a Python function signature into an OpenAI tool parameters JSON Schema."""
    try:
        hints = get_type_hints(func)
    except Exception:
        hints = {
            name: param.annotation
            for name, param in inspect.signature(func).parameters.items()
            if param.annotation is not inspect.Parameter.empty
        }

    sig = inspect.signature(func)
    properties: Dict[str, Any] = {}
    required: List[str] = []

    for name, param in sig.parameters.items():
        if name in ("self", "state", "context"):
            continue
        prop = _map_type_to_schema(hints.get(name))
        prop.setdefault("description", f"Parameter: {name}")
        properties[name] = prop
        if param.default is inspect.Parameter.empty:
            required.append(name)

    schema: Dict[str, Any] = {
        "type": "object",
        "properties": properties,
    }
    if required:
        schema["required"] = required
    return schema


def format_tool_definition(
    name: str,
    description: str,
    parameters: Dict[str, Any],
) -> Dict[str, Any]:
    """Format a tool specification using OpenAI Chat Completions function schema."""
    return {
        "type": "function",
        "function": {
            "name": name,
            "description": description,
            "parameters": parameters,
        },
    }


class BaseTool(ABC):
    """Abstract base class for TripMate AI agent tools."""

    def __init__(
        self,
        name: Optional[str] = None,
        description: Optional[str] = None,
        tool_definition: Optional[Dict[str, Any]] = None,
        requires_confirmation: bool = False,
    ):
        self.name = name or self.__class__.__name__
        self.description = description or (self.__doc__ or "").strip()
        self._tool_definition = tool_definition
        self.requires_confirmation = requires_confirmation

    @property
    def tool_definition(self) -> Optional[Dict[str, Any]]:
        """OpenAI function-calling schema exposed to the model."""
        return self._tool_definition

    @abstractmethod
    async def execute(self, state: AgentState, **kwargs: Any) -> Any:
        """Execute the tool using the current AgentState and parsed LLM arguments."""
        raise NotImplementedError

    async def __call__(self, state: AgentState, **kwargs: Any) -> Any:
        return await self.execute(state, **kwargs)


class FunctionTool(BaseTool):
    """Wraps a sync or async Python callable as a BaseTool with optional state injection."""

    def __init__(
        self,
        func: Callable[..., Any],
        name: Optional[str] = None,
        description: Optional[str] = None,
        tool_definition: Optional[Dict[str, Any]] = None,
        requires_confirmation: bool = False,
    ):
        self.func = func
        self.needs_state = "state" in inspect.signature(func).parameters
        resolved_name = name or func.__name__
        resolved_desc = description or (inspect.getdoc(func) or f"Tool: {resolved_name}")

        super().__init__(
            name=resolved_name,
            description=resolved_desc,
            tool_definition=tool_definition,
            requires_confirmation=requires_confirmation,
        )

        if self._tool_definition is None:
            params = function_to_input_schema(self.func)
            self._tool_definition = format_tool_definition(
                self.name, self.description, params
            )

    async def execute(self, state: AgentState, **kwargs: Any) -> Any:
        """Invoke the wrapped callable, awaiting coroutines transparently."""
        if self.needs_state:
            result = self.func(state=state, **kwargs)
        else:
            result = self.func(**kwargs)

        if inspect.isawaitable(result):
            return await result
        return result


def tool(
    func: Optional[Callable[..., Any]] = None,
    *,
    name: Optional[str] = None,
    description: Optional[str] = None,
    requires_confirmation: bool = False,
) -> Union[FunctionTool, Callable[[Callable[..., Any]], FunctionTool]]:
    """Decorator converting a Python function into an agent FunctionTool."""

    def _decorator(fn: Callable[..., Any]) -> FunctionTool:
        return FunctionTool(
            func=fn,
            name=name,
            description=description,
            requires_confirmation=requires_confirmation,
        )

    if func is not None:
        return _decorator(func)
    return _decorator
