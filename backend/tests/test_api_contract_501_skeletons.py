"""Contract tests verifying PR #28-PR #35 API router skeletons return 501 Not Implemented."""
import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_new_chat_plan_and_vote_501_skeletons():
    """All delegated chat, plan versioning, dish, fetch-more, and candidate vote endpoints must return 501."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Chat skeletons
        r_chat_list = await client.get("/api/v1/events/ev-1/chat")
        assert r_chat_list.status_code == 501

        r_chat_post = await client.post(
            "/api/v1/events/ev-1/chat",
            json={"content": "Hello", "message_type": "CHAT"},
        )
        assert r_chat_post.status_code == 501

        # Plan generate & Input Filter validation
        r_gen_bad = await client.post(
            "/api/v1/events/ev-1/plans/generate",
            json={"destination": "Da Nang", "start_date": "2026-12-22", "end_date": "2026-12-20"},
        )
        assert r_gen_bad.status_code == 422

        r_gen = await client.post(
            "/api/v1/events/ev-1/plans/generate",
            json={"destination": "Da Nang", "start_date": "2026-12-20", "end_date": "2026-12-22"},
        )
        assert r_gen.status_code == 501

        # Clone version, Macro Lock, Final Lock
        r_clone = await client.post(
            "/api/v1/events/ev-1/plans/p-1/clone-version",
            json={"target_status": "FINALIZED", "change_summary": "Lock v2"},
        )
        assert r_clone.status_code == 501

        r_macro = await client.post("/api/v1/events/ev-1/plans/p-1/macro-lock", json={})
        assert r_macro.status_code == 501

        r_final = await client.post("/api/v1/events/ev-1/plans/p-1/final-lock", json={})
        assert r_final.status_code == 501

        # Fetch-more backups & Dish recommendations
        r_more = await client.post(
            "/api/v1/events/ev-1/plans/p-1/stops/s-1/backup-options/fetch-more",
            json={"clarification_notes": "Prefer quiet BBQ"},
        )
        assert r_more.status_code == 501

        r_dishes = await client.get("/api/v1/events/ev-1/plans/p-1/stops/s-1/dishes")
        assert r_dishes.status_code == 501

        # PR #35 Candidate Voting & Plan Votes list
        r_vote = await client.post(
            "/api/v1/events/ev-1/plans/p-1/stops/s-1/vote",
            json={"candidate_id": "cand_hotel_001", "comment": "Great location"},
        )
        assert r_vote.status_code == 501

        r_votes_list = await client.get("/api/v1/events/ev-1/plans/p-1/votes")
        assert r_votes_list.status_code == 501


@pytest.mark.asyncio
async def test_openapi_registers_all_pr35_routes():
    """Verify Swagger OpenAPI schema exposes all new chat, plan versioning, and candidate vote paths."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/openapi.json")
        assert resp.status_code == 200
        paths = resp.json()["paths"]

        expected_paths = [
            "/api/v1/events/{event_id}/chat",
            "/api/v1/events/{event_id}/plans/generate",
            "/api/v1/events/{event_id}/plans/{plan_id}/clone-version",
            "/api/v1/events/{event_id}/plans/{plan_id}/macro-lock",
            "/api/v1/events/{event_id}/plans/{plan_id}/final-lock",
            "/api/v1/events/{event_id}/plans/{plan_id}/stops/{stop_id}/backup-options/fetch-more",
            "/api/v1/events/{event_id}/plans/{plan_id}/stops/{stop_id}/dishes",
            "/api/v1/events/{event_id}/plans/{plan_id}/stops/{stop_id}/vote",
            "/api/v1/events/{event_id}/plans/{plan_id}/votes",
        ]
        for p in expected_paths:
            assert p in paths, f"Missing OpenAPI path: {p}"
