import asyncio
from typing import Optional

from fastapi import APIRouter, HTTPException, Query, status
import httpx
import pybreaker

from app.schemas.currency import ExchangeRateResponse
from app.schemas.weather import WeatherResponse
from app.services.currency_service import CurrencyService, UnsupportedCurrencyError
from app.services.weather_service import WeatherService

router = APIRouter(tags=["utils"])
weather_service = WeatherService()
currency_service = CurrencyService()


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


@router.get("/exchange-rate", response_model=ExchangeRateResponse)
async def get_exchange_rate(
    base: str = Query(
        default="VND",
        min_length=3,
        max_length=3,
        pattern="^[A-Za-z]{3}$",
        description="Base 3-letter ISO-4217 currency code (e.g., VND, USD, THB, SGD)",
    ),
    target: Optional[str] = Query(
        default=None,
        min_length=3,
        max_length=3,
        pattern="^[A-Za-z]{3}$",
        description="Optional target 3-letter ISO-4217 currency code (e.g., THB, SGD)",
    ),
    amount: Optional[float] = Query(
        default=None,
        gt=0,
        description="Optional positive amount in base currency to convert into target currency",
    ),
    include_all: bool = Query(
        default=False,
        description="When target is omitted, return all global currencies instead of ASEAN + USD",
    ),
) -> ExchangeRateResponse:
    """
    Get live ASEAN & travel exchange rates and optional currency conversion (TASK-208).
    Base-currency rate tables are cached for 12 hours in Upstash Redis and protected by PyBreaker.
    Uses open.er-api.com (100% free, keyless) by default, ExchangeRate-API v6 if key is set,
    or a custom Team Leader scraper hook if configured.
    """
    try:
        return await currency_service.get_exchange_rates(
            base=base,
            target=target,
            amount=amount,
            include_all=include_all,
        )
    except UnsupportedCurrencyError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except (
        pybreaker.CircuitBreakerError,
        httpx.TimeoutException,
        asyncio.TimeoutError,
        httpx.HTTPError,
    ) as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Currency provider temporarily unavailable: {exc}",
        ) from exc
