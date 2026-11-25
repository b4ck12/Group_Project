"""Google Maps Places service: search, nearby radius, hotels, details, geocode."""

from __future__ import annotations

from typing import Any

from .http_client import HttpTransport, haversine_km, safe_get
from .models import Place


def _parse_place_record(p: list[Any], center: tuple[float, float] | None = None) -> Place:
    lat = safe_get(p, 9, 2)
    lng = safe_get(p, 9, 3)
    dist_km = (
        haversine_km(center[0], center[1], lat, lng)
        if center is not None and lat is not None and lng is not None
        else None
    )
    amenities_raw = safe_get(p, 64, 2, default=[])
    amenities = [a[2] for a in amenities_raw if isinstance(a, list) and len(a) > 2 and a[2]]

    return Place(
        name=safe_get(p, 11, default=""),
        place_id=safe_get(p, 78),
        feature_id=safe_get(p, 10),
        address=safe_get(p, 39),
        latitude=lat,
        longitude=lng,
        distance_km=dist_km,
        rating=safe_get(p, 4, 7),
        review_count=safe_get(p, 4, 8),
        reviews_url=safe_get(p, 4, 3, 0),
        categories=safe_get(p, 13, default=[]),
        phone=safe_get(p, 178, 0, 0),
        website=safe_get(p, 7, 0),
        description=safe_get(p, 161, 1),
        price=safe_get(p, 88, 0),
        stars=safe_get(p, 35, 6),
        amenities=amenities,
        thumbnail=safe_get(p, 157),
        maps_url=safe_get(p, 42),
    )


class PlacesService:
    """Service for searching places, nearby radius queries, hotels, details, and geocoding."""

    def __init__(self, http: HttpTransport) -> None:
        self.http = http

    def search_places(
        self,
        query: str,
        *,
        latitude: float = 16.0544,
        longitude: float = 108.2022,
        radius_km: float = 10.0,
        max_results: int = 20,
        filter_by_radius: bool = False,
    ) -> list[dict[str, Any]]:
        if not query.strip():
            raise ValueError("query must not be empty")
        if radius_km <= 0:
            raise ValueError("radius_km must be positive")

        scale_m = max(int(radius_km * 2000), 1000)
        pb = (
            f"!4m12!1m3!1d{scale_m}!2d{longitude}!3d{latitude}"
            "!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!7i20!10b1"
        )
        data = self.http.get_json_xssi(
            "https://www.google.com/search",
            params={
                "tbm": "map",
                "authuser": "0",
                "hl": self.http.hl,
                "gl": self.http.gl,
                "q": query,
                "pb": pb,
            },
        )
        raw_items = safe_get(data, 0, 1, default=[])

        results: list[dict[str, Any]] = []
        for item in raw_items:
            p = safe_get(item, 14)
            if not isinstance(p, list):
                continue
            place = _parse_place_record(p, center=(latitude, longitude))
            if not place.name:
                continue
            if filter_by_radius and place.distance_km is not None and place.distance_km > radius_km:
                continue
            results.append(place.to_dict())
            if len(results) >= max_results:
                break
        return results

    def search_nearby(
        self,
        latitude: float,
        longitude: float,
        radius_km: float = 2.0,
        place_type: str = "restaurant",
        max_results: int = 20,
    ) -> list[dict[str, Any]]:
        places = self.search_places(
            query=place_type,
            latitude=latitude,
            longitude=longitude,
            radius_km=radius_km,
            max_results=max_results,
            filter_by_radius=True,
        )
        places.sort(key=lambda x: x["distance_km"] if x["distance_km"] is not None else 999999.0)
        return places

    def find_hotels(
        self,
        query: str = "hotel",
        *,
        latitude: float = 16.0544,
        longitude: float = 108.2022,
        radius_km: float = 10.0,
        min_rating: float | None = None,
        max_results: int = 20,
    ) -> list[dict[str, Any]]:
        q = query if "hotel" in query.lower() else f"hotel {query}"
        places = self.search_places(
            query=q,
            latitude=latitude,
            longitude=longitude,
            radius_km=radius_km,
            max_results=max_results,
            filter_by_radius=False,
        )
        if min_rating is not None:
            places = [p for p in places if (p["rating"] or 0.0) >= min_rating]
        return places

    def get_place_details(
        self,
        query: str,
        *,
        latitude: float = 16.0544,
        longitude: float = 108.2022,
    ) -> dict[str, Any] | None:
        places = self.search_places(
            query=query,
            latitude=latitude,
            longitude=longitude,
            radius_km=50.0,
            max_results=1,
        )
        return places[0] if places else None

    def get_review_point(
        self,
        query: str,
        *,
        latitude: float = 16.0544,
        longitude: float = 108.2022,
    ) -> dict[str, Any] | None:
        place = self.get_place_details(query, latitude=latitude, longitude=longitude)
        if not place:
            return None
        return {
            "name": place["name"],
            "place_id": place["place_id"],
            "feature_id": place["feature_id"],
            "rating": place["rating"],
            "review_count": place["review_count"],
            "reviews_url": place["reviews_url"],
        }

    def autocomplete(
        self,
        partial_query: str,
        *,
        latitude: float = 16.0544,
        longitude: float = 108.2022,
        max_results: int = 5,
    ) -> list[dict[str, Any]]:
        places = self.search_places(
            query=partial_query,
            latitude=latitude,
            longitude=longitude,
            radius_km=50.0,
            max_results=max_results,
        )
        return [
            {
                "name": p["name"],
                "place_id": p["place_id"],
                "address": p["address"],
                "latitude": p["latitude"],
                "longitude": p["longitude"],
            }
            for p in places
        ]

    def geocode(
        self,
        address: str,
        *,
        latitude: float = 16.0544,
        longitude: float = 108.2022,
    ) -> dict[str, Any] | None:
        place = self.get_place_details(address, latitude=latitude, longitude=longitude)
        if not place:
            return None
        return {
            "name": place["name"],
            "place_id": place["place_id"],
            "formatted_address": place["address"],
            "latitude": place["latitude"],
            "longitude": place["longitude"],
        }

    def reverse_geocode(self, latitude: float, longitude: float) -> dict[str, Any] | None:
        places = self.search_nearby(
            latitude=latitude,
            longitude=longitude,
            radius_km=1.0,
            place_type="restaurant",
            max_results=3,
        )
        for p in places:
            if p.get("address"):
                return {
                    "name": p["name"],
                    "place_id": p["place_id"],
                    "formatted_address": p["address"],
                    "latitude": p["latitude"],
                    "longitude": p["longitude"],
                }
        return None
