import pytest
from pydantic import ValidationError
from app.schemas.place import POIItem, PlaceSearchResponse, PlaceDetailResponse


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
