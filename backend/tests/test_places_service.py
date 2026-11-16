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


@pytest.mark.asyncio
async def test_google_places_search_with_category_and_open_now_filter():
    mock_payload = {
        "places": [
            {
                "id": "cafe_open",
                "displayName": {"text": "The Note Coffee"},
                "formattedAddress": "64 Luong Van Can, Hoan Kiem, Ha Noi",
                "location": {"latitude": 21.0318, "longitude": 105.8512},
                "primaryType": "coffee_shop",
                "types": ["coffee_shop", "cafe", "food"],
                "rating": 4.6,
                "userRatingCount": 4200,
                "priceLevel": "PRICE_LEVEL_INEXPENSIVE",
                "regularOpeningHours": {
                    "openNow": True,
                    "weekdayDescriptions": ["Monday: 8:00 AM – 10:30 PM"],
                },
            },
            {
                "id": "cafe_closed",
                "displayName": {"text": "Closed Night Cafe"},
                "formattedAddress": "10 Hang Gai, Hoan Kiem, Ha Noi",
                "location": {"latitude": 21.0310, "longitude": 105.8505},
                "primaryType": "cafe",
                "types": ["cafe"],
                "rating": 4.1,
                "userRatingCount": 120,
                "regularOpeningHours": {
                    "openNow": False,
                    "weekdayDescriptions": ["Monday: 7:00 AM – 5:00 PM"],
                },
            },
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
        res = await service.search_places(
            keyword="Coffee",
            category="CAFE",
            lat=21.03,
            lng=105.85,
            open_now=True,
        )

    assert res.total == 1
    place = res.results[0]
    assert place.place_id == "cafe_open"
    assert place.open_now is True
    assert place.metadata is not None
    assert place.metadata["raw_primary_type"] == "coffee_shop"
    assert place.metadata["stop_category"] == "CAFE"
    assert place.metadata["weekday_hours"] == ["Monday: 8:00 AM – 10:30 PM"]
    assert "cafe" in place.metadata["types"]

    sent_json = mock_client.post.call_args.kwargs["json"]
    assert sent_json["includedType"] == "cafe"
    assert sent_json["openNow"] is True


def test_estimate_transit_walking_short_distance():
    from decimal import Decimal
    from app.models.enums import TransportMode
    from app.services.places_service import estimate_transit_between_coords

    # ~0.4 km apart in Hoan Kiem, Ha Noi
    est = estimate_transit_between_coords(21.0285, 105.8542, 21.0315, 105.8530)
    assert est.transport_mode == TransportMode.WALKING
    assert 0.1 <= est.transit_distance_km <= 0.8
    assert est.transit_duration_minutes >= 2
    assert est.transit_cost == Decimal("0")


def test_estimate_transit_motorbike_medium_distance():
    from decimal import Decimal
    from app.models.enums import TransportMode
    from app.services.places_service import estimate_transit_between_coords

    # ~2.5 km apart in Ha Noi
    est = estimate_transit_between_coords(21.0285, 105.8542, 21.0278, 105.8355)
    assert est.transport_mode == TransportMode.MOTORBIKE
    assert 0.8 < est.transit_distance_km <= 5.0
    assert est.transit_duration_minutes > 0
    assert est.transit_cost >= Decimal("15000")


def test_estimate_transit_taxi_long_distance():
    from decimal import Decimal
    from app.models.enums import TransportMode
    from app.services.places_service import estimate_transit_between_coords

    # ~8.5 km apart (Hoan Kiem to West Lake / Cau Giay)
    est = estimate_transit_between_coords(21.0285, 105.8542, 21.0362, 105.7829)
    assert est.transport_mode == TransportMode.TAXI_GRAB
    assert est.transit_distance_km > 5.0
    assert est.transit_duration_minutes > 10
    assert est.transit_cost >= Decimal("30000")
