# 👤 Person 4 — Hà Đăng Huy (Frontend Dev A: Core Flows UI)

> **Người phụ trách**: **Hà Đăng Huy**  
> **Sở hữu**: Giao diện người dùng cho Auth, Room Dashboard, Bộ chọn phạm vi (Day Hangouts vs Vacations), Dòng thời gian tương tác (Interactive Timeline), Nút bấm khóa đồng thuận (Consensus Header: Macro Lock & Final Lock), và Canvas Bản đồ Mapbox GL. Code song song với Backend Dev A qua MSW (Mock Service Worker), ghép nối API thật ở Integration Day.  
> **Quy định tracking bắt buộc**: Sau khi hoàn thành code và test mỗi task, đổi `[ ]` thành `[x]` kèm link PR, ngày hoàn thành và cập nhật tài liệu kỹ thuật tương ứng theo [post-task-documentation.md](../01-workflow/post-task-documentation.md).

---

## 📊 Progress Tracker

| Sprint | Số Tasks | Đã hoàn thành | Trạng thái |
|:---:|:---:|:---:|:---:|
| **Sprint 0** | 1 Task | 0/1 | 🔲 To Do |
| **Sprint 1** | 3 Tasks | 0/3 | 🔲 To Do |
| **Sprint 2** | 4 Tasks | 0/4 | 🔲 To Do |
| **Sprint 3** | 2 Tasks | 0/2 | 🔲 To Do |
| **Sprint 4** | 0 Tasks (Testing, Mapbox Polish & Mobile) | 0/0 | 🔲 To Do |
| **Tổng cộng** | **10 Tasks** | 0/10 | 🔲 Sẵn sàng bắt tay vào làm |

---

## 🛠️ Detailed Sprint Backlog

### Sprint 0 — MSW Mock Setup Cho Core APIs
- [ ] **`TASK-004`** **MSW Mock Handlers Setup Cho Core APIs**
  - **Mục tiêu**: Dựng Mock Service Worker chặn các request API core để code UI song song.
  - **Target Files**: `frontend/src/mocks/handlers/` (`auth.ts`, `events.ts`, `plans.ts`)
  - **Acceptance Criteria**: MSW intercepts `/api/v1/auth/*` và `/api/v1/events/*`, trả về mock JSON chuẩn theo OpenAPI contract.
  - **Docs & Tracking**: Cập nhật `frontend/src/mocks/` + tick `[x]`.

### Sprint 1 — Design System & Auth Screens
- [ ] **`TASK-111`** **Frontend Skeleton, Tailwind Theme & Layout**
  - **Feature**: #29
  - **Target Files**: `frontend/src/`, `frontend/tailwind.config.js`
  - **Acceptance Criteria**: Vite app build sạch sẽ với Tailwind CSS, shadcn components (Button, Input, Card, Dialog), responsive design.
  - **Docs & Tracking**: Cập nhật `docs/06-design/design-tokens.md` + tick `[x]`.
- [ ] **`TASK-112`** **Login & Register UI Screens**
  - **Feature**: #1, #2
  - **Target Files**: `frontend/src/features/auth/pages/LoginPage.tsx`, `RegisterPage.tsx`
  - **Acceptance Criteria**: Form validation với React Hook Form + Zod, nút đăng nhập Google OAuth2, kết nối Auth API / MSW.
  - **Docs & Tracking**: Cập nhật `docs/06-design/user-flows.md` + tick `[x]`.
- [ ] **`TASK-113`** **Forgot Password & Profile Management UI**
  - **Feature**: #3, #5
  - **Target Files**: `frontend/src/features/auth/pages/ForgotPasswordPage.tsx`, `ProfilePage.tsx`
  - **Acceptance Criteria**: Đổi thông tin họ tên, avatar và cập nhật Zustand auth store.
  - **Docs & Tracking**: Cập nhật `docs/06-design/user-flows.md` + tick `[x]`.

### Sprint 2 — Room Dashboard & Mapbox GL Canvas
- [ ] **`TASK-212`** **Room Creation Modal & Dual Scope Selector**
  - **Feature**: #7
  - **Target Files**: `frontend/src/features/event/components/CreateRoomModal.tsx`
  - **Acceptance Criteria**: Cho phép chọn phạm vi Day Hangout hoặc Vacation, ngày đi và ngân sách.
  - **Docs & Tracking**: Cập nhật `docs/06-design/user-flows.md` + tick `[x]`.
- [ ] **`TASK-213`** **Room Dashboard & Navigation Tabs**
  - **Feature**: #10
  - **Target Files**: `frontend/src/features/event/pages/RoomDashboardPage.tsx`
  - **Acceptance Criteria**: Hiển thị danh sách chuyến đi, các tab (Timeline, Chat, Bản đồ, Chi phí, Cài đặt).
  - **Docs & Tracking**: Cập nhật `docs/06-design/user-flows.md` + tick `[x]`.
- [ ] **`TASK-214`** **Member Invitation Modal & Shareable Link UI**
  - **Feature**: #8
  - **Target Files**: `frontend/src/features/event/components/InviteModal.tsx`
  - **Acceptance Criteria**: Nút sao chép link mời tức thì, hiển thị danh sách thành viên hiện tại trong phòng.
  - **Docs & Tracking**: Cập nhật `docs/06-design/user-flows.md` + tick `[x]`.
- [ ] **`TASK-215`** **Interactive Mapbox GL Route Canvas**
  - **Feature**: #32
  - **Target Files**: `frontend/src/components/map/MapboxCanvas.tsx`
  - **Acceptance Criteria**: Hiển thị markers cho các điểm dừng, vẽ tuyến đường di chuyển tối ưu giữa các điểm theo cụm $2.0$--$2.5$\,km.
  - **Docs & Tracking**: Cập nhật `docs/06-design/user-flows.md` + tick `[x]`.

### Sprint 3 — Interactive Timeline & Consensus Header
- [ ] **`TASK-314`** **Interactive Timeline Component (Draggable Stop Cards)**
  - **Feature**: #33
  - **Target Files**: `frontend/src/features/plan/components/InteractiveTimeline.tsx`
  - **Acceptance Criteria**: Kéo thả sắp xếp thứ tự điểm dừng, hiển thị thời lượng ghé thăm và khoảng cách di chuyển.
  - **Docs & Tracking**: Cập nhật `docs/06-design/user-flows.md` + tick `[x]`.
- [ ] **`TASK-316`** **Macro Lock & Final Confirmation Header UI**
  - **Feature**: #12, #15
  - **Target Files**: `frontend/src/features/plan/components/ConsensusHeader.tsx`
  - **Acceptance Criteria**: Hiển thị nút "Khóa Lộ Trình Vĩ Mô" (Macro Lock - Consensus 1) và "Chốt Kế Hoạch Chính Thức" (Final Lock - Consensus 2) dành riêng cho Host.
  - **Docs & Tracking**: Cập nhật `docs/06-design/user-flows.md` + tick `[x]`.
