# Hướng Dẫn Đóng Góp (Contributing Guide) — TripMate AI

Chào mừng bạn đến với dự án **TripMate AI: Intelligent Group Activity & Travel Planning Platform**!  
Dự án được xây dựng bởi nhóm 6 thành viên: **Tạ Quang Huy, Hà Đăng Huy, Phạm Đình Ánh Dương, Nguyễn Minh Đức, Nguyễn Tùng Dương, Đinh Tiến Luân**.

Mọi thành viên **bắt buộc đọc [guides.md](guides.md)** (15 phút) và tuân thủ quy trình làm việc chuẩn hóa dưới đây trước khi bắt tay vào code.

---

## ⚡ 1. Khởi Động Nhanh Môi Trường Dev

```bash
git clone <repo-url>
cd Group_Project

# --- Backend (FastAPI Python 3.11+) ---
cd backend
cp ../.env.example .env    # Điền API keys cần thiết
docker compose up -d        # Khởi động PostgreSQL + Redis local
poetry install              # Cài dependencies
poetry run alembic upgrade head
poetry run uvicorn app.main:app --reload --port 8000

# --- Frontend (React 18 + Vite + TypeScript) ---
cd ../frontend
pnpm install
pnpm run dev
```
- Swagger API Docs: `http://localhost:8000/docs`
- Web UI: `http://localhost:5173`

---

## 🔄 2. Quy Trình Làm Việc Tiêu Chuẩn (5 Bước Bắt Buộc)

Xem chi tiết tại [post-task-documentation.md](docs/01-workflow/post-task-documentation.md):

1. **Nhận Task & Đổi Trạng Thái**: Nhận mã task từ [task-board.md](docs/04-tasks/task-board.md), chuyển sang `🟡 In Progress`. Tạo branch theo mẫu `feature/TASK-xxx-mo-ta-ngan`.
2. **Code Chuẩn Convention & Clean Code**: 
   - Tuân thủ [coding-conventions.md](docs/02-standards/coding-conventions.md) và [naming-conventions.md](docs/02-standards/naming-conventions.md).
   - Áp dụng nguyên lý **SOLID**, **Low Coupling** (giảm phụ thuộc) & **High Cohesion** (tăng gắn kết).
   - **Frontend**: Phân tách rõ ràng 3 lớp **HTML/JSX** (giao diện), **CSS Modules / Tailwind** (định kiểu, tuyệt đối không inline style), và **Custom Hooks / Services** (logic/API).
   - **Hàm & Class ngắn gọn**: Hàm < 50 dòng, tham số ≤ 3, class/component < 200 dòng.
   - **Hạn chế tuyệt đối Hardcode**: Toàn bộ magic numbers, magic strings, URLs, colors phải đưa vào Constants, Enums hoặc `.env`.
3. **Chạy Test & Lint Sạch Sẽ (Bắt buộc kèm Unit/Integration Test)**: 
   - Backend: Viết unit/integration test với Pytest (`poetry run pytest`), chạy linter `poetry run ruff check .`.
   - Frontend: Viết test với Vitest (`pnpm run test`), chạy linter `pnpm run lint`.
   - Test theo cấu trúc **AAA (Arrange - Act - Assert)**, bao phủ cả Happy Path và Unhappy Path (trường hợp biên, ngoại lệ).
4. **Viết Docs & Tick Tracking Board**:
   - Cập nhật tài liệu kỹ thuật liên quan: `api-design-guide.md`, `database-schema.md`, `ai-agent-architecture.md`, `.env.example`.
   - Tick `[x]` vào file task cá nhân (`docs/04-tasks/person-X-*.md`) và `docs/TASKS.md` kèm thông tin PR.
5. **Mở PR Bằng Template**: Điền đầy đủ mục `Updated Docs`. Phải có ít nhất 1 Approve + CI xanh + Docs đầy đủ mới được **Squash and Merge**.

---

## 🚫 3. Những Việc Tuyệt Đối Không Được Làm (Zero Tolerance)

- ❌ **Push trực tiếp lên nhánh `main`**.
- ❌ **Commit file `.env` hoặc bất kỳ secret/API key thật nào lên GitHub**.
- ❌ **Merge PR khi chưa cập nhật tài liệu kỹ thuật và chưa tick task board ("No Docs = No Merge")**.
- ❌ **Tự ý sửa đổi DB Schema, Contract API, hoặc State của AI Agent mà không thông báo trên `#contract-changes`**.
- ❌ **Để AI Agent tự động chốt quyết định thay con người mà không qua xác nhận của Host/Owner**.
- ❌ **Sửa code trong module của thành viên khác mà không thảo luận trước** (xem [cross-team-collaboration.md](docs/01-workflow/cross-team-collaboration.md)).

---

## 🤝 4. Quy Trình Phối Hợp & Hỗ Trợ

- **Bàn giao task & nhờ người khác hỗ trợ**: Tham khảo [cross-team-collaboration.md](docs/01-workflow/cross-team-collaboration.md).
- **Thắc mắc về Contract & Schema**: Trao đổi trên kênh `#contract-changes`.
- **Báo cáo tiến độ**: Gửi daily update 3 dòng trước 10:00 sáng mỗi ngày.
- **Bản đồ tài liệu đầy đủ**: Xem tại [README.md](README.md).
