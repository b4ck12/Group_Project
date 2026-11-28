"""Structured data models for Google Maps places, reviews, and routes."""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any


@dataclass(slots=True)
class Place:
    """Normalized place record from Google Maps search/details."""

    name: str
    place_id: str | None = None
    feature_id: str | None = None
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    distance_km: float | None = None
    rating: float | None = None
    review_count: int | None = None
    reviews_url: str | None = None
    categories: list[str] = field(default_factory=list)
    phone: str | None = None
    website: str | None = None
    description: str | None = None
    price: str | None = None
    stars: str | None = None
    amenities: list[str] = field(default_factory=list)
    thumbnail: str | None = None
    maps_url: str | None = None

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass(slots=True)
class Review:
    """Single user review extracted from Google Maps."""

    review_id: str | None
    author: str | None
    author_url: str | None
    rating: int | float | None
    text: str | None
    relative_time: str | None
    photos: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass(slots=True)
class RouteStep:
    """Single maneuver step along a route."""

    instruction: str | None
    distance_meters: int | None = None
    distance_text: str | None = None
    duration_seconds: int | None = None
    duration_text: str | None = None
    notes: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass(slots=True)
class RouteSummary:
    """Summary metrics for a primary or alternative route."""

    summary: str | None
    distance_meters: int | None
    distance_km: float | None
    distance_text: str | None
    duration_seconds: int | None
    duration_minutes: float | None
    duration_text: str | None
    static_duration_seconds: int | None = None
    static_duration_text: str | None = None
    duration_range: str | None = None

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)
