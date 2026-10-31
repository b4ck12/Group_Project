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
