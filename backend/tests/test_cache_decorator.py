import pytest
from unittest.mock import AsyncMock
from pydantic import BaseModel
from app.services.cache_service import cache_response, InMemoryCache

class SamplePOI(BaseModel):
    id: str
    name: str

@pytest.mark.asyncio
async def test_cache_response_decorator_hit_and_miss():
    cache = InMemoryCache()
    call_count = 0

    @cache_response(ttl=60, prefix="test_poi", cache_instance=cache)
    async def fetch_poi(poi_id: str):
        nonlocal call_count
        call_count += 1
        return {"id": poi_id, "name": "Son Tra Peninsula"}

    # First call -> Miss (function executed)
    res1 = await fetch_poi("poi_1")
    assert res1["name"] == "Son Tra Peninsula"
    assert call_count == 1

    # Second call -> Hit (cached result returned, function not re-executed)
    res2 = await fetch_poi("poi_1")
    assert res2["name"] == "Son Tra Peninsula"
    assert call_count == 1

    # Third call with different arg -> Miss (function executed for new arg)
    res3 = await fetch_poi("poi_2")
    assert res3["name"] == "Son Tra Peninsula"
    assert call_count == 2

@pytest.mark.asyncio
async def test_cache_response_with_pydantic_model():
    cache = InMemoryCache()
    call_count = 0

    @cache_response(ttl=60, prefix="poi_model", cache_instance=cache)
    async def get_poi_model(poi_id: str):
        nonlocal call_count
        call_count += 1
        return SamplePOI(id=poi_id, name="Marble Mountains")

    res1 = await get_poi_model("poi_marble")
    assert res1.name == "Marble Mountains"
    assert call_count == 1

    # Second call returns cached dict / model
    res2 = await get_poi_model("poi_marble")
    # Both dict or model access should be supported or dict returned
    name = res2.name if hasattr(res2, "name") else res2["name"]
    assert name == "Marble Mountains"
    assert call_count == 1

@pytest.mark.asyncio
async def test_cache_response_fallback_on_cache_failure():
    # Cache that fails on get and set
    mock_failing_cache = AsyncMock()
    mock_failing_cache.get.side_effect = Exception("Cache down")
    mock_failing_cache.set.side_effect = Exception("Cache down")

    call_count = 0

    @cache_response(ttl=60, prefix="fallback", cache_instance=mock_failing_cache)
    async def get_data():
        nonlocal call_count
        call_count += 1
        return {"status": "ok"}

    # Despite cache throwing exceptions, function executes safely
    res = await get_data()
    assert res == {"status": "ok"}
    assert call_count == 1
