# 👤 Person 2 — Hà Đăng Huy & Phạm Đình Ánh Dương (Backend Platform & Services)

> **Người phụ trách**: 
> - **Hà Đăng Huy** (Backend Dev B: External Travel APIs, PyBreaker Circuit Breaker, Upstash Redis L2 Cache)
> - **Phạm Đình Ánh Dương** (Backend Dev C: Supabase Auth & JWT, Link Invitations, Notification Services, PDF & Calendar (.ics) Export, Quản lý tài chính & Optimal Settlement)  
> **Tham gia bắt buộc**: Contract Session (Sprint 0), Integration Day cuối mỗi Sprint.  
> **Quy định tracking bắt buộc**: Sau khi hoàn thành code và test mỗi task, đổi `[ ]` thành `[x]` kèm link PR, ngày hoàn thành và cập nhật tài liệu kỹ thuật tương ứng theo [post-task-documentation.md](../01-workflow/post-task-documentation.md).

---

## 📊 Progress Tracker

| Sprint | Số Tasks | Phụ trách | Đã hoàn thành | Trạng thái |
|:---:|:---:|:---:|:---:|:---:|
| **Sprint 0** | 1 Task | Phạm Đình Ánh Dương | 1/1 | ✅ Done (TASK-002) |
| **Sprint 1** | 7 Tasks | Hà Đăng Huy (2) + Phạm Đình Ánh Dương (5) | 2/7 | 🟡 Đang thực hiện |
| **Sprint 2** | 5 Tasks | Hà Đăng Huy (4) + Phạm Đình Ánh Dương (1) | 0/5 | 🔲 To Do |
| **Sprint 3** | 3 Tasks | Phạm Đình Ánh Dương | 0/3 | 🔲 To Do |
| **Sprint 4** | 2 Tasks | Phạm Đình Ánh Dương | 0/2 | 🔲 To Do |
| **Tổng cộng** | **18 Tasks** | 2 Thành viên | 3/18 | 🟡 Đang thực hiện |

---

## 🛠️ Detailed Sprint Backlog

### Sprint 0 — Contract Session (Phụ trách: Phạm Đình Ánh Dương)
- [X] **`TASK-002`** `[BE-Services - Phạm Đình Ánh Dương]` **FastAPI APIRouter Skeleton & Swagger Docs**
  - **Feature**: N/A (Contract)
  - **Target Files**: `backend/app/api/v1/` (`auth.py`, `events.py`, `consensus.py`, `places.py`, `export.py`, `finance.py`, `admin.py`)
  - **Acceptance Criteria**: Routes trả về `501 Not Implemented` khớp Pydantic DTOs, Swagger xem được tại `http://localhost:8000/docs`.

### Sprint 1 — Auth APIs, Upstash Redis Cache & PyBreaker Base
- [x] **`TASK-107`** `[BE-Platform - Hà Đăng Huy]` **HTTPX Async Client & Upstash Redis L2 Caching Service** *(Branch: `feature/TASK-107-108-redis-cache-places-api`)*
  - **Feature**: #27, #28
  - **Target Files**: `backend/app/core/redis.py`, `backend/app/services/cache_service.py`
  - **Acceptance Criteria**: Decorator `@cache_response(ttl=86400)` lưu và đọc kết quả POIs từ Upstash Redis qua kết nối TLS (`rediss://`).
  - **Docs & Tracking**: Cập nhật `tech-stack.md` + tick `[x]`.
- [ ] **`TASK-108`** `[BE-Platform - Hà Đăng Huy]` **Google Places API Base Service & PyBreaker Wrapper**
  - **Feature**: #24, #27
  - **Target Files**: `backend/app/services/places_service.py`
  - **Acceptance Criteria**: Truy vấn Google Places API New bằng `httpx.AsyncClient` bọc trong `PyBreaker` (timeout 2.5s, tự động ngắt mạch khi lỗi).
  - **Docs & Tracking**: Cập nhật `api-design-guide.md` + tick `[x]`.
- [X] **`TASK-102`** `[BE-Services - Phạm Đình Ánh Dương]` **User Registration & Password Hashing**
  - **Feature**: #2
  - **Target Files**: `backend/app/api/v1/auth.py`, `backend/app/services/auth_service.py`
  - **Acceptance Criteria**: `POST /auth/register` hash mật khẩu bằng `bcrypt` (cost $\ge 10$), lưu user vào Supabase, trả về JWT tokens.
  - **Docs & Tracking**: Cập nhật `api-design-guide.md` + tick `[x]`.
- [ ] **`TASK-103`** `[BE-Services - Phạm Đình Ánh Dương]` **Google & Facebook OAuth2 Integration**
  - **Feature**: #1
  - **Target Files**: `backend/app/api/v1/auth.py`, `backend/app/core/oauth.py`
  - **Acceptance Criteria**: `POST /auth/login/google` đổi auth code lấy token, lưu user vào database Supabase.
  - **Docs & Tracking**: Cập nhật `api-design-guide.md` + tick `[x]`.
- [X] **`TASK-104`** `[BE-Services - Phạm Đình Ánh Dương]` **JWT Access & Refresh Token Rotation**
  - **Feature**: #4
  - **Target Files**: `backend/app/core/security.py`, `backend/app/api/v1/auth.py`
  - **Acceptance Criteria**: Access token 15 phút, Refresh token 7 ngày trong httpOnly cookie.
  - **Docs & Tracking**: Cập nhật `api-design-guide.md` + tick `[x]`.
- [ ] **`TASK-105`** `[BE-Services - Phạm Đình Ánh Dương]` **Forgot & Reset Password Flow**
  - **Feature**: #3
  - **Target Files**: `backend/app/api/v1/auth.py`, `backend/app/services/email_service.py`
  - **Acceptance Criteria**: `POST /auth/forgot-password` gửi email token 1 lần (TTL 15 phút) qua SMTP.
  - **Docs & Tracking**: Cập nhật `api-design-guide.md` + tick `[x]`.
- [ ] **`TASK-106`** `[BE-Services - Phạm Đình Ánh Dương]` **User Profile API (GET & PATCH)**
  - **Feature**: #5
  - **Target Files**: `backend/app/api/v1/users.py`, `backend/app/services/user_service.py`
  - **Acceptance Criteria**: `GET /users/me` và `PATCH /users/me` cập nhật họ tên, avatar URL.
  - **Docs & Tracking**: Cập nhật `api-design-guide.md` + tick `[x]`.

### Sprint 2 — External Travel APIs & Link Invitations
- [ ] **`TASK-205`** `[BE-Platform - Hà Đăng Huy]` **Google Places Search with Category & Hours Filter**
  - **Feature**: #24, #25
  - **Target Files**: `backend/app/api/v1/places.py`, `backend/app/services/places_service.py`
  - **Acceptance Criteria**: `GET /places/search?category=...` lọc địa điểm kèm cờ `open_now` và gán metadata.
  - **Docs & Tracking**: Cập nhật `api-design-guide.md` + tick `[x]`.
- [ ] **`TASK-206`** `[BE-Platform - Hà Đăng Huy]` **Lodging & Tours Integration (Agoda, Booking.com, Klook)**
  - **Feature**: #25
  - **Target Files**: `backend/app/services/external_travel_service.py`
  - **Acceptance Criteria**: Cung cấp link và thông tin chỗ ở, vé trải nghiệm Klook.
  - **Docs & Tracking**: Cập nhật `api-design-guide.md` + tick `[x]`.
- [ ] **`TASK-207`** `[BE-Platform - Hà Đăng Huy]` **OpenWeatherMap Integration Service**
  - **Feature**: #26
  - **Target Files**: `backend/app/api/v1/utils.py`, `backend/app/services/weather_service.py`
  - **Acceptance Criteria**: `GET /weather?lat=&lng=` trả về thông tin nhiệt độ và cảnh báo mưa; cache 3 giờ trên Redis.
  - **Docs & Tracking**: Cập nhật `api-design-guide.md` + tick `[x]`.
- [ ] **`TASK-208`** `[BE-Platform - Hà Đăng Huy]` **Currency Converter API & Redis TTL Store**
  - **Feature**: #28
  - **Target Files**: `backend/app/api/v1/utils.py`, `backend/app/services/currency_service.py`
  - **Acceptance Criteria**: `GET /exchange-rate` trả về tỷ giá hối đoái cho các chuyến đi ASEAN; cache 12 giờ.
  - **Docs & Tracking**: Cập nhật `api-design-guide.md` + tick `[x]`.
- [ ] **`TASK-203`** `[BE-Services - Phạm Đình Ánh Dương]` **Invite via Link & Role Assignment APIs**
  - **Feature**: #8
  - **Target Files**: `backend/app/models/invitation.py`, `backend/app/api/v1/invitations.py`
  - **Acceptance Criteria**: `POST /events/{id}/invitations` tạo token mời tức thì, người nhận join vào `event_members`.
  - **Docs & Tracking**: Cập nhật `api-design-guide.md` + tick `[x]`.

### Sprint 3 — Notifications, PDF & Calendar Export (Phụ trách: Phạm Đình Ánh Dương)
- [ ] **`TASK-311`** `[BE-Services - Phạm Đình Ánh Dương]` **Email Notification Service (SMTP)**
  - **Feature**: Notification
  - **Target Files**: `backend/app/services/notification_service.py`
  - **Acceptance Criteria**: Gửi email mời vào phòng, thông báo khi mở vote điểm dừng và khi kế hoạch được chốt chính thức.
  - **Docs & Tracking**: Cập nhật `api-design-guide.md` + tick `[x]`.
- [ ] **`TASK-312`** `[BE-Services - Phạm Đình Ánh Dương]` **PDF Export Service (WeasyPrint)**
  - **Feature**: #36
  - **Target Files**: `backend/app/api/v1/export.py`, `backend/app/services/export_service.py`
  - **Acceptance Criteria**: `GET /events/{id}/export/pdf` xuất file PDF chuyên nghiệp chứa bản đồ, timeline và chi phí dự kiến.
  - **Docs & Tracking**: Cập nhật `api-design-guide.md` + tick `[x]`.
- [ ] **`TASK-313`** `[BE-Services - Phạm Đình Ánh Dương]` **Calendar (.ics) Export Service**
  - **Feature**: #37
  - **Target Files**: `backend/app/api/v1/export.py`, `backend/app/services/calendar_service.py`
  - **Acceptance Criteria**: `GET /events/{id}/export/calendar` tạo file `.ics` đồng bộ vào Google Calendar / Apple Calendar.
  - **Docs & Tracking**: Cập nhật `api-design-guide.md` + tick `[x]`.

### Sprint 4 — Shared Expenses & Optimal Debt Settlement (Phụ trách: Phạm Đình Ánh Dương)
- [ ] **`TASK-404`** `[BE-Services - Phạm Đình Ánh Dương]` **Thuật toán Bù trừ Nợ Tối ưu (Optimal Settlement Algorithm)**
  - **Feature**: #38, #39
  - **Target Files**: `backend/app/services/settlement_service.py`
  - **Acceptance Criteria**: Tính net balance từng thành viên qua SQL GROUP BY; chạy thuật toán Min-Cash-Flow khớp cặp nợ với số giao dịch ít nhất.
  - **Docs & Tracking**: Cập nhật `database-schema.md` + tick `[x]`.
- [ ] **`TASK-415`** `[BE-Services - Phạm Đình Ánh Dương]` **Quỹ Nhóm & Chi Phí CRUD APIs**
  - **Feature**: #38
  - **Target Files**: `backend/app/api/v1/finance.py`
  - **Acceptance Criteria**: `POST /events/{id}/fund-contributions` (thu quỹ trước) và `/expenses` (chi tiêu thật), trả về danh sách chuyển khoản tối ưu.
  - **Docs & Tracking**: Cập nhật `api-design-guide.md` + tick `[x]`.
