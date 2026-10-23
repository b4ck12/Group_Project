import pytest
from unittest.mock import AsyncMock, patch
from app.core.redis import (
    init_redis_pool,
    close_redis_pool,
    get_redis,
    get_redis_client,
    check_redis_health,
)

@pytest.mark.asyncio
async def test_redis_lifecycle_and_health_success():
    with patch("app.core.redis.ConnectionPool.from_url") as mock_pool_cls, \
         patch("app.core.redis.Redis") as mock_redis_cls:
        mock_pool = AsyncMock()
        mock_pool_cls.return_value = mock_pool

        mock_client = AsyncMock()
        mock_client.ping.return_value = True
        mock_redis_cls.return_value = mock_client

        await init_redis_pool()
        client = get_redis_client()
        assert client is not None

        health = await check_redis_health()
        assert health["status"] == "healthy"
        assert health["connected"] is True

        # Test FastAPI dependency generator
        gen = get_redis()
        dep_client = await anext(gen)
        assert dep_client is not None

        await close_redis_pool()

@pytest.mark.asyncio
async def test_redis_health_unhealthy_when_offline():
    with patch("app.core.redis.get_redis_client") as mock_get_client:
        mock_client = AsyncMock()
        mock_client.ping.side_effect = Exception("Connection refused")
        mock_get_client.return_value = mock_client

        health = await check_redis_health()
        assert health["status"] == "unhealthy"
        assert health["connected"] is False
        assert "error" in health
