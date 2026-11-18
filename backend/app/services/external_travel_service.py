import asyncio
from decimal import Decimal
import logging
from typing import Awaitable, Callable, Dict, List, Optional
from urllib.parse import quote_plus

import httpx
import pybreaker

from app.schemas.place import (
    HotelCompareResponse,
    HotelComparisonItem,
    POIItem,
    ProviderBookingLink,
    TourActivityItem,
    TourSearchResponse,
)
from app.services.places_service import GooglePlacesService

logger = logging.getLogger(__name__)

CustomScraperCallable = Callable[
    [POIItem, Optional[str], Optional[str], int],
    Awaitable[List[ProviderBookingLink]],
]

_LODGING_PRICE_BY_LEVEL: Dict[int, Decimal] = {
    0: Decimal("300000"),
    1: Decimal("450000"),
    2: Decimal("850000"),
    3: Decimal("1600000"),
    4: Decimal("3200000"),
}

_TOUR_PRICE_BY_LEVEL: Dict[int, Decimal] = {
    0: Decimal("0"),
    1: Decimal("150000"),
    2: Decimal("450000"),
    3: Decimal("850000"),
    4: Decimal("1500000"),
}

_AMENITIES_BY_LEVEL: Dict[int, List[str]] = {
    0: ["Free Wi-Fi", "24h Check-in"],
    1: ["Free Wi-Fi", "Air Conditioning", "24h Front Desk"],
    2: ["Free Wi-Fi", "Breakfast Included", "Air Conditioning", "Airport Shuttle"],
    3: ["Free Wi-Fi", "Buffet Breakfast", "Swimming Pool", "Fitness Center", "Spa"],
    4: [
        "Free Wi-Fi",
        "Luxury Breakfast",
        "Infinity Pool",
        "Private Beach/Lounge",
        "Full Spa & Concierge",
    ],
}


def estimate_lodging_nightly_vnd(price_level: Optional[int]) -> Decimal:
    """Map 0-4 price_level to realistic Vietnam/ASEAN nightly hotel price in VND."""
    level = price_level if price_level in _LODGING_PRICE_BY_LEVEL else 2
    return _LODGING_PRICE_BY_LEVEL[level]


def estimate_tour_ticket_vnd(price_level: Optional[int]) -> Decimal:
    """Map 0-4 price_level to realistic Klook / attraction ticket price in VND."""
    level = price_level if price_level in _TOUR_PRICE_BY_LEVEL else 2
    return _TOUR_PRICE_BY_LEVEL[level]


def build_lodging_provider_links(
    hotel_name: str,
    address: Optional[str] = None,
    base_nightly_vnd: Decimal = Decimal("850000"),
    checkin: Optional[str] = None,
    checkout: Optional[str] = None,
    guests: int = 2,
) -> List[ProviderBookingLink]:
    """
    Generate 100% free, keyless booking deep-links across 9 major OTAs
    (Agoda, Booking.com, Airbnb, Trip.com, Expedia, Hotels.com, Trivago, Google Hotels, TripAdvisor).
    """
    search_term = f"{hotel_name} {address}".strip() if address else hotel_name
    q = quote_plus(search_term)
    name_q = quote_plus(hotel_name)
    date_params = f"&checkin={checkin}&checkout={checkout}" if checkin and checkout else ""

    providers = [
        (
            "agoda",
            "Agoda",
            f"https://www.agoda.com/search?text={name_q}&adults={guests}{date_params}",
            Decimal("0.96"),
        ),
        (
            "booking_com",
            "Booking.com",
            f"https://www.booking.com/searchresults.html?ss={q}&group_adults={guests}{date_params}",
            Decimal("1.00"),
        ),
        (
            "airbnb",
            "Airbnb",
            f"https://www.airbnb.com/s/{name_q}/homes?adults={guests}{date_params}",
            Decimal("0.92"),
        ),
        (
            "trip_com",
            "Trip.com",
            f"https://www.trip.com/hotels/list?keyword={name_q}",
            Decimal("0.95"),
        ),
        (
            "hotels_com",
            "Hotels.com",
            f"https://www.hotels.com/Hotel-Search?destination={q}&adults={guests}",
            Decimal("1.02"),
        ),
        (
            "expedia",
            "Expedia",
            f"https://www.expedia.com/Hotel-Search?destination={q}&adults={guests}",
            Decimal("1.03"),
        ),
        (
            "trivago",
            "Trivago",
            f"https://www.trivago.com/en-US/srl?searchQuery={name_q}",
            Decimal("0.98"),
        ),
        (
            "google_hotels",
            "Google Hotels",
            f"https://www.google.com/travel/hotels?q={q}",
            Decimal("1.00"),
        ),
        (
            "tripadvisor",
            "TripAdvisor",
            f"https://www.tripadvisor.com/Search?q={name_q}",
            Decimal("1.00"),
        ),
    ]

    links: List[ProviderBookingLink] = []
    for code, display_name, url, multiplier in providers:
        price = Decimal(str(int(round(float(base_nightly_vnd * multiplier), -3))))
        links.append(
            ProviderBookingLink(
                provider=code,
                display_name=display_name,
                booking_url=url,
                estimated_price_vnd=price,
                is_live_price=False,
            )
        )
    return links


def build_tour_provider_links(
    activity_name: str,
    destination: Optional[str] = None,
    base_ticket_vnd: Decimal = Decimal("450000"),
) -> List[ProviderBookingLink]:
    """Generate keyless booking deep-links for Klook, TripAdvisor, and 12Go Asia."""
    search_term = f"{activity_name} {destination}".strip() if destination else activity_name
    q = quote_plus(search_term)
    dest_q = quote_plus(destination or activity_name)

    return [
        ProviderBookingLink(
            provider="klook",
            display_name="Klook",
            booking_url=f"https://www.klook.com/en-US/search/result/?query={q}",
            estimated_price_vnd=base_ticket_vnd,
            is_live_price=False,
        ),
        ProviderBookingLink(
            provider="tripadvisor",
            display_name="TripAdvisor Attractions",
            booking_url=f"https://www.tripadvisor.com/Search?q={q}",
            estimated_price_vnd=base_ticket_vnd,
            is_live_price=False,
        ),
        ProviderBookingLink(
            provider="12go_asia",
            display_name="12Go Asia (Transit & Transfers)",
            booking_url=f"https://12go.asia/en/travel/{dest_q}",
            estimated_price_vnd=Decimal(str(max(150000, int(base_ticket_vnd)))),
            is_live_price=False,
        ),
    ]


def _build_fallback_poi(place_id: str, category: str = "lodging", index: int = 0) -> POIItem:
    """Synthesize a deterministic POIItem when Google Places API key is unconfigured."""
    human_name = (
        place_id.replace("_", " ").replace("-", " ").strip().title()
        or f"Place {index + 1}"
    )
    price_level = (index % 3) + 1
    return POIItem(
        place_id=place_id,
        name=human_name,
        address="Vietnam",
        lat=16.0544 + (index * 0.005),
        lng=108.2022 + (index * 0.005),
        category=category,
        rating=round(4.3 + (index % 5) * 0.1, 1),
        user_ratings_total=250 + (index * 120),
        price_level=price_level,
        open_now=True,
        metadata={
            "raw_primary_type": category,
            "stop_category": "HOTEL" if category == "lodging" else "ATTRACTION",
            "weekday_hours": ["Open 24 hours"],
            "types": [category],
            "is_fallback": True,
        },
    )


class ExternalTravelService:
    """
    3-Layer Zero-Cost Adapter integrating Lodging (Agoda, Booking.com, Airbnb, Trip.com,
    Expedia, Hotels.com, Trivago, Google Hotels, TripAdvisor) and Tours/Transit (Klook,
    TripAdvisor, 12Go Asia) on top of GooglePlacesService with:
      - 100% free keyless fallback when GOOGLE_PLACES_API_KEY is empty
      - Optional `custom_scraper_fn` hook so the Team Leader can plug in a scraper or
        reverse-API provider without changing API contracts (TASK-206).
    """

    def __init__(
        self,
        places_service: Optional[GooglePlacesService] = None,
        custom_scraper_fn: Optional[CustomScraperCallable] = None,
    ):
        self.places_service = places_service or GooglePlacesService()
        self.custom_scraper_fn = custom_scraper_fn

    async def enrich_hotel_item_async(
        self,
        place: POIItem,
        checkin: Optional[str] = None,
        checkout: Optional[str] = None,
        guests: int = 2,
    ) -> HotelComparisonItem:
        """Convert a POIItem into a HotelComparisonItem using custom_scraper_fn if provided, else deterministic links."""
        nightly_vnd = estimate_lodging_nightly_vnd(place.price_level)
        level = place.price_level if place.price_level in _AMENITIES_BY_LEVEL else 2

        links: Optional[List[ProviderBookingLink]] = None
        if self.custom_scraper_fn is not None:
            try:
                links = await self.custom_scraper_fn(place, checkin, checkout, guests)
            except Exception as exc:
                logger.warning(
                    "Custom scraper hook failed for %s (%s); falling back to deterministic OTA links.",
                    place.place_id,
                    exc,
                )

        if not links:
            links = build_lodging_provider_links(
                hotel_name=place.name,
                address=place.address,
                base_nightly_vnd=nightly_vnd,
                checkin=checkin,
                checkout=checkout,
                guests=guests,
            )

        return HotelComparisonItem(
            place=place,
            estimated_nightly_vnd=nightly_vnd,
            amenities=_AMENITIES_BY_LEVEL[level],
            provider_links=links,
        )

    def enrich_hotel_item(
        self,
        place: POIItem,
        checkin: Optional[str] = None,
        checkout: Optional[str] = None,
        guests: int = 2,
    ) -> HotelComparisonItem:
        """Synchronous helper converting a POIItem into a HotelComparisonItem with deterministic OTA links."""
        nightly_vnd = estimate_lodging_nightly_vnd(place.price_level)
        level = place.price_level if place.price_level in _AMENITIES_BY_LEVEL else 2
        links = build_lodging_provider_links(
            hotel_name=place.name,
            address=place.address,
            base_nightly_vnd=nightly_vnd,
            checkin=checkin,
            checkout=checkout,
            guests=guests,
        )
        return HotelComparisonItem(
            place=place,
            estimated_nightly_vnd=nightly_vnd,
            amenities=_AMENITIES_BY_LEVEL[level],
            provider_links=links,
        )

    async def _fetch_single_hotel_poi(self, place_id: str, index: int) -> POIItem:
        """Fetch place details via GooglePlacesService, or synthesize fallback if no API key."""
        api_key = getattr(self.places_service, "api_key", None)
        if api_key is not None and not str(api_key).strip():
            return _build_fallback_poi(place_id, category="lodging", index=index)

        try:
            detail = await self.places_service.get_place_details(place_id=place_id)
            return detail.place
        except (
            pybreaker.CircuitBreakerError,
            httpx.TimeoutException,
            asyncio.TimeoutError,
            httpx.HTTPError,
        ):
            raise
        except Exception as exc:
            logger.warning("Falling back to synthetic hotel POI for %s: %s", place_id, exc)
            return _build_fallback_poi(place_id, category="lodging", index=index)

    async def compare_hotels(
        self,
        place_ids: List[str],
        checkin: Optional[str] = None,
        checkout: Optional[str] = None,
        guests: int = 2,
    ) -> HotelCompareResponse:
        """Compare 1 to 5 hotels side-by-side with multi-OTA booking links."""
        cleaned_ids = [pid.strip() for pid in place_ids if pid and pid.strip()]
        pois = await asyncio.gather(
            *(self._fetch_single_hotel_poi(pid, idx) for idx, pid in enumerate(cleaned_ids))
        )
        hotels = await asyncio.gather(
            *(
                self.enrich_hotel_item_async(
                    poi, checkin=checkin, checkout=checkout, guests=guests
                )
                for poi in pois
            )
        )
        return HotelCompareResponse(hotels=list(hotels), total=len(hotels))

    async def search_tours_and_activities(
        self,
        destination: Optional[str] = None,
        keyword: Optional[str] = None,
        lat: Optional[float] = None,
        lng: Optional[float] = None,
    ) -> TourSearchResponse:
        """Search attractions/experiences and enrich with Klook, TripAdvisor, and 12Go Asia links."""
        search_kw = " ".join(filter(None, [keyword, destination])) or "tourist attraction"
        api_key = getattr(self.places_service, "api_key", None)

        if api_key is not None and not str(api_key).strip():
            pois = [
                _build_fallback_poi(
                    f"{search_kw.lower().replace(' ', '_')}_tour_1",
                    category="tourist_attraction",
                    index=0,
                ),
                _build_fallback_poi(
                    f"{search_kw.lower().replace(' ', '_')}_tour_2",
                    category="amusement_park",
                    index=1,
                ),
            ]
        else:
            search_resp = await self.places_service.search_places(
                keyword=search_kw,
                category="ATTRACTION",
                lat=lat,
                lng=lng,
            )
            pois = search_resp.results

        items: List[TourActivityItem] = []
        for poi in pois:
            ticket_vnd = estimate_tour_ticket_vnd(poi.price_level)
            links = build_tour_provider_links(
                activity_name=poi.name,
                destination=destination or poi.address,
                base_ticket_vnd=ticket_vnd,
            )
            items.append(
                TourActivityItem(
                    place=poi,
                    estimated_ticket_vnd=ticket_vnd,
                    duration_hours=3.0 if (poi.price_level or 2) >= 3 else 2.0,
                    provider_links=links,
                )
            )
        return TourSearchResponse(results=items, total=len(items))
