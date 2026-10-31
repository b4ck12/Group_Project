import asyncio
from unittest.mock import AsyncMock, MagicMock, patch

import httpx
import pybreaker
import pytest

from app.services.cache_service import InMemoryCache
from app.services.places_service import (
    BaseTravelProvider,
    GooglePlacesService,
    call_with_breaker,
    create_places_breaker,
    places_circuit_breaker,
)


@pytest.fixture(autouse=True)
def reset_breaker():
    places_circuit_breaker.close()
    yield
    places_circuit_breaker.close()


@pytest.mark.asyncio
async def test_circuit_breaker_opens_after_three_failures():
    breaker = create_places_breaker(fail_max=3, reset_timeout=60)

    async def failing_call():
        raise httpx.ConnectError("Upstream connection failed")

    for _ in range(2):
        with pytest.raises(httpx.ConnectError):
            await call_with_breaker(breaker, failing_call, timeout=2.5)
        assert breaker.current_state == "closed"

    with pytest.raises((pybreaker.CircuitBreakerError, httpx.ConnectError)):
        await call_with_breaker(breaker, failing_call, timeout=2.5)

    assert breaker.current_state == "open"

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


@pytest.mark.asyncio
async def test_google_places_search_normalizes_response():
    mock_payload = {
        "places": [
            {
                "id": "place_123",
                "displayName": {"text": "Bun Cha Huong Lien"},
                "formattedAddress": "24 Le Van Huu, Hai Ba Trung, Ha Noi",
                "location": {"latitude": 21.0181, "longitude": 105.8525},
                "primaryType": "restaurant",
                "rating": 4.4,
                "userRatingCount": 3500,
                "priceLevel": "PRICE_LEVEL_MODERATE",
                "regularOpeningHours": {"openNow": True},
            }
        ]
    }
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.raise_for_status = MagicMock()
    mock_response.json.return_value = mock_payload

    mock_client = AsyncMock()
    mock_client.post = AsyncMock(return_value=mock_response)

    mem_cache = InMemoryCache()
    service = GooglePlacesService(api_key="test-api-key")

    with patch("app.services.places_service.get_http_client", return_value=mock_client), \
         patch("app.services.cache_service._get_active_cache", return_value=mem_cache):
        res1 = await service.search_places(keyword="Bun Cha", category="restaurant", lat=21.02, lng=105.85)
        res2 = await service.search_places(keyword="Bun Cha", category="restaurant", lat=21.02, lng=105.85)

    assert res1.total == 1
    assert res1.results[0].place_id == "place_123"
    assert res1.results[0].name == "Bun Cha Huong Lien"
    assert res1.results[0].price_level == 2
    assert res2.results[0].place_id == "place_123"
    # Second call served from 24h cache -> HTTP client called only once!
    assert mock_client.post.call_count == 1


@pytest.mark.asyncio
async def test_google_places_get_details_normalizes_response():
    mock_payload = {
        "id": "place_456",
        "displayName": {"text": "Hoan Kiem Lake"},
        "formattedAddress": "Hang Trong, Hoan Kiem, Ha Noi",
        "location": {"latitude": 21.0288, "longitude": 105.8522},
        "primaryType": "tourist_attraction",
        "rating": 4.8,
        "userRatingCount": 15000,
        "websiteUri": "https://hanoi.gov.vn",
    }
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.raise_for_status = MagicMock()
    mock_response.json.return_value = mock_payload

    mock_client = AsyncMock()
    mock_client.get = AsyncMock(return_value=mock_response)

    mem_cache = InMemoryCache()
    service = GooglePlacesService(api_key="test-api-key")

    with patch("app.services.places_service.get_http_client", return_value=mock_client), \
         patch("app.services.cache_service._get_active_cache", return_value=mem_cache):
        detail = await service.get_place_details("place_456")

    assert detail.place.place_id == "place_456"
    assert detail.place.name == "Hoan Kiem Lake"
    assert detail.place.rating == 4.8
    assert mock_client.get.call_count == 1
