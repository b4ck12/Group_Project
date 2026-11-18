from decimal import Decimal
from unittest.mock import AsyncMock, patch
import pybreaker
import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app
from app.schemas.place import (
    HotelCompareResponse,
    HotelComparisonItem,
    POIItem,
    PlaceDetailResponse,
    PlaceSearchResponse,
    ProviderBookingLink,
    TourActivityItem,
    TourSearchResponse,
)


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


@pytest.mark.asyncio
async def test_search_places_endpoint_with_category_and_open_now_filter():
    mock_result = PlaceSearchResponse(
        results=[
            POIItem(
                place_id="ChIJ_cafe_open",
                name="Cong Caphe",
                address="116 Cau Go, Hoan Kiem, Ha Noi",
                lat=21.0321,
                lng=105.8519,
                category="cafe",
                rating=4.5,
                open_now=True,
                metadata={
                    "raw_primary_type": "cafe",
                    "stop_category": "CAFE",
                    "weekday_hours": ["Monday: 7:30 AM – 11:30 PM"],
                    "types": ["cafe", "coffee_shop"],
                },
            )
        ],
        total=1,
        provider="google_places",
    )

    mock_search = AsyncMock(return_value=mock_result)
    with patch("app.api.v1.places.places_service.search_places", new=mock_search):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.get(
                "/api/v1/places/search",
                params={
                    "keyword": "Cong",
                    "category": "CAFE",
                    "lat": 21.03,
                    "lng": 105.85,
                    "radius": 2000,
                    "open_now": "true",
                },
            )

    assert resp.status_code == 200
    body = resp.json()
    assert body["total"] == 1
    assert body["results"][0]["open_now"] is True
    assert body["results"][0]["metadata"]["stop_category"] == "CAFE"
    mock_search.assert_awaited_once_with(
        keyword="Cong",
        category="CAFE",
        lat=21.03,
        lng=105.85,
        radius=2000,
        open_now=True,
    )


@pytest.mark.asyncio
async def test_compare_hotels_endpoint_200():
    mock_compare = HotelCompareResponse(
        hotels=[
            HotelComparisonItem(
                place=POIItem(place_id="h1", name="Hotel Alpha", rating=4.5, price_level=2),
                estimated_nightly_vnd=Decimal("850000"),
                amenities=["Free Wi-Fi", "Breakfast Included"],
                provider_links=[
                    ProviderBookingLink(
                        provider="agoda",
                        display_name="Agoda",
                        booking_url="https://www.agoda.com/search?text=Hotel+Alpha",
                        estimated_price_vnd=Decimal("816000"),
                    )
                ],
            ),
            HotelComparisonItem(
                place=POIItem(place_id="h2", name="Hotel Beta", rating=4.8, price_level=3),
                estimated_nightly_vnd=Decimal("1600000"),
                amenities=["Free Wi-Fi", "Swimming Pool"],
                provider_links=[
                    ProviderBookingLink(
                        provider="booking_com",
                        display_name="Booking.com",
                        booking_url="https://www.booking.com/searchresults.html?ss=Hotel+Beta",
                        estimated_price_vnd=Decimal("1600000"),
                    )
                ],
            ),
        ],
        total=2,
    )

    mock_fn = AsyncMock(return_value=mock_compare)
    with patch("app.api.v1.places.external_travel_service.compare_hotels", new=mock_fn):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.get(
                "/api/v1/places/hotels/compare",
                params={
                    "ids": "h1,h2",
                    "checkin": "2026-12-20",
                    "checkout": "2026-12-22",
                    "guests": 2,
                },
            )

    assert resp.status_code == 200
    body = resp.json()
    assert body["total"] == 2
    assert body["hotels"][0]["place"]["place_id"] == "h1"
    assert body["hotels"][0]["provider_links"][0]["provider"] == "agoda"
    mock_fn.assert_awaited_once_with(
        place_ids=["h1", "h2"],
        checkin="2026-12-20",
        checkout="2026-12-22",
        guests=2,
    )


@pytest.mark.asyncio
async def test_compare_hotels_endpoint_400_when_ids_empty_or_too_many():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp_empty = await client.get("/api/v1/places/hotels/compare", params={"ids": " , "})
        resp_many = await client.get(
            "/api/v1/places/hotels/compare", params={"ids": "h1,h2,h3,h4,h5,h6"}
        )

    assert resp_empty.status_code == 400
    assert resp_many.status_code == 400


@pytest.mark.asyncio
async def test_compare_hotels_returns_503_when_circuit_breaker_open():
    with patch(
        "app.api.v1.places.external_travel_service.compare_hotels",
        new=AsyncMock(side_effect=pybreaker.CircuitBreakerError("Circuit breaker is open")),
    ):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.get("/api/v1/places/hotels/compare", params={"ids": "h1,h2"})

    assert resp.status_code == 503


@pytest.mark.asyncio
async def test_search_tours_endpoint_200():
    mock_tours = TourSearchResponse(
        results=[
            TourActivityItem(
                place=POIItem(
                    place_id="t1", name="Ba Na Hills Cable Car", rating=4.7, price_level=3
                ),
                estimated_ticket_vnd=Decimal("850000"),
                duration_hours=3.0,
                provider_links=[
                    ProviderBookingLink(
                        provider="klook",
                        display_name="Klook",
                        booking_url="https://www.klook.com/en-US/search/result/?query=Ba+Na+Hills",
                        estimated_price_vnd=Decimal("850000"),
                    )
                ],
            )
        ],
        total=1,
    )

    with patch(
        "app.api.v1.places.external_travel_service.search_tours_and_activities",
        new=AsyncMock(return_value=mock_tours),
    ):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.get(
                "/api/v1/places/tours/search",
                params={"destination": "Da Nang", "keyword": "Ba Na Hills"},
            )

    assert resp.status_code == 200
    body = resp.json()
    assert body["total"] == 1
    assert body["results"][0]["provider_links"][0]["provider"] == "klook"

