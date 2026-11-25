"""Unit and API contract tests for Auth (TASK-102 & TASK-104)."""
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from app.core.database import get_db
from app.core.security import (
    create_access_token,
    create_refresh_token,
    get_password_hash,
)
from app.main import app
from app.models.enums import AuthProvider, SystemRole
from app.models.user import User


def _make_user(user_id: str = "usr_1", email: str = "duong@tripmate.ai") -> User:
    now = datetime.now(timezone.utc)
    return User(
        id=user_id,
        email=email,
        password_hash=get_password_hash("Secret123!"),
        full_name="Pham Dinh Anh Duong",
        avatar_url=None,
        dietary_preferences={"no_spicy": True},
        provider=AuthProvider.LOCAL,
        role=SystemRole.USER,
        created_at=now,
        updated_at=now,
    )


@pytest.mark.asyncio
async def test_register_success_with_dietary_preferences():
    mock_repo = MagicMock()
    mock_repo.get_by_email = AsyncMock(return_value=None)
    mock_repo.create = AsyncMock(side_effect=lambda u: _make_user(email=u.email))
    app.dependency_overrides[get_db] = lambda: MagicMock()

    try:
        with patch("app.services.auth_service.UserRepository", return_value=mock_repo):
            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as client:
                resp = await client.post(
                    "/api/v1/auth/register",
                    json={
                        "email": "duong@tripmate.ai",
                        "password": "Secret123!",
                        "full_name": "Pham Dinh Anh Duong",
                        "dietary_preferences": {"no_spicy": True},
                    },
                )
        assert resp.status_code == 201
        body = resp.json()
        assert body["email"] == "duong@tripmate.ai"
        assert body["dietary_preferences"] == {"no_spicy": True}
        created_arg = mock_repo.create.call_args.args[0]
        assert created_arg.password_hash != "Secret123!"
    finally:
        app.dependency_overrides.pop(get_db, None)


@pytest.mark.asyncio
async def test_register_duplicate_email_returns_400():
    mock_repo = MagicMock()
    mock_repo.get_by_email = AsyncMock(return_value=_make_user())
    app.dependency_overrides[get_db] = lambda: MagicMock()

    try:
        with patch("app.services.auth_service.UserRepository", return_value=mock_repo):
            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as client:
                resp = await client.post(
                    "/api/v1/auth/register",
                    json={
                        "email": "duong@tripmate.ai",
                        "password": "Secret123!",
                        "full_name": "Duong",
                    },
                )
        assert resp.status_code == 400
    finally:
        app.dependency_overrides.pop(get_db, None)


@pytest.mark.asyncio
async def test_login_sets_httponly_cookie_and_returns_tokens():
    user = _make_user()
    mock_repo = MagicMock()
    mock_repo.get_by_email = AsyncMock(return_value=user)
    app.dependency_overrides[get_db] = lambda: MagicMock()

    try:
        with patch("app.services.auth_service.UserRepository", return_value=mock_repo):
            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as client:
                resp = await client.post(
                    "/api/v1/auth/login",
                    json={"email": "duong@tripmate.ai", "password": "Secret123!"},
                )
        assert resp.status_code == 200
        assert resp.json()["token_type"] == "bearer"
        assert "refresh_token" in resp.cookies
    finally:
        app.dependency_overrides.pop(get_db, None)


@pytest.mark.asyncio
async def test_login_wrong_password_returns_400():
    mock_repo = MagicMock()
    mock_repo.get_by_email = AsyncMock(return_value=_make_user())
    app.dependency_overrides[get_db] = lambda: MagicMock()

    try:
        with patch("app.services.auth_service.UserRepository", return_value=mock_repo):
            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as client:
                resp = await client.post(
                    "/api/v1/auth/login",
                    json={"email": "duong@tripmate.ai", "password": "WrongPassword"},
                )
        assert resp.status_code == 400
    finally:
        app.dependency_overrides.pop(get_db, None)


@pytest.mark.asyncio
async def test_refresh_token_rotates_tokens_and_rejects_access_token():
    user = _make_user()
    mock_repo = MagicMock()
    mock_repo.get_by_id = AsyncMock(return_value=user)
    app.dependency_overrides[get_db] = lambda: MagicMock()

    try:
        with patch("app.api.v1.auth.UserRepository", return_value=mock_repo):
            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as client:
                valid_refresh = create_refresh_token(user.id)
                resp_ok = await client.post(
                    "/api/v1/auth/refresh-token",
                    cookies={"refresh_token": valid_refresh},
                )
                assert resp_ok.status_code == 200
                assert resp_ok.json()["access_token"]

                wrong_access = create_access_token(user.id)
                resp_bad = await client.post(
                    "/api/v1/auth/refresh-token",
                    cookies={"refresh_token": wrong_access},
                )
                assert resp_bad.status_code == 401
    finally:
        app.dependency_overrides.pop(get_db, None)
