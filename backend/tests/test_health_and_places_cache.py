import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_health_check_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/healthz")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "redis" in data

@pytest.mark.asyncio
async def test_health_check_alias_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/healthz")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
