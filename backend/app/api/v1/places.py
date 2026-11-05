import asyncio
from typing import Any, Optional

from fastapi import APIRouter, HTTPException, Query, status
import httpx
import pybreaker

from app.schemas.place import PlaceDetailResponse, PlaceSearchResponse
from app.services.places_service import GooglePlacesService

router = APIRouter(prefix="/places", tags=["places"])
places_service = GooglePlacesService()


@router.get("/search", response_model=PlaceSearchResponse)
async def search_places(
    keyword: Optional[str] = Query(default=None, description="Search keyword"),
    category: Optional[str] = Query(default=None, description="Place category (e.g. restaurant, hotel)"),
    lat: Optional[float] = Query(default=None, ge=-90.0, le=90.0),
    lng: Optional[float] = Query(default=None, ge=-180.0, le=180.0),
    radius: int = Query(default=5000, ge=100, le=50000),
) -> PlaceSearchResponse:
    """Search places via Google Places API with 24h Redis cache and PyBreaker protection."""
    try:
        return await places_service.search_places(
            keyword=keyword,
            category=category,
            lat=lat,
            lng=lng,
            radius=radius,
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


@router.get("/hotels/compare", response_model=Any)
async def compare_hotels(ids: str):
    """[STUB] Compare multiple hotels side-by-side (Sprint 2 TASK-206)."""
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Endpoint compare_hotels is not implemented yet.",
    )
