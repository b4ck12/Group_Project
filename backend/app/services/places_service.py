from abc import ABC, abstractmethod
import asyncio
import logging
from typing import Any, Awaitable, Callable, Dict, List, Optional, TypeVar

import httpx
import pybreaker

from app.core.config import settings
from app.core.http_client import get_http_client
from app.schemas.place import POIItem, PlaceDetailResponse, PlaceSearchResponse
from app.services.cache_service import cache_response

logger = logging.getLogger(__name__)
T = TypeVar("T")


class BaseTravelProvider(ABC):
    """Abstract interface for Pluggable Travel Providers (SOLID - OCP/DIP)."""

    provider_name: str = "base"

    @abstractmethod
    async def search_places(
        self,
        keyword: Optional[str] = None,
        category: Optional[str] = None,
        lat: Optional[float] = None,
        lng: Optional[float] = None,
        radius: int = 5000,
        open_now: Optional[bool] = None,
    ) -> PlaceSearchResponse:
        """Search POIs with optional category, geo-location, radius, and open_now filter."""
        raise NotImplementedError

    @abstractmethod
    async def get_place_details(self, place_id: str) -> PlaceDetailResponse:
        """Get enriched place details by ID."""
        raise NotImplementedError


def create_places_breaker(
    fail_max: int = settings.CIRCUIT_BREAKER_FAIL_MAX,
    reset_timeout: int = settings.CIRCUIT_BREAKER_RESET_TIMEOUT,
) -> pybreaker.CircuitBreaker:
    """Factory creating an isolated pybreaker CircuitBreaker instance."""
    return pybreaker.CircuitBreaker(
        fail_max=fail_max,
        reset_timeout=reset_timeout,
        name="google_places_breaker",
    )


places_circuit_breaker = create_places_breaker()


async def call_with_breaker(
    breaker: pybreaker.CircuitBreaker,
    func: Callable[..., Awaitable[T]],
    *args: Any,
    timeout: float = settings.PLACES_API_TIMEOUT,
    **kwargs: Any,
) -> T:
    """
    Execute an async callable inside a PyBreaker CircuitBreaker with strict timeout.
    Guarantees state transitions and fast-fails with CircuitBreakerError when circuit is OPEN.
    """
    # PyBreaker's native call() is sync-only (unless Tornado is used), so we drive its
    # state machine manually around asyncio.wait_for():
    # 1) Fast-fail with CircuitBreakerError if OPEN (or transition to HALF-OPEN after reset_timeout)
    if breaker.current_state == "open":
        breaker.call(lambda: None)

    try:
        result = await asyncio.wait_for(func(*args, **kwargs), timeout=timeout)
        breaker.call(lambda: None)  # Record success (resets failure count / closes HALF-OPEN)
        return result
    except Exception as exc:
        # Re-raise inside breaker.call() so PyBreaker counts the failure and trips at fail_max
        def _fail() -> None:
            raise exc

        try:
            breaker.call(_fail)
        except Exception:
            pass
        raise


def _map_price_level(raw_price: Optional[str]) -> Optional[int]:
    """Map Google Places API v1 priceLevel string enum to 0-4 integer."""
    if not raw_price:
        return None
    mapping = {
        "PRICE_LEVEL_FREE": 0,
        "PRICE_LEVEL_INEXPENSIVE": 1,
        "PRICE_LEVEL_MODERATE": 2,
        "PRICE_LEVEL_EXPENSIVE": 3,
        "PRICE_LEVEL_VERY_EXPENSIVE": 4,
    }
    return mapping.get(raw_price)


_CATEGORY_TO_INCLUDED_TYPE: Dict[str, str] = {
    "RESTAURANT": "restaurant",
    "CAFE": "cafe",
    "HOTEL": "lodging",
    "LODGING": "lodging",
    "ATTRACTION": "tourist_attraction",
    "ENTERTAINMENT": "amusement_park",
    "SHOPPING": "shopping_mall",
    "TRANSPORT": "transit_station",
}


def _map_to_google_included_type(category: Optional[str]) -> Optional[str]:
    """Normalize a StopCategory or user category string to a Google Places includedType."""
    if not category:
        return None
    cleaned = category.strip()
    upper = cleaned.upper()
    if upper in _CATEGORY_TO_INCLUDED_TYPE:
        return _CATEGORY_TO_INCLUDED_TYPE[upper]
    return cleaned.lower()


def _map_to_stop_category(primary_type: Optional[str], types: Optional[List[str]] = None) -> str:
    """Map Google Places primaryType/types to TripMate StopCategory enum string."""
    candidates = [t.lower() for t in ([primary_type] if primary_type else []) + (types or []) if t]
    for t in candidates:
        if "cafe" in t or "coffee" in t or "bakery" in t:
            return "CAFE"
        if "restaurant" in t or "food" in t or "meal" in t or "bar" in t:
            return "RESTAURANT"
        if "lodging" in t or "hotel" in t or "resort" in t or "hostel" in t:
            return "HOTEL"
        if "tourist_attraction" in t or "museum" in t or "park" in t or "historical" in t:
            return "ATTRACTION"
        if "shopping" in t or "market" in t or "store" in t:
            return "SHOPPING"
        if "amusement" in t or "night_club" in t or "movie" in t or "spa" in t:
            return "ENTERTAINMENT"
        if "airport" in t or "station" in t or "transit" in t:
            return "TRANSPORT"
    return "OTHER"


def _normalize_place(raw: Dict[str, Any]) -> POIItem:
    """Normalize a raw Google Places v1 dict into a POIItem schema."""
    loc = raw.get("location") or {}
    # Google Places v1 wraps names in {"text": "...", "languageCode": "..."}
    display_name = raw.get("displayName")
    name = (
        display_name.get("text")
        if isinstance(display_name, dict)
        else (display_name or raw.get("name") or "")
    )

    hours = raw.get("regularOpeningHours") or raw.get("currentOpeningHours") or {}
    open_now = hours.get("openNow") if isinstance(hours, dict) else None
    weekday_hours = hours.get("weekdayDescriptions", []) if isinstance(hours, dict) else []
    raw_types = raw.get("types") if isinstance(raw.get("types"), list) else []

    photos = raw.get("photos") or []
    photo_url = None
    if photos and isinstance(photos, list) and len(photos) > 0:
        first_photo = photos[0]
        if isinstance(first_photo, dict):
            photo_url = first_photo.get("name") or first_photo.get("photoUri")

    rating = float(raw["rating"]) if raw.get("rating") is not None else None
    user_ratings_total = (
        int(raw["userRatingCount"]) if raw.get("userRatingCount") is not None else None
    )

    return POIItem(
        place_id=str(raw.get("id") or raw.get("name") or "unknown"),
        name=name,
        address=raw.get("formattedAddress"),
        lat=loc.get("latitude"),
        lng=loc.get("longitude"),
        category=raw.get("primaryType"),
        rating=rating,
        user_ratings_total=user_ratings_total,
        price_level=_map_price_level(raw.get("priceLevel")),
        open_now=open_now,
        photo_url=photo_url,
        website_uri=raw.get("websiteUri"),
        phone_number=raw.get("nationalPhoneNumber") or raw.get("internationalPhoneNumber"),
        metadata={
            "raw_primary_type": raw.get("primaryType"),
            "stop_category": _map_to_stop_category(raw.get("primaryType"), raw_types),
            "weekday_hours": weekday_hours,
            "types": raw_types,
        },
    )


class GooglePlacesService(BaseTravelProvider):
    """Google Places API (New) adapter with PyBreaker resilience and L2 caching."""

    provider_name: str = "google_places"

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        breaker: Optional[pybreaker.CircuitBreaker] = None,
    ):
        self.api_key = api_key if api_key is not None else settings.GOOGLE_PLACES_API_KEY
        self.base_url = (base_url or settings.GOOGLE_PLACES_BASE_URL).rstrip("/")
        self.breaker = breaker or places_circuit_breaker

    def __repr__(self) -> str:
        # Must stay constant (no memory address or api_key) because @cache_response uses str(self) in cache keys
        return f"GooglePlacesService(provider={self.provider_name})"

    def __str__(self) -> str:
        return "GooglePlacesService"

    @cache_response(ttl=settings.CACHE_DEFAULT_TTL, prefix="places_search")
    async def _search_places_cached(
        self,
        keyword: Optional[str] = None,
        category: Optional[str] = None,
        lat: Optional[float] = None,
        lng: Optional[float] = None,
        radius: int = 5000,
        open_now: Optional[bool] = None,
    ) -> Dict[str, Any]:
        """Internal cached search query returning a serialized dictionary."""
        client = get_http_client()
        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": self.api_key,
            # FieldMask limits Google response & billing tier to only the fields we actually normalize
            "X-Goog-FieldMask": (
                "places.id,places.displayName,places.formattedAddress,"
                "places.location,places.primaryType,places.types,places.rating,"
                "places.userRatingCount,places.priceLevel,places.regularOpeningHours"
            ),
        }
        body: Dict[str, Any] = {}
        query_text = " ".join(filter(None, [keyword, category])) or "point of interest"
        body["textQuery"] = query_text
        included_type = _map_to_google_included_type(category)
        if included_type:
            body["includedType"] = included_type
        if open_now is True:
            body["openNow"] = True
        if lat is not None and lng is not None:
            body["locationBias"] = {
                "circle": {
                    "center": {"latitude": lat, "longitude": lng},
                    "radius": float(radius),
                }
            }

        url = f"{self.base_url}/places:searchText"
        resp = await call_with_breaker(
            self.breaker,
            client.post,
            url,
            json=body,
            headers=headers,
            timeout=settings.PLACES_API_TIMEOUT,
        )
        resp.raise_for_status()
        data = resp.json()
        raw_places = data.get("places") or []
        items = [_normalize_place(p) for p in raw_places]
        if open_now is not None:
            items = [item for item in items if item.open_now is open_now]
        result = PlaceSearchResponse(
            results=items,
            total=len(items),
            provider=self.provider_name,
        )
        # Return plain JSON-safe dict so @cache_response can store it in Redis cleanly
        return result.model_dump(mode="json")

    async def search_places(
        self,
        keyword: Optional[str] = None,
        category: Optional[str] = None,
        lat: Optional[float] = None,
        lng: Optional[float] = None,
        radius: int = 5000,
        open_now: Optional[bool] = None,
    ) -> PlaceSearchResponse:
        """Search places via Google Places API (New) with 24h cache & PyBreaker."""
        data = await self._search_places_cached(
            keyword=keyword,
            category=category,
            lat=lat,
            lng=lng,
            radius=radius,
            open_now=open_now,
        )
        return PlaceSearchResponse.model_validate(data)

    @cache_response(ttl=settings.CACHE_DEFAULT_TTL, prefix="place_details")
    async def _get_place_details_cached(self, place_id: str) -> Dict[str, Any]:
        """Internal cached place details query returning a serialized dictionary."""
        client = get_http_client()
        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": self.api_key,
            # Single-object endpoint omits the "places." prefix used in searchText FieldMask
            "X-Goog-FieldMask": (
                "id,displayName,formattedAddress,location,primaryType,"
                "rating,userRatingCount,priceLevel,regularOpeningHours,"
                "photos,websiteUri,nationalPhoneNumber"
            ),
        }
        url = f"{self.base_url}/places/{place_id}"
        resp = await call_with_breaker(
            self.breaker,
            client.get,
            url,
            headers=headers,
            timeout=settings.PLACES_API_TIMEOUT,
        )
        resp.raise_for_status()
        raw_data = resp.json()
        item = _normalize_place(raw_data)
        result = PlaceDetailResponse(place=item, provider=self.provider_name)
        return result.model_dump(mode="json")

    async def get_place_details(self, place_id: str) -> PlaceDetailResponse:
        """Get place details via Google Places API (New) with 24h cache & PyBreaker."""
        data = await self._get_place_details_cached(place_id=place_id)
        return PlaceDetailResponse.model_validate(data)
