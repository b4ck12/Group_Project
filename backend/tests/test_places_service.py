import asyncio
import httpx
import pybreaker
import pytest
from app.services.places_service import (
    BaseTravelProvider,
    call_with_breaker,
    create_places_breaker,
)


@pytest.mark.asyncio
async def test_circuit_breaker_opens_after_three_failures():
    breaker = create_places_breaker(fail_max=3, reset_timeout=60)

    async def failing_call():
        raise httpx.ConnectError("Upstream connection failed")

    # First 2 failures keep circuit closed/increment counter, 3rd failure trips circuit
    for _ in range(2):
        with pytest.raises(httpx.ConnectError):
            await call_with_breaker(breaker, failing_call, timeout=2.5)
        assert breaker.current_state == "closed"

    # 3rd failure opens the circuit and raises CircuitBreakerError or ConnectError
    with pytest.raises((pybreaker.CircuitBreakerError, httpx.ConnectError)):
        await call_with_breaker(breaker, failing_call, timeout=2.5)

    assert breaker.current_state == "open"

    # Subsequent call while OPEN immediately raises CircuitBreakerError without calling func
    called = False

    async def should_not_run():
        nonlocal called
        called = True
        return "ok"

    with pytest.raises(pybreaker.CircuitBreakerError):
        await call_with_breaker(breaker, should_not_run, timeout=2.5)
    assert called is False


@pytest.mark.asyncio
async def test_circuit_breaker_trips_on_timeout():
    breaker = create_places_breaker(fail_max=3, reset_timeout=60)

    async def slow_call():
        await asyncio.sleep(0.2)
        return "slow"

    for _ in range(3):
        with pytest.raises((asyncio.TimeoutError, httpx.TimeoutException, pybreaker.CircuitBreakerError)):
            await call_with_breaker(breaker, slow_call, timeout=0.05)

    assert breaker.current_state == "open"
