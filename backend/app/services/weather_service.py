from abc import ABC, abstractmethod
from collections import defaultdict
import logging
from typing import Any, Awaitable, Callable, Dict, List, Optional, Tuple

import pybreaker

from app.core.config import settings
from app.core.http_client import get_http_client
from app.schemas.weather import (
    CurrentWeather,
    DailyForecastItem,
    WeatherAlert,
    WeatherResponse,
)
from app.services.cache_service import cache_response
from app.services.places_service import call_with_breaker

logger = logging.getLogger(__name__)

CustomWeatherCallable = Callable[[float, float, int], Awaitable[WeatherResponse]]


class BaseWeatherProvider(ABC):
    """Abstract interface for pluggable weather providers (SOLID - OCP/DIP)."""

    provider_name: str = "base_weather"

    @abstractmethod
    async def get_weather(self, lat: float, lng: float, days: int = 3) -> WeatherResponse:
        """Fetch current weather, daily forecast, and rain alert for coordinates."""
        raise NotImplementedError


def create_weather_breaker(
    fail_max: int = settings.CIRCUIT_BREAKER_FAIL_MAX,
    reset_timeout: int = settings.CIRCUIT_BREAKER_RESET_TIMEOUT,
) -> pybreaker.CircuitBreaker:
    """Create an isolated PyBreaker instance for Weather APIs (Bulkhead isolation)."""
    return pybreaker.CircuitBreaker(
        fail_max=fail_max,
        reset_timeout=reset_timeout,
        name="weather_api_breaker",
    )


weather_circuit_breaker = create_weather_breaker()


def map_wmo_weather_code(code: Optional[int]) -> Tuple[str, str, bool]:
    """
    Map Open-Meteo WMO weather interpretation code (0..99) to
    (condition, description, is_raining).
    """
    if code is None:
        return ("Unknown", "Weather data unavailable", False)
    if code == 0:
        return ("Clear", "Clear sky", False)
    if code in (1, 2, 3):
        return ("Clouds", "Partly cloudy to overcast", False)
    if code in (45, 48):
        return ("Fog", "Foggy conditions", False)
    if code in (51, 53, 55, 56, 57):
        return ("Drizzle", "Light to dense drizzle", True)
    if code in (61, 63, 65, 66, 67):
        return ("Rain", "Rain showers", True)
    if code in (71, 73, 75, 77):
        return ("Snow", "Snowfall", False)
    if code in (80, 81, 82):
        return ("Rain", "Heavy rain showers", True)
    if code in (95, 96, 99):
        return ("Thunderstorm", "Thunderstorm with rain", True)
    return ("Clouds", f"Weather code {code}", False)


def build_weather_alert(
    current: CurrentWeather,
    daily_forecast: List[DailyForecastItem],
) -> WeatherAlert:
    """Compute rain alert and indoor-swap recommendation for Living Itinerary."""
    today = daily_forecast[0] if daily_forecast else None
    today_prob = today.rain_probability_percent if today else 0
    today_rain_mm = today.precipitation_mm if today else 0.0

    is_storm = current.condition.lower() == "thunderstorm"
    heavy_rain = (
        is_storm
        or current.precipitation_mm >= 5.0
        or today_rain_mm >= 10.0
        or today_prob >= 75
    )
    moderate_rain = (
        current.is_raining
        or current.precipitation_mm >= 1.0
        or today_prob >= 50
        or (today is not None and today.is_rainy_day)
    )

    if heavy_rain:
        return WeatherAlert(
            rain_alert=True,
            severity="HIGH",
            suggest_indoor_swap=True,
            advisory_message=(
                f"Heavy rain or storm expected (rain chance {today_prob}%). "
                "Strongly recommend swapping outdoor stops to indoor backup options."
            ),
        )
    if moderate_rain:
        return WeatherAlert(
            rain_alert=True,
            severity="MODERATE",
            suggest_indoor_swap=True,
            advisory_message=(
                f"Rain likely (rain chance {today_prob}%). "
                "Bring an umbrella or consider indoor cafes/museums."
            ),
        )
    if today_prob >= 30:
        return WeatherAlert(
            rain_alert=False,
            severity="LOW",
            suggest_indoor_swap=False,
            advisory_message=(
                f"Low chance of light showers ({today_prob}%). "
                "Outdoor activities are generally fine."
            ),
        )
    return WeatherAlert(
        rain_alert=False,
        severity="NONE",
        suggest_indoor_swap=False,
        advisory_message="Clear conditions — ideal for outdoor itinerary stops.",
    )


class WeatherService(BaseWeatherProvider):
    """
    Zero-Cost 3-Tier Weather Adapter (TASK-207):
      - Tier 1: Optional `custom_weather_fn` hook for Team Leader's scraper / reverse-API
      - Tier 2: OpenWeatherMap 2.5 Forecast API (when OPENWEATHER_API_KEY is configured)
      - Tier 3: Open-Meteo Public API (DEFAULT 100% free, keyless, real live meteorological data)
    Protected by isolated PyBreaker and 3-hour Upstash Redis L2 Cache (ttl=10800).
    """

    provider_name: str = "weather_service"

    def __init__(
        self,
        api_key: Optional[str] = None,
        openweather_base_url: Optional[str] = None,
        open_meteo_base_url: Optional[str] = None,
        breaker: Optional[pybreaker.CircuitBreaker] = None,
        custom_weather_fn: Optional[CustomWeatherCallable] = None,
    ):
        self.api_key = api_key if api_key is not None else settings.OPENWEATHER_API_KEY
        self.openweather_base_url = (
            openweather_base_url or settings.OPENWEATHER_BASE_URL
        ).rstrip("/")
        self.open_meteo_base_url = (
            open_meteo_base_url or settings.OPEN_METEO_BASE_URL
        ).rstrip("/")
        self.breaker = breaker or weather_circuit_breaker
        self.custom_weather_fn = custom_weather_fn

    def __repr__(self) -> str:
        # Constant string because @cache_response includes str(self) in Redis cache keys
        return "WeatherService(provider=weather_service)"

    def __str__(self) -> str:
        return "WeatherService"

    async def _fetch_from_open_meteo(
        self, lat: float, lng: float, days: int
    ) -> WeatherResponse:
        client = get_http_client()
        url = f"{self.open_meteo_base_url}/forecast"
        params = {
            "latitude": lat,
            "longitude": lng,
            "current": (
                "temperature_2m,relative_humidity_2m,apparent_temperature,"
                "precipitation,rain,weather_code,wind_speed_10m"
            ),
            "daily": (
                "weather_code,temperature_2m_max,temperature_2m_min,"
                "precipitation_sum,precipitation_probability_max"
            ),
            "timezone": "auto",
            "forecast_days": days,
        }

        async def _call() -> Dict[str, Any]:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            return resp.json()

        payload = await call_with_breaker(
            self.breaker, _call, timeout=settings.WEATHER_API_TIMEOUT
        )
        cur = payload.get("current") or {}
        w_code = cur.get("weather_code")
        cond, desc, code_is_rain = map_wmo_weather_code(w_code)
        precip_mm = float(cur.get("precipitation") or cur.get("rain") or 0.0)

        current = CurrentWeather(
            temperature_c=float(cur.get("temperature_2m", 0.0)),
            feels_like_c=(
                float(cur["apparent_temperature"])
                if cur.get("apparent_temperature") is not None
                else None
            ),
            humidity_percent=(
                int(cur["relative_humidity_2m"])
                if cur.get("relative_humidity_2m") is not None
                else None
            ),
            wind_speed_kmh=(
                float(cur["wind_speed_10m"])
                if cur.get("wind_speed_10m") is not None
                else None
            ),
            precipitation_mm=precip_mm,
            condition=cond,
            description=desc,
            weather_code=w_code,
            is_raining=code_is_rain or precip_mm > 0.2,
        )

        daily_raw = payload.get("daily") or {}
        times = daily_raw.get("time") or []
        codes = daily_raw.get("weather_code") or []
        t_mins = daily_raw.get("temperature_2m_min") or []
        t_maxs = daily_raw.get("temperature_2m_max") or []
        p_sums = daily_raw.get("precipitation_sum") or []
        p_probs = daily_raw.get("precipitation_probability_max") or []

        daily_items: List[DailyForecastItem] = []
        for idx, date_str in enumerate(times[:days]):
            d_code = codes[idx] if idx < len(codes) else None
            d_cond, d_desc, d_rain = map_wmo_weather_code(d_code)
            d_precip = float(p_sums[idx]) if idx < len(p_sums) and p_sums[idx] is not None else 0.0
            d_prob = int(p_probs[idx]) if idx < len(p_probs) and p_probs[idx] is not None else 0
            daily_items.append(
                DailyForecastItem(
                    date=str(date_str),
                    temp_min_c=float(t_mins[idx]) if idx < len(t_mins) else current.temperature_c,
                    temp_max_c=float(t_maxs[idx]) if idx < len(t_maxs) else current.temperature_c,
                    precipitation_mm=d_precip,
                    rain_probability_percent=d_prob,
                    condition=d_cond,
                    description=d_desc,
                    is_rainy_day=d_rain or d_prob >= 50 or d_precip >= 1.0,
                )
            )

        alert = build_weather_alert(current, daily_items)
        return WeatherResponse(
            lat=lat,
            lng=lng,
            timezone=str(payload.get("timezone") or "UTC"),
            provider="open_meteo",
            current=current,
            daily_forecast=daily_items,
            alert=alert,
            is_live_data=True,
        )

    async def _fetch_from_openweathermap(
        self, lat: float, lng: float, days: int
    ) -> WeatherResponse:
        client = get_http_client()
        url = f"{self.openweather_base_url}/forecast"
        params = {
            "lat": lat,
            "lon": lng,
            "appid": self.api_key,
            "units": "metric",
        }

        async def _call() -> Dict[str, Any]:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            return resp.json()

        payload = await call_with_breaker(
            self.breaker, _call, timeout=settings.WEATHER_API_TIMEOUT
        )
        entries = payload.get("list") or []
        first = entries[0] if entries else {}
        first_main = first.get("main") or {}
        first_weather = (first.get("weather") or [{}])[0]
        first_rain_mm = float((first.get("rain") or {}).get("3h", 0.0))
        first_cond = str(first_weather.get("main") or "Clear")
        first_desc = str(first_weather.get("description") or first_cond)
        first_wind_ms = float((first.get("wind") or {}).get("speed", 0.0))

        current = CurrentWeather(
            temperature_c=float(first_main.get("temp", 0.0)),
            feels_like_c=(
                float(first_main["feels_like"])
                if first_main.get("feels_like") is not None
                else None
            ),
            humidity_percent=(
                int(first_main["humidity"])
                if first_main.get("humidity") is not None
                else None
            ),
            wind_speed_kmh=round(first_wind_ms * 3.6, 1),
            precipitation_mm=first_rain_mm,
            condition=first_cond,
            description=first_desc,
            weather_code=first_weather.get("id"),
            is_raining=first_cond.lower() in {"rain", "drizzle", "thunderstorm"}
            or first_rain_mm > 0.2,
        )

        # Group 3-hour OpenWeatherMap intervals by YYYY-MM-DD
        grouped: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
        for item in entries:
            date_key = str(item.get("dt_txt", ""))[:10]
            if date_key:
                grouped[date_key].append(item)

        daily_items: List[DailyForecastItem] = []
        for date_key in sorted(grouped.keys())[:days]:
            slots = grouped[date_key]
            t_min = min(float((s.get("main") or {}).get("temp_min", 0.0)) for s in slots)
            t_max = max(float((s.get("main") or {}).get("temp_max", 0.0)) for s in slots)
            precip = round(
                sum(float((s.get("rain") or {}).get("3h", 0.0)) for s in slots), 2
            )
            max_pop = int(round(max(float(s.get("pop", 0.0)) for s in slots) * 100))
            rep_w = (slots[0].get("weather") or [{}])[0]
            d_cond = str(rep_w.get("main") or "Clear")
            d_desc = str(rep_w.get("description") or d_cond)
            daily_items.append(
                DailyForecastItem(
                    date=date_key,
                    temp_min_c=t_min,
                    temp_max_c=t_max,
                    precipitation_mm=precip,
                    rain_probability_percent=max_pop,
                    condition=d_cond,
                    description=d_desc,
                    is_rainy_day=(
                        d_cond.lower() in {"rain", "drizzle", "thunderstorm"}
                        or max_pop >= 50
                        or precip >= 1.0
                    ),
                )
            )

        alert = build_weather_alert(current, daily_items)
        return WeatherResponse(
            lat=lat,
            lng=lng,
            timezone="UTC",
            provider="openweathermap",
            current=current,
            daily_forecast=daily_items,
            alert=alert,
            is_live_data=True,
        )

    @cache_response(ttl=settings.WEATHER_CACHE_TTL, prefix="weather_forecast")
    async def _get_weather_cached(
        self, lat: float, lng: float, days: int = 3
    ) -> Dict[str, Any]:
        # Tier 1: Pluggable Leader Scraper / Reverse-API Hook
        if self.custom_weather_fn is not None:
            try:
                custom_res = await self.custom_weather_fn(lat, lng, days)
                if custom_res is not None:
                    return custom_res.model_dump()
            except Exception as exc:
                logger.warning(
                    "Custom weather scraper hook failed for (%s, %s): %s. Falling back to public provider.",
                    lat,
                    lng,
                    exc,
                )

        # Tier 2: OpenWeatherMap 2.5 if API key is configured
        if self.api_key and self.api_key.strip():
            res = await self._fetch_from_openweathermap(lat, lng, days)
            return res.model_dump()

        # Tier 3: Open-Meteo Public API (100% Free, Keyless, Live Data)
        res = await self._fetch_from_open_meteo(lat, lng, days)
        return res.model_dump()

    async def get_weather(
        self, lat: float, lng: float, days: int = 3
    ) -> WeatherResponse:
        """
        Get current weather, N-day forecast, and rain alert for coordinates.
        Rounds lat/lng to 2 decimal places (~1.1km grid) for optimal 3-hour Redis cache hit rate.
        """
        norm_lat = round(lat, 2)
        norm_lng = round(lng, 2)
        data = await self._get_weather_cached(lat=norm_lat, lng=norm_lng, days=days)
        return WeatherResponse.model_validate(data)
