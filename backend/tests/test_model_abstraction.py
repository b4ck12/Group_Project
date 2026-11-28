"""Unit tests for TASK-110 pure OpenAI SDK Model Abstraction Layer."""

from types import SimpleNamespace
from unittest.mock import AsyncMock

import httpx
from openai import APIConnectionError, APIStatusError, APITimeoutError, RateLimitError
from pydantic import BaseModel, Field
import pytest

from app.ai_agents.model_abstraction import (
    AllProvidersFailedError,
    LLMModelAbstraction,
    LLMProviderConfig,
    LlmRequest,
    Message,
    ToolCall,
    ToolResult,
    build_messages,
)


def _dummy_request() -> httpx.Request:
    return httpx.Request("POST", "https://api.deepseek.com/v1/chat/completions")


def _fake_completion(
    content: str | None = "Hello",
    tool_calls: list | None = None,
    prompt_tokens: int = 120,
    completion_tokens: int = 45,
):
    message = SimpleNamespace(content=content, tool_calls=tool_calls)
    choice = SimpleNamespace(message=message)
    usage = SimpleNamespace(
        prompt_tokens=prompt_tokens,
        completion_tokens=completion_tokens,
        total_tokens=prompt_tokens + completion_tokens,
    )
    return SimpleNamespace(choices=[choice], usage=usage)


def _fake_tool_call(tc_id: str, name: str, arguments: str):
    return SimpleNamespace(
        id=tc_id,
        function=SimpleNamespace(name=name, arguments=arguments),
    )


def _make_providers() -> list[LLMProviderConfig]:
    return [
        LLMProviderConfig(
            name="deepseek",
            model="deepseek-chat",
            api_key="sk-ds-test",
            base_url="https://api.deepseek.com/v1",
        ),
        LLMProviderConfig(
            name="openai",
            model="gpt-4o",
            api_key="sk-oa-test",
            base_url=None,
        ),
        LLMProviderConfig(
            name="gemini",
            model="gemini-1.5-pro",
            api_key="sk-gem-test",
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
        ),
    ]


def test_build_messages_groups_tool_calls_and_serializes_tool_results():
    req = LlmRequest(
        instructions=["System prompt"],
        contents=[
            Message(role="user", content="Find places in Da Nang"),
            ToolCall(tool_call_id="tc_1", name="search_places", arguments={"keyword": "cafe"}),
            ToolCall(tool_call_id="tc_2", name="get_weather", arguments={"lat": 16.05}),
            ToolResult(
                tool_call_id="tc_1",
                name="search_places",
                status="success",
                content=[{"name": "Reply 1988"}],
            ),
        ],
    )
    messages = build_messages(req)

    assert len(messages) == 4
    assert messages[0] == {"role": "system", "content": "System prompt"}
    assert messages[1] == {"role": "user", "content": "Find places in Da Nang"}
    assert messages[2]["role"] == "assistant"
    assert messages[2]["content"] is None
    assert len(messages[2]["tool_calls"]) == 2
    assert messages[3]["role"] == "tool"
    assert messages[3]["tool_call_id"] == "tc_1"
    assert "Reply 1988" in messages[3]["content"]


@pytest.mark.asyncio
async def test_primary_provider_success_tracks_usage_and_parses_tool_calls():
    fake_client = SimpleNamespace(
        chat=SimpleNamespace(
            completions=SimpleNamespace(
                create=AsyncMock(
                    return_value=_fake_completion(
                        content=None,
                        tool_calls=[
                            _fake_tool_call("call_1", "get_weather", '{"lat": 16.05, "lng": 108.24}')
                        ],
                        prompt_tokens=200,
                        completion_tokens=30,
                    )
                )
            )
        )
    )

    abstraction = LLMModelAbstraction(
        providers=_make_providers(),
        client_factory=lambda _cfg: fake_client,
    )
    resp = await abstraction.generate(
        LlmRequest(
            contents=[Message(role="user", content="Weather?")],
            tools=[{"type": "function", "function": {"name": "get_weather", "parameters": {}}}],
            tool_choice="auto",
        )
    )

    assert resp.provider == "deepseek"
    assert resp.model == "deepseek-chat"
    assert resp.usage_metadata["input_tokens"] == 200
    assert resp.usage_metadata["output_tokens"] == 30
    assert resp.usage_metadata["total_tokens"] == 230
    assert isinstance(resp.usage_metadata["duration_ms"], int)
    assert isinstance(resp.content[0], ToolCall)
    assert resp.content[0].arguments == {"lat": 16.05, "lng": 108.24}


@pytest.mark.asyncio
async def test_transparent_fallback_deepseek_to_openai_and_gemini():
    req_obj = _dummy_request()
    ds_client = SimpleNamespace(
        chat=SimpleNamespace(
            completions=SimpleNamespace(
                create=AsyncMock(
                    side_effect=RateLimitError(
                        "rate limit",
                        response=httpx.Response(429, request=req_obj),
                        body=None,
                    )
                )
            )
        )
    )
    oa_client = SimpleNamespace(
        chat=SimpleNamespace(
            completions=SimpleNamespace(
                create=AsyncMock(side_effect=APITimeoutError(request=req_obj))
            )
        )
    )
    gem_client = SimpleNamespace(
        chat=SimpleNamespace(
            completions=SimpleNamespace(
                create=AsyncMock(return_value=_fake_completion(content="Gemini fallback ok"))
            )
        )
    )

    clients = {"deepseek": ds_client, "openai": oa_client, "gemini": gem_client}
    abstraction = LLMModelAbstraction(
        providers=_make_providers(),
        client_factory=lambda cfg: clients[cfg.name],
    )

    resp = await abstraction.generate(
        LlmRequest(contents=[Message(role="user", content="Plan trip")])
    )

    assert resp.provider == "gemini"
    assert resp.model == "gemini-1.5-pro"
    assert isinstance(resp.content[0], Message)
    assert resp.content[0].content == "Gemini fallback ok"
    ds_client.chat.completions.create.assert_awaited_once()
    oa_client.chat.completions.create.assert_awaited_once()
    gem_client.chat.completions.create.assert_awaited_once()


@pytest.mark.asyncio
async def test_skips_unconfigured_providers_and_raises_when_all_fail():
    req_obj = _dummy_request()
    providers = [
        LLMProviderConfig(name="deepseek", model="deepseek-chat", api_key=""),
        LLMProviderConfig(name="openai", model="gpt-4o", api_key="sk-oa"),
        LLMProviderConfig(name="gemini", model="gemini-1.5-pro", api_key="sk-gem"),
    ]
    oa_client = SimpleNamespace(
        chat=SimpleNamespace(
            completions=SimpleNamespace(
                create=AsyncMock(side_effect=APIConnectionError(request=req_obj))
            )
        )
    )
    gem_client = SimpleNamespace(
        chat=SimpleNamespace(
            completions=SimpleNamespace(
                create=AsyncMock(
                    side_effect=APIStatusError(
                        "503",
                        response=httpx.Response(503, request=req_obj),
                        body=None,
                    )
                )
            )
        )
    )
    clients = {"openai": oa_client, "gemini": gem_client}

    abstraction = LLMModelAbstraction(
        providers=providers,
        client_factory=lambda cfg: clients[cfg.name],
    )

    with pytest.raises(AllProvidersFailedError) as exc_info:
        await abstraction.generate(LlmRequest(contents=[Message(role="user", content="Hi")]))
    assert len(exc_info.value.errors) == 2

    empty_abstraction = LLMModelAbstraction(
        providers=[LLMProviderConfig(name="deepseek", model="deepseek-chat", api_key="")]
    )
    with pytest.raises(AllProvidersFailedError):
        await empty_abstraction.generate(
            LlmRequest(contents=[Message(role="user", content="Hi")])
        )


@pytest.mark.asyncio
async def test_malformed_tool_arguments_captured_safely():
    fake_client = SimpleNamespace(
        chat=SimpleNamespace(
            completions=SimpleNamespace(
                create=AsyncMock(
                    return_value=_fake_completion(
                        content=None,
                        tool_calls=[_fake_tool_call("call_bad", "search_places", "{bad json")],
                    )
                )
            )
        )
    )
    abstraction = LLMModelAbstraction(
        providers=[_make_providers()[0]],
        client_factory=lambda _cfg: fake_client,
    )

    resp = await abstraction.generate(LlmRequest(contents=[Message(role="user", content="Hi")]))
    tc = resp.content[0]
    assert isinstance(tc, ToolCall)
    assert "_parse_error" in tc.arguments
    assert tc.raw_arguments == "{bad json"


class _DishItem(BaseModel):
    name: str
    price: int


class _RoadmapDraft(BaseModel):
    destination: str
    dishes: list[_DishItem] = Field(default_factory=list)


@pytest.mark.asyncio
async def test_generate_structured_preserves_defs_and_strips_fences():
    captured_kwargs = {}

    async def _create(**kwargs):
        captured_kwargs.update(kwargs)
        return _fake_completion(
            content='```json\n{"destination": "Da Nang", "dishes": [{"name": "Mi Quang", "price": 50000}]}\n```'
        )

    fake_client = SimpleNamespace(
        chat=SimpleNamespace(completions=SimpleNamespace(create=_create))
    )
    abstraction = LLMModelAbstraction(
        providers=[_make_providers()[0]],
        client_factory=lambda _cfg: fake_client,
    )

    parsed, resp = await abstraction.generate_structured(
        prompt="Draft a food plan",
        response_model=_RoadmapDraft,
        system_instruction="Be concise.",
    )

    assert parsed.destination == "Da Nang"
    assert parsed.dishes[0].name == "Mi Quang"
    assert resp.provider == "deepseek"
    assert captured_kwargs["response_format"] == {"type": "json_object"}
    system_prompt = captured_kwargs["messages"][1]["content"]
    assert "$defs" in system_prompt
    assert "_DishItem" in system_prompt
