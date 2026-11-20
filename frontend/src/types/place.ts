/**
 * TypeScript interfaces for Places & POI APIs.
 * Mirrors backend Pydantic schemas: schemas/place.py
 * Endpoints: api-design-guide.md Section 2 — /api/v1/places/search, /api/v1/places/{id}/details
 */

export interface POIItem {
  place_id: string;
  name: string;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  category?: string | null;
  rating?: number | null;
  user_ratings_total?: number | null;
  price_level?: number | null; // Google Places Price Level: 0 (Free), 1 ($), 2 ($$), 3 ($$$), 4 ($$$$)
  open_now?: boolean | null;
  photo_url?: string | null;
  website_uri?: string | null;
  phone_number?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface PlaceSearchParams {
  keyword?: string;
  category?: string;
  lat?: number;
  lng?: number;
  radius?: number;
}

export interface PlaceSearchResponse {
  results: POIItem[];
  total: number;
  provider: string;
}

export interface PlaceDetailResponse {
  place: POIItem;
  provider: string;
}
