# 🔌 API Design Guide & Two-Stage Consensus Endpoints
## Dự án: TripMate AI — Intelligent Group Activity & Travel Planning Platform

> Tài liệu chuẩn hóa thiết kế RESTful API và WebSocket cho dự án TripMate AI, bao gồm đầy đủ các endpoint phục vụ **Quy trình đồng thuận 2 giai đoạn (Two-Stage Consensus)**, bình chọn điểm dừng chi tiết (Granular Stop Voting), đổi địa điểm 1 click (1-Click Swap), lịch trình động (Living Itinerary) và ping kiểm tra sức khỏe hệ thống.

---

## 📐 1. Nguyên Tắc Thiết Kế RESTful

1. **Resource là danh từ số nhiều**: Sử dụng `/events`, `/plans`, `/stops`, `/expenses`.
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

/api/v1/events/{id}/consensus (Two-Stage Consensus Engine)
  GET    /events/{id}/chat                           # Lịch sử tin nhắn phòng chat (Bước 1)
  POST   /events/{id}/chat                           # Gửi tin nhắn mong muốn / yêu cầu điều chỉnh
  POST   /events/{id}/ai/macro-plan                  # Kích hoạt Pha 1 LangGraph soạn thảo Roadmap vĩ mô
  POST   /events/{id}/macro-lock                     # [Consensus 1] Host bấm Khóa Roadmap Vĩ mô
  POST   /events/{id}/ai/micro-curation              # Kích hoạt Pha 2 LangGraph tuyển chọn địa điểm & gom cụm
  POST   /events/{id}/stops/{stopId}/vote            # Thành viên vote UP / DOWN cho từng điểm dừng
  POST   /events/{id}/stops/{stopId}/swap            # 1-Click Swap: Đổi điểm dừng sang phương án dự phòng
  POST   /events/{id}/final-lock                     # [Consensus 2] Host Chốt Kế Hoạch Chính Thức
  PATCH  /events/{id}/stops/{stopId}                 # Living Itinerary: Cập nhật duy nhất 1 điểm dừng khi trời mưa

/api/v1/places & Travel APIs
  GET    /places/search?category=&keyword=&lat=&lng= # Tra cứu địa điểm qua Google Places + Redis Cache
  GET    /places/{placeId}/details                   # Chi tiết địa điểm, giờ mở cửa, hình ảnh
  GET    /weather?lat=&lng=                          # Dự báo thời tiết 3 ngày (OpenWeatherMap)
  GET    /exchange-rate?from=USD&to=VND              # Tỷ giá ngoại tệ

/api/v1/export
  GET    /events/{id}/export/pdf                     # Xuất file PDF lịch trình chi tiết (WeasyPrint)
  GET    /events/{id}/export/calendar                # Xuất file lịch .ics đồng bộ Google / Apple Calendar

/api/v1/events/{id}/finance (Quản lý chi phí & Settlement)
  POST   /events/{id}/fund-contributions             # Thu quỹ trước chuyến đi (Expense ADVANCE)
  GET    /events/{id}/expenses                       # Danh sách các khoản chi tiêu thực tế
  POST   /events/{id}/expenses                       # Thêm khoản chi tiêu mới kèm phân bổ split
  GET    /events/{id}/balances                       # Số dư ròng (Net Balance) của từng thành viên
  GET    /events/{id}/settlements                    # Gợi ý chuyển khoản bù trừ nợ tối ưu (Min-Cash-Flow)
  PATCH  /events/{id}/settlements/{settlementId}     # Đánh dấu đã chuyển khoản thành công

/api/v1/admin
  GET    /admin/dashboard/stats                      # Thống kê CCU, số phòng hoạt động, uptime
  GET    /admin/usage/tokens                         # Thống kê lượng token DeepSeek tiêu thụ & chi phí

/ws/rooms/{roomId}
  WSS    /ws/rooms/{roomId}                          # Kênh WebSocket thời gian thực đồng bộ toàn phòng
```

---

## ⚡ 3. Chi Tiết Các Endpoint Đồng Thuận Cốt Lõi (Two-Stage Consensus APIs)

### 3.1. `POST /api/v1/events/{id}/macro-lock` (Chốt Consensus 1)
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

### 3.2. `POST /api/v1/events/{id}/stops/{stopId}/vote` (Bình chọn Điểm dừng)
- **Mô tả**: Thành viên vote UP hoặc DOWN cho một điểm dừng cụ thể.
- **Quyền hạn (Auth)**: `Bearer JWT` (Role `HOST` hoặc `MEMBER`).
- **Request Body (JSON)**:
  ```json
  {
    "vote_value": "DOWN",
    "comment": "Quán này đông và ồn quá, muốn đổi quán yên tĩnh hơn"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "stop_id": "stop_cafe_001",
      "up_votes": 2,
      "down_votes": 3,
      "recommend_swap": true,
      "backup_options": [
        {
          "place_name": "The Espresso Station",
          "place_ref_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
          "category": "CAFE",
          "estimated_cost": 45000,
          "distance_km": 0.4
        }
      ]
    }
  }
  ```

---

### 3.3. `POST /api/v1/events/{id}/stops/{stopId}/swap` (1-Click Swap Dự Phòng)
- **Mô tả**: Thay thế điểm dừng hiện tại bằng phương án dự phòng đã được xác thực sẵn.
- **Quyền hạn (Auth)**: `Bearer JWT` (Role `HOST` hoặc `MEMBER`).
- **Request Body (JSON)**:
  ```json
  {
    "target_backup_place_ref_id": "ChIJN1t_tDeuEmsRUsoyG83frY4"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "swapped_stop_id": "stop_cafe_001",
      "new_place_name": "The Espresso Station",
      "category": "CAFE",
      "lat": 16.0682,
      "lng": 108.2235,
      "updated_at": "2026-09-22T14:32:10Z"
    },
    "message": "Đã đổi sang địa điểm dự phòng thành công trong 1 click."
  }
  ```

---

### 3.4. `PATCH /api/v1/events/{id}/stops/{stopId}` (Dynamic On-The-Go Adaptation)
- **Mô tả**: Cập nhật khẩn cấp duy nhất 1 dòng bản ghi điểm dừng trong chuyến đi thực tế (ví dụ trời mưa).
- **Request Body (JSON)**:
  ```json
  {
    "place_name": "Artisan Indoor Boardgame Cafe",
    "place_ref_id": "ChIJsW8gV3SuEmsReD345g83frY4",
    "note": "Đổi điểm ngẫu hứng do trời mưa to"
  }
  ```
- **Response `200 OK`**: Cập nhật thành công và phát sóng tức thì tới toàn phòng qua WebSockets.

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
