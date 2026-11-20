from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field


class CurrentWeather(BaseModel):
    """Normalized current weather snapshot (TASK-207)."""

    temperature_c: float
    feels_like_c: Optional[float] = None
    humidity_percent: Optional[int] = Field(default=None, ge=0, le=100)
    wind_speed_kmh: Optional[float] = Field(default=None, ge=0)
    precipitation_mm: float = Field(default=0.0, ge=0)
    condition: str = Field(..., min_length=1, max_length=64)
    description: str = Field(..., min_length=1, max_length=200)
    weather_code: Optional[int] = None
    is_raining: bool = False


class DailyForecastItem(BaseModel):
    """Single-day weather forecast entry (TASK-207)."""

    date: str = Field(..., description="ISO date string YYYY-MM-DD")
    temp_min_c: float
    temp_max_c: float
    precipitation_mm: float = Field(default=0.0, ge=0)
    rain_probability_percent: int = Field(default=0, ge=0, le=100)
    condition: str = Field(..., min_length=1, max_length=64)
    description: str = Field(..., min_length=1, max_length=200)
    is_rainy_day: bool = False


class WeatherAlert(BaseModel):
    """Rain & outdoor-adaptation alert for Living Itinerary (Feature #16 & #26)."""

    rain_alert: bool = False
    severity: Literal["NONE", "LOW", "MODERATE", "HIGH"] = "NONE"
    suggest_indoor_swap: bool = False
    advisory_message: str = "Weather looks favorable for outdoor stops."


class WeatherResponse(BaseModel):
    """Response payload for GET /api/v1/weather (TASK-207)."""

    lat: float = Field(..., ge=-90.0, le=90.0)
    lng: float = Field(..., ge=-180.0, le=180.0)
    timezone: str = "UTC"
    provider: str = Field(
        ...,
        description="Data source: open_meteo (free keyless), openweathermap, or custom_scraper",
    )
    current: CurrentWeather
    daily_forecast: List[DailyForecastItem] = Field(default_factory=list)
    alert: WeatherAlert = Field(default_factory=WeatherAlert)
    is_live_data: bool = True

    def to_llm_compact_dict(self) -> Dict[str, Any]:
        """Compact ~40-token weather summary for AI Agent prompts (Supervisor Item 3.2)."""
        return {
            "temp_c": self.current.temperature_c,
            "condition": self.current.condition,
            "rain_alert": self.alert.rain_alert,
            "severity": self.alert.severity,
            "suggest_indoor_swap": self.alert.suggest_indoor_swap,
            "advisory": self.alert.advisory_message,
        }
