from decimal import Decimal
from unittest.mock import AsyncMock

import pybreaker
import pytest

from app.schemas.place import (
    POIItem,
    PlaceDetailResponse,
    PlaceSearchResponse,
    ProviderBookingLink,
)
from app.services.external_travel_service import (
    ExternalTravelService,
    build_lodging_provider_links,
    build_tour_provider_links,
    estimate_lodging_nightly_vnd,
    estimate_tour_ticket_vnd,
)


def test_build_lodging_provider_links_generates_all_otas():
    base_price = estimate_lodging_nightly_vnd(2)
    assert base_price == Decimal("850000")

    links = build_lodging_provider_links(
        hotel_name="Sala Danang Beach Hotel",
        address="36 Lam Hoanh, Da Nang",
        base_nightly_vnd=Decimal("1000000"),
        checkin="2026-12-20",
        checkout="2026-12-22",
        guests=4,
    )
    providers = {link.provider: link for link in links}
    assert {
        "agoda",
        "booking_com",
        "airbnb",
        "trip_com",
        "expedia",
        "hotels_com",
        "trivago",
        "google_hotels",
        "tripadvisor",
    }.issubset(providers.keys())
    assert "Sala+Danang+Beach+Hotel" in providers["agoda"].booking_url
    assert "checkin=2026-12-20&checkout=2026-12-22" in providers["agoda"].booking_url
    assert providers["agoda"].estimated_price_vnd > Decimal("0")


def test_build_tour_provider_links_generates_klook_tripadvisor_12go():
    base_ticket = estimate_tour_ticket_vnd(2)
    assert base_ticket == Decimal("450000")

    links = build_tour_provider_links(
        activity_name="Sun World Ba Na Hills",
        destination="Da Nang",
        base_ticket_vnd=Decimal("500000"),
    )
    providers = {link.provider: link for link in links}
    assert "klook" in providers
    assert "tripadvisor" in providers
    assert "12go_asia" in providers
    assert "klook.com" in providers["klook"].booking_url
    assert "Sun+World+Ba+Na+Hills" in providers["klook"].booking_url


@pytest.mark.asyncio
async def test_compare_hotels_fetches_details_and_builds_comparison():
    mock_places_service = AsyncMock()
    mock_places_service.api_key = "test-google-key"
    mock_places_service.get_place_details = AsyncMock(
        side_effect=[
            PlaceDetailResponse(
                place=POIItem(
                    place_id="hotel_1",
                    name="Hotel One",
                    address="Da Nang",
                    lat=16.06,
                    lng=108.24,
                    category="lodging",
                    rating=4.6,
                    price_level=2,
                )
            ),
            PlaceDetailResponse(
                place=POIItem(
                    place_id="hotel_2",
                    name="Resort Two",
                    address="Da Nang",
                    lat=16.05,
                    lng=108.25,
                    category="lodging",
                    rating=4.8,
                    price_level=4,
                )
            ),
        ]
    )

    service = ExternalTravelService(places_service=mock_places_service)
    resp = await service.compare_hotels(
        place_ids=["hotel_1", "hotel_2"],
        checkin="2026-12-20",
        checkout="2026-12-22",
        guests=2,
    )

    assert resp.total == 2
    assert resp.hotels[0].place.name == "Hotel One"
    assert resp.hotels[1].place.name == "Resort Two"
    assert resp.hotels[1].estimated_nightly_vnd > resp.hotels[0].estimated_nightly_vnd
    assert any(link.provider == "agoda" for link in resp.hotels[0].provider_links)
    assert any(link.provider == "booking_com" for link in resp.hotels[0].provider_links)


@pytest.mark.asyncio
async def test_compare_hotels_falls_back_gracefully_when_no_google_api_key():
    """Verify 100% free fallback works when Google Places API has no key."""
    mock_places_service = AsyncMock()
    mock_places_service.api_key = ""
    mock_places_service.get_place_details = AsyncMock(side_effect=RuntimeError("No API key"))

    service = ExternalTravelService(places_service=mock_places_service)
    resp = await service.compare_hotels(place_ids=["danang_beach_hotel", "hoian_boutique_villa"])

    assert resp.total == 2
    assert resp.hotels[0].place.place_id == "danang_beach_hotel"
    assert resp.hotels[0].place.metadata["is_fallback"] is True
    assert len(resp.hotels[0].provider_links) == 9


@pytest.mark.asyncio
async def test_compare_hotels_propagates_circuit_breaker_error():
    """Verify CircuitBreakerError is not swallowed when an API key is configured."""
    mock_places_service = AsyncMock()
    mock_places_service.api_key = "real-key"
    mock_places_service.get_place_details = AsyncMock(
        side_effect=pybreaker.CircuitBreakerError("Circuit breaker is open")
    )

    service = ExternalTravelService(places_service=mock_places_service)
    with pytest.raises(pybreaker.CircuitBreakerError):
        await service.compare_hotels(place_ids=["hotel_1"])


@pytest.mark.asyncio
async def test_custom_scraper_hook_overrides_links_and_falls_back_on_error():
    """Verify leader's custom scraper/reverse-API hook works and degrades gracefully on error."""
    mock_places_service = AsyncMock()
    mock_places_service.api_key = ""

    async def fake_leader_scraper(poi: POIItem, checkin, checkout, guests):
        return [
            ProviderBookingLink(
                provider="agoda",
                display_name="Agoda (Live Scraped)",
                booking_url="https://www.agoda.com/live-deal",
                estimated_price_vnd=Decimal("799000"),
                is_live_price=True,
            )
        ]

    service = ExternalTravelService(
        places_service=mock_places_service,
        custom_scraper_fn=fake_leader_scraper,
    )
    resp = await service.compare_hotels(place_ids=["hotel_scraped"])
    assert resp.hotels[0].provider_links[0].is_live_price is True
    assert resp.hotels[0].provider_links[0].estimated_price_vnd == Decimal("799000")

    # If the leader's scraper throws an error, service must fall back to deterministic links
    async def broken_scraper(poi: POIItem, checkin, checkout, guests):
        raise RuntimeError("Captcha blocked scraper")

    service_fallback = ExternalTravelService(
        places_service=mock_places_service,
        custom_scraper_fn=broken_scraper,
    )
    resp_fb = await service_fallback.compare_hotels(place_ids=["hotel_scraped"])
    assert len(resp_fb.hotels[0].provider_links) == 9
    assert resp_fb.hotels[0].provider_links[0].is_live_price is False


@pytest.mark.asyncio
async def test_search_tours_and_activities_enriches_klook_links():
    mock_places_service = AsyncMock()
    mock_places_service.api_key = "test-google-key"
    mock_places_service.search_places = AsyncMock(
        return_value=PlaceSearchResponse(
            results=[
                POIItem(
                    place_id="tour_1",
                    name="VinWonders Phu Quoc",
                    address="Phu Quoc, Kien Giang",
                    lat=10.33,
                    lng=103.85,
                    category="amusement_park",
                    rating=4.7,
                    price_level=3,
                )
            ],
            total=1,
            provider="google_places",
        )
    )

    service = ExternalTravelService(places_service=mock_places_service)
    resp = await service.search_tours_and_activities(destination="Phu Quoc", keyword="VinWonders")

    assert resp.total == 1
    assert resp.results[0].place.name == "VinWonders Phu Quoc"
    assert resp.results[0].estimated_ticket_vnd == Decimal("850000")
    assert any(link.provider == "klook" for link in resp.results[0].provider_links)
