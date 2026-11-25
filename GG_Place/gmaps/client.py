"""Unified facade client composing PlacesService, ReviewsService, and RoutesService."""

from __future__ import annotations

from typing import Any

from .http_client import HttpTransport
from .places import PlacesService
from .reviews import ReviewsService
from .routes import RoutesService


class GoogleMapsWebClient:
    """Free, no-API-key, no-Playwright Google Maps & Places client."""

    def __init__(self, hl: str = "en", gl: str = "us", timeout: float = 15.0) -> None:
        self.http = HttpTransport(hl=hl, gl=gl, timeout=timeout)
        self.places = PlacesService(self.http)
        self.reviews = ReviewsService(self.http)
        self.routes = RoutesService(self.http, self.places)

    def search_places(self, query: str, **kwargs: Any) -> list[dict[str, Any]]:
        return self.places.search_places(query, **kwargs)

    def search_nearby(
        self,
        latitude: float,
        longitude: float,
        radius_km: float = 2.0,
        place_type: str = "restaurant",
        max_results: int = 20,
    ) -> list[dict[str, Any]]:
        return self.places.search_nearby(latitude, longitude, radius_km, place_type, max_results)

    def find_hotels(self, query: str = "hotel", **kwargs: Any) -> list[dict[str, Any]]:
        return self.places.find_hotels(query, **kwargs)

    def get_place_details(self, query: str, **kwargs: Any) -> dict[str, Any] | None:
        return self.places.get_place_details(query, **kwargs)

    def get_review_point(self, query: str, **kwargs: Any) -> dict[str, Any] | None:
        return self.places.get_review_point(query, **kwargs)

    def autocomplete(self, partial_query: str, **kwargs: Any) -> list[dict[str, Any]]:
        return self.places.autocomplete(partial_query, **kwargs)

    def geocode(self, address: str, **kwargs: Any) -> dict[str, Any] | None:
        return self.places.geocode(address, **kwargs)

    def reverse_geocode(self, latitude: float, longitude: float) -> dict[str, Any] | None:
        return self.places.reverse_geocode(latitude, longitude)

    def get_reviews(
        self,
        feature_id: str,
        *,
        cookies: dict[str, str] | str | None = None,
        **kwargs: Any,
    ) -> dict[str, Any]:
        return self.reviews.get_reviews(feature_id, cookies=cookies, **kwargs)

    def get_reviews_guest(self, feature_id: str, **kwargs: Any) -> dict[str, Any]:
        return self.reviews.get_reviews_guest(feature_id, **kwargs)

    def get_reviews_authenticated(
        self,
        feature_id: str,
        cookies: dict[str, str] | str,
        **kwargs: Any,
    ) -> dict[str, Any]:
        return self.reviews.get_reviews_authenticated(feature_id, cookies, **kwargs)

    def get_all_reviews(self, feature_id: str, **kwargs: Any) -> list[dict[str, Any]]:
        return self.reviews.get_all_reviews(feature_id, **kwargs)

    def compute_route(
        self,
        origin: str | tuple[float, float],
        destination: str | tuple[float, float],
        **kwargs: Any,
    ) -> dict[str, Any]:
        return self.routes.compute_route(origin, destination, **kwargs)

    def compute_route_matrix(
        self,
        origins: list[str | tuple[float, float]],
        destinations: list[str | tuple[float, float]],
        **kwargs: Any,
    ) -> list[dict[str, Any]]:
        return self.routes.compute_route_matrix(origins, destinations, **kwargs)
