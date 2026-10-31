from unittest.mock import AsyncMock, patch
import pybreaker
import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app
from app.schemas.place import POIItem, PlaceDetailResponse, PlaceSearchResponse


@pytest.mark.asyncio
async def test_search_places_endpoint_200():
    mock_result = PlaceSearchResponse(
        results=[
            POIItem(
                place_id="ChIJ_test_1",
                name="Temple of Literature",
                address="58 Quoc Tu Giam, Dong Da, Ha Noi",
                lat=21.0278,
                lng=105.8355,
                category="tourist_attraction",
                rating=4.7,
            )
        ],
        total=1,
        provider="google_places",
    )

    with patch("app.api.v1.places.places_service.search_places", new=AsyncMock(return_value=mock_result)):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.get(
                "/api/v1/places/search",
                params={"keyword": "Temple", "category": "tourist_attraction", "lat": 21.02, "lng": 105.83},
            )

    assert resp.status_code == 200
    body = resp.json()
    assert body["total"] == 1
    assert body["results"][0]["place_id"] == "ChIJ_test_1"


@pytest.mark.asyncio
async def test_search_places_returns_503_when_circuit_breaker_open():
    with patch(
        "app.api.v1.places.places_service.search_places",
        new=AsyncMock(side_effect=pybreaker.CircuitBreakerError("Circuit breaker is open")),
    ):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.get("/api/v1/places/search", params={"keyword": "Coffee"})

    assert resp.status_code == 503
    assert "temporarily unavailable" in resp.json()["detail"].lower()


@pytest.mark.asyncio
async def test_get_place_details_endpoint_200():
    mock_detail = PlaceDetailResponse(
        place=POIItem(
            place_id="ChIJ_detail_1",
            name="Hanoi Opera House",
            address="1 Trang Tien, Hoan Kiem, Ha Noi",
            rating=4.6,
        ),
        provider="google_places",
    )

    with patch("app.api.v1.places.places_service.get_place_details", new=AsyncMock(return_value=mock_detail)):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.get("/api/v1/places/ChIJ_detail_1/details")

    assert resp.status_code == 200
    assert resp.json()["place"]["name"] == "Hanoi Opera House"
