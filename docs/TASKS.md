# 📌 Master Detailed Task Breakdown (TASKS.md)
## Dự án: TripMate AI — Intelligent Group Activity & Travel Planning Platform
**Tech Stack & Cloud**: React 18 + TS (Vercel Edge CDN) · FastAPI (Render Web Service) · LangGraph Python (Render Worker) · DeepSeek-V4 + Model Abstraction · Supabase PostgreSQL 16 (Supavisor port 6543) · Upstash Redis 7 (Streams & Pub/Sub) · PyBreaker · OpenTelemetry

---

## 📊 Quick Status Overview

| Sprint | Trọng tâm Sprint | Số Micro-Tasks | Trạng thái |
|---|---|:---:|:---:|
| **Sprint 0** | Contract Session, Supabase Schemas, Two-Phase State DTOs, MSW Mocks, Design Tokens, Docker & CI/CD | 11 Tasks | 🔲 To Do |
| **Sprint 1** | Supabase Auth, Upstash Redis & PyBreaker Base, LangGraph Skeleton, UI Base, Vercel Edge Deploy | 18 Tasks | 🔲 To Do |
| **Sprint 2** | Room CRUD, External Travel APIs, Phase 1 Macro State, Four-Tier Grounding, Timeline, Render Deploy | 16 Tasks | 🔲 To Do |
| **Sprint 3** | Two-Stage Consensus Engine, Stop Voting & 1-Click Swap, Phase 2 Micro State, PDF & .ics Export | 17 Tasks | 🔲 To Do |
| **Sprint 4** | WebSocket Room Server, Token Streaming UI, Shared Expenses, OpenTelemetry, Locust Load Test | 16 Tasks | 🔲 To Do |
| **Tổng cộng** | 5 Sprint (Sprint 0 đến 4) | **78 Tasks** | 🔲 Sẵn sàng bắt tay vào làm |

---

## 👥 Danh Sách 6 Thành Viên & Ký Hiệu Phân Công

| Ký hiệu | Vai trò kỹ thuật theo Proposal | Thành viên phụ trách | File theo dõi cá nhân |
|---|---|---|---|
| `[BE-A]` / `[BE-Core]` | Backend Core Domain, Two-Stage Consensus & AI DAL Bridge | **Tạ Quang Huy** | [person-1-backend-core.md](04-tasks/person-1-backend-core.md) |
| `[BE-B]` / `[BE-Platform]` | External Travel APIs, PyBreaker Circuit Breaker & Redis Cache | **Hà Đăng Huy** | [person-2-backend-platform.md](04-tasks/person-2-backend-platform.md) |
| `[BE-Services]` | Supabase Auth, Invitations, Email SMTP, PDF/.ics Export, Settlement | **Phạm Đình Ánh Dương** | [person-2-backend-platform.md](04-tasks/person-2-backend-platform.md) |
| `[FE-A]` / `[FE-Core]` | Frontend Core Flows UI (Auth, Room Dashboard, Timeline, Mapbox) | **Hà Đăng Huy** | [person-4-frontend-core.md](04-tasks/person-4-frontend-core.md) |
| `[FE-B]` / `[FE-Growth]` | Frontend AI Chat UI, Stop Voting Cards (1-Click Swap), Expenses UI | **Nguyễn Minh Đức** | [person-5-frontend-growth.md](04-tasks/person-5-frontend-growth.md) |
| `[AI]` | AI Agent Lead (LangGraph, DeepSeek-V4, Four-Tier Grounding) | **Nguyễn Tùng Dương** (Lead) & **Tạ Quang Huy** (Bridge) | [person-3-ai-engineer.md](04-tasks/person-3-ai-engineer.md) |
| `[SEC/DEVOPS]` | Cyber Security & DevOps (Multi-Cloud, CI/CD, Tracing, Locust Test) | **Đinh Tiến Luân** | [person-6-security-devops.md](04-tasks/person-6-security-devops.md) |

> ⚠️ **Quy tắc bất biến khi thực hiện mọi task**:  
> Sau khi hoàn thành code và test, người thực hiện **bắt buộc cập nhật tài liệu kỹ thuật liên quan** (`docs/02-standards/` hoặc `docs/03-architecture/`) và đổi `[ ]` thành `[x]` trong file task cá nhân và `docs/TASKS.md` theo chuẩn [post-task-documentation.md](01-workflow/post-task-documentation.md).

---

## 🛠️ Sprint 0 — Contract Session & Infrastructure Setup

### 0.1 Architecture & Contract Definition
- [x] **TASK-001** `[BE-A]` **Thiết kế SQLAlchemy & Pydantic DB Schemas cho Supabase**
  - **Mục tiêu**: Chuẩn hóa mô hình dữ liệu cho Supabase PostgreSQL 16 phân tách 3 schema (`core`, `checkpoints`, `vectors`).
  - **Target Files**: `backend/app/models/` (`user.py`, `event.py`, `plan.py`, `stop.py`, `vote.py`, `chat.py`, `expense.py`, `settlement.py`), `backend/app/schemas/`
  - **Acceptance Criteria**: Hỗ trợ đầy đủ `scope` (DAY_HANGOUT | VACATION), `macro_locked`, `final_locked`, `plan_stops` với `place_ref_id` và `backup_options` JSONB, 3 bảng tài chính (`expenses`, `expense_splits`, `settlements`). Cấu hình Supavisor Pooler port 6543. Migration Alembic sạch.
  - **Docs & Tracking**: Cập nhật `database-schema.md` + tick `[x]` task board.
- [X] **TASK-002** `[BE-Services]` **FastAPI APIRouter Skeleton & Swagger Docs**
  - **Mục tiêu**: Tạo khung các Router trả về `501 Not Implemented` khớp chuẩn OpenAPI spec.
  - **Target Files**: `backend/app/api/v1/` (`auth.py`, `events.py`, `consensus.py`, `places.py`, `export.py`, `finance.py`, `admin.py`)
  - **Acceptance Criteria**: Swagger hiển thị đầy đủ schema tại `http://localhost:8000/docs`, Pydantic DTOs khớp hợp đồng giao diện.
- [ ] **TASK-003** `[AI]` **LangGraph State Schema & Fixture Data Definition**
  - **Mục tiêu**: Định nghĩa `AgentState` cho 2 pha thực thi và tạo dữ liệu giả lập để test đồ thị.
  - **Target Files**: `backend/app/ai_agents/state.py`, `backend/app/ai_agents/fixtures/` (`mock_places.json`, `mock_roadmaps.json`)
feature/TASK-004-msw-core-mocks
  - **Acceptance Criteria**: Khai báo Pydantic `AgentState` chứa `phase`, `macro_locked`, `daily_themes`, `plan_stops`, `backup_options`. Dữ liệu mock validate pass 100% với DB models.
- [x] **TASK-004** `[FE-A]` **MSW Mock Handlers Setup Cho Core APIs**
  - **Mục tiêu**: Dựng Mock Service Worker chặn các request API core để code UI song song.
  - **Target Files**: `frontend/src/mocks/handlers/` (`auth.ts`, `events.ts`, `plans.ts`)
  - **Acceptance Criteria**: Giả lập API auth, tạo phòng và lấy danh sách điểm dừng khớp với OpenAPI contract.
- [ ] **TASK-005** `[FE-B]` **MSW Mock Handlers Setup Cho Realtime AI Streaming**
  - **Mục tiêu**: Giả lập streaming token và sự kiện cập nhật điểm dừng qua WebSocket/SSE.
  - **Target Files**: `frontend/src/mocks/handlers/ai.ts`
  - **Acceptance Criteria**: Giả lập gửi từng chunk token (TTFT $< 800$\,ms) và broadcast sự kiện `plan:updated`.
- [ ] **TASK-006** `[SEC/DEVOPS]` **Docker Compose & Môi Trường Local**
  - **Mục tiêu**: Khởi động PostgreSQL 15, Redis 7 và FastAPI server cục bộ.
  - **Target Files**: `docker-compose.yml`, `backend/Dockerfile`, `.env.example`
  - **Acceptance Criteria**: `docker compose up -d` khởi chạy thành công toàn bộ service với health check pass.

### 0.2 CI/CD & Code Quality Rules
- [ ] **TASK-007** `[SEC/DEVOPS]` **GitHub Actions CI Pipeline Setup**
  - **Mục tiêu**: Tự động hóa kiểm tra code quality khi mở PR.
  - **Target Files**: `.github/workflows/ci.yml`
  - **Acceptance Criteria**: Pipeline chạy: `ruff check backend`, `pytest backend`, `pnpm run lint frontend`, `pnpm run test frontend`.
- [ ] **TASK-008** `[SEC/DEVOPS]` **Pre-commit Hooks & Linter Configuration**
  - **Mục tiêu**: Chặn commit nếu code vi phạm convention.
  - **Target Files**: `.pre-commit-config.yaml`, `backend/pyproject.toml`
  - **Acceptance Criteria**: Chặn commit nếu Ruff hoặc Black phát hiện lỗi format.

### 0.3 UI/UX Design System & Wireframes
- [ ] **TASK-009** `[FE-B]` **Design Tokens & Design System Spec**
  - **Mục tiêu**: Xây dựng bảng màu chuẩn (Primary Blue `#12305c`, Accent Teal `#186c8e`), typography, radius, shadow.
  - **Target Files**: `docs/06-design/design-tokens.md`, `frontend/src/styles/theme.ts`, `frontend/tailwind.config.js`
  - **Acceptance Criteria**: Chốt design tokens theo Proposal, cấu hình tương thích Tailwind CSS và shadcn/ui.
- [ ] **TASK-010** `[FE-B]` **User Flows & Wireframes (Two-Stage Consensus & Living Itinerary)**
  - **Mục tiêu**: Vẽ luồng giao diện cho 2 chốt chặn đồng thuận (Consensus 1 & 2), kịch bản 1-Click Swap và đổi điểm khi trời mưa.
  - **Target Files**: `docs/06-design/user-flows.md`, `docs/06-design/wireframes/`
  - **Acceptance Criteria**: Flowchart và wireframe đầy đủ các trạng thái empty, loading, error, success.
- [ ] **TASK-011** `[FE-B]` **Hi-fi Mockups, Thư Viện Component & WCAG AA**
  - **Mục tiêu**: Dựng mockup chi tiết cho Room Chat, Interactive Timeline, Stop Voting Cards.
  - **Target Files**: `docs/06-design/mockups.md`, `frontend/src/components/ui/`
  - **Acceptance Criteria**: Đảm bảo độ tương phản màu sắc đạt chuẩn WCAG AA, responsive trên Mobile và Desktop.

---

## 🔐 Sprint 1 — Auth, Infrastructure Baseline & Vercel Edge Deploy

### 1.1 Auth & Supabase Identity
- [x] **TASK-101** `[BE-A]` **Supabase Core Database Models & Alembic Migration**
  - **Feature**: #1, #2
  - **Target Files**: `backend/app/models/user.py`, `backend/alembic/versions/`
  - **Acceptance Criteria**: Tạo bảng `core.users` và `core.event_members`, kết nối qua Supavisor pooler port 6543.
- [ ] **TASK-102** `[BE-Services]` **User Registration & Password Hashing**
  - **Feature**: #2
  - **Target Files**: `backend/app/api/v1/auth.py`, `backend/app/services/auth_service.py`
  - **Acceptance Criteria**: `POST /auth/register` hash mật khẩu bằng `bcrypt` (cost $\ge 10$), trả về JWT tokens.
- [ ] **TASK-103** `[BE-Services]` **Google & Facebook OAuth2 Integration**
  - **Feature**: #1
  - **Target Files**: `backend/app/api/v1/auth.py`, `backend/app/core/oauth.py`
  - **Acceptance Criteria**: `POST /auth/login/google` đổi auth code lấy token, lưu user vào database Supabase.
- [ ] **TASK-104** `[BE-Services]` **JWT Access & Refresh Token Rotation**
  - **Feature**: #4
  - **Target Files**: `backend/app/core/security.py`, `backend/app/api/v1/auth.py`
  - **Acceptance Criteria**: Access token 15 phút, Refresh token 7 ngày trong httpOnly cookie.
- [ ] **TASK-105** `[BE-Services]` **Forgot & Reset Password Flow**
  - **Feature**: #3
  - **Target Files**: `backend/app/api/v1/auth.py`, `backend/app/services/email_service.py`
  - **Acceptance Criteria**: `POST /auth/forgot-password` gửi email token 1 lần (TTL 15 phút) qua SMTP.
- [ ] **TASK-106** `[BE-Services]` **User Profile API (GET & PATCH)**
  - **Feature**: #5
  - **Target Files**: `backend/app/api/v1/users.py`, `backend/app/services/user_service.py`
  - **Acceptance Criteria**: `GET /users/me` và `PATCH /users/me` cập nhật họ tên, avatar URL.

### 1.2 Platform & Upstash Redis Cache Baseline
- [ ] **TASK-107** `[BE-B]` **HTTPX Async Client & Upstash Redis L2 Caching Service**
  - **Feature**: #27, #28
  - **Target Files**: `backend/app/core/redis.py`, `backend/app/services/cache_service.py`
  - **Acceptance Criteria**: Decorator `@cache_response(ttl=86400)` lưu và đọc kết quả POIs từ Upstash Redis qua giao thức TLS.
- [ ] **TASK-108** `[BE-B]` **Google Places API Base Service & PyBreaker Wrapper**
  - **Feature**: #24, #27
  - **Target Files**: `backend/app/services/places_service.py`
  - **Acceptance Criteria**: Truy vấn Google Places API New bằng `httpx.AsyncClient` bọc trong `PyBreaker` (timeout 2.5s).

### 1.3 AI Agent Two-Phase State Machine Baseline
- [ ] **TASK-109** `[AI]` **LangGraph Two-Phase State Machine Skeleton**
  - **Feature**: #17
  - **Target Files**: `backend/app/ai_agents/state_machine.py`
  - **Acceptance Criteria**: Xây dựng đồ thị máy trạng thái gồm 2 pha (Phase 1 Macro State và Phase 2 Micro State), kiểm soát chuyển pha dựa trên cờ `macro_locked`.
- [ ] **TASK-110** `[AI]` **DeepSeek-V4 Provider & Model Abstraction Layer**
  - **Feature**: #18
  - **Target Files**: `backend/app/ai_agents/model_abstraction.py`
  - **Acceptance Criteria**: Gọi mô hình chính `deepseek-v4`, tích hợp cơ chế tự động fallback sang GPT-4o / Claude khi DeepSeek gặp lỗi.

### 1.4 Frontend Foundations & Auth UI
- [ ] **TASK-111** `[FE-A]` **Frontend Skeleton, Tailwind Theme & Layout**
  - **Feature**: #29
  - **Target Files**: `frontend/src/`, `frontend/tailwind.config.js`
  - **Acceptance Criteria**: Khởi tạo project React 18 + Vite + TS, tích hợp Tailwind palette theo proposal.
- [ ] **TASK-112** `[FE-A]` **Login & Register UI Screens**
  - **Feature**: #1, #2
  - **Target Files**: `frontend/src/features/auth/pages/LoginPage.tsx`, `RegisterPage.tsx`
  - **Acceptance Criteria**: Form validation với React Hook Form + Zod, nút đăng nhập Google OAuth2.
- [ ] **TASK-113** `[FE-A]` **Forgot Password & Profile Management UI**
  - **Feature**: #3, #5
  - **Target Files**: `frontend/src/features/auth/pages/ForgotPasswordPage.tsx`, `ProfilePage.tsx`
  - **Acceptance Criteria**: Đổi thông tin họ tên, avatar và cập nhật Zustand auth store.
- [ ] **TASK-114** `[FE-B]` **Landing Page & Hero Showcase**
  - **Feature**: #30
  - **Target Files**: `frontend/src/features/landing/pages/LandingPage.tsx`
  - **Acceptance Criteria**: Giới thiệu nền tảng TripMate AI, mô phỏng luồng Two-Stage Consensus và các nút CTA.
- [ ] **TASK-115** `[FE-B]` **i18n Setup (Tiếng Việt & English)**
  - **Feature**: #31
  - **Target Files**: `frontend/src/i18n/`, `frontend/src/locales/` (`vi.json`, `en.json`)
  - **Acceptance Criteria**: Nút chuyển đổi ngôn ngữ trên Header đổi toàn bộ giao diện tức thì.

### 1.5 Security & Vercel Edge CDN Deploy
- [ ] **TASK-116** `[SEC/DEVOPS]` **FastAPI Security Middlewares & Supabase RLS Audit**
  - **Feature**: #6
  - **Target Files**: `backend/app/main.py`, `docs/05-security/security-guidelines.md`
  - **Acceptance Criteria**: Cấu hình CORS restricted origins, TrustedHost, security headers, audit chính sách RLS.
- [ ] **TASK-117** `[SEC/DEVOPS]` **Auth Security Audit**
  - **Feature**: Security
  - **Target Files**: `backend/app/api/v1/auth.py`
  - **Acceptance Criteria**: Kiểm tra bcrypt cost $\ge 10$, JWT secret length $\ge 32$ chars, rate limit 10 req/min.
- [ ] **TASK-118** `[SEC/DEVOPS]` **Vercel Edge CDN Deploy Pipeline (Preview + Production)**
  - **Feature**: DevOps
  - **Target Files**: `vercel.json`, `.github/workflows/cd-frontend.yml`, `docs/03-architecture/deployment-guide.md`
  - **Acceptance Criteria**: Deploy tự động khi merge `main`, tự sinh Preview URL cho PR. Smoke test domain Vercel live.

---

## 📅 Sprint 2 — Room Management, External APIs, Phase 1 Macro State & Render Deploy

### 2.1 Room & Member Management (Backend Core & Services)
- [x] **TASK-201** `[BE-A]` **Event & Room Database Models (Day Hangouts & Vacations)**
  - **Feature**: #7
  - **Target Files**: `backend/app/models/event.py`, `backend/alembic/versions/`
  - **Acceptance Criteria**: Bảng `core.events` hỗ trợ `scope` (`DAY_HANGOUT` | `VACATION`), `macro_locked`, `final_locked`.
- [x] **TASK-202** `[BE-A]` **Room CRUD APIs**
  - **Feature**: #7
  - **Target Files**: `backend/app/api/v1/events.py`, `backend/app/services/event_service.py`
  - **Acceptance Criteria**: `POST /events` tạo phòng và gán người tạo làm `HOST`. `GET /events` lấy danh sách phòng.
- [ ] **TASK-203** `[BE-Services]` **Invite via Link & Role Assignment APIs**
  - **Feature**: #8
  - **Target Files**: `backend/app/models/invitation.py`, `backend/app/api/v1/invitations.py`
  - **Acceptance Criteria**: `POST /events/{id}/invitations` tạo token mời tức thì, người nhận join vào `event_members`.
- [ ] **TASK-204** `[BE-A]` **RolesGuard Dependency (Host vs Member Permissions)**
  - **Feature**: #9
  - **Target Files**: `backend/app/api/v1/dependencies.py`
  - **Acceptance Criteria**: Dependency `require_host` chặn các thao tác khóa kế hoạch nếu user không phải là Host (`403 Forbidden`).

### 2.2 External APIs & PyBreaker Resilience (Backend Platform)
- [ ] **TASK-205** `[BE-B]` **Google Places Search with Category & Hours Filter**
  - **Feature**: #24, #25
  - **Target Files**: `backend/app/api/v1/places.py`, `backend/app/services/places_service.py`
  - **Acceptance Criteria**: `GET /places/search?category=...` lọc địa điểm kèm cờ `open_now` và gán metadata.
- [ ] **TASK-206** `[BE-B]` **Lodging & Tours Integration (Agoda, Booking.com, Klook)**
  - **Feature**: #25
  - **Target Files**: `backend/app/services/external_travel_service.py`
  - **Acceptance Criteria**: Cung cấp link và thông tin chỗ ở, vé trải nghiệm Klook.
- [ ] **TASK-207** `[BE-B]` **OpenWeatherMap Integration Service**
  - **Feature**: #26
  - **Target Files**: `backend/app/api/v1/utils.py`, `backend/app/services/weather_service.py`
  - **Acceptance Criteria**: `GET /weather?lat=&lng=` trả về thông tin nhiệt độ và cảnh báo mưa; cache 3 giờ trên Redis.
- [ ] **TASK-208** `[BE-B]` **Currency Converter API & Redis TTL Store**
  - **Feature**: #28
  - **Target Files**: `backend/app/api/v1/utils.py`, `backend/app/services/currency_service.py`
  - **Acceptance Criteria**: `GET /exchange-rate` trả về tỷ giá hối đoái cho các chuyến đi ASEAN; cache 12 giờ.

### 2.3 Phase 1 Macro Planning State & Four-Tier Grounding Setup (AI Team)
- [ ] **TASK-209** `[AI]` **Tier 1: Pydantic Schema Enforcement for Macro Drafting**
  - **Feature**: #19
  - **Target Files**: `backend/app/ai_agents/schemas.py`, `backend/app/ai_agents/nodes/macro_planner.py`
  - **Acceptance Criteria**: Ép đầu ra của LLM vào cấu trúc Pydantic nghiêm ngặt, soạn thảo số ngày, chủ đề và ma trận phân bổ ngân sách vĩ mô (bóc tách vé máy bay 25-35% và Land Budget: Lưu trú, Ẩm thực, Hoạt động, Đi lại & Sân bay) mà KHÔNG gọi API ngoài.
- [ ] **TASK-210** `[AI]` **Tier 2: Live Map Check Verification Service**
  - **Feature**: #20
  - **Target Files**: `backend/app/ai_agents/grounding/map_verifier.py`
  - **Acceptance Criteria**: Đối chiếu từng địa điểm với Google Places API và OSM, xác thực `place_id` và giờ mở cửa thật 100%.
- [ ] **TASK-211** `[AI]` **Tier 3: Haversine Geo-Clustering Algorithm (Distance Guard)**
  - **Feature**: #21
  - **Target Files**: `backend/app/ai_agents/grounding/geo_clustering.py`
  - **Acceptance Criteria**: Gom cụm các điểm dừng trong cùng nửa ngày vào bán kính $\le 2.5$\,km ($\le 20$\,phút di chuyển) bằng công thức Haversine.

### 2.4 UI Room Dashboard & Mapbox Route Canvas (Frontend Core)
- [ ] **TASK-212** `[FE-A]` **Room Creation Modal & Dual Scope Selector**
  - **Feature**: #7
  - **Target Files**: `frontend/src/features/event/components/CreateRoomModal.tsx`
  - **Acceptance Criteria**: Cho phép chọn phạm vi Day Hangout hoặc Vacation, ngày đi và ngân sách.
- [ ] **TASK-213** `[FE-A]` **Room Dashboard & Navigation Tabs**
  - **Feature**: #10
  - **Target Files**: `frontend/src/features/event/pages/RoomDashboardPage.tsx`
  - **Acceptance Criteria**: Hiển thị danh sách chuyến đi, các tab (Timeline, Chat, Bản đồ, Chi phí, Cài đặt).
- [ ] **TASK-214** `[FE-A]` **Member Invitation Modal & Shareable Link UI**
  - **Feature**: #8
  - **Target Files**: `frontend/src/features/event/components/InviteModal.tsx`
  - **Acceptance Criteria**: Nút sao chép link mời tức thì, hiển thị danh sách thành viên hiện tại trong phòng.
- [ ] **TASK-215** `[FE-A]` **Interactive Mapbox GL Route Canvas**
  - **Feature**: #32
  - **Target Files**: `frontend/src/components/map/MapboxCanvas.tsx`
  - **Acceptance Criteria**: Hiển thị markers cho các điểm dừng, vẽ tuyến đường di chuyển tối ưu giữa các điểm.

### 2.5 Backend Deployment — Render.com (FastAPI Gateway + Anti-Sleep Ping)
- [ ] **TASK-216** `[SEC/DEVOPS]` **Render Deploy Pipeline & Keep-Alive Ping Setup**
  - **Feature**: DevOps
  - **Target Files**: `render.yaml`, `backend/Dockerfile.prod`, `backend/app/api/healthz.py`, `.github/workflows/cd-backend.yml`
  - **Acceptance Criteria**: Deploy FastAPI Web Service lên Render. Endpoint `/api/healthz` phản hồi 200 OK. Thiết lập cron ping 10 phút chống sleep.

---

## 🗳️ Sprint 3 — Two-Stage Consensus Engine, Phase 2 Micro Curation & Exports

### 3.1 Two-Stage Consensus Engine (Backend Core)
- [ ] **TASK-301** `[BE-A]` **Normalized `plan_stops` & `plan_votes` Database Models**
  - **Feature**: #11
  - **Target Files**: `backend/app/models/plan.py`, `backend/app/models/stop.py`, `backend/alembic/versions/`
  - **Acceptance Criteria**: Bảng `plan_stops` hỗ trợ lưu Place ID, tọa độ lat/lng, backup options JSONB; bảng `plan_votes` có ràng buộc unique `(stop_id, user_id)`.
- [ ] **TASK-302** `[BE-A]` **Macro Consensus Lock API (Consensus Checkpoint 1)**
  - **Feature**: #12
  - **Target Files**: `backend/app/api/v1/consensus.py`
  - **Acceptance Criteria**: `POST /events/{id}/macro-lock` xác nhận khóa khung lộ trình vĩ mô (chỉ Host thực hiện), kích hoạt chuyển sang Phase 2.
- [ ] **TASK-303** `[BE-A]` **Granular Stop Management & Ordering APIs**
  - **Feature**: #11
  - **Target Files**: `backend/app/api/v1/plans.py`
  - **Acceptance Criteria**: Sắp xếp lại thứ tự điểm dừng, cập nhật thời lượng lưu lại và ghi chú điểm dừng.
- [ ] **TASK-304** `[BE-A]` **Stop Voting API with Atomic SQL Counter**
  - **Feature**: #13
  - **Target Files**: `backend/app/api/v1/consensus.py`, `backend/app/services/vote_service.py`
  - **Acceptance Criteria**: `POST /events/{id}/stops/{stopId}/vote` vote UP/DOWN với lệnh SQL nguyên tử, triệt tiêu race condition.
- [ ] **TASK-305** `[BE-A]` **1-Click Swap Alternative POI API**
  - **Feature**: #14
  - **Target Files**: `backend/app/api/v1/consensus.py`
  - **Acceptance Criteria**: `POST /events/{id}/stops/{stopId}/swap` thay thế tức thì điểm dừng bằng 1 trong 2 phương án dự phòng đã nạp sẵn.
- [ ] **TASK-306** `[BE-A]` **Final Plan Confirmation API (Consensus Checkpoint 2)**
  - **Feature**: #15
  - **Target Files**: `backend/app/api/v1/consensus.py`
  - **Acceptance Criteria**: `POST /events/{id}/final-lock` khóa toàn bộ kế hoạch chính thức (chỉ Host thực hiện) và kích hoạt xuất file.
- [ ] **TASK-307** `[BE-A]` **Living Itinerary Dynamic Adaptation API (On-Trip Edit)**
  - **Feature**: #16
  - **Target Files**: `backend/app/api/v1/consensus.py`
  - **Acceptance Criteria**: `PATCH /events/{id}/stops/{stopId}` cho phép cập nhật duy nhất 1 điểm dừng khi có biến cố thực tế (ví dụ trời mưa).

### 3.2 Phase 2 Micro Curation State & Typed Checkpointing (AI Team)
- [ ] **TASK-308** `[AI]` **Phase 2: Micro Curation State & Backup Stops Pre-fetching**
  - **Feature**: #22
  - **Target Files**: `backend/app/ai_agents/nodes/micro_curator.py`
  - **Acceptance Criteria**: Sau khi có Macro Lock, AI truy vấn Google Places/12Go Asia/Travel APIs qua PyBreaker, tự động tính cước đưa đón sân bay và Grab/xe máy theo Haversine, lọc quán theo phân khúc giá (`price_level`), áp dụng gom cụm 2--3 km, cơ chế cân đối bù trừ chi phí động (`running_cost <= total_budget`) và chuẩn bị sẵn 2 backup options cùng mức giá cho mỗi điểm dừng.
- [ ] **TASK-309** `[AI]` **Typed State Persistence with `AsyncPostgresSaver` via DAL**
  - **Feature**: #23
  - **Target Files**: `backend/app/ai_agents/dal.py`
  - **Acceptance Criteria**: Lưu vết checkpoint của `AgentState` vào schema `checkpoints` của Supabase, hỗ trợ khôi phục phiên tự động.
- [ ] **TASK-310** `[AI]` **Dynamic On-The-Go Adaptation Agent Node**
  - **Feature**: #16
  - **Target Files**: `backend/app/ai_agents/nodes/adaptive_replanner.py`
  - **Acceptance Criteria**: Xử lý yêu cầu khẩn cấp trong chuyến đi (tìm quán cafe trong nhà gần vị trí hiện tại khi trời mưa), sinh thay đổi cho 1 stop duy nhất.

### 3.3 Notifications, PDF & Calendar Export (Backend Services)
- [ ] **TASK-311** `[BE-Services]` **Email Notification Service (SMTP)**
  - **Feature**: Notification
  - **Target Files**: `backend/app/services/notification_service.py`
  - **Acceptance Criteria**: Gửi email mời vào phòng, thông báo khi mở vote điểm dừng và khi kế hoạch được chốt chính thức.
- [ ] **TASK-312** `[BE-Services]` **PDF Export Service (WeasyPrint)**
  - **Feature**: #36
  - **Target Files**: `backend/app/api/v1/export.py`, `backend/app/services/export_service.py`
  - **Acceptance Criteria**: `GET /events/{id}/export/pdf` xuất file PDF chuyên nghiệp chứa bản đồ, timeline và chi phí dự kiến.
- [ ] **TASK-313** `[BE-Services]` **Calendar (.ics) Export Service**
  - **Feature**: #37
  - **Target Files**: `backend/app/api/v1/export.py`, `backend/app/services/calendar_service.py`
  - **Acceptance Criteria**: `GET /events/{id}/export/calendar` tạo file `.ics` đồng bộ vào Google Calendar / Apple Calendar.

### 3.4 Interactive Timeline, Voting Cards & Packing Checklist UI (Frontend)
- [ ] **TASK-314** `[FE-A]` **Interactive Timeline Component (Draggable Stop Cards)**
  - **Feature**: #33
  - **Target Files**: `frontend/src/features/plan/components/InteractiveTimeline.tsx`
  - **Acceptance Criteria**: Kéo thả sắp xếp thứ tự điểm dừng, hiển thị thời lượng ghé thăm và khoảng cách di chuyển.
- [ ] **TASK-315** `[FE-B]` **Granular Stop Voting Cards & 1-Click Swap UI**
  - **Feature**: #35
  - **Target Files**: `frontend/src/features/plan/components/StopVotingCard.tsx`
  - **Acceptance Criteria**: Thẻ điểm dừng hiển thị hình ảnh thật, nút vote UP/DOWN, progress bar đồng thuận và nút 1-Click Swap.
- [ ] **TASK-316** `[FE-A]` **Macro Lock & Final Confirmation Header UI**
  - **Feature**: #12, #15
  - **Target Files**: `frontend/src/features/plan/components/ConsensusHeader.tsx`
  - **Acceptance Criteria**: Hiển thị nút "Khóa Lộ Trình Vĩ Mô" và "Chốt Kế Hoạch Chính Thức" dành riêng cho Host.
- [ ] **TASK-317** `[FE-B]` **Packing Checklist UI Screen**
  - **Feature**: Checklist
  - **Target Files**: `frontend/src/features/checklist/pages/ChecklistPage.tsx`
  - **Acceptance Criteria**: Danh sách kiểm tra đồ cần mang theo điều chỉnh theo điểm đến và thời tiết.

---

## 🚀 Sprint 4 — Realtime Synchronization, Shared Expenses, Load Benchmarks & Release

### 4.1 WebSocket Room Server & Redis Pub/Sub Sync (Backend Core)
- [ ] **TASK-401** `[BE-A]` **FastAPI WebSocket Room Server**
  - **Feature**: Realtime Sync
  - **Target Files**: `backend/app/api/v1/ws.py`, `backend/app/services/room_socket_manager.py`
  - **Acceptance Criteria**: Quản lý các kết nối WebSocket theo `room_id`, phản hồi ACK thao tác người dùng dưới 80ms.
- [ ] **TASK-402** `[BE-A]` **Redis Streams & Redis Pub/Sub Event Synchronization**
  - **Feature**: Realtime Sync
  - **Target Files**: `backend/app/core/redis_events.py`
  - **Acceptance Criteria**: Gateway đẩy task qua Redis Streams (`XADD`); AI Worker phát sóng sự kiện `PUBLISH plan:updated` để các Gateway gửi WebSockets tới client.
- [ ] **TASK-403** `[BE-A]` **Token & Latency Metrics Logger**
  - **Feature**: Observability
  - **Target Files**: `backend/app/services/metrics_logger.py`
  - **Acceptance Criteria**: Ghi nhận `input_tokens`, `output_tokens`, `ttft_ms`, `total_duration_ms` cho mỗi lần gọi AI.

### 4.2 Shared Expense Splitting & Optimal Debt Settlement (Backend Services)
- [ ] **TASK-404** `[BE-Services]` **Thuật toán Bù trừ Nợ Tối ưu (Optimal Settlement Algorithm)**
  - **Feature**: #38, #39
  - **Target Files**: `backend/app/services/settlement_service.py`
  - **Acceptance Criteria**: Tính net balance từng thành viên qua SQL GROUP BY; chạy thuật toán Min-Cash-Flow khớp cặp nợ với số giao dịch ít nhất.
- [ ] **TASK-415** `[BE-Services]` **Quỹ Nhóm & Chi Phí CRUD APIs**
  - **Feature**: #38
  - **Target Files**: `backend/app/api/v1/finance.py`
  - **Acceptance Criteria**: `POST /events/{id}/fund-contributions` (thu quỹ trước) và `/expenses` (chi tiêu thật), trả về danh sách chuyển khoản tối ưu.

### 4.3 Realtime AI Chat, Shared Expenses & Admin UI (Frontend Growth)
- [ ] **TASK-406** `[FE-B]` **Realtime Room Chat & Token Streaming UI**
  - **Feature**: #34
  - **Target Files**: `frontend/src/features/chat/pages/RoomChatPage.tsx`
  - **Acceptance Criteria**: Stream từng token phản hồi của AI qua WebSockets với TTFT $< 800$\,ms, hiển thị typing indicator.
- [ ] **TASK-407** `[FE-B]` **Macro Roadmap Preview Card Renderer**
  - **Feature**: #12
  - **Target Files**: `frontend/src/features/chat/components/MacroRoadmapCard.tsx`
  - **Acceptance Criteria**: Hiển thị đề xuất khung vĩ mô dạng thẻ tương tác trong chat kèm nút duyệt vĩ mô cho Host.
- [ ] **TASK-408** `[FE-B]` **Dynamic On-The-Go Alert & Swap Notification UI**
  - **Feature**: #16
  - **Target Files**: `frontend/src/features/plan/components/AdaptationToast.tsx`
  - **Acceptance Criteria**: Khi có thành viên đổi điểm do trời mưa, UI hiện thông báo và tự động cập nhật thẻ điểm dừng mới.
- [ ] **TASK-409** `[FE-B]` **Shared Expense & Settlement UI Screen**
  - **Feature**: #40
  - **Target Files**: `frontend/src/features/expense/pages/ExpensePage.tsx`
  - **Acceptance Criteria**: Hiển thị tổng quỹ, ai đã chi, ai nợ ai bao nhiêu tiền kèm nút đánh dấu đã thanh toán thành công.
- [ ] **TASK-410** `[FE-B]` **Admin Dashboard UI Screen**
  - **Feature**: #41
  - **Target Files**: `frontend/src/features/admin/pages/AdminDashboardPage.tsx`
  - **Acceptance Criteria**: Biểu đồ thống kê số phòng hoạt động, token tiêu thụ, cache hit rate và thời gian phản hồi API.

### 4.4 Security Pentest, Load Benchmarks & Production Validation
- [ ] **TASK-411** `[SEC/DEVOPS]` **Input Sanitization & Prompt Injection Defense Audit**
  - **Feature**: Security
  - **Target Files**: `backend/app/ai_agents/`, `backend/app/schemas/`
  - **Acceptance Criteria**: Kiểm tra làm sạch dữ liệu đầu vào qua Pydantic v2 và bleach; kiểm thử các câu lệnh jailbreak prompt.
- [ ] **TASK-412** `[SEC/DEVOPS]` **OpenTelemetry Distributed Tracing Setup**
  - **Feature**: #42
  - **Target Files**: `backend/app/core/telemetry.py`
  - **Acceptance Criteria**: Đo lường và trực quan hóa độ trễ qua các chặng Gateway $\rightarrow$ Redis $\rightarrow$ AI Worker $\rightarrow$ DB $\rightarrow$ WebSocket.
- [ ] **TASK-413** `[SEC/DEVOPS]` **Grounding Benchmark Verification (100 Prompts Test)**
  - **Feature**: AI Evaluation
  - **Target Files**: `backend/tests/evaluation/grounding_benchmark.py`
  - **Acceptance Criteria**: Chạy script 100 prompts tự động qua Google Places API; đạt tỷ lệ xác thực $\ge 98\%$ và **0% địa điểm ảo**.
- [ ] **TASK-414** `[SEC/DEVOPS]` **Locust Load Stress Test & Multi-Cloud Production Release**
  - **Feature**: Evaluation & DevOps
  - **Target Files**: `backend/tests/load_test/locustfile.py`, `docs/03-architecture/deployment-guide.md`
  - **Acceptance Criteria**: Giả lập 50--100 CCU trong 10--20 phòng trên môi trường production thật (Vercel + Render + Supabase + Upstash); duy trì thông lượng 150--250 req/s, tỷ lệ lỗi $< 0.5\%$, bộ nhớ worker $\le 512$\,MB RAM.
