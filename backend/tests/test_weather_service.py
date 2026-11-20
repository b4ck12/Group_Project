from unittest.mock import AsyncMock, MagicMock, patch
import pybreaker
import pytest

from app.schemas.weather import CurrentWeather, WeatherAlert, WeatherResponse
from app.services import cache_service
from app.services.cache_service import InMemoryCache
from app.services.weather_service import (
    WeatherService,
    create_weather_breaker,
    map_wmo_weather_code,
)


@pytest.fixture(autouse=True)
def isolated_memory_cache(monkeypatch):
    mem_cache = InMemoryCache()
    monkeypatch.setattr(cache_service, "_get_active_cache", lambda: mem_cache)
    return mem_cache


def _mock_open_meteo_payload(rain_code: int = 63, rain_prob: int = 85, rain_mm: float = 5.4):
    return {
        "timezone": "Asia/Ho_Chi_Minh",
        "current": {
            "temperature_2m": 26.8,
            "apparent_temperature": 29.5,
            "relative_humidity_2m": 88,
            "wind_speed_10m": 15.0,
            "precipitation": rain_mm,
            "rain": rain_mm,
            "weather_code": rain_code,
        },
        "daily": {
            "time": ["2026-11-19", "2026-11-20", "2026-11-21"],
            "weather_code": [rain_code, 2, 0],
            "temperature_2m_min": [23.0, 24.0, 24.5],
            "temperature_2m_max": [29.0, 31.0, 32.0],
            "precipitation_sum": [rain_mm, 0.2, 0.0],
            "precipitation_probability_max": [rain_prob, 20, 5],
        },
    }


def _mock_openweathermap_payload():
    return {
        "city": {"name": "Da Nang", "timezone": 25200},
        "list": [
            {
                "dt_txt": "2026-11-19 09:00:00",
                "main": {"temp": 28.5, "feels_like": 31.0, "temp_min": 26.0, "temp_max": 30.0, "humidity": 78},
                "weather": [{"id": 500, "main": "Rain", "description": "light rain"}],
                "wind": {"speed": 4.0},
                "pop": 0.65,
                "rain": {"3h": 2.4},
            },
            {
                "dt_txt": "2026-11-20 09:00:00",
                "main": {"temp": 30.0, "feels_like": 32.5, "temp_min": 25.5, "temp_max": 31.5, "humidity": 70},
                "weather": [{"id": 800, "main": "Clear", "description": "clear sky"}],
                "wind": {"speed": 3.0},
                "pop": 0.1,
            },
        ],
    }


def test_map_wmo_weather_code_identifies_clear_and_rain():
    cond, desc, is_rain = map_wmo_weather_code(0)
    assert cond == "Clear"
    assert is_rain is False

    cond_r, desc_r, is_rain_r = map_wmo_weather_code(63)
    assert cond_r == "Rain"
    assert is_rain_r is True

    cond_t, _, is_rain_t = map_wmo_weather_code(95)
    assert cond_t == "Thunderstorm"
    assert is_rain_t is True


@pytest.mark.asyncio
async def test_weather_service_uses_open_meteo_when_no_api_key_and_caches_3h():
    mock_resp = MagicMock()
    mock_resp.raise_for_status = MagicMock()
    mock_resp.json.return_value = _mock_open_meteo_payload()

    mock_client = AsyncMock()
    mock_client.get = AsyncMock(return_value=mock_resp)

    service = WeatherService(api_key="", breaker=create_weather_breaker())

    with patch("app.services.weather_service.get_http_client", return_value=mock_client):
        res1 = await service.get_weather(lat=16.05441, lng=108.20221, days=3)
        # Slightly shifted coordinates within same ~1.1km grid should hit 3h cache
        res2 = await service.get_weather(lat=16.05449, lng=108.20229, days=3)

    assert res1.provider == "open_meteo"
    assert res1.current.temperature_c == 26.8
    assert res1.alert.rain_alert is True
    assert res1.alert.suggest_indoor_swap is True
    assert len(res1.daily_forecast) == 3
    assert res2.current.temperature_c == 26.8
    # Upstream HTTP GET must only be called ONCE because second call hits cache
    assert mock_client.get.await_count == 1


@pytest.mark.asyncio
async def test_weather_service_uses_openweathermap_when_api_key_provided():
    mock_resp = MagicMock()
    mock_resp.raise_for_status = MagicMock()
    mock_resp.json.return_value = _mock_openweathermap_payload()

    mock_client = AsyncMock()
    mock_client.get = AsyncMock(return_value=mock_resp)

    service = WeatherService(api_key="test-owm-key", breaker=create_weather_breaker())

    with patch("app.services.weather_service.get_http_client", return_value=mock_client):
        res = await service.get_weather(lat=16.05, lng=108.20, days=3)

    assert res.provider == "openweathermap"
    assert res.current.temperature_c == 28.5
    assert res.alert.rain_alert is True
    assert len(res.daily_forecast) == 2


@pytest.mark.asyncio
async def test_weather_service_propagates_circuit_breaker_error():
    breaker = create_weather_breaker(fail_max=1, reset_timeout=60)
    mock_client = AsyncMock()
    mock_client.get = AsyncMock(side_effect=RuntimeError("Upstream unreachable"))

    service = WeatherService(api_key="", breaker=breaker)

    with patch("app.services.weather_service.get_http_client", return_value=mock_client):
        with pytest.raises(RuntimeError):
            await service.get_weather(lat=21.03, lng=105.85, days=3)
        # Next call must fast-fail with CircuitBreakerError
        with pytest.raises(pybreaker.CircuitBreakerError):
            await service.get_weather(lat=21.04, lng=105.86, days=3)


@pytest.mark.asyncio
async def test_custom_weather_hook_overrides_and_falls_back_on_error():
    async def leader_weather_scraper(lat: float, lng: float, days: int) -> WeatherResponse:
        return WeatherResponse(
            lat=lat,
            lng=lng,
            timezone="Asia/Ho_Chi_Minh",
            provider="custom_scraper",
            current=CurrentWeather(
                temperature_c=31.0,
                condition="Clear",
                description="Live scraped sunny weather",
                is_raining=False,
            ),
            daily_forecast=[],
            alert=WeatherAlert(rain_alert=False, severity="NONE", suggest_indoor_swap=False),
        )

    service = WeatherService(
        api_key="",
        breaker=create_weather_breaker(),
        custom_weather_fn=leader_weather_scraper,
    )
    res = await service.get_weather(lat=10.78, lng=106.70, days=3)
    assert res.provider == "custom_scraper"
    assert res.current.temperature_c == 31.0

    # If leader scraper fails, must fall back automatically to Open-Meteo
    async def broken_scraper(lat: float, lng: float, days: int) -> WeatherResponse:
        raise RuntimeError("Cloudflare Turnstile blocked")

    mock_resp = MagicMock()
    mock_resp.raise_for_status = MagicMock()
    mock_resp.json.return_value = _mock_open_meteo_payload(rain_code=0, rain_prob=10, rain_mm=0.0)
    mock_client = AsyncMock()
    mock_client.get = AsyncMock(return_value=mock_resp)

    service_fb = WeatherService(
        api_key="",
        breaker=create_weather_breaker(),
        custom_weather_fn=broken_scraper,
    )
    with patch("app.services.weather_service.get_http_client", return_value=mock_client):
        res_fb = await service_fb.get_weather(lat=10.80, lng=106.72, days=3)
    assert res_fb.provider == "open_meteo"
    assert res_fb.alert.rain_alert is False
