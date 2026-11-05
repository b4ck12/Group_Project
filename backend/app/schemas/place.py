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


class PlaceSearchResponse(BaseModel):
    results: List[POIItem] = Field(default_factory=list)
    total: int = Field(default=0, ge=0)
    provider: str = "google_places"


class PlaceDetailResponse(BaseModel):
    place: POIItem
    provider: str = "google_places"
