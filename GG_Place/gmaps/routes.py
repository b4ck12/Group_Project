"""Google Maps real-time routing and distance matrix services."""

from __future__ import annotations

import re
from typing import Any

from .http_client import HttpTransport, safe_get
from .models import RouteStep, RouteSummary
from .places import PlacesService

_TRAVEL_MODE_CODES = {
    "driving": "0",
    "drive": "0",
    "bicycling": "1",
    "bicycle": "1",
    "walking": "2",
    "walk": "2",
    "transit": "3",
    "two_wheeler": "9",
}


class RoutesService:
    """Service for real-time traffic routing (Google Maps) and route matrices (OSRM)."""

    def __init__(self, http: HttpTransport, places: PlacesService) -> None:
        self.http = http
        self.places = places

    def resolve_coords(
        self,
        target: str | tuple[float, float],
        *,
        near: tuple[float, float] = (21.0285, 105.8542),
    ) -> tuple[float, float]:
        if isinstance(target, tuple) and len(target) == 2:
            return float(target[0]), float(target[1])
        if isinstance(target, str):
            place = self.places.get_place_details(target, latitude=near[0], longitude=near[1])
            if place and place["latitude"] is not None and place["longitude"] is not None:
                return float(place["latitude"]), float(place["longitude"])
            raise ValueError(f"Could not resolve coordinates for: {target!r}")
        raise TypeError(f"Unsupported target type: {type(target).__name__}")

    @staticmethod
    def _parse_route_summary(rt: list[Any]) -> dict[str, Any]:
        info = safe_get(rt, 0, default=[])
        dist_m = safe_get(info, 2, 0, default=0)
        static_s = safe_get(info, 3, 0, default=0)
        static_text = safe_get(info, 3, 1)
        traffic_s = safe_get(info, 10, 0, 0, default=static_s)
        traffic_text = safe_get(info, 10, 0, 1, default=static_text)
        return RouteSummary(
            summary=safe_get(info, 1),
            distance_meters=dist_m,
            distance_km=round(dist_m / 1000.0, 3) if dist_m else None,
            distance_text=safe_get(info, 2, 1),
            duration_seconds=traffic_s,
            duration_minutes=round(traffic_s / 60.0, 1) if traffic_s else None,
            duration_text=traffic_text,
            static_duration_seconds=static_s,
            static_duration_text=static_text,
            duration_range=safe_get(rt, 1, 0, 0, 10, 4, 2),
        ).to_dict()

    def compute_route(
        self,
        origin: str | tuple[float, float],
        destination: str | tuple[float, float],
        *,
        profile: str = "driving",
        near: tuple[float, float] = (21.0285, 105.8542),
    ) -> dict[str, Any]:
        """Compute real-time traffic route via Google Maps ``/maps/preview/directions``."""
        lat1, lng1 = self.resolve_coords(origin, near=near)
        lat2, lng2 = self.resolve_coords(destination, near=near)
        mid_lat, mid_lng = (lat1 + lat2) / 2.0, (lng1 + lng2) / 2.0
        mode_code = _TRAVEL_MODE_CODES.get(profile.lower(), "0")

        pb = (
            f"!1m4!3m2!3d{lat1}!4d{lng1}!6e2"
            f"!1m4!3m2!3d{lat2}!4d{lng2}!6e2"
            f"!3m12!1m3!1d30000!2d{mid_lng}!3d{mid_lat}!2m3!1f0.0!2f0.0!3f0.0!3m2!1i1024!2i768!4f13.1"
            "!6m61!1m5!18b1!30b1!31m1!1b1!34e1!2m4!5m1!6e2!20e3!39b1!6m30!32i1!49b1!63m0!66b1!85b1!114b1"
            "!149b1!206b1!209b1!212b1!215b1!216b1!222b1!223b1!234b1!235b1!239b1!246b1!253b1!260b1!262b1"
            "!266b1!270b1!271b1!273b1!281b1!294b1!302i300!303i100!327m0!10b1!12b1!13b1!14b1!16b1!17m1"
            f"!3e{mode_code}!20m5!1e6!2e1!5e2!6b1!14b1!46m1!1b0!96b1!97m1!2b1!99b1"
        )
        data = self.http.get_json_xssi(
            "https://www.google.com/maps/preview/directions",
            params={"authuser": "0", "hl": self.http.hl, "gl": self.http.gl, "pb": pb},
        )
        routes_raw = safe_get(data, 0, 1, default=[])
        if not routes_raw:
            return {"distance_km": None, "duration_seconds": None, "steps": [], "alternatives": []}

        primary = self._parse_route_summary(routes_raw[0])
        alternatives = [self._parse_route_summary(rt) for rt in routes_raw[1:]]
        steps: list[dict[str, Any]] = []
        for st in safe_get(routes_raw[0], 1, 0, 1, 0, 1, default=[]):
            if not isinstance(st, list):
                continue
            step_data = safe_get(st, 0, default=[])
            raw_html = safe_get(step_data, 1, default="")
            instruction = re.sub(r"<[^>]+>", "", raw_html).strip() if isinstance(raw_html, str) else None
            notes_raw = safe_get(step_data, 9, default=[])
            notes = [
                safe_get(n, 1)
                for n in notes_raw
                if isinstance(n, list) and safe_get(n, 1)
            ]
            steps.append(
                RouteStep(
                    instruction=instruction or safe_get(st, 2, 1),
                    distance_meters=safe_get(step_data, 2, 0),
                    distance_text=safe_get(step_data, 2, 1),
                    duration_seconds=safe_get(step_data, 3, 0),
                    duration_text=safe_get(step_data, 3, 1),
                    notes=notes,
                ).to_dict()
            )

        return {
            "origin": (lat1, lng1),
            "destination": (lat2, lng2),
            **primary,
            "alternatives": alternatives,
            "steps": steps,
        }

    def compute_route_matrix(
        self,
        origins: list[str | tuple[float, float]],
        destinations: list[str | tuple[float, float]],
        *,
        profile: str = "driving",
        near: tuple[float, float] = (16.0544, 108.2022),
    ) -> list[dict[str, Any]]:
        """Compute distance (km) and duration matrix for origin -> destination pairs."""
        if not origins or not destinations:
            raise ValueError("origins and destinations must not be empty")

        orig_coords = [self.resolve_coords(o, near=near) for o in origins]
        dest_coords = [self.resolve_coords(d, near=near) for d in destinations]
        all_coords = orig_coords + dest_coords
        coord_str = ";".join(f"{lng},{lat}" for lat, lng in all_coords)
        src_idx = ";".join(str(i) for i in range(len(orig_coords)))
        dst_idx = ";".join(str(len(orig_coords) + j) for j in range(len(dest_coords)))

        data = self.http.get_json(
            f"https://router.project-osrm.org/table/v1/{profile}/{coord_str}",
            params={"sources": src_idx, "destinations": dst_idx, "annotations": "distance,duration"},
        )
        distances = data.get("distances", [])
        durations = data.get("durations", [])

        matrix: list[dict[str, Any]] = []
        for i in range(len(orig_coords)):
            for j in range(len(dest_coords)):
                dist_m = distances[i][j] if i < len(distances) and j < len(distances[i]) else None
                dur_s = durations[i][j] if i < len(durations) and j < len(durations[i]) else None
                matrix.append(
                    {
                        "origin_index": i,
                        "destination_index": j,
                        "distance_km": round(dist_m / 1000.0, 3) if dist_m is not None else None,
                        "duration_minutes": round(dur_s / 60.0, 1) if dur_s is not None else None,
                    }
                )
        return matrix
