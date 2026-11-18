from decimal import Decimal
import pytest
from pydantic import ValidationError
from app.models.enums import TransportMode
from app.schemas.place import (
    HotelCompareResponse,
    HotelComparisonItem,
    POIItem,
    PlaceDetailResponse,
    PlaceSearchResponse,
    ProviderBookingLink,
    TourActivityItem,
    TourSearchResponse,
    TransitEstimate,
)


def test_poi_item_valid():
    poi = POIItem(
        place_id="ChIJN1t_tDeuEmsRUsoyG83frY4",
        name="Pho Thin Bo Ho",
        address="61 Dinh Tien Hoang, Hoan Kiem, Ha Noi",
        lat=21.0285,
        lng=105.8542,
        category="restaurant",
        rating=4.5,
        user_ratings_total=1200,
        price_level=2,
        open_now=True,
        photo_url="https://example.com/photo.jpg",
    )
    assert poi.place_id == "ChIJN1t_tDeuEmsRUsoyG83frY4"
    assert poi.rating == 4.5
    assert poi.category == "restaurant"


def test_poi_item_rating_bounds():
    with pytest.raises(ValidationError):
        POIItem(
            place_id="bad_rating",
            name="Invalid Place",
            rating=5.5,
        )


def test_place_search_and_detail_responses():
    item = POIItem(place_id="p1", name="Cafe Giang")
    search_resp = PlaceSearchResponse(results=[item], total=1, provider="google_places")
    assert search_resp.total == 1
    assert search_resp.results[0].name == "Cafe Giang"

    detail_resp = PlaceDetailResponse(place=item, provider="google_places")
    assert detail_resp.place.place_id == "p1"


def test_poi_item_to_llm_compact_dict():
    """Verify that to_llm_compact_dict strips heavy URLs and preserves decision attributes."""
    full_poi = POIItem(
        place_id="ChIJ_full_sample",
        name="Nhà hàng Hải sản Bé Mặn",
        address="Lô 11 Võ Nguyên Giáp, Sơn Trà, Đà Nẵng",
        lat=16.0682,
        lng=108.2435,
        category="RESTAURANT",
        rating=4.7,
        user_ratings_total=3500,
        price_level=2,
        open_now=True,
        photo_url="https://maps.googleapis.com/maps/api/place/photo?photoreference=VERY_LONG_STRING_THAT_WASTES_TOKENS",
        website_uri="https://beman.vn/menu/full?ref=tracking_heavy_url",
        phone_number="+84 236 3838 888",
        metadata={"raw_google_reviews": [{"text": "heavy review"}], "internal_id": "xyz"},
    )

    compact = full_poi.to_llm_compact_dict()

    # Core fields must be present
    assert compact["place_id"] == "ChIJ_full_sample"
    assert compact["name"] == "Nhà hàng Hải sản Bé Mặn"
    assert compact["address"] == "Lô 11 Võ Nguyên Giáp, Sơn Trà, Đà Nẵng"
    assert compact["lat"] == 16.0682
    assert compact["lng"] == 108.2435
    assert compact["category"] == "RESTAURANT"
    assert compact["rating"] == 4.7
    assert compact["user_ratings_total"] == 3500
    assert compact["price_level"] == 2
    assert compact["open_now"] is True

    # Heavy token-wasting fields must be stripped (Supervisor Feedback Item 3.2)
    assert "photo_url" not in compact
    assert "website_uri" not in compact
    assert "phone_number" not in compact
    assert "metadata" not in compact


def test_poi_item_to_llm_compact_dict_minimal():
    """Verify to_llm_compact_dict works with only required fields."""
    min_poi = POIItem(place_id="min_001", name="Điểm ngắm hoàng hôn")
    compact = min_poi.to_llm_compact_dict()

    assert compact == {
        "place_id": "min_001",
        "name": "Điểm ngắm hoàng hôn",
    }


def test_transit_estimate_schema_valid():
    est = TransitEstimate(
        transport_mode=TransportMode.WALKING,
        transit_distance_km=0.5,
        transit_duration_minutes=6,
        transit_cost=Decimal("0"),
    )
    assert est.transport_mode == TransportMode.WALKING
    assert est.transit_distance_km == 0.5
    assert est.transit_duration_minutes == 6
    assert est.transit_cost == Decimal("0")


def test_hotel_comparison_and_tour_schemas_valid():
    link = ProviderBookingLink(
        provider="agoda",
        display_name="Agoda",
        booking_url="https://www.agoda.com/search?text=Muong+Thanh+Da+Nang",
        estimated_price_vnd=Decimal("850000"),
    )
    poi = POIItem(
        place_id="hotel_dn_1",
        name="Muong Thanh Luxury Da Nang",
        address="270 Vo Nguyen Giap, Da Nang",
        lat=16.0544,
        lng=108.2478,
        category="lodging",
        rating=4.4,
        user_ratings_total=1800,
        price_level=3,
    )
    hotel_item = HotelComparisonItem(
        place=poi,
        estimated_nightly_vnd=Decimal("1200000"),
        amenities=["Free Wi-Fi", "Breakfast Included", "Swimming Pool"],
        provider_links=[link],
    )
    compare_resp = HotelCompareResponse(hotels=[hotel_item], total=1)
    assert compare_resp.total == 1
    assert compare_resp.hotels[0].provider_links[0].provider == "agoda"
    assert compare_resp.hotels[0].provider_links[0].is_live_price is False

    klook_link = ProviderBookingLink(
        provider="klook",
        display_name="Klook",
        booking_url="https://www.klook.com/en-US/search/result/?query=Ba+Na+Hills",
        estimated_price_vnd=Decimal("900000"),
    )
    tour_item = TourActivityItem(
        place=poi,
        estimated_ticket_vnd=Decimal("900000"),
        duration_hours=6.0,
        provider_links=[klook_link],
    )
    tour_resp = TourSearchResponse(results=[tour_item], total=1)
    assert tour_resp.total == 1
    assert tour_resp.results[0].provider_links[0].provider == "klook"
