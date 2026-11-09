from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class POIItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    place_id: str = Field(..., min_length=1, max_length=255)
    name: str = Field(..., min_length=1, max_length=255)
    address: Optional[str] = None
    lat: Optional[float] = Field(default=None, ge=-90.0, le=90.0)
    lng: Optional[float] = Field(default=None, ge=-180.0, le=180.0)
    category: Optional[str] = None
    rating: Optional[float] = Field(default=None, ge=0.0, le=5.0)
    user_ratings_total: Optional[int] = Field(default=None, ge=0)
    price_level: Optional[int] = Field(default=None, ge=0, le=4)
    open_now: Optional[bool] = None
    photo_url: Optional[str] = None
    website_uri: Optional[str] = None
    phone_number: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

    def to_llm_compact_dict(self) -> Dict[str, Any]:
        """
        Export a token-optimized dictionary for LLM context injection (Supervisor Item 3.2).
        Strips heavy media URLs (photo_url, website_uri), phone numbers, and raw metadata
        to reduce token consumption by ~85% while preserving all core decision parameters.
        """
        compact: Dict[str, Any] = {
            "place_id": self.place_id,
            "name": self.name,
        }
        if self.address is not None:
            compact["address"] = self.address
        if self.lat is not None:
            compact["lat"] = self.lat
        if self.lng is not None:
            compact["lng"] = self.lng
        if self.category is not None:
            compact["category"] = self.category
        if self.rating is not None:
            compact["rating"] = self.rating
        if self.user_ratings_total is not None:
            compact["user_ratings_total"] = self.user_ratings_total
        if self.price_level is not None:
            compact["price_level"] = self.price_level
        if self.open_now is not None:
            compact["open_now"] = self.open_now
        return compact


class PlaceSearchResponse(BaseModel):
    results: List[POIItem] = Field(default_factory=list)
    total: int = Field(default=0, ge=0)
    provider: str = "google_places"


class PlaceDetailResponse(BaseModel):
    place: POIItem
    provider: str = "google_places"
