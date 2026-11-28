# 🔌 API Design Guide & Two-Stage Consensus Endpoints
## Dự án: TripMate AI — Intelligent Group Activity & Travel Planning Platform

> Tài liệu chuẩn hóa thiết kế RESTful API và WebSocket cho dự án TripMate AI, bao gồm đầy đủ các endpoint phục vụ **Quy trình đồng thuận 2 giai đoạn (Two-Stage Consensus)**, bình chọn điểm dừng chi tiết (Granular Stop Voting), đổi địa điểm 1 click (1-Click Swap), lịch trình động (Living Itinerary) và ping kiểm tra sức khỏe hệ thống.

---

## 📐 1. Nguyên Tắc Thiết Kế RESTful

1. **Resource là danh từ số nhiều**: Sử dụng `/events`, `/plans`, `/stops`, `/votes`.
2. **Phiên bản hóa (Versioning)**: Mọi endpoint đều có prefix `/api/v1/...`
3. **HTTP Method thể hiện rõ ngữ nghĩa**:
   - `GET`: Đọc dữ liệu (Idempotent).
   - `POST`: Tạo mới tài nguyên hoặc kích hoạt hành động nghiệp vụ (Action Trigger).
   - `PATCH`: Cập nhật một phần dữ liệu (ví dụ: đổi 1 điểm dừng khi trời mưa).
   - `DELETE`: Xóa tài nguyên.
4. **Phản hồi chuẩn hóa (Consistent Response Envelope)**:
   ```json
   {
     "success": true,
     "data": { ... },
     "message": "Thao tác thành công",
     "meta": { "timestamp": "2026-09-22T14:00:00Z" }
   }
   ```
5. **Mã lỗi HTTP chuẩn**:
   - `200 OK`, `201 Created`, `204 No Content`
   - `400 Bad Request` (Dữ liệu không hợp lệ)
   - `401 Unauthorized` (Chưa đăng nhập / Token hết hạn)
   - `403 Forbidden` (Không đủ quyền, ví dụ: Member cố bấm Lock thay vì Host)
   - `404 Not Found` (Không tìm thấy phòng / điểm dừng)
   - `422 Unprocessable Entity` (Pydantic validation failure)
   - `503 Service Unavailable` (PyBreaker ngắt mạch do API ngoài lỗi)

---

## 🗺️ 2. Danh Sách Endpoint Đầy Đủ Theo Nhóm Tính Năng

```
/api/healthz
  GET    /api/healthz                                # Keep-alive anti-sleep ping (Render Free Tier)

/api/v1/auth
  POST   /auth/register                              # Đăng ký tài khoản (email, password, full_name)
  POST   /auth/login                                 # Đăng nhập email & mật khẩu
  POST   /auth/login/google                          # Đăng nhập Google OAuth2
  POST   /auth/refresh-token                         # Xoay vòng JWT token qua httpOnly cookie
  POST   /auth/forgot-password                       # Gửi email reset password token (15 phút)
  POST   /auth/reset-password                        # Đặt lại mật khẩu mới

/api/v1/users
  GET    /users/me                                   # Thông tin profile user hiện tại
  PATCH  /users/me                                   # Cập nhật họ tên, avatar URL

/api/v1/events (Room Management)
  GET    /events                                     # Danh sách phòng của user hiện tại
  POST   /events                                     # Tạo phòng mới (name, scope: DAY_HANGOUT | VACATION, dates)
  GET    /events/{id}                                # Chi tiết phòng, danh sách thành viên, trạng thái lock
  PATCH  /events/{id}                                # Chỉnh sửa thông tin phòng (chỉ Host)
  DELETE /events/{id}                                # Xóa phòng (chỉ Host)
  POST   /events/{id}/invitations                    # Sinh link mời thành viên vào phòng
  GET    /events/{id}/members                        # Danh sách thành viên và phân quyền (Host vs Member)

/api/v1/events/{id}/chat (Group Room Chat Channel)
  GET    /events/{id}/chat                           # Lịch sử tin nhắn phòng chat chung (hỗ trợ limit, before)
  POST   /events/{id}/chat                           # Gửi tin nhắn (CHAT | AGENT_QA | AGENT_TRIGGER qua Input Filter)

/api/v1/events/{id}/plans (Plan Management, Versioning 1-to-N & Consensus - Items 2.2, 2.4, 2.5, PR #35)
  GET    /events/{id}/plans                          # Danh sách các phiên bản Plan của phòng (v1, v2, v3...)
  POST   /events/{id}/plans                          # Tạo phiên bản Plan mới (version_number, macro_roadmap)
  POST   /events/{id}/plans/generate                 # Kích hoạt sinh lịch trình qua AI (Bắt buộc qua Input Filter: Location & Date)
  POST   /events/{id}/plans/{planId}/clone-version   # Nhân bản Plan sang phiên bản mới (v1 -> v2 -> v3, không ghi đè)
  GET    /events/{id}/plans/{planId}                 # Chi tiết Plan và danh sách điểm dừng (stops)
  PATCH  /events/{id}/plans/{planId}                 # Cập nhật thông tin Plan (tiêu đề, macro_roadmap, total_budget)
  DELETE /events/{id}/plans/{planId}                 # Xóa phiên bản Plan (chỉ Host)
  PATCH  /events/{id}/plans/{planId}/status          # Chuyển trạng thái Plan (INITIAL -> VOTING -> FINALIZED -> ONGOING)
  PATCH  /events/{id}/plans/{planId}/stops           # Sắp xếp và cập nhật toàn bộ danh sách điểm dừng
  POST   /events/{id}/plans/{planId}/stops           # Thêm 1 điểm dừng mới vào Plan
  POST   /events/{id}/plans/{planId}/macro-lock      # [Consensus 1] Host bấm Khóa Roadmap Vĩ mô
  POST   /events/{id}/plans/{planId}/final-lock      # [Consensus 2] Host Chốt Kế Hoạch (tự động đóng băng v1 & clone Plan v2 FINALIZED)
  POST   /events/{id}/plans/{planId}/stops/{stopId}/vote                      # Vote chọn candidate_id trong candidate_options (Quorum >= 60% mở khóa trạm kế)
  GET    /events/{id}/plans/{planId}/votes                                    # Lấy tổng hợp phiếu bầu & comment của toàn Plan
  POST   /events/{id}/plans/{planId}/stops/{stopId}/swap                      # Multi-Option Swap: đổi phương án dự phòng (target_backup_place_ref_id hoặc cycle_next)
  POST   /events/{id}/plans/{planId}/stops/{stopId}/backup-options/fetch-more # Gợi ý thêm PA 4, 5, 6... kèm Proactive Clarification
  POST   /events/{id}/plans/{planId}/stops/{stopId}/adapt                     # Thích ứng lúc đang đi (tự động clone v2 -> v3 ONGOING nếu đang FINALIZED; SKIPPED + ADAPTED)
  GET    /events/{id}/plans/{planId}/stops/{stopId}/dishes                    # Gợi ý món ăn trong quán theo sở thích/chế độ ăn của nhóm
  GET    /events/{id}/plans/{planId}/history                                  # Xem lịch sử 4 giai đoạn: version_chain (v1->v2->v3) & 4 nhóm stops

/api/v1/places & Travel APIs (Adapter Pattern)
  GET    /places/search?category=&keyword=&lat=&lng=&open_now= # Tra cứu địa điểm qua Google Places API (New) + lọc danh mục/giờ mở cửa + Redis L2 Cache (TTL 24h)
  GET    /places/{placeId}/details                   # Chi tiết địa điểm, giờ mở cửa, hình ảnh (POIItem)
  GET    /places/hotels/compare?ids=id1,id2          # So sánh 1-5 khách sạn cạnh nhau (side-by-side) kèm 9 link OTA (TASK-206)
  GET    /places/tours/search?destination=&keyword=  # Tìm kiếm tour & điểm vui chơi kèm link Klook, TripAdvisor, 12Go Asia (TASK-206)
  GET    /weather?lat=&lng=                          # Dự báo thời tiết 3 ngày (OpenWeatherMap API)
  GET    /exchange-rate?from=USD&to=VND              # Tỷ giá ngoại tệ cho các chuyến đi ASEAN

/api/v1/export
  GET    /events/{id}/export/pdf                     # Xuất file PDF lịch trình chi tiết (WeasyPrint)
  GET    /events/{id}/export/calendar                # Xuất file lịch .ics đồng bộ Google / Apple Calendar

# LƯU Ý KIẾN TRÚC: CÁC ENDPOINT CHI PHÍ & SETTLEMENT ĐÃ ĐƯỢC XÓA BỎ HOÀN TOÀN
# Theo phản biện của GVHD: Hệ thống không tích hợp cổng thanh toán trực tuyến,
# việc lưu trữ các bảng/endpoint chia tiền (expenses, settlements) là không cần thiết và làm rối CSDL.
# Quản lý ngân sách hiện được tích hợp gọn gàng trong thuộc tính total_budget, estimated_cost và transit_cost.

/api/v1/admin
  GET    /admin/dashboard/stats                      # Thống kê CCU, số phòng hoạt động, uptime
  GET    /admin/usage/tokens                         # Thống kê lượng token DeepSeek tiêu thụ & chi phí

/ws/rooms/{roomId}
  WSS    /ws/rooms/{roomId}                          # Kênh WebSocket thời gian thực đồng bộ toàn phòng
```

---

## ⚡ 3. Chi Tiết Các Endpoint Đồng Thuận Cốt Lõi (Two-Stage Consensus APIs)

### 3.1. `POST /api/v1/events/{id}/plans/{planId}/macro-lock` (Chốt Consensus 1)
- **Mô tả**: Host xác nhận khóa khung lộ trình vĩ mô sau khi cả nhóm đã thảo luận thống nhất.
- **Quyền hạn (Auth)**: `Bearer JWT` (Bắt buộc Role `HOST`).
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "event_id": "evt_da_nang_2026",
      "macro_locked": true,
      "locked_at": "2026-09-22T14:30:00Z",
      "roadmap_themes": [
        { "day": 1, "theme": "Khám phá bán đảo Sơn Trà & Biển Mỹ Khê" },
        { "day": 2, "theme": "Trải nghiệm Bà Nà Hills trọn ngày" },
        { "day": 3, "theme": "Phố cổ Hội An & Ẩm thực đêm" }
      ]
    },
    "message": "Đã khóa lộ trình vĩ mô thành công. Hệ thống bắt đầu tuyển chọn địa điểm chi tiết."
  }
  ```

---

### 3.2. `POST /api/v1/events/{id}/plans/{planId}/stops/{stopId}/vote` (Bình chọn Ứng viên Điểm dừng & Mở khóa Tuần tự)
- **Mô tả**: Thành viên bỏ phiếu cho một ứng viên cụ thể trong danh sách `candidate_options` hiển thị đồng thời tại trạm. Khi 1 ứng viên đạt Quorum ($\ge 60\%-70\%$), hệ thống chốt trạm và tự động mở khóa trạm kế tiếp (`next_unlocked_stop_id`).
- **Quyền hạn (Auth)**: `Bearer JWT` (Role `HOST` hoặc `MEMBER`).
- **Request Body (JSON)**:
  ```json
  {
    "candidate_id": "cand_hotel_001",
    "comment": "Khách sạn phong cách Indochine đẹp và tiện đi lại"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "stop_id": "stop_hotel_001",
      "selected_candidate_id": "cand_hotel_001",
      "quorum_reached": true,
      "stop_status": "SELECTED_AFTER_VOTE",
      "next_unlocked_stop_id": "stop_food_002",
      "candidates": [
        {
          "candidate_id": "cand_hotel_001",
          "place_name": "Anio Boutique Hotel Hội An",
          "votes_count": 2,
          "voters": ["Lan Vy", "Minh Đức"]
        },
        {
          "candidate_id": "cand_hotel_002",
          "place_name": "La Siesta Hoi An Resort & Spa",
          "votes_count": 1,
          "voters": ["Hoàng Anh"]
        },
        {
          "candidate_id": "cand_hotel_003",
          "place_name": "Allegro Hoi An Little Luxury Hotel",
          "votes_count": 0,
          "voters": []
        }
      ]
    }
  }
  ```

---

### 3.3. `POST /api/v1/events/{id}/plans/{planId}/stops/{stopId}/swap` (Luân Chuyển Đa Phương Án / Multi-Option Swap)
- **Mô tả**: Thay thế điểm dừng hiện tại bằng một phương án cụ thể trong danh sách ứng viên (`backup_options`), cho phép luân chuyển sang Phương án 2, Phương án 3,... mà không bị giới hạn chỉ swap 1 lần.
- **Quyền hạn (Auth)**: `Bearer JWT` (Role `HOST` hoặc `MEMBER`).
- **Request Body (JSON)**:
  ```json
  {
    "target_backup_place_ref_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
    "cycle_next": false,
    "change_reason": "Nhóm muốn đổi sang quán yên tĩnh hơn"
  }
  ```
  *(Truyền `target_backup_place_ref_id` để chọn chính xác Phương án 2 hoặc 3; hoặc truyền `"cycle_next": true` để tự động chuyển sang phương án kế tiếp trong danh sách).*
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "previous_stop_id": "stop_cafe_001",
      "new_stop_id": "stop_cafe_002",
      "new_place_name": "The Espresso Station",
      "selected_option_index": 2,
      "category": "CAFE",
      "lat": 16.0682,
      "lng": 108.2235,
      "stop_status": "SELECTED_AFTER_VOTE",
      "replaced_by_stop_id": "stop_cafe_002",
      "updated_at": "2026-09-22T14:32:10Z"
    },
    "message": "Đã đổi sang Phương án 2 thành công. Điểm cũ được lưu vết REJECTED_IN_VOTE mà không bị xóa mất."
  }
  ```

---

### 3.3.1. `POST /api/v1/events/{id}/plans/{planId}/stops/{stopId}/backup-options/fetch-more` (Gợi Ý Thêm Phương Án Mới Kèm Hỏi Lại / Clarification)
- **Mô tả**: Khi nhóm đã xem qua cả Phương án 2 và Phương án 3 nhưng vẫn chưa ưng ý, endpoint này kích hoạt AI Agent truy vấn lại live API (Google Places, TripAdvisor) để lấy thêm $3$--$5$ ứng viên mới (Phương án 4, 5, 6...) bổ sung vào danh sách `backup_options`.
- **Cơ chế Hỏi Lại & Đảm Bảo Ràng Buộc**:
  - Request body nhận yêu cầu/lý do làm rõ từ nhóm (`clarification_notes`, `dietary_filter`, `exclude_place_ref_ids`). Nếu không truyền, Agent trả về `needs_clarification: true` kèm `clarification_question` và gửi tin nhắn hỏi lại vào group chat.
  - **100% ứng viên mới bắt buộc phải tuân thủ nghiêm ngặt các ràng buộc cốt lõi**: Bán kính Haversine $\le 2.5$\,km, trần ngân sách phân bổ, giờ mở cửa thực tế và an toàn dị ứng thực phẩm của nhóm.
- **Request Body (JSON)**:
  ```json
  {
    "clarification_notes": "Nhóm muốn đổi sang quán nướng hoặc lẩu, không gian yên tĩnh để trò chuyện",
    "dietary_filter": "NON_SPICY",
    "exclude_place_ref_ids": ["ChIJ_PA1", "ChIJ_PA2", "ChIJ_PA3"]
  }
  ```
- **Response `200 OK`**: Trả về `FetchMoreBackupsResponse` gồm `stop_id`, danh sách `backup_options` mở rộng, `needs_clarification`, và `clarification_question`.

---

### 3.4. `POST /api/v1/events/{id}/plans/{planId}/stops/{stopId}/adapt` (Thích Ứng Lịch Trình Động Lúc Đang Đi - Non-destructive)
- **Mô tả**: Thích ứng linh hoạt khi xảy ra sự cố thực tế (ví dụ: trời mưa lớn, quán đóng cửa đột xuất). Nếu phiên bản `Plan` hiện tại đang ở `FINALIZED` (`v2`), hệ thống **tự động clone sang `Plan v3 (ONGOING, parent_plan_id=v2)`** (giữ nguyên `v2` bất biến); sau đó chuyển điểm cũ trên `v3` sang `SKIPPED_ON_TRIP` (kèm `change_reason`) và chèn điểm dừng trong nhà mới với `ADAPTED_ON_TRIP`, liên kết qua `replaced_by_stop_id`.
- **Request Body (JSON)**:
  ```json
  {
    "new_place_name": "Artisan Indoor Boardgame Cafe",
    "new_place_ref_id": "ChIJsW8gV3SuEmsReD345g83frY4",
    "change_reason": "Trời mưa lớn ngoài trời, đổi sang quán boardgame cafe trong nhà"
  }
  ```
- **Response `200 OK`**: Trả về `StopAdaptationResponse` (`previous_stop_id`, `new_stop_id`, `stop_status`, `replaced_by_stop_id`, `cloned_plan_id`) và phát sóng tức thì tới toàn phòng qua WebSockets.

---

### 3.5. `POST /api/v1/events/{id}/plans/{planId}/clone-version` & `GET/POST /api/v1/events/{id}/chat` (Plan Versioning & Group Chat Channel)

#### 3.5.1. `POST /api/v1/events/{id}/plans/{planId}/clone-version` (Nhân bản Phiên bản Plan Không Ghi Đè)
- **Mô tả**: Tạo phiên bản `Plan` mới (`version_number + 1`, `parent_plan_id = planId`, đóng băng bản cũ `is_active = false`), đồng thời **deep-copy (`INSERT` mới)** các `PlanStop` hợp lệ (bỏ qua các stop `REJECTED_IN_VOTE`).
- **Quy tắc Auto-Clone tích hợp**:
  - `POST .../plans/{planId}/final-lock` tự động đóng băng `v1` và clone sang **`Plan v2 (FINALIZED)`**.
  - `POST .../plans/{planId}/stops/{stopId}/adapt` tự động clone `v2` $\rightarrow$ **`Plan v3 (ONGOING)`** nếu bản nguồn đang là `FINALIZED`.
- **Request Body (JSON)**:
  ```json
  {
    "target_status": "FINALIZED",
    "change_summary": "Chốt lịch trình chính thức sau khi cả nhóm bình chọn xong",
    "title": "Đà Nẵng 3N2Đ — Bản Chính Thức (v2)"
  }
  ```
- **Response `200 OK`**: Trả về `PlanResponse` của phiên bản mới (`version_number`, `parent_plan_id`, `is_active: true`, `stops`).

#### 3.5.2. `GET` & `POST /api/v1/events/{id}/chat` (Kênh Chat Chung Của Phòng - Group Channel)
- **Mô tả**: Đọc phân trang lịch sử tin nhắn chung (`limit`, `before`) và gửi tin nhắn mới phân loại theo `message_type` (`CHAT` không gọi AI, `AGENT_QA` hỏi đáp & gợi ý món ăn, `AGENT_TRIGGER` kích hoạt lập lịch qua Input Filter).
- **Request Body `POST` (JSON)**:
  ```json
  {
    "content": "@TripMate quán Bếp Cuốn có món gì cho người ăn chay không?",
    "role": "USER",
    "message_type": "AGENT_QA",
    "metadata": { "target_stop_id": "stop_food_002" }
  }
  ```
- **Response `GET` `200 OK` (`ChatMessageListResponse`)**:
  ```json
  {
    "messages": [
      {
        "id": "msg_001",
        "event_id": "evt_da_nang_2026",
        "user_id": "usr_001",
        "role": "USER",
        "message_type": "AGENT_QA",
        "content": "@TripMate quán Bếp Cuốn có món gì cho người ăn chay không?",
        "metadata": { "target_stop_id": "stop_food_002" },
        "created_at": "2026-09-22T14:20:00Z"
      }
    ],
    "total": 1,
    "has_more": false
  }
  ```

---

### 3.6. `GET /api/v1/places/search` & `GET /api/v1/places/{placeId}/details` (Places Service & PyBreaker - TASK-108 & TASK-205)
- **Mô tả**: Tra cứu địa điểm và lấy thông tin chi tiết POI qua Google Places API (New) được bảo vệ bởi Circuit Breaker `PyBreaker` (`fail_max=3`, `reset_timeout=60s`, `timeout=2.5s`) và Redis L2 Cache 24 giờ. Hỗ trợ chuẩn hóa `category` sang `StopCategory`/`includedType`, lọc theo cờ `open_now`, và làm giàu `metadata` (`stop_category`, `weekday_hours`, `types`).
- **Query Params (`/places/search`)**: `keyword` (string), `category` (string, hỗ trợ `StopCategory` như `CAFE`, `RESTAURANT`, `HOTEL` hoặc Google `includedType`), `lat` (float), `lng` (float), `radius` (int, default 5000m), `open_now` (bool, optional — lọc địa điểm đang mở/đóng cửa).
- **Response `200 OK` (`PlaceSearchResponse`)**:
  ```json
  {
    "results": [
      {
        "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
        "name": "Pho Thin Bo Ho",
        "address": "61 Dinh Tien Hoang, Hoan Kiem, Ha Noi",
        "lat": 21.0285,
        "lng": 105.8542,
        "category": "restaurant",
        "rating": 4.5,
        "user_ratings_total": 1200,
        "price_level": 2,
        "open_now": true,
        "photo_url": "places/ChIJN1t_tDeuEmsRUsoyG83frY4/photos/photo1",
        "website_uri": "https://example.com",
        "phone_number": "+84 24 3825 1234",
        "metadata": {
          "raw_primary_type": "vietnamese_restaurant",
          "stop_category": "RESTAURANT",
          "weekday_hours": ["Monday: 6:00 AM – 9:00 PM"],
          "types": ["vietnamese_restaurant", "restaurant", "food"]
        }
      }
    ],
    "total": 1,
    "provider": "google_places"
  }
  ```
- **Response `200 OK` (`PlaceDetailResponse`)**:
  ```json
  {
    "place": {
      "place_id": "ChIJ_detail_1",
      "name": "Hanoi Opera House",
      "address": "1 Trang Tien, Hoan Kiem, Ha Noi",
      "lat": 21.0245,
      "lng": 105.8576,
      "category": "tourist_attraction",
      "rating": 4.6,
      "user_ratings_total": 5400,
      "price_level": null,
      "open_now": null,
      "photo_url": null,
      "website_uri": "http://nhahatlonhanoi.org.vn",
      "phone_number": "+84 24 3933 0113",
      "metadata": { "raw_primary_type": "opera_house" }
    },
    "provider": "google_places"
  }
  ```
- **Lỗi `503 Service Unavailable` (Circuit Breaker Tripped)**:
  - Trả về khi PyBreaker phát hiện 3 lần lỗi liên tiếp hoặc thời gian phản hồi upstream vượt quá 2.5s:
  ```json
  {
    "detail": "External Places provider temporarily unavailable: Circuit breaker is open"
  }
  ```

---

### 3.7. `PATCH /api/v1/events/{id}/plans/{planId}` (Cập nhật thông tin Plan & Macro Roadmap)
- **Mô tả**: Cho phép chỉnh sửa thông tin Plan (tiêu đề, tổng ngân sách, và danh sách chủ đề từng ngày `macro_roadmap` chỉnh sửa bằng tay trên UI hoặc qua chat AI ở Pha 1).
- **Quyền hạn (Auth)**: `Bearer JWT` (Role `HOST` hoặc `MEMBER`).
- **Request Body (JSON)**:
  ```json
  {
    "title": "Lịch trình Đà Nẵng 3N2Đ - Bản cập nhật",
    "macro_roadmap": [
      { "day": 1, "theme": "Khám phá trung tâm phố hoa & ngắm hoàng hôn biển Mỹ Khê" },
      { "day": 2, "theme": "Khám phá Bán đảo Sơn Trà & lặn ngắm san hô Thọ Quang" },
      { "day": 3, "theme": "Phố cổ Hội An & Thưởng thức ẩm thực đêm" }
    ]
  }
  ```
- **Response `200 OK`**: Trả về `PlanResponse` chứa `macro_roadmap` mới đã được lưu vào PostgreSQL.

---

### 3.8. `GET /api/v1/events/{id}/plans/{planId}/history` (Xem Lịch Sử 4 Giai Đoạn - Item 2.5)
- **Mô tả**: Trả về đối tượng `PlanStageHistoryResponse` tổng hợp toàn bộ các điểm dừng được phân loại theo 4 giai đoạn vòng đời (`initial_stops`, `finalized_stops`, `ongoing_stops`, `rejected_or_skipped_stops`), cho phép UI hiển thị tab so sánh mà không mất dấu dữ liệu lịch sử.
- **Quyền hạn (Auth)**: `Bearer JWT`.
- **Response `200 OK` (`PlanStageHistoryResponse`)**:
  ```json
  {
    "plan_id": "plan_001",
    "event_id": "evt_001",
    "version_number": 1,
    "current_status": "ONGOING",
    "initial_stops": [],
    "finalized_stops": [],
    "ongoing_stops": [],
    "rejected_or_skipped_stops": [
      {
        "id": "stop_002",
        "place_name": "Quán Bún Bò Huế Cũ",
        "stop_status": "REJECTED_IN_VOTE",
        "replaced_by_stop_id": "stop_005",
        "change_reason": "Bị vote DOWN 3 phiếu"
      }
    ]
  }
  ```

---

### 3.9. `GET /api/v1/places/hotels/compare` & `GET /api/v1/places/tours/search` (Multi-OTA Lodging & Tours - TASK-206)
- **Mô tả**:
  - `GET /places/hotels/compare?ids=h1,h2&checkin=YYYY-MM-DD&checkout=YYYY-MM-DD&guests=2`: So sánh `1`–`5` khách sạn cạnh nhau (`HotelCompareResponse`), trả về giá ước tính VND, tiện nghi (`amenities`) và deep-link đặt phòng trên 9 OTA (`agoda`, `booking_com`, `airbnb`, `trip_com`, `hotels_com`, `expedia`, `trivago`, `google_hotels`, `tripadvisor`). Trả về `400` nếu `ids` rỗng hoặc `> 5` IDs; trả về `503` nếu circuit breaker mở.
  - `GET /places/tours/search?destination=&keyword=&lat=&lng=`: Tìm kiếm tour/điểm tham quan (`TourSearchResponse`) kèm giá vé ước tính VND và deep-link trên `klook`, `tripadvisor`, `12go_asia`.
- **Response `200 OK` (`HotelCompareResponse`)**:
  ```json
  {
    "hotels": [
      {
        "place": {
          "place_id": "h1",
          "name": "Hotel Alpha",
          "rating": 4.5,
          "price_level": 2
        },
        "estimated_nightly_vnd": "850000",
        "currency": "VND",
        "amenities": ["Free Wi-Fi", "Breakfast Included", "Air Conditioning", "Airport Shuttle"],
        "provider_links": [
          {
            "provider": "agoda",
            "display_name": "Agoda",
            "booking_url": "https://www.agoda.com/search?text=Hotel+Alpha&adults=2&checkin=2026-12-20&checkout=2026-12-22",
            "estimated_price_vnd": "816000",
            "currency": "VND",
            "is_live_price": false
          }
        ]
      }
    ],
    "total": 1
  }
  ```

---

## 📡 4. Giao Thức WebSocket Thời Gian Thực (`/ws/rooms/{roomId}`)

- **Endpoint**: `wss://api.tripmate.ai/ws/rooms/{roomId}?token={jwt_token}`
- **Payload Client gửi lên (User Action)**:
  ```json
  {
    "action": "STOP_VOTE",
    "payload": {
      "stop_id": "stop_cafe_001",
      "vote": "UP"
    },
    "trace_id": "0af7651916cd43dd8448eb211c80319c"
  }
  ```
- **Phản hồi tức thì từ Gateway (<80ms ACK)**:
  ```json
  {
    "event": "ACK",
    "action": "STOP_VOTE",
    "status": "ACCEPTED",
    "timestamp": 1727010720000
  }
  ```
- **Phát sóng cập nhật từ Redis Pub/Sub (`plan:updated`)**:
  ```json
  {
    "event": "PLAN_STOP_UPDATED",
    "roomId": "evt_da_nang_2026",
    "updated_stop": {
      "id": "stop_cafe_001",
      "place_name": "The Espresso Station",
      "up_votes": 4,
      "down_votes": 0
    }
  }
  ```


### 3.10. `GET /api/v1/weather` (Weather & Rain Alert Service - TASK-207)
- **Endpoint**: `GET /api/v1/weather`
- **Query Parameters**:
  - `lat` (float, required, `-90.0` to `90.0`)
  - `lng` (float, required, `-180.0` to `180.0`)
  - `days` (int, optional, default `3`, `1` to `7`)
- **Behavior**:
  - Zero-cost 3-tier adapter: Tier 1 optional `custom_weather_fn` scraper hook (falls back on error), Tier 2 OpenWeatherMap 2.5 Forecast (when `OPENWEATHER_API_KEY` is configured), Tier 3 Open-Meteo Public API (free keyless live meteorological data default).
  - Normalizes coordinates to 2 decimal places (`~1.1 km`) and caches responses for **3 hours (`10800s`)** in Upstash Redis (`weather_forecast` prefix).
  - Protected by isolated `weather_circuit_breaker` (`PyBreaker`); returns `503 Service Unavailable` when upstream fails or circuit is open.
- **Response `200 OK` (sample)**:
  ```json
  {
    "lat": 16.05,
    "lng": 108.2,
    "timezone": "Asia/Ho_Chi_Minh",
    "provider": "open_meteo",
    "current": {
      "temperature_c": 27.0,
      "feels_like_c": 29.5,
      "humidity_percent": 82,
      "wind_speed_kmh": 14.2,
      "precipitation_mm": 3.5,
      "condition": "Rain",
      "description": "Rain showers",
      "weather_code": 63,
      "is_raining": true
    },
    "daily_forecast": [
      {
        "date": "2026-11-19",
        "temp_min_c": 24.0,
        "temp_max_c": 29.5,
        "precipitation_mm": 8.0,
        "rain_probability_percent": 75,
        "condition": "Rain",
        "description": "Rain showers",
        "is_rainy_day": true
      }
    ],
    "alert": {
      "rain_alert": true,
      "severity": "HIGH",
      "suggest_indoor_swap": true,
      "advisory_message": "Heavy rain or storm expected (rain chance 75%). Strongly recommend swapping outdoor stops to indoor backup options."
    },
    "is_live_data": true
  }
  ```
- **Error Responses**:
  - `422 Unprocessable Entity`: Invalid `lat`, `lng`, or `days` query parameter.
  - `503 Service Unavailable`: `Weather provider temporarily unavailable: ...` (circuit breaker open or upstream timeout/HTTP error).


### 3.11. `GET /api/v1/exchange-rate` (ASEAN Currency Converter & 12h Redis Cache - TASK-208)
- **Endpoint**: `GET /api/v1/exchange-rate`
- **Query Parameters**:
  - `base` (string, optional, default `"VND"`, 3-letter ISO-4217 code matching `^[A-Za-z]{3}$`)
  - `target` (string, optional, 3-letter ISO-4217 code matching `^[A-Za-z]{3}$`)
  - `amount` (float, optional, `> 0`, positive amount in `base` currency to convert into `target`)
  - `include_all` (bool, optional, default `false`; when `target` is omitted, returns all global currencies instead of curated ASEAN + `USD`)
- **Behavior**:
  - Zero-cost 3-tier adapter: Tier 1 optional `custom_rates_fn` scraper hook (falls back on error), Tier 2 ExchangeRate-API v6 (`v6.exchangerate-api.com/v6/{key}/latest/{base}`, when `EXCHANGE_RATE_API_KEY` is configured), Tier 3 Open ExchangeRate-API (`open.er-api.com/v6/latest/{base}`, free keyless live forex rates covering all 10 ASEAN currencies: `VND`, `THB`, `SGD`, `MYR`, `IDR`, `PHP`, `KHR`, `LAK`, `MMK`, `BND`, plus `USD`).
  - Caches base-currency rate tables for **12 hours (`43200s`)** in Upstash Redis (`exchange_rates` prefix), allowing different `target`/`amount` queries for the same `base` to share one cache key.
  - Uses `decimal.Decimal` (`ROUND_HALF_UP`) for `converted_amount` and is protected by isolated `currency_circuit_breaker` (`PyBreaker`).
- **Response `200 OK` (sample with conversion)**:
  ```json
  {
    "base_currency": "VND",
    "provider": "open_er_api",
    "updated_at": "Fri, 20 Nov 2026 00:02:31 +0000",
    "rates": {
      "THB": 0.00135
    },
    "conversion": {
      "from_currency": "VND",
      "to_currency": "THB",
      "amount": 1000000.0,
      "rate": 0.00135,
      "converted_amount": 1350.0
    },
    "asean_only": true,
    "is_live_data": true
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Unsupported currency code (e.g., `ZZZ` not returned by provider).
  - `422 Unprocessable Entity`: Invalid 3-letter ISO currency code format or non-positive `amount <= 0`.
  - `503 Service Unavailable`: `Currency provider temporarily unavailable: ...` (circuit breaker open or upstream timeout/HTTP error).
