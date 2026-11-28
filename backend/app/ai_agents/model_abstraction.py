"""OpenAI-compatible Model Abstraction Layer for TripMate AI (TASK-110, ADR-001)."""

from __future__ import annotations

from datetime import datetime
import json
import logging
import time
from typing import Any, Callable, Dict, List, Literal, Optional, Tuple, Type, TypeVar, Union
import uuid

from openai import (
    APIConnectionError,
    APIStatusError,
    APITimeoutError,
    AsyncOpenAI,
    RateLimitError,
)
from pydantic import BaseModel, Field

from app.core.config import settings

logger = logging.getLogger(__name__)
TModel = TypeVar("TModel", bound=BaseModel)


class Message(BaseModel):
    """A text message in the agent execution conversation."""

    type: Literal["message"] = "message"
    role: Literal["system", "user", "assistant"]
    content: str


class ToolCall(BaseModel):
    """LLM request to invoke a registered function tool."""

    type: Literal["tool_call"] = "tool_call"
    tool_call_id: str
    name: str
    arguments: Dict[str, Any] = Field(default_factory=dict)
    raw_arguments: Optional[str] = None


class ToolResult(BaseModel):
    """Result returned by executing a tool."""

    type: Literal["tool_result"] = "tool_result"
    tool_call_id: str
    name: str
    status: Literal["success", "error"]
    content: List[Any] = Field(default_factory=list)


ContentItem = Union[Message, ToolCall, ToolResult]


class AgentEvent(BaseModel):
    """A recorded step event during agent execution."""

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    execution_id: str
    timestamp: float = Field(default_factory=lambda: datetime.now().timestamp())
    author: str
    content: List[ContentItem] = Field(default_factory=list)


class LlmRequest(BaseModel):
    """Provider-agnostic request payload built from execution context."""

    instructions: List[str] = Field(default_factory=list)
    contents: List[ContentItem] = Field(default_factory=list)
    tools: List[Dict[str, Any]] = Field(default_factory=list)
    tool_choice: Optional[Union[str, Dict[str, Any]]] = None
    response_format: Optional[Dict[str, Any]] = None
    max_tokens: Optional[int] = None
    temperature: Optional[float] = None


class LlmResponse(BaseModel):
    """Normalized LLM response with parsed content and token/latency usage."""

    content: List[ContentItem] = Field(default_factory=list)
    error_message: Optional[str] = None
    provider: Optional[str] = None
    model: Optional[str] = None
    usage_metadata: Dict[str, Any] = Field(default_factory=dict)


class LLMProviderConfig(BaseModel):
    """Configuration for a single OpenAI-compatible LLM provider endpoint."""

    name: str
    model: str
    api_key: str = ""
    base_url: Optional[str] = None
    timeout: float = 30.0


class AllProvidersFailedError(RuntimeError):
    """Raised when no configured LLM provider succeeds."""

    def __init__(self, message: str, errors: Optional[List[str]] = None):
        super().__init__(message)
        self.errors = errors or []


def _serialize_tool_content(content: List[Any]) -> str:
    """Serialize ToolResult content list into a string for Chat Completions tool role."""
    if not content:
        return ""
    value = content[0] if len(content) == 1 else content
    if isinstance(value, str):
        return value
    if isinstance(value, BaseModel):
        return value.model_dump_json()
    try:
        return json.dumps(value, ensure_ascii=False, default=str)
    except TypeError:
        return str(value)


def build_messages(request: LlmRequest) -> List[Dict[str, Any]]:
    """Convert an LlmRequest into OpenAI Chat Completions `messages` payload."""
    messages: List[Dict[str, Any]] = []

    for instruction in request.instructions:
        if instruction:
            messages.append({"role": "system", "content": instruction})

    for item in request.contents:
        if isinstance(item, Message):
            messages.append({"role": item.role, "content": item.content})
        elif isinstance(item, ToolCall):
            raw_args = (
                item.raw_arguments
                if item.raw_arguments is not None
                else json.dumps(item.arguments, ensure_ascii=False)
            )
            tool_call_dict = {
                "id": item.tool_call_id,
                "type": "function",
                "function": {
                    "name": item.name,
                    "arguments": raw_args,
                },
            }
            if (
                messages
                and messages[-1]["role"] == "assistant"
                and "tool_calls" in messages[-1]
            ):
                messages[-1]["tool_calls"].append(tool_call_dict)
            else:
                messages.append(
                    {
                        "role": "assistant",
                        "content": None,
                        "tool_calls": [tool_call_dict],
                    }
                )
        elif isinstance(item, ToolResult):
            messages.append(
                {
                    "role": "tool",
                    "tool_call_id": item.tool_call_id,
                    "content": _serialize_tool_content(item.content),
                }
            )

    return messages


def _parse_tool_arguments(raw_args: Optional[str]) -> Dict[str, Any]:
    """Parse tool call JSON arguments safely without crashing on malformed output."""
    if not raw_args:
        return {}
    try:
        parsed = json.loads(raw_args)
        if isinstance(parsed, dict):
            return parsed
        return {"_value": parsed}
    except json.JSONDecodeError as exc:
        return {"_raw": raw_args, "_parse_error": str(exc)}


def _parse_completion(
    response: Any,
    provider_name: str,
    model_name: str,
    duration_ms: int,
) -> LlmResponse:
    """Convert an OpenAI ChatCompletion response into normalized LlmResponse."""
    choice = response.choices[0]
    content_items: List[ContentItem] = []

    if choice.message.content:
        content_items.append(
            Message(role="assistant", content=choice.message.content)
        )

    if choice.message.tool_calls:
        for tc in choice.message.tool_calls:
            raw_args = tc.function.arguments
            content_items.append(
                ToolCall(
                    tool_call_id=tc.id,
                    name=tc.function.name,
                    arguments=_parse_tool_arguments(raw_args),
                    raw_arguments=raw_args,
                )
            )

    usage = getattr(response, "usage", None)
    input_tokens = getattr(usage, "prompt_tokens", 0) or 0
    output_tokens = getattr(usage, "completion_tokens", 0) or 0
    total_tokens = getattr(usage, "total_tokens", None)
    if total_tokens is None:
        total_tokens = input_tokens + output_tokens

    return LlmResponse(
        content=content_items,
        provider=provider_name,
        model=model_name,
        usage_metadata={
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "total_tokens": total_tokens,
            "duration_ms": duration_ms,
            "provider": provider_name,
            "model": model_name,
        },
    )


def _strip_markdown_fences(raw_text: str) -> str:
    """Remove surrounding markdown ```json fences if an LLM includes them."""
    cleaned = raw_text.strip()
    if not cleaned.startswith("```"):
        return cleaned
    cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned.rsplit("```", 1)[0]
    if cleaned.startswith("json"):
        cleaned = cleaned[4:].lstrip()
    return cleaned.strip()


class LLMModelAbstraction:
    """Pure OpenAI SDK abstraction layer supporting DeepSeek primary and multi-provider fallback."""

    def __init__(
        self,
        providers: Optional[List[LLMProviderConfig]] = None,
        client_factory: Optional[Callable[[LLMProviderConfig], AsyncOpenAI]] = None,
        default_max_tokens: Optional[int] = None,
    ):
        self.providers = (
            providers if providers is not None else self._build_default_providers()
        )
        self._client_factory = client_factory
        self._clients: Dict[str, AsyncOpenAI] = {}
        self.default_max_tokens = (
            default_max_tokens
            if default_max_tokens is not None
            else settings.AI_MAX_TOKENS_PER_REQUEST
        )

    @staticmethod
    def _build_default_providers() -> List[LLMProviderConfig]:
        """Build ordered primary -> fallback provider chain from Settings."""
        return [
            LLMProviderConfig(
                name="deepseek",
                model=settings.AI_MODEL_DEFAULT,
                api_key=settings.DEEPSEEK_API_KEY,
                base_url=settings.DEEPSEEK_BASE_URL,
                timeout=settings.AI_REQUEST_TIMEOUT,
            ),
            LLMProviderConfig(
                name="openai",
                model=settings.OPENAI_MODEL_FALLBACK,
                api_key=settings.OPENAI_API_KEY,
                base_url=None,
                timeout=settings.AI_REQUEST_TIMEOUT,
            ),
            LLMProviderConfig(
                name="gemini",
                model=settings.GEMINI_MODEL_FALLBACK,
                api_key=settings.GOOGLE_API_KEY,
                base_url=settings.GEMINI_BASE_URL,
                timeout=settings.AI_REQUEST_TIMEOUT,
            ),
        ]

    def _get_client(self, provider: LLMProviderConfig) -> AsyncOpenAI:
        """Return a cached AsyncOpenAI client for the given provider configuration."""
        if provider.name in self._clients:
            return self._clients[provider.name]

        if self._client_factory is not None:
            client = self._client_factory(provider)
        else:
            kwargs: Dict[str, Any] = {
                "api_key": provider.api_key,
                "timeout": provider.timeout,
            }
            if provider.base_url:
                kwargs["base_url"] = provider.base_url
            client = AsyncOpenAI(**kwargs)

        self._clients[provider.name] = client
        return client

    async def generate(self, request: LlmRequest) -> LlmResponse:
        """Execute Chat Completions with transparent fallback across configured providers."""
        configured = [p for p in self.providers if p.api_key and p.api_key.strip()]
        if not configured:
            raise AllProvidersFailedError(
                "No LLM provider API keys are configured.", errors=[]
            )

        messages = build_messages(request)
        errors: List[str] = []

        for provider in configured:
            client = self._get_client(provider)
            kwargs: Dict[str, Any] = {
                "model": provider.model,
                "messages": messages,
                "max_tokens": request.max_tokens or self.default_max_tokens,
            }
            if request.tools:
                kwargs["tools"] = request.tools
                if request.tool_choice is not None:
                    kwargs["tool_choice"] = request.tool_choice
            if request.response_format is not None:
                kwargs["response_format"] = request.response_format
            if request.temperature is not None:
                kwargs["temperature"] = request.temperature

            start = time.perf_counter()
            try:
                completion = await client.chat.completions.create(**kwargs)
                duration_ms = int((time.perf_counter() - start) * 1000)
                return _parse_completion(
                    completion,
                    provider_name=provider.name,
                    model_name=provider.model,
                    duration_ms=duration_ms,
                )
            except (
                RateLimitError,
                APITimeoutError,
                APIConnectionError,
                APIStatusError,
            ) as exc:
                err_msg = f"{provider.name} ({provider.model}): {exc}"
                errors.append(err_msg)
                logger.warning("LLM provider failed (%s). Trying fallback...", err_msg)

        raise AllProvidersFailedError(
            f"All configured LLM providers failed: {'; '.join(errors)}",
            errors=errors,
        )

    async def generate_structured(
        self,
        prompt: str,
        response_model: Type[TModel],
        system_instruction: Optional[str] = None,
    ) -> Tuple[TModel, LlmResponse]:
        """Request JSON output matching full Pydantic schema (preserving `$defs`) and validate."""
        schema_json = json.dumps(response_model.model_json_schema(), ensure_ascii=False)
        instructions: List[str] = []
        if system_instruction:
            instructions.append(system_instruction)
        instructions.append(
            "Respond ONLY with valid JSON matching this JSON Schema:\n"
            f"{schema_json}"
        )

        request = LlmRequest(
            instructions=instructions,
            contents=[Message(role="user", content=prompt)],
            response_format={"type": "json_object"},
        )
        llm_response = await self.generate(request)

        raw_text = ""
        for item in llm_response.content:
            if isinstance(item, Message):
                raw_text = item.content
                break

        cleaned = _strip_markdown_fences(raw_text)
        parsed_model = response_model.model_validate_json(cleaned)
        return parsed_model, llm_response
