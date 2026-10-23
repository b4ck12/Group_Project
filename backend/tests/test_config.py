from app.core.config import Settings

def test_redis_settings_default():
    settings = Settings()
    assert settings.REDIS_URL.startswith("redis://") or settings.REDIS_URL.startswith("rediss://")
    assert settings.HTTP_CLIENT_TIMEOUT == 10.0
    assert settings.CACHE_DEFAULT_TTL == 86400
