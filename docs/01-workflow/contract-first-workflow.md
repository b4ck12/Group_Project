# 🤝 Contract-First Workflow — Cơ Chế Cho 6 Thành Viên Code Song Song
## Dự án: TripMate AI — Intelligent Group Activity & Travel Planning Platform

> **Nguyên tắc vàng**: "Chốt hợp đồng giao diện (Contract) trước khi viết code triển khai" để 6 thành viên (**Tạ Quang Huy, Hà Đăng Huy, Phạm Đình Ánh Dương, Nguyễn Minh Đức, Nguyễn Tùng Dương, Đinh Tiến Luân**) code song song ngay từ Ngày 1 mà không ai phải chờ đợi ai.

---

## ⚡ 1. Vì Sao Phải Áp Dụng Contract-First?

Nếu làm theo cách truyền thống: *"Backend viết xong API $\rightarrow$ Frontend mới code UI $\rightarrow$ AI Engineer mới tích hợp"*, 6 người sẽ bị nghẽn (blocked) liên tục.  
Với mô hình **Contract-First**:
- Cả nhóm chốt trước **Database Schema** (Supabase PostgreSQL 16) và **OpenAPI Specification** (FastAPI).
- **Frontend** dùng Mock Service Worker (MSW) giả lập response đúng hợp đồng để dựng toàn bộ giao diện (Room Chat, Timeline, Voting Cards, Mapbox).
- **AI Agent Lead** dùng dữ liệu mock fixtures JSON (`mock_places.json`, `mock_roadmaps.json`) để xây dựng đồ thị LangGraph máy trạng thái 2 pha (Phase 1 & Phase 2).
- **Security & DevOps** dựng sẵn pipeline CI/CD, linter, Docker local và kết nối hạ tầng đám mây (Vercel, Render, Supabase).
- Khi đến **Integration Day**, nhóm chỉ việc tắt mock và kết nối thật — tỷ lệ lỗi ghép nối giảm trên 90%.

---

## 📐 2. Bộ Hợp Đồng Kỹ Thuật (Contract) Gồm Những Gì?

1. **Database Schema Supabase** (`core`, `checkpoints`, `vectors`): Xem [database-schema.md](../03-architecture/database-schema.md).
2. **OpenAPI Specification & Endpoints**: Toàn bộ endpoints Two-Stage Consensus, 1-Click Swap, Stop Voting, WebSocket payloads: Xem [api-design-guide.md](../02-standards/api-design-guide.md).
3. **Pydantic Schemas & DTOs**: Backend định nghĩa các Pydantic v2 schemas (`backend/app/schemas/`), Frontend ánh xạ sang TypeScript interfaces tương ứng trong `frontend/src/types/`.

---

## 🚀 3. Sprint 0: Contract Session (Ngày 1–2, Bắt buộc cả 6 người)

1. **Tạ Quang Huy (Backend Core)**: Trình bày đề xuất schema Supabase (`core.events`, `core.plans`, `core.plan_stops`, `core.plan_votes`) và cấu hình Supavisor connection pooler port 6543. Cả nhóm thảo luận và chốt cấu trúc.
2. **Phạm Đình Ánh Dương (Backend Services)**: Thống nhất các endpoint Auth, Invitations qua link, Quỹ nhóm & Optimal Settlement (TASK-002).
3. **Nguyễn Tùng Dương (AI Lead)**: Chốt schema `AgentState` cho 2 pha trạng thái (Phase 1 Macro State & Phase 2 Micro State), thống nhất các trường của Four-Tier Grounding (TASK-003).
4. **Hà Đăng Huy & Nguyễn Minh Đức (Frontend)**: Chốt danh sách mock handlers trong `frontend/src/mocks/` để giả lập REST APIs và token streaming qua WebSockets (TASK-004, TASK-005).
5. **Đinh Tiến Luân (DevOps/Sec)**: Chốt Docker compose local, CI workflow, và cấu hình biến môi trường `.env.example` (TASK-006..008).
6. **Mốc ra khỏi Sprint 0**: Toàn bộ Contract được commit và merge vào `main` làm nguồn sự thật duy nhất (Single Source of Truth).

---

## 🔄 4. Quy Tắc Thay Đổi Contract Giữa Chừng

> ⚠️ **Nghiêm cấm tự ý sửa đổi contract âm thầm trong local code**.

Nếu trong quá trình làm việc phát hiện cần thêm trường dữ liệu hoặc đổi cấu trúc API:
1. **Thông báo ngay trên kênh `#contract-changes`**: Nêu rõ lý do đổi, field nào thêm/sửa, và những ai bị ảnh hưởng.
2. **Cập nhật tài liệu kỹ thuật trước**: Mở PR cập nhật `api-design-guide.md` hoặc `database-schema.md` trước.
3. **Các thành viên liên quan cập nhật mock**: Frontend và AI Agent cập nhật MSW handlers hoặc fixtures JSON tương ứng.
4. **Nguyên tắc tương thích ngược (Backward Compatibility)**: Ưu tiên thêm trường mới có giá trị mặc định (`Optional` / nullable) thay vì xóa hoặc đổi tên trường cũ.

---

## 🎯 5. Integration Day (Ngày Ghép Nối Cuối Mỗi Sprint)

- Vào ngày cuối cùng của mỗi Sprint, nhóm dành **nửa ngày** để thực hiện kiểm thử tích hợp toàn diện:
  1. Frontend tắt cờ `VITE_USE_MOCK=false`, trỏ trực tiếp vào Backend Gateway trên Render (hoặc local).
  2. AI Worker kết nối trực tiếp với database Supabase và Upstash Redis thật.
  3. Chạy luồng Two-Stage Consensus thực tế từ tạo phòng $\rightarrow$ Macro Lock $\rightarrow$ Stop Voting $\rightarrow$ 1-Click Swap $\rightarrow$ Final Lock.
  4. Nếu có lỗi phát sinh, ghi nhận vào Task Board và ưu tiên sửa ngay trước khi bước sang Sprint mới.
