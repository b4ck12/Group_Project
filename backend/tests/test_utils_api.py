from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient
import pybreaker

from app.main import app
from app.schemas.weather import (
    CurrentWeather,
    DailyForecastItem,
    WeatherAlert,
    WeatherResponse,
)

client = TestClient(app)


def test_get_weather_endpoint_200():
    mock_response = WeatherResponse(
        lat=16.05,
        lng=108.20,
        timezone="Asia/Ho_Chi_Minh",
        provider="open_meteo",
        current=CurrentWeather(
            temperature_c=27.0,
            humidity_percent=82,
            precipitation_mm=3.5,
            condition="Rain",
            description="Rain showers",
            is_raining=True,
        ),
        daily_forecast=[
            DailyForecastItem(
                date="2026-11-19",
                temp_min_c=24.0,
                temp_max_c=29.5,
                precipitation_mm=8.0,
                rain_probability_percent=75,
                condition="Rain",
                description="Rain showers",
                is_rainy_day=True,
            )
        ],
        alert=WeatherAlert(
            rain_alert=True,
            severity="HIGH",
            suggest_indoor_swap=True,
            advisory_message="Heavy rain expected. Consider indoor backup stops.",
        ),
    )

    with patch(
        "app.api.v1.utils.weather_service.get_weather",
        new=AsyncMock(return_value=mock_response),
    ):
        resp = client.get("/api/v1/weather?lat=16.0544&lng=108.2022&days=3")

    assert resp.status_code == 200
    body = resp.json()
    assert body["provider"] == "open_meteo"
    assert body["current"]["temperature_c"] == 27.0
    assert body["alert"]["rain_alert"] is True
    assert body["alert"]["suggest_indoor_swap"] is True


def test_get_weather_endpoint_422_on_invalid_coords_or_days():
    resp_lat = client.get("/api/v1/weather?lat=120.0&lng=108.2")
    assert resp_lat.status_code == 422

    resp_days = client.get("/api/v1/weather?lat=16.05&lng=108.2&days=15")
    assert resp_days.status_code == 422


def test_get_weather_endpoint_503_when_circuit_breaker_open():
    with patch(
        "app.api.v1.utils.weather_service.get_weather",
        new=AsyncMock(side_effect=pybreaker.CircuitBreakerError("Weather circuit open")),
    ):
        resp = client.get("/api/v1/weather?lat=16.05&lng=108.2")

    assert resp.status_code == 503
    assert "Weather provider temporarily unavailable" in resp.json()["detail"]
