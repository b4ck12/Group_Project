"""Real live tests (no mocks, no Playwright, no API key) for GoogleMapsWebClient.

Run with:
    .\\.venv\\Scripts\\python.exe -m pytest test.py -v -s
"""

from __future__ import annotations

import pytest

from gmaps import GoogleMapsWebClient

DA_NANG_CENTER = (16.0544, 108.2022)


@pytest.fixture(scope="module")
def web_client() -> GoogleMapsWebClient:
    return GoogleMapsWebClient(hl="en", gl="us")


class TestGoogleMapsRealLive:
    def test_real_search_places(self, web_client: GoogleMapsWebClient) -> None:
        places = web_client.search_places(
            "cafe in Da Nang",
            latitude=DA_NANG_CENTER[0],
            longitude=DA_NANG_CENTER[1],
            radius_km=5.0,
            max_results=5,
        )
        assert len(places) > 0
        first = places[0]
        print(f"\n[search_places] {first['name']} | rating={first['rating']} ({first['review_count']})")
        assert first["name"]
        assert first["latitude"] is not None
        assert first["longitude"] is not None

    def test_real_search_nearby_within_radius_x_km(self, web_client: GoogleMapsWebClient) -> None:
        radius_km = 2.0
        nearby = web_client.search_nearby(
            latitude=DA_NANG_CENTER[0],
            longitude=DA_NANG_CENTER[1],
            radius_km=radius_km,
            place_type="restaurant",
            max_results=10,
        )
        assert len(nearby) > 0
        for p in nearby:
            assert p["distance_km"] is not None
            assert p["distance_km"] <= radius_km
        print(
            f"\n[search_nearby <= {radius_km}km] found {len(nearby)} places; "
            f"closest: {nearby[0]['name']} ({nearby[0]['distance_km']} km)"
        )

    def test_real_find_hotels_with_rating_and_reviews(self, web_client: GoogleMapsWebClient) -> None:
        hotels = web_client.find_hotels(
            "hotel in Da Nang",
            latitude=DA_NANG_CENTER[0],
            longitude=DA_NANG_CENTER[1],
            min_rating=4.0,
            max_results=5,
        )
        assert len(hotels) > 0
        top = hotels[0]
        print(
            f"\n[find_hotels] {top['name']} | rating={top['rating']} | "
            f"reviews={top['review_count']} | price={top['price']}"
        )
        assert top["rating"] is not None and top["rating"] >= 4.0
        assert top["review_count"] is not None and top["review_count"] > 0

    def test_real_place_details_and_review_point(self, web_client: GoogleMapsWebClient) -> None:
        details = web_client.get_place_details("Melia Vinpearl Danang Riverfront")
        assert details is not None
        print(
            f"\n[get_place_details] {details['name']} | id={details['place_id']} | "
            f"rating={details['rating']} ({details['review_count']} reviews) | phone={details['phone']}"
        )
        assert details["place_id"]
        assert details["feature_id"]
        assert details["rating"] is not None
        assert details["review_count"] is not None and details["review_count"] > 0

    def test_real_compute_route_way_and_km(self, web_client: GoogleMapsWebClient) -> None:
        route = web_client.compute_route(
            "Da Nang International Airport",
            "My Khe Beach, Da Nang",
            profile="driving",
        )
        print(
            f"\n[compute_route] {route['distance_km']} km | "
            f"{route['duration_minutes']} min | {len(route['steps'])} steps"
        )
        assert route["distance_km"] is not None and route["distance_km"] > 0
        assert route["duration_seconds"] is not None and route["duration_seconds"] > 0
        assert len(route["steps"]) > 0

    def test_real_com_ga_ba_buoi_review_point(self, web_client: GoogleMapsWebClient) -> None:
        rp = web_client.get_review_point("Cơm Gà Bà Buội Hội An", latitude=15.878, longitude=108.327)
        assert rp is not None
        print(
            f"\n[get_review_point] {rp['name']} | rating={rp['rating']} | "
            f"reviews={rp['review_count']} | url={rp['reviews_url']}"
        )
        assert rp["rating"] is not None
        assert rp["review_count"] is not None and rp["review_count"] > 0

    def test_real_autocomplete_geocode_reverse_and_matrix(self, web_client: GoogleMapsWebClient) -> None:
        suggestions = web_client.autocomplete("Cơm Gà Bà Buội", max_results=3)
        assert len(suggestions) > 0
        print(f"\n[autocomplete] {len(suggestions)} suggestions; top: {suggestions[0]['name']}")

        geo = web_client.geocode("Hoi An Ancient Town")
        assert geo is not None and geo["latitude"] is not None
        print(f"[geocode] {geo['name']} -> ({geo['latitude']}, {geo['longitude']})")

        rev = web_client.reverse_geocode(15.878, 108.327)
        assert rev is not None and rev["formatted_address"]
        print(f"[reverse_geocode] (15.878, 108.327) -> {rev['formatted_address']}")

        matrix = web_client.compute_route_matrix(
            ["Da Nang International Airport"],
            ["My Khe Beach, Da Nang", "Hoi An Ancient Town"],
        )
        assert len(matrix) == 2
        assert all(m["distance_km"] is not None and m["distance_km"] > 0 for m in matrix)
        print(f"[route_matrix] {matrix}")

    def test_real_reviews_extraction_no_playwright(self, web_client: GoogleMapsWebClient) -> None:
        details = web_client.get_place_details("Cơm Gà Bà Buội Hội An", latitude=15.878, longitude=108.327)
        assert details is not None and details["feature_id"]

        guest_res = web_client.get_reviews(details["feature_id"])
        assert guest_res["mode"] == "guest"
        assert guest_res["count"] > 0
        reviews = guest_res["reviews"]
        for r in reviews:
            print(f"\n[review:guest] {r['author']} ({r['rating']}★, {r['relative_time']}, photos={len(r['photos'])}): {(r['text'] or '')[:80]}")
        assert reviews[0]["author"]
        assert reviews[0]["rating"] is not None
        assert reviews[0]["text"]

        # Authenticated mode with cookie string auto-selects authenticated mode
        auth_res = web_client.get_reviews(details["feature_id"], cookies="NID=test_cookie", max_pages=1)
        assert auth_res["mode"] == "authenticated"
        assert auth_res["count"] > 0
