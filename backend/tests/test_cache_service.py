import asyncio
from datetime import datetime
import uuid
import pytest
from unittest.mock import AsyncMock
from app.services.cache_service import (
    BaseCache,
    InMemoryCache,
    RedisCache,
    build_cache_key,
)

@pytest.mark.asyncio
async def test_in_memory_cache_crud():
    cache = InMemoryCache()
    await cache.set("poi:123", {"name": "Da Nang Beach"}, ttl=10)
    val = await cache.get("poi:123")
    assert val == {"name": "Da Nang Beach"}
    assert await cache.exists("poi:123") is True
    
    # Test prefix clear
    await cache.set("poi:456", {"name": "Dragon Bridge"}, ttl=10)
    await cache.set("other:789", {"name": "Museum"}, ttl=10)
    cleared = await cache.clear_prefix("poi")
    assert cleared == 2
    assert await cache.get("poi:123") is None
    assert await cache.get("other:789") == {"name": "Museum"}

    await cache.delete("other:789")
    assert await cache.get("other:789") is None

@pytest.mark.asyncio
async def test_in_memory_cache_ttl_expiration():
    cache = InMemoryCache()
    await cache.set("temp_key", "temp_value", ttl=1)
    assert await cache.get("temp_key") == "temp_value"
    await asyncio.sleep(1.1)
    assert await cache.get("temp_key") is None

@pytest.mark.asyncio
async def test_cache_key_builder_deterministic():
    key1 = build_cache_key("poi", category="cafe", city="Da Nang")
    key2 = build_cache_key("poi", city="Da Nang", category="cafe")
    assert key1 == key2
    assert key1.startswith("poi:")

@pytest.mark.asyncio
async def test_redis_cache_serialization_and_operations():
    mock_redis = AsyncMock()
    cache = RedisCache(redis_client=mock_redis)

    test_data = {
        "id": uuid.uuid4(),
        "created_at": datetime(2026, 1, 1, 12, 0, 0),
        "name": "Ba Na Hills",
    }

    # Test set with serialization of UUID and datetime
    await cache.set("poi:bana", test_data, ttl=3600)
    assert mock_redis.set.called
    call_args = mock_redis.set.call_args[0]
    assert call_args[0] == "poi:bana"
    assert "Ba Na Hills" in call_args[1]

    # Test get with deserialization
    mock_redis.get.return_value = '{"name": "Ba Na Hills", "rating": 4.8}'
    val = await cache.get("poi:bana")
    assert val == {"name": "Ba Na Hills", "rating": 4.8}

    # Test exists
    mock_redis.exists.return_value = 1
    assert await cache.exists("poi:bana") is True

    # Test delete
    mock_redis.delete.return_value = 1
    assert await cache.delete("poi:bana") is True

@pytest.mark.asyncio
async def test_redis_cache_graceful_degradation_on_error():
    mock_redis = AsyncMock()
    mock_redis.get.side_effect = Exception("Redis connection lost")
    mock_redis.set.side_effect = Exception("Redis connection lost")
    mock_redis.exists.side_effect = Exception("Redis connection lost")
    mock_redis.delete.side_effect = Exception("Redis connection lost")

    cache = RedisCache(redis_client=mock_redis)

    # Should not raise exception, but return None/False gracefully
    assert await cache.get("any_key") is None
    assert await cache.set("any_key", {"data": 1}, ttl=60) is False
    assert await cache.exists("any_key") is False
    assert await cache.delete("any_key") is False
