# GG_Place (`gmaps`) — Free Google Maps & Places Python Module

Module Python thuần HTTP (`curl_cffi`), **không cần API key**, **không dùng Playwright**, hỗ trợ đầy đủ tìm kiếm địa điểm, tìm quanh bán kính `x` km, khách sạn, điểm đánh giá, lấy review (chế độ khách & chế độ có cookie), chỉ đường giao thông real-time, ma trận khoảng cách, autocomplete và geocode.

---

## 1. Cách ném folder `GG_Place` vào project khác

### Cách 1 (Khuyên dùng): Cài dạng editable package vào `.venv` của project mới
Copy folder `GG_Place` vào trong project của bạn (ví dụ `my_project/GG_Place`), kích hoạt `.venv` của project mới rồi chạy:

```powershell
# Trên Windows PowerShell nếu bị chặn script:
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned ; & .\.venv\Scripts\Activate.ps1

# Cài module GG_Place (chỉ cần curl_cffi)
pip install -e ./GG_Place
```

Sau đó ở bất kỳ file nào trong project bạn chỉ cần import:
```python
from gmaps import GoogleMapsWebClient
```

### Cách 2: Import trực tiếp như subfolder (không cần `pip install -e`)
Chỉ cần cài `curl_cffi` trong môi trường của project (`pip install curl_cffi`), để folder `GG_Place` cạnh code của bạn và import thẳng:

```python
from GG_Place.gmaps import GoogleMapsWebClient
```

*(Hoặc nếu dùng `sys.path`:)*
```python
import sys
sys.path.append("/path/to/GG_Place")
from gmaps import GoogleMapsWebClient
```

---

## 2. Hướng dẫn sử dụng nhanh

```python
from gmaps import GoogleMapsWebClient

client = GoogleMapsWebClient(hl="vi", gl="vn")

# 1. Tìm kiếm địa điểm bất kỳ
places = client.search_places("quán cafe", latitude=21.0285, longitude=105.8542, radius_km=3.0)

# 2. Tìm địa điểm trong bán kính x km (sắp xếp theo khoảng cách gần nhất)
nearby = client.search_nearby(21.0285, 105.8542, radius_km=2.0, place_type="nhà hàng")

# 3. Tìm khách sạn (có rating, số review, giá, sao, tiện ích)
hotels = client.find_hotels("khách sạn Đà Nẵng", latitude=16.0544, longitude=108.2022, min_rating=4.5)

# 4. Lấy chi tiết địa điểm & điểm review
details = client.get_place_details("Cơm Gà Bà Buội Hội An", latitude=15.878, longitude=108.327)
review_point = client.get_review_point("Cơm Gà Bà Buội Hội An", latitude=15.878, longitude=108.327)

# 5. Lấy review:
# - Không cookie (guest mode: tối đa 5 review nổi bật)
guest_reviews = client.get_reviews(details["feature_id"])
# - Có cookie Google đã đăng nhập (authenticated mode: phân trang lấy toàn bộ review)
all_reviews = client.get_reviews(
    details["feature_id"],
    cookies="SID=...; HSID=...; SSID=...; APISID=...; SAPISID=...",
    sort_by="newest",   # "relevant" | "newest" | "highest" | "lowest"
    max_pages=20,
)

# 6. Chỉ đường real-time giống Google Maps (có kẹt xe, tuyến thay thế, từng bước rẽ)
route = client.compute_route("99 Võ Chí Công, Hà Nội", "Nhà sách Tiến Thọ, Đường Láng, Hà Nội")
print(route["summary"], route["distance_text"], route["duration_text"], route["alternatives"])
for step in route["steps"]:
    print(step["instruction"], step["distance_text"], step["duration_text"], step["notes"])

# 7. Ma trận khoảng cách (km & phút)
matrix = client.compute_route_matrix(
    ["Sân bay Nội Bài"],
    ["Hồ Hoàn Kiếm, Hà Nội", "99 Võ Chí Công, Hà Nội"],
)

# 8. Autocomplete, Geocode, Reverse Geocode
suggestions = client.autocomplete("Cơm Gà Bà Buội")
geo = client.geocode("Phố Cổ Hội An")
rev = client.reverse_geocode(15.878, 108.327)
```

---

## 3. Cấu trúc module

- [`gmaps/__init__.py`](file:///D:/LT/GG_Place/gmaps/__init__.py) — Export public API (`GoogleMapsWebClient`, `Place`, `Review`, `RouteSummary`, `RouteStep`, ...)
- [`gmaps/client.py`](file:///D:/LT/GG_Place/gmaps/client.py) — `GoogleMapsWebClient` facade
- [`gmaps/http_client.py`](file:///D:/LT/GG_Place/gmaps/http_client.py) — `HttpTransport` (`curl_cffi`), `haversine_km`, `strip_xssi`
- [`gmaps/models.py`](file:///D:/LT/GG_Place/gmaps/models.py) — Dataclasses chuẩn hóa dữ liệu
- [`gmaps/places.py`](file:///D:/LT/GG_Place/gmaps/places.py) — `PlacesService`
- [`gmaps/reviews.py`](file:///D:/LT/GG_Place/gmaps/reviews.py) — `ReviewsService` (guest & authenticated modes)
- [`gmaps/routes.py`](file:///D:/LT/GG_Place/gmaps/routes.py) — `RoutesService` (Google Maps real-time directions & OSRM matrix)
- [`gmaps/exceptions.py`](file:///D:/LT/GG_Place/gmaps/exceptions.py) — `GoogleMapsError`, `GoogleMapsBlockedError`
- [`pyproject.toml`](file:///D:/LT/GG_Place/pyproject.toml) & [`requirements.txt`](file:///D:/LT/GG_Place/requirements.txt) — Cấu hình cài đặt package

---

## 4. Chạy test thực tế

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned ; & d:\LT\GG_Place\.venv\Scripts\Activate.ps1
pytest test.py -v -s
```
