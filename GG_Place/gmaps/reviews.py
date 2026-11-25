"""Google Maps Reviews service with guest (no-cookie) and authenticated (cookie) modes."""

from __future__ import annotations

from typing import Any

from .http_client import HttpTransport, safe_get
from .models import Review

_SORT_MODES = {
    "relevant": 1,
    "newest": 2,
    "highest": 3,
    "lowest": 4,
}


def parse_cookies(cookies: dict[str, str] | str | None) -> dict[str, str] | None:
    """Normalize a cookie dict or raw HTTP ``Cookie`` header string into a dict."""
    if not cookies:
        return None
    if isinstance(cookies, dict):
        cleaned = {str(k).strip(): str(v).strip() for k, v in cookies.items() if str(k).strip()}
        return cleaned or None
    if isinstance(cookies, str):
        parsed: dict[str, str] = {}
        for part in cookies.split(";"):
            if "=" in part:
                k, v = part.split("=", 1)
                k = k.strip()
                if k:
                    parsed[k] = v.strip()
        return parsed or None
    raise TypeError(f"cookies must be dict, str, or None; got {type(cookies).__name__}")


class ReviewsService:
    """Service for extracting place reviews in guest or authenticated mode."""

    def __init__(self, http: HttpTransport) -> None:
        self.http = http

    def _fetch_page(
        self,
        feature_id: str,
        *,
        ei: str = "",
        sort_code: int = 1,
        page_size: int = 20,
        next_token: str = "",
        cookies: dict[str, str] | None = None,
    ) -> tuple[list[dict[str, Any]], str, bool]:
        inner_payload = [
            [[feature_id], None, None, None, None, [None, None, None, [[1], [3]]]],
            [page_size, next_token],
            None,
            None,
            [ei or "0", None, None, None, None, None, 81],
            None,
            None,
            [None, 1, 1, None, 1, None, 1, None, None, None, None, [1, 1, None, [[1]]]],
            None,
            None,
            [3, sort_code, None, None, None, [2]],
            None,
            [1],
        ]
        data = self.http.post_batchexecute("qv9Egd", inner_payload, cookies=cookies)
        if not isinstance(data, list):
            return [], "", False

        parsed: list[dict[str, Any]] = []
        for item in safe_get(data, 2, default=[]):
            rev = safe_get(item, 0, default=[])
            photos_raw = safe_get(rev, 2, 2, default=[])
            photos = [
                safe_get(ph, 1, 6, 0)
                for ph in photos_raw
                if isinstance(ph, list) and safe_get(ph, 1, 6, 0)
            ]
            parsed.append(
                Review(
                    review_id=safe_get(rev, 0),
                    author=safe_get(rev, 1, 4, 5, 0),
                    author_url=safe_get(rev, 1, 4, 2, 0),
                    rating=safe_get(rev, 2, 0, 0),
                    text=safe_get(rev, 2, 15, 0, 0),
                    relative_time=safe_get(rev, 1, 6),
                    photos=photos,
                ).to_dict()
            )

        next_tok = safe_get(data, 1, default="") or ""
        limited_view = bool(safe_get(data, 5, default=False))
        return parsed, next_tok, limited_view

    def get_reviews_guest(
        self,
        feature_id: str,
        *,
        ei: str = "",
        sort_by: str = "relevant",
    ) -> dict[str, Any]:
        """Guest mode (no cookies): single fast request returning up to 5 top reviews."""
        if not feature_id.strip():
            raise ValueError("feature_id must not be empty")
        sort_code = _SORT_MODES.get(sort_by.lower(), 1)
        reviews, next_tok, limited_view = self._fetch_page(
            feature_id,
            ei=ei,
            sort_code=sort_code,
            page_size=20,
            next_token="",
            cookies=None,
        )
        return {
            "mode": "guest",
            "count": len(reviews),
            "limited_view": limited_view,
            "next_token": next_tok or None,
            "reviews": reviews,
        }

    def get_reviews_authenticated(
        self,
        feature_id: str,
        cookies: dict[str, str] | str,
        *,
        ei: str = "",
        sort_by: str = "relevant",
        page_size: int = 20,
        max_pages: int = 20,
    ) -> dict[str, Any]:
        """Authenticated mode (with Google cookies): paginates through all available reviews."""
        if not feature_id.strip():
            raise ValueError("feature_id must not be empty")
        parsed_cookies = parse_cookies(cookies)
        if not parsed_cookies:
            raise ValueError("Authenticated mode requires non-empty Google cookies.")

        sort_code = _SORT_MODES.get(sort_by.lower(), 1)
        all_reviews: list[dict[str, Any]] = []
        seen_ids: set[str] = set()
        next_token = ""
        limited_view = False

        for _ in range(max_pages):
            page_reviews, next_token, limited_view = self._fetch_page(
                feature_id,
                ei=ei,
                sort_code=sort_code,
                page_size=min(max(page_size, 1), 20),
                next_token=next_token,
                cookies=parsed_cookies,
            )
            for r in page_reviews:
                rid = r.get("review_id")
                if rid and rid in seen_ids:
                    continue
                if rid:
                    seen_ids.add(rid)
                all_reviews.append(r)

            if not next_token:
                break

        return {
            "mode": "authenticated",
            "count": len(all_reviews),
            "limited_view": limited_view,
            "next_token": next_token or None,
            "reviews": all_reviews,
        }

    def get_reviews(
        self,
        feature_id: str,
        *,
        cookies: dict[str, str] | str | None = None,
        ei: str = "",
        sort_by: str = "relevant",
        page_size: int = 20,
        max_pages: int = 20,
    ) -> dict[str, Any]:
        """Auto-select guest mode (no cookie) or authenticated paginated mode (with cookie)."""
        parsed_cookies = parse_cookies(cookies)
        if parsed_cookies:
            return self.get_reviews_authenticated(
                feature_id,
                parsed_cookies,
                ei=ei,
                sort_by=sort_by,
                page_size=page_size,
                max_pages=max_pages,
            )
        return self.get_reviews_guest(feature_id, ei=ei, sort_by=sort_by)

    def get_all_reviews(
        self,
        feature_id: str,
        *,
        ei: str = "",
        page_size: int = 20,
        max_pages: int = 20,
        cookies: dict[str, str] | str | None = None,
        sort_by: str = "relevant",
    ) -> list[dict[str, Any]]:
        """Backward-compatible wrapper returning only the list of review dicts."""
        result = self.get_reviews(
            feature_id,
            cookies=cookies,
            ei=ei,
            sort_by=sort_by,
            page_size=page_size,
            max_pages=max_pages,
        )
        return result["reviews"]
