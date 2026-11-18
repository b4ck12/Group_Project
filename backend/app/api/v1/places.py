import asyncio
from typing import Optional

from fastapi import APIRouter, HTTPException, Query, status
import httpx
import pybreaker

from app.schemas.place import (
    HotelCompareResponse,
    PlaceDetailResponse,
    PlaceSearchResponse,
    TourSearchResponse,
)
from app.services.external_travel_service import ExternalTravelService
from app.services.places_service import GooglePlacesService

router = APIRouter(prefix="/places", tags=["places"])
places_service = GooglePlacesService()
external_travel_service = ExternalTravelService(places_service=places_service)


@router.get("/search", response_model=PlaceSearchResponse)
async def search_places(
    keyword: Optional[str] = Query(default=None, description="Search keyword"),
    category: Optional[str] = Query(
        default=None, description="Place category (e.g. restaurant, cafe, hotel)"
    ),
    lat: Optional[float] = Query(default=None, ge=-90.0, le=90.0),
    lng: Optional[float] = Query(default=None, ge=-180.0, le=180.0),
    radius: int = Query(default=5000, ge=100, le=50000),
    open_now: Optional[bool] = Query(default=None, description="Filter places currently open"),
) -> PlaceSearchResponse:
    """Search places via Google Places API with category & hours filter, 24h Redis cache, and PyBreaker."""
    try:
        return await places_service.search_places(
            keyword=keyword,
            category=category,
            lat=lat,
            lng=lng,
            radius=radius,
            open_now=open_now,
        )
    except (pybreaker.CircuitBreakerError, httpx.TimeoutException, asyncio.TimeoutError, httpx.HTTPError) as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"External Places provider temporarily unavailable: {exc}",
        ) from exc


@router.get("/{place_id}/details", response_model=PlaceDetailResponse)
async def get_place_details(place_id: str) -> PlaceDetailResponse:
    """Get detailed POI metadata for a specific place ID."""
    try:
        return await places_service.get_place_details(place_id=place_id)
    except (pybreaker.CircuitBreakerError, httpx.TimeoutException, asyncio.TimeoutError, httpx.HTTPError) as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"External Places provider temporarily unavailable: {exc}",
        ) from exc


@router.get("/hotels/compare", response_model=HotelCompareResponse)
async def compare_hotels(
    ids: str = Query(..., description="Comma-separated place IDs (1 to 5 hotels)"),
    checkin: Optional[str] = Query(default=None, description="Check-in date YYYY-MM-DD"),
    checkout: Optional[str] = Query(default=None, description="Check-out date YYYY-MM-DD"),
    guests: int = Query(default=2, ge=1, le=20, description="Number of adult guests"),
) -> HotelCompareResponse:
    """Compare 1-5 hotels side-by-side with multi-OTA booking links (Agoda, Booking.com, Airbnb, etc.)."""
    place_ids = [pid.strip() for pid in ids.split(",") if pid.strip()]
    if not place_ids or len(place_ids) > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Parameter 'ids' must contain between 1 and 5 comma-separated hotel place IDs.",
        )
    try:
        return await external_travel_service.compare_hotels(
            place_ids=place_ids,
            checkin=checkin,
            checkout=checkout,
            guests=guests,
        )
    except (
        pybreaker.CircuitBreakerError,
        httpx.TimeoutException,
        asyncio.TimeoutError,
        httpx.HTTPError,
    ) as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"External Places provider temporarily unavailable: {exc}",
        ) from exc


@router.get("/tours/search", response_model=TourSearchResponse)
async def search_tours(
    destination: Optional[str] = Query(default=None, description="Destination city or region"),
    keyword: Optional[str] = Query(default=None, description="Tour or attraction keyword"),
    lat: Optional[float] = Query(default=None, ge=-90.0, le=90.0),
    lng: Optional[float] = Query(default=None, ge=-180.0, le=180.0),
) -> TourSearchResponse:
    """Search tours and experiences with Klook, TripAdvisor, and 12Go Asia booking links (TASK-206)."""
    try:
        return await external_travel_service.search_tours_and_activities(
            destination=destination,
            keyword=keyword,
            lat=lat,
            lng=lng,
        )
    except (
        pybreaker.CircuitBreakerError,
        httpx.TimeoutException,
        asyncio.TimeoutError,
        httpx.HTTPError,
    ) as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"External Places provider temporarily unavailable: {exc}",
        ) from exc
