# 👤 Person 5 — Nguyễn Minh Đức (Frontend Dev B: AI Experience & Growth UI)

> **Người phụ trách**: **Nguyễn Minh Đức**  
> **Sở hữu**: Giao diện Room Chat thời gian thực & AI Token Streaming (TTFT $< 800$\,ms), Thẻ xem trước lộ trình vĩ mô, Thẻ bình chọn điểm dừng (Stop Voting Cards UP/DOWN kèm nút 1-Click Swap), Thông báo thích ứng động khi trời mưa (Dynamic Adaptation Alert), Design System (Tailwind/shadcn), Đa ngôn ngữ (i18n), UI Quyết toán chi phí & Admin Dashboard.  
> **Quy định tracking bắt buộc**: Sau khi hoàn thành code và test mỗi task, đổi `[ ]` thành `[x]` kèm link PR, ngày hoàn thành và cập nhật tài liệu kỹ thuật tương ứng theo [post-task-documentation.md](../01-workflow/post-task-documentation.md).

---

## 📊 Progress Tracker

| Sprint | Số Tasks | Đã hoàn thành | Trạng thái |
|:---:|:---:|:---:|:---:|
| **Sprint 0** | 4 Tasks | 0/4 | 🔲 To Do |
| **Sprint 1** | 2 Tasks | 0/2 | 🔲 To Do |
| **Sprint 2** | 0 Tasks (Hỗ trợ Chat Mock & User Flows) | 0/0 | 🔲 To Do |
| **Sprint 3** | 2 Tasks | 0/2 | 🔲 To Do |
| **Sprint 4** | 5 Tasks | 0/5 | 🔲 To Do |
| **Tổng cộng** | **13 Tasks** | 0/13 | 🔲 Sẵn sàng bắt tay vào làm |

---

## 🛠️ Detailed Sprint Backlog

### Sprint 0 — MSW Streaming Mock, Design Tokens & Wireframes
- [ ] **`TASK-005`** **MSW Mock Handlers Setup Cho Realtime AI Streaming**
  - **Feature**: #34
  - **Target Files**: `frontend/src/mocks/handlers/ai.ts`
  - **Acceptance Criteria**: Giả lập gửi từng chunk token (TTFT $< 800$\,ms) và broadcast sự kiện `plan:updated` cho chat UI testing mà không cần backend thật.
  - **Docs & Tracking**: Cập nhật `frontend/src/mocks/` + tick `[x]`.
- [ ] **`TASK-009`** **Design Tokens & Design System Spec**
  - **Feature**: #29
  - **Target Files**: `docs/06-design/design-tokens.md`, `frontend/src/styles/theme.ts`, `frontend/tailwind.config.js`
  - **Acceptance Criteria**: Chốt bảng màu Primary Blue (`#12305c`) và Accent Teal (`#186c8e`), typography, radius, shadow; mapping sang Tailwind và shadcn/ui.
  - **Docs & Tracking**: Cập nhật `docs/06-design/design-tokens.md` + tick `[x]`.
- [ ] **`TASK-010`** **User Flows & Wireframes (Two-Stage Consensus & Dynamic Living Itinerary)**
  - **Feature**: #12, #15, #16
  - **Target Files**: `docs/06-design/user-flows.md`, `docs/06-design/wireframes/`
  - **Acceptance Criteria**: Flowchart và wireframe đầy đủ: Room Chat $\rightarrow$ Macro Lock $\rightarrow$ Stop Voting $\rightarrow$ 1-Click Swap $\rightarrow$ Final Lock $\rightarrow$ On-Trip Edit khi trời mưa.
  - **Docs & Tracking**: Cập nhật `docs/06-design/user-flows.md` + tick `[x]`.
- [ ] **`TASK-011`** **Hi-fi Mockups, Thư Viện Component & Tiêu Chuẩn WCAG AA**
  - **Feature**: #29
  - **Target Files**: `docs/06-design/mockups.md`, `frontend/src/components/ui/`
  - **Acceptance Criteria**: Dựng component variants (Button, Card, Modal, Progress bar), responsive trên mobile/desktop, độ tương phản đạt chuẩn WCAG AA.
  - **Docs & Tracking**: Cập nhật `docs/06-design/mockups.md` + tick `[x]`.

### Sprint 1 — Landing Page & i18n
- [ ] **`TASK-114`** **Landing Page & Hero Showcase**
  - **Feature**: #30
  - **Target Files**: `frontend/src/features/landing/pages/LandingPage.tsx`
  - **Acceptance Criteria**: Giới thiệu nền tảng TripMate AI, mô phỏng luồng Two-Stage Consensus và các nút Call-to-Action.
  - **Docs & Tracking**: Cập nhật `docs/06-design/user-flows.md` + tick `[x]`.
- [ ] **`TASK-115`** **i18n Setup (Tiếng Việt & English)**
  - **Feature**: #31
  - **Target Files**: `frontend/src/i18n/`, `frontend/src/locales/` (`vi.json`, `en.json`)
  - **Acceptance Criteria**: Header language toggle chuyển đổi toàn bộ ngôn ngữ giao diện mượt mà.
  - **Docs & Tracking**: Cập nhật `docs/06-design/user-flows.md` + tick `[x]`.

### Sprint 3 — Granular Stop Voting Cards & Packing Checklist UI
- [ ] **`TASK-315`** **Granular Stop Voting Cards & 1-Click Swap UI**
  - **Feature**: #35
  - **Target Files**: `frontend/src/features/plan/components/StopVotingCard.tsx`
  - **Acceptance Criteria**: Thẻ điểm dừng hiển thị hình ảnh thật, nút vote UP/DOWN, progress bar đồng thuận và nút 1-Click Swap thay thế tức thì địa điểm dự phòng.
  - **Docs & Tracking**: Cập nhật `docs/06-design/user-flows.md` + tick `[x]`.
- [ ] **`TASK-317`** **Packing Checklist UI Screen**
  - **Feature**: Checklist
  - **Target Files**: `frontend/src/features/checklist/pages/ChecklistPage.tsx`
  - **Acceptance Criteria**: Checklist hành lý thông minh tương tác check/uncheck, thêm/xóa đồ dùng cá nhân.
  - **Docs & Tracking**: Cập nhật `docs/06-design/user-flows.md` + tick `[x]`.

### Sprint 4 — Realtime AI Chat, Dynamic Adaptation Alert & Admin Dashboard
- [ ] **`TASK-406`** **Realtime Room Chat & Token Streaming UI**
  - **Feature**: #34
  - **Target Files**: `frontend/src/features/chat/pages/RoomChatPage.tsx`
  - **Acceptance Criteria**: Stream từng token phản hồi của AI qua WebSockets với TTFT $< 800$\,ms, hiển thị typing indicator và danh sách thành viên đang online trong phòng.
  - **Docs & Tracking**: Cập nhật `api-design-guide.md` + tick `[x]`.
- [ ] **`TASK-407`** **Macro Roadmap Preview Card Renderer**
  - **Feature**: #12
  - **Target Files**: `frontend/src/features/chat/components/MacroRoadmapCard.tsx`
  - **Acceptance Criteria**: Hiển thị đề xuất khung vĩ mô dạng thẻ tương tác trong chat kèm nút duyệt vĩ mô cho Host.
  - **Docs & Tracking**: Cập nhật `docs/06-design/user-flows.md` + tick `[x]`.
- [ ] **`TASK-408`** **Dynamic On-The-Go Alert & Swap Notification UI**
  - **Feature**: #16
  - **Target Files**: `frontend/src/features/plan/components/AdaptationToast.tsx`
  - **Acceptance Criteria**: Khi có thành viên đổi điểm do trời mưa, UI hiện thông báo toast và tự động cập nhật thẻ điểm dừng mới trên timeline và bản đồ.
  - **Docs & Tracking**: Cập nhật `docs/06-design/user-flows.md` + tick `[x]`.
- [ ] **`TASK-409`** **Shared Expense & Settlement UI Screen**
  - **Feature**: #40
  - **Target Files**: `frontend/src/features/expense/pages/ExpensePage.tsx`
  - **Acceptance Criteria**: Hiển thị tổng quỹ, ai đã chi, ai nợ ai bao nhiêu tiền kèm nút đánh dấu đã thanh toán thành công.
  - **Docs & Tracking**: Cập nhật `docs/06-design/user-flows.md` + tick `[x]`.
- [ ] **`TASK-410`** **Admin Dashboard UI Screen**
  - **Feature**: #41
  - **Target Files**: `frontend/src/features/admin/pages/AdminDashboardPage.tsx`
  - **Acceptance Criteria**: Biểu đồ thống kê số phòng hoạt động, token tiêu thụ, cache hit rate và thời gian phản hồi API (Recharts).
  - **Docs & Tracking**: Cập nhật `api-design-guide.md` + tick `[x]`.
