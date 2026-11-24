from app.core.config import Settings


def test_redis_settings_default():
    settings = Settings()
    assert settings.REDIS_URL.startswith("redis://") or settings.REDIS_URL.startswith("rediss://")
    assert settings.HTTP_CLIENT_TIMEOUT == 10.0
    assert settings.CACHE_DEFAULT_TTL == 86400


def test_places_and_circuit_breaker_settings_default():
    s = Settings()
    assert s.PLACES_API_TIMEOUT == 2.5
    assert s.CIRCUIT_BREAKER_FAIL_MAX == 3
    assert s.CIRCUIT_BREAKER_RESET_TIMEOUT == 60
    assert s.GOOGLE_PLACES_BASE_URL == "https://places.googleapis.com/v1"


def test_weather_settings_default():
    s = Settings()
    assert s.OPENWEATHER_BASE_URL == "https://api.openweathermap.org/data/2.5"
    assert s.OPEN_METEO_BASE_URL == "https://api.open-meteo.com/v1"
    assert s.WEATHER_API_TIMEOUT == 3.0
    assert s.WEATHER_CACHE_TTL == 10800


def test_currency_settings_default():
    s = Settings()
    assert s.EXCHANGE_RATE_API_BASE_URL == "https://v6.exchangerate-api.com/v6"
    assert s.EXCHANGE_RATE_OPEN_BASE_URL == "https://open.er-api.com/v6"
    assert s.CURRENCY_API_TIMEOUT == 3.0
    assert s.CURRENCY_CACHE_TTL == 43200
