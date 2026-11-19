import pytest
from pydantic import ValidationError

from app.schemas.weather import (
    CurrentWeather,
    DailyForecastItem,
    WeatherAlert,
    WeatherResponse,
)


def test_weather_response_valid_and_llm_compact_dict():
    resp = WeatherResponse(
        lat=16.05,
        lng=108.20,
        timezone="Asia/Ho_Chi_Minh",
        provider="open_meteo",
        current=CurrentWeather(
            temperature_c=27.5,
            feels_like_c=30.0,
            humidity_percent=84,
            wind_speed_kmh=14.2,
            precipitation_mm=4.2,
            condition="Rain",
            description="Moderate rain",
            weather_code=63,
            is_raining=True,
        ),
        daily_forecast=[
            DailyForecastItem(
                date="2026-11-19",
                temp_min_c=24.0,
                temp_max_c=29.0,
                precipitation_mm=12.5,
                rain_probability_percent=80,
                condition="Rain",
                description="Moderate rain",
                is_rainy_day=True,
            )
        ],
        alert=WeatherAlert(
            rain_alert=True,
            severity="HIGH",
            suggest_indoor_swap=True,
            advisory_message="Rain expected (80% probability). Consider indoor backup stops.",
        ),
    )

    assert resp.provider == "open_meteo"
    assert resp.alert.rain_alert is True
    assert resp.alert.suggest_indoor_swap is True

    compact = resp.to_llm_compact_dict()
    assert compact["temp_c"] == 27.5
    assert compact["condition"] == "Rain"
    assert compact["rain_alert"] is True
    assert compact["suggest_indoor_swap"] is True
    assert "daily_forecast" not in compact  # Pruned to save LLM tokens


def test_weather_schema_rejects_invalid_coordinates():
    with pytest.raises(ValidationError):
        WeatherResponse(
            lat=120.0,
            lng=108.2,
            provider="open_meteo",
            current=CurrentWeather(
                temperature_c=28.0,
                condition="Clear",
                description="Clear sky",
            ),
            daily_forecast=[],
            alert=WeatherAlert(),
        )
