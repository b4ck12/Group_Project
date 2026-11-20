import asyncio

from fastapi import APIRouter, HTTPException, Query, status
import httpx
import pybreaker

from app.schemas.weather import WeatherResponse
from app.services.weather_service import WeatherService

router = APIRouter(tags=["utils"])
weather_service = WeatherService()


@router.get("/weather", response_model=WeatherResponse)
async def get_weather(
    lat: float = Query(..., ge=-90.0, le=90.0, description="Latitude (-90 to 90)"),
    lng: float = Query(..., ge=-180.0, le=180.0, description="Longitude (-180 to 180)"),
    days: int = Query(default=3, ge=1, le=7, description="Number of forecast days (1-7)"),
) -> WeatherResponse:
    """
    Get current weather, multi-day forecast, and rain/indoor-swap alert (TASK-207).
    Cached for 3 hours in Upstash Redis and protected by PyBreaker.
    Uses Open-Meteo (100% free, keyless) by default, OpenWeatherMap 2.5 if key is set,
    or a custom Team Leader scraper hook if configured.
    """
    try:
        return await weather_service.get_weather(lat=lat, lng=lng, days=days)
    except (
        pybreaker.CircuitBreakerError,
        httpx.TimeoutException,
        asyncio.TimeoutError,
        httpx.HTTPError,
    ) as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Weather provider temporarily unavailable: {exc}",
        ) from exc
