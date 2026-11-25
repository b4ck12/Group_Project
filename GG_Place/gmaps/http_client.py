"""Low-level HTTP transport and JSON/geo helpers for Google Maps RPCs."""

from __future__ import annotations

import json
import math
import re
from typing import Any

from curl_cffi import requests

DEFAULT_HEADERS = {
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.google.com/maps",
}


def strip_xssi(text: str) -> str:
    """Strip Google's XSSI protection prefix ``)]}'`` from RPC responses."""
    return re.sub(r"^\)\]\}'\s*\n?", "", text)


def safe_get(obj: Any, *indices: int, default: Any = None) -> Any:
    """Safely traverse nested lists by index, returning ``default`` if missing."""
    cur = obj
    for idx in indices:
        if isinstance(cur, list) and 0 <= idx < len(cur):
            cur = cur[idx]
        else:
            return default
    return cur if cur is not None else default


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance in kilometers between two (latitude, longitude) points."""
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return round(2 * r * math.asin(math.sqrt(a)), 3)


class HttpTransport:
    """Shared ``curl_cffi`` Chrome-impersonated HTTP session."""

    def __init__(self, hl: str = "en", gl: str = "us", timeout: float = 15.0) -> None:
        self.hl = hl
        self.gl = gl
        self.timeout = timeout
        self.session = requests.Session(impersonate="chrome124")

    def get_json_xssi(
        self,
        url: str,
        *,
        params: dict[str, Any] | None = None,
        headers: dict[str, str] | None = None,
    ) -> Any:
        merged_headers = {**DEFAULT_HEADERS, **(headers or {})}
        resp = self.session.get(url, params=params, headers=merged_headers, timeout=self.timeout)
        resp.raise_for_status()
        return json.loads(strip_xssi(resp.text))

    def get_json(
        self,
        url: str,
        *,
        params: dict[str, Any] | None = None,
        headers: dict[str, str] | None = None,
    ) -> Any:
        resp = self.session.get(url, params=params, headers=headers, timeout=self.timeout)
        resp.raise_for_status()
        return resp.json()

    def post_batchexecute(
        self,
        rpc_id: str,
        inner_payload: list[Any],
        *,
        cookies: dict[str, str] | None = None,
    ) -> Any:
        f_req = json.dumps(
            [[[rpc_id, json.dumps(inner_payload, separators=(",", ":")), None, "generic"]]],
            separators=(",", ":"),
        )
        headers = {
            "Referer": "https://www.google.com/",
            "X-Same-Domain": "1",
            "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
            "Accept-Language": f"{self.hl},en-US;q=0.9,en;q=0.8",
        }
        resp = self.session.post(
            "https://www.google.com/maps/_/MapsWizUi/data/batchexecute",
            params={"rpcids": rpc_id, "hl": self.hl, "gl": self.gl, "rt": "c"},
            headers=headers,
            data={"f.req": f_req},
            cookies=cookies,
            timeout=self.timeout,
        )
        resp.raise_for_status()
        for line in resp.text.splitlines():
            if line.startswith('[["wrb.fr"'):
                outer = json.loads(line)
                payload_str = safe_get(outer, 0, 2)
                if payload_str:
                    return json.loads(payload_str)
        return None
