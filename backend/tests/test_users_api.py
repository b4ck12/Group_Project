from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from app.core.database import get_db
from app.core.security import get_current_user
from app.main import app
from app.models.enums import AuthProvider, SystemRole
from app.models.user import User


def _sample_user() -> User:
    now = datetime.now(timezone.utc)
    return User(
        id="usr_profile_1",
        email="duong@tripmate.ai",
        full_name="Anh Duong",
        avatar_url="https://example.com/old.png",
        dietary_preferences={"vegetarian": False},
        provider=AuthProvider.LOCAL,
        role=SystemRole.USER,
        created_at=now,
        updated_at=now,
    )


@pytest.mark.asyncio
async def test_get_profile_requires_auth():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/v1/users/me")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_get_profile_returns_current_user():
    user = _sample_user()
    app.dependency_overrides[get_current_user] = lambda: user
    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.get("/api/v1/users/me")
        assert resp.status_code == 200
        assert resp.json()["id"] == "usr_profile_1"
        assert resp.json()["full_name"] == "Anh Duong"
    finally:
        app.dependency_overrides.pop(get_current_user, None)


@pytest.mark.asyncio
async def test_patch_profile_partial_update():
    user = _sample_user()
    mock_repo = MagicMock()

    async def _fake_update(u: User, updates: dict) -> User:
        for k, v in updates.items():
            setattr(u, k, v)
        return u

    mock_repo.update = AsyncMock(side_effect=_fake_update)
    app.dependency_overrides[get_current_user] = lambda: user
    app.dependency_overrides[get_db] = lambda: MagicMock()

    try:
        with patch("app.services.user_service.UserRepository", return_value=mock_repo):
            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as client:
                resp = await client.patch(
                    "/api/v1/users/me",
                    json={"dietary_preferences": {"vegetarian": True, "no_spicy": True}},
                )
        assert resp.status_code == 200
        data = resp.json()
        assert data["full_name"] == "Anh Duong"
        assert data["dietary_preferences"] == {"vegetarian": True, "no_spicy": True}
    finally:
        app.dependency_overrides.pop(get_current_user, None)
        app.dependency_overrides.pop(get_db, None)


@pytest.mark.asyncio
async def test_patch_profile_rejects_blank_full_name():
    user = _sample_user()
    app.dependency_overrides[get_current_user] = lambda: user
    app.dependency_overrides[get_db] = lambda: MagicMock()

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.patch("/api/v1/users/me", json={"full_name": "   "})
        assert resp.status_code == 422
    finally:
        app.dependency_overrides.pop(get_current_user, None)
        app.dependency_overrides.pop(get_db, None)
