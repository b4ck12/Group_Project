"""
Tests for Event / Room Management (TASK-201 & TASK-202)
Author: Tạ Quang Huy (Person 1 - Backend Core Dev A)

Covers:
- POST /api/v1/events (Tạo phòng, tự động gán creator làm HOST)
- GET /api/v1/events (Lấy danh sách phòng theo user)
- GET /api/v1/events/{id} (Lấy chi tiết phòng kèm danh sách thành viên)
- PATCH /api/v1/events/{id} (Cập nhật thông tin phòng)
- DELETE /api/v1/events/{id} (Xóa phòng)
- Service Unit Tests (EventService logic, auto HOST role, 404 handling)
"""

from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch
import pytest
from fastapi import HTTPException, status
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.models.enums import BudgetTier, EventRole, EventScope, EventType
from app.models.event import Event, EventMember
from app.schemas.event import EventCreate, EventUpdate
from app.services.event_service import EventService


@pytest.fixture
def sample_event():
    now = datetime.now(timezone.utc)
    ev = Event(
        id="evt_test_123",
        name="Chuyến đi Đà Lạt 3N2Đ",
        description="Nghỉ dưỡng và săn mây cùng bạn bè",
        type=EventType.TRAVEL,
        scope=EventScope.VACATION,
        destination="Đà Lạt",
        location="Lâm Đồng",
        budget_tier=BudgetTier.MODERATE,
        start_date=datetime(2026, 12, 1, 8, 0, 0, tzinfo=timezone.utc),
        end_date=datetime(2026, 12, 3, 18, 0, 0, tzinfo=timezone.utc),
        macro_locked=False,
        final_locked=False,
        created_by="user_huy_123",
        created_at=now,
        updated_at=now,
    )
    ev.members = [
        EventMember(
            id="mem_123",
            event_id="evt_test_123",
            user_id="user_huy_123",
            role=EventRole.HOST,
            created_at=now,
        )
    ]
    return ev


# =====================================================================
# 1. API Endpoints Tests (Integration / HTTP Contract)
# =====================================================================

@pytest.mark.asyncio
async def test_create_event_endpoint_201(sample_event):
    """Test API POST /api/v1/events trả về 201 Created và thông tin phòng vừa tạo."""
    payload = {
        "name": "Chuyến đi Đà Lạt 3N2Đ",
        "description": "Nghỉ dưỡng và săn mây cùng bạn bè",
        "type": "TRAVEL",
        "scope": "VACATION",
        "destination": "Đà Lạt",
        "location": "Lâm Đồng",
        "budget_tier": "MODERATE",
        "start_date": "2026-12-01T08:00:00Z",
        "end_date": "2026-12-03T18:00:00Z",
    }
    headers = {"X-User-Id": "user_huy_123"}

    with patch("app.api.v1.events.EventService.create_event", new=AsyncMock(return_value=sample_event)):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.post("/api/v1/events", json=payload, headers=headers)

    assert resp.status_code == 201
    data = resp.json()
    assert data["id"] == "evt_test_123"
    assert data["name"] == "Chuyến đi Đà Lạt 3N2Đ"
    assert data["created_by"] == "user_huy_123"
    assert data["scope"] == "VACATION"


@pytest.mark.asyncio
async def test_list_events_endpoint_200(sample_event):
    """Test API GET /api/v1/events trả về danh sách các phòng của user."""
    headers = {"X-User-Id": "user_huy_123"}

    with patch("app.api.v1.events.EventService.list_user_events", new=AsyncMock(return_value=[sample_event])):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.get("/api/v1/events", headers=headers)

    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]["id"] == "evt_test_123"


@pytest.mark.asyncio
async def test_get_event_detail_endpoint_200(sample_event):
    """Test API GET /api/v1/events/{id} trả về thông tin chi tiết kèm danh sách thành viên."""
    with patch("app.api.v1.events.EventService.get_event_by_id", new=AsyncMock(return_value=sample_event)):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.get("/api/v1/events/evt_test_123")

    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == "evt_test_123"
    assert len(data["members"]) == 1
    assert data["members"][0]["role"] == "HOST"
    assert data["members"][0]["user_id"] == "user_huy_123"


@pytest.mark.asyncio
async def test_get_event_detail_endpoint_404():
    """Test API GET /api/v1/events/{id} trả về 404 khi không tìm thấy phòng."""
    with patch(
        "app.api.v1.events.EventService.get_event_by_id",
        new=AsyncMock(side_effect=HTTPException(status_code=404, detail="Không tìm thấy phòng chuyến đi")),
    ):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.get("/api/v1/events/non_existing_id")

    assert resp.status_code == 404
    assert "Không tìm thấy phòng chuyến đi" in resp.json()["detail"]


@pytest.mark.asyncio
async def test_update_event_endpoint_200(sample_event):
    """Test API PATCH /api/v1/events/{id} cập nhật thông tin phòng thành công."""
    sample_event.name = "Chuyến đi Đà Lạt (Đã cập nhật)"

    with patch("app.api.v1.events.EventService.update_event", new=AsyncMock(return_value=sample_event)):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.patch(
                "/api/v1/events/evt_test_123",
                json={"name": "Chuyến đi Đà Lạt (Đã cập nhật)"},
            )

    assert resp.status_code == 200
    assert resp.json()["name"] == "Chuyến đi Đà Lạt (Đã cập nhật)"


@pytest.mark.asyncio
async def test_delete_event_endpoint_200():
    """Test API DELETE /api/v1/events/{id} xóa phòng thành công."""
    with patch("app.api.v1.events.EventService.delete_event", new=AsyncMock(return_value=True)):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.delete("/api/v1/events/evt_test_123")

    assert resp.status_code == 200
    assert resp.json()["event_id"] == "evt_test_123"
    assert "Đã xóa phòng thành công" in resp.json()["message"]


# =====================================================================
# 2. Service Layer Unit Tests (Business Logic & Database Interactions)
# =====================================================================

@pytest.mark.asyncio
async def test_service_create_event_auto_assigns_host():
    """Kiểm tra EventService.create_event tự động gán creator làm HOST trong event_members."""
    mock_db = MagicMock()
    mock_db.flush = AsyncMock()
    mock_db.commit = AsyncMock()
    mock_db.execute = AsyncMock()
    mock_result = MagicMock()

    mock_event = Event(
        id="evt_new_999",
        name="Hà Giang Loop",
        start_date=datetime(2026, 11, 15, tzinfo=timezone.utc),
        end_date=datetime(2026, 11, 18, tzinfo=timezone.utc),
        created_by="user_host_1",
    )
    mock_result.scalar_one.return_value = mock_event
    mock_db.execute.return_value = mock_result

    event_in = EventCreate(
        name="Hà Giang Loop",
        description="Phượt xe máy",
        type=EventType.TRAVEL,
        scope=EventScope.VACATION,
        destination="Hà Giang",
        budget_tier=BudgetTier.BUDGET,
        start_date=datetime(2026, 11, 15, 8, 0, 0, tzinfo=timezone.utc),
        end_date=datetime(2026, 11, 18, 18, 0, 0, tzinfo=timezone.utc),
    )

    result = await EventService.create_event(
        db=mock_db,
        event_in=event_in,
        creator_id="user_host_1",
    )

    # Đảm bảo db.add được gọi 2 lần: 1 cho Event, 1 cho EventMember
    assert mock_db.add.call_count == 2
    added_objects = [call.args[0] for call in mock_db.add.call_args_list]

    added_event = added_objects[0]
    added_member = added_objects[1]

    assert isinstance(added_event, Event)
    assert added_event.name == "Hà Giang Loop"
    assert added_event.created_by == "user_host_1"

    assert isinstance(added_member, EventMember)
    assert added_member.role == EventRole.HOST
    assert added_member.user_id == "user_host_1"

    assert mock_db.flush.await_count == 1
    assert mock_db.commit.await_count == 1
    assert result.id == "evt_new_999"


@pytest.mark.asyncio
async def test_service_get_event_not_found_raises_404():
    """Kiểm tra EventService.get_event_by_id ném HTTPException 404 khi phòng không tồn tại."""
    mock_db = MagicMock()
    mock_db.execute = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = mock_result

    with pytest.raises(HTTPException) as exc_info:
        await EventService.get_event_by_id(mock_db, "non_existent_event")

    assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
    assert "Không tìm thấy phòng chuyến đi" in exc_info.value.detail


@pytest.mark.asyncio
async def test_service_update_event():
    """Kiểm tra EventService.update_event cập nhật đúng trường và lưu vào db."""
    mock_db = MagicMock()
    mock_db.commit = AsyncMock()
    mock_db.refresh = AsyncMock()
    existing_event = Event(
        id="evt_upd_1",
        name="Original Name",
        description="Original Desc",
        start_date=datetime(2026, 11, 1, tzinfo=timezone.utc),
        end_date=datetime(2026, 11, 2, tzinfo=timezone.utc),
    )

    with patch("app.services.event_service.EventService.get_event_by_id", new=AsyncMock(return_value=existing_event)):
        update_schema = EventUpdate(name="Brand New Name")
        updated = await EventService.update_event(mock_db, "evt_upd_1", update_schema)

    assert updated.name == "Brand New Name"
    assert updated.description == "Original Desc"
    assert updated.updated_at is not None
    assert mock_db.commit.await_count == 1
    assert mock_db.refresh.await_count == 1


@pytest.mark.asyncio
async def test_service_delete_event():
    """Kiểm tra EventService.delete_event gọi đúng hàm delete và commit."""
    mock_db = MagicMock()
    mock_db.delete = AsyncMock()
    mock_db.commit = AsyncMock()
    mock_event = Event(id="evt_del_1", name="To Delete")

    with patch("app.services.event_service.EventService.get_event_by_id", new=AsyncMock(return_value=mock_event)):
        success = await EventService.delete_event(mock_db, "evt_del_1")

    assert success is True
    mock_db.delete.assert_awaited_once_with(mock_event)
    mock_db.commit.assert_awaited_once()
