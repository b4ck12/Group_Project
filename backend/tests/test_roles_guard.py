"""
Unit and Integration Tests for RolesGuard Dependencies (TASK-204).
Author: Ta Quang Huy (Person 1 - Backend Core Dev A).

Covers:
- get_event_membership: returns member when found, raises 403 when user not enrolled.
- require_host: allows HOST role, raises 403 for MEMBER or VIEWER.
- require_member: allows HOST and MEMBER, raises 403 for VIEWER.
- API integration: PATCH /api/v1/events/{id} allows Host, rejects Member with 403.
- API integration: DELETE /api/v1/events/{id} allows Host, rejects Member with 403.
- API integration: rejects non-members with 403.
"""

from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch
import pytest
from fastapi import HTTPException, status
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.models.enums import EventRole, EventScope, EventType
from app.models.event import EventMember, Event
from app.api.v1.dependencies import (
    get_event_membership,
    require_host,
    require_member,
)


# =====================================================================
# 1. Unit Tests for Dependency Functions
# =====================================================================

@pytest.mark.asyncio
async def test_get_event_membership_success():
    """Verify get_event_membership returns member record when user is enrolled."""
    mock_db = MagicMock()
    mock_db.execute = AsyncMock()
    mock_result = MagicMock()

    mock_member = EventMember(
        id="mem_1",
        event_id="evt_1",
        user_id="user_1",
        role=EventRole.MEMBER,
    )
    mock_result.scalar_one_or_none.return_value = mock_member
    mock_db.execute.return_value = mock_result

    result = await get_event_membership(
        event_id="evt_1",
        user_id="user_1",
        db=mock_db,
    )
    assert result.id == "mem_1"
    assert result.role == EventRole.MEMBER


@pytest.mark.asyncio
async def test_get_event_membership_non_member_raises_403():
    """Verify get_event_membership raises 403 when user is not in the room."""
    mock_db = MagicMock()
    mock_db.execute = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = mock_result

    with pytest.raises(HTTPException) as exc_info:
        await get_event_membership(
            event_id="evt_1",
            user_id="stranger_user",
            db=mock_db,
        )

    assert exc_info.value.status_code == status.HTTP_403_FORBIDDEN
    assert "not a member" in exc_info.value.detail.lower()


@pytest.mark.asyncio
async def test_require_host_allows_host():
    """Verify require_host passes through when member role is HOST."""
    host_member = EventMember(
        id="mem_host",
        event_id="evt_1",
        user_id="user_host",
        role=EventRole.HOST,
    )
    result = await require_host(member=host_member)
    assert result.role == EventRole.HOST


@pytest.mark.asyncio
async def test_require_host_rejects_member_raises_403():
    """Verify require_host raises 403 when member role is MEMBER."""
    regular_member = EventMember(
        id="mem_regular",
        event_id="evt_1",
        user_id="user_regular",
        role=EventRole.MEMBER,
    )
    with pytest.raises(HTTPException) as exc_info:
        await require_host(member=regular_member)

    assert exc_info.value.status_code == status.HTTP_403_FORBIDDEN
    assert "host privileges" in exc_info.value.detail.lower()


@pytest.mark.asyncio
async def test_require_host_rejects_viewer_raises_403():
    """Verify require_host raises 403 when member role is VIEWER."""
    viewer_member = EventMember(
        id="mem_viewer",
        event_id="evt_1",
        user_id="user_viewer",
        role=EventRole.VIEWER,
    )
    with pytest.raises(HTTPException) as exc_info:
        await require_host(member=viewer_member)

    assert exc_info.value.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.asyncio
async def test_require_member_allows_host_and_member():
    """Verify require_member allows both HOST and MEMBER roles."""
    host_member = EventMember(id="m1", event_id="e1", user_id="u1", role=EventRole.HOST)
    regular_member = EventMember(id="m2", event_id="e1", user_id="u2", role=EventRole.MEMBER)

    res_host = await require_member(member=host_member)
    res_member = await require_member(member=regular_member)

    assert res_host.role == EventRole.HOST
    assert res_member.role == EventRole.MEMBER


@pytest.mark.asyncio
async def test_require_member_rejects_viewer_raises_403():
    """Verify require_member raises 403 for read-only VIEWER."""
    viewer_member = EventMember(id="m3", event_id="e1", user_id="u3", role=EventRole.VIEWER)

    with pytest.raises(HTTPException) as exc_info:
        await require_member(member=viewer_member)

    assert exc_info.value.status_code == status.HTTP_403_FORBIDDEN
    assert "viewers cannot" in exc_info.value.detail.lower()


# =====================================================================
