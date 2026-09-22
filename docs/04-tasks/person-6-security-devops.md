# 👤 Person 6 — Đinh Tiến Luân (Cyber Security & DevOps Engineer)

> **Người phụ trách**: **Đinh Tiến Luân**  
> **Sở hữu**: Hạ tầng Multi-Cloud (Vercel Edge CDN, Render Web Service & Worker, Supabase PostgreSQL 16 + Supavisor pooler port 6543, Upstash Redis), CI/CD GitHub Actions, Cấu hình Keep-Alive ping `/api/healthz`, OpenTelemetry Distributed Tracing, Supabase RLS Audit, Pentest OWASP Top 10, Grounding Benchmark (100 Prompts Test) và Locust Concurrency Stress Test.  
> **Quy định tracking bắt buộc**: Sau khi hoàn thành code và test mỗi task, đổi `[ ]` thành `[x]` kèm link PR, ngày hoàn thành và cập nhật tài liệu kỹ thuật tương ứng theo [post-task-documentation.md](../01-workflow/post-task-documentation.md).

---

## 📊 Progress Tracker

| Sprint | Số Tasks | Đã hoàn thành | Trạng thái |
|:---:|:---:|:---:|:---:|
| **Sprint 0** | 3 Tasks | 0/3 | 🔲 To Do |
| **Sprint 1** | 3 Tasks | 0/3 | 🔲 To Do |
| **Sprint 2** | 1 Task | 0/1 | 🔲 To Do |
| **Sprint 3** | 0 Tasks (Hỗ trợ Tracing & Chaos Test) | 0/0 | 🔲 To Do |
| **Sprint 4** | 4 Tasks | 0/4 | 🔲 To Do |
| **Tổng cộng** | **11 Tasks** | 0/11 | 🔲 Sẵn sàng bắt tay vào làm |

---

## 🛠️ Detailed Sprint Backlog

### Sprint 0 — Local Infrastructure & CI Pipeline
- [ ] **`TASK-006`** **Docker Compose & Môi Trường Phát Triển Cục Bộ**
  - **Mục tiêu**: Khởi động PostgreSQL 15, Redis 7 và FastAPI server cục bộ.
  - **Target Files**: `docker-compose.yml`, `backend/Dockerfile`, `.env.example`
  - **Acceptance Criteria**: `docker compose up -d` khởi chạy thành công toàn bộ service với health check pass.
  - **Docs & Tracking**: Cập nhật `.env.example` + tick `[x]`.
- [ ] **`TASK-007`** **GitHub Actions CI Pipeline Setup**
  - **Mục tiêu**: Tự động hóa kiểm tra code quality khi mở PR.
  - **Target Files**: `.github/workflows/ci.yml`
  - **Acceptance Criteria**: Pipeline chạy: `ruff check backend`, `pytest backend`, `pnpm run lint frontend`, `pnpm run test frontend`.
  - **Docs & Tracking**: Cập nhật `docs/01-workflow/git-workflow.md` + tick `[x]`.
- [ ] **`TASK-008`** **Pre-commit Hooks & Linter Configuration**
  - **Mục tiêu**: Chặn commit nếu code vi phạm convention.
  - **Target Files**: `.pre-commit-config.yaml`, `backend/pyproject.toml`
  - **Acceptance Criteria**: Chặn commit nếu Ruff hoặc Black phát hiện lỗi format.
  - **Docs & Tracking**: Cập nhật `docs/02-standards/coding-conventions.md` + tick `[x]`.

### Sprint 1 — Security Middlewares, Supabase RLS & Vercel Edge Deploy
- [ ] **`TASK-116`** **FastAPI Security Middlewares & Supabase RLS Audit**
  - **Feature**: #6
  - **Target Files**: `backend/app/main.py`, `docs/05-security/security-guidelines.md`
  - **Acceptance Criteria**: Cấu hình CORS restricted origins, TrustedHost, security headers, audit chính sách RLS trên Supabase.
  - **Docs & Tracking**: Cập nhật `docs/05-security/security-guidelines.md` + tick `[x]`.
- [ ] **`TASK-117`** **Auth Security Audit**
  - **Feature**: Security
  - **Target Files**: `backend/app/api/v1/auth.py`
  - **Acceptance Criteria**: Kiểm tra bcrypt cost $\ge 10$, JWT secret length $\ge 32$ chars, rate limit 10 req/min.
  - **Docs & Tracking**: Cập nhật `docs/05-security/security-guidelines.md` + tick `[x]`.
- [ ] **`TASK-118`** **Vercel Edge CDN Deploy Pipeline (Preview + Production)**
  - **Feature**: DevOps
  - **Target Files**: `vercel.json`, `.github/workflows/cd-frontend.yml`, `docs/03-architecture/deployment-guide.md`
  - **Acceptance Criteria**: Deploy tự động khi merge `main`, tự sinh Preview URL cho PR. Smoke test domain Vercel live với zero cold-start.
  - **Docs & Tracking**: Cập nhật `docs/03-architecture/deployment-guide.md` + tick `[x]`.

### Sprint 2 — Backend Deploy Pipeline (Render Web Service + Worker)
- [ ] **`TASK-216`** **Render Deploy Pipeline & Keep-Alive Ping Setup**
  - **Feature**: DevOps
  - **Target Files**: `render.yaml`, `backend/Dockerfile.prod`, `backend/app/api/healthz.py`, `.github/workflows/cd-backend.yml`
  - **Acceptance Criteria**: Render Blueprint (`render.yaml`) khởi tạo FastAPI web service + LangGraph worker. Endpoint `/api/healthz` phản hồi 200 OK. Thiết lập cron ping 10 phút chống sleep.
  - **Docs & Tracking**: Cập nhật `docs/03-architecture/deployment-guide.md` + tick `[x]`.

### Sprint 4 — Pentest, Grounding Benchmark & Locust Load Testing
- [ ] **`TASK-411`** **Input Sanitization & Prompt Injection Defense Audit**
  - **Feature**: Security
  - **Target Files**: `backend/app/ai_agents/`, `backend/app/schemas/`
  - **Acceptance Criteria**: Kiểm tra làm sạch dữ liệu đầu vào qua Pydantic v2 và bleach; kiểm thử các câu lệnh jailbreak prompt.
  - **Docs & Tracking**: Cập nhật `docs/05-security/security-guidelines.md` + tick `[x]`.
- [ ] **`TASK-412`** **OpenTelemetry Distributed Tracing Setup**
  - **Feature**: #42
  - **Target Files**: `backend/app/core/telemetry.py`
  - **Acceptance Criteria**: Đo lường và trực quan hóa độ trễ qua các chặng Gateway $\rightarrow$ Redis $\rightarrow$ AI Worker $\rightarrow$ DB $\rightarrow$ WebSocket.
  - **Docs & Tracking**: Cập nhật `docs/03-architecture/system-architecture.md` + tick `[x]`.
- [ ] **`TASK-413`** **Grounding Benchmark Verification (100 Prompts Test)**
  - **Feature**: AI Evaluation
  - **Target Files**: `backend/tests/evaluation/grounding_benchmark.py`
  - **Acceptance Criteria**: Chạy script 100 prompts tự động qua Google Places API; đạt tỷ lệ xác thực $\ge 98\%$ và **0% địa điểm ảo**.
  - **Docs & Tracking**: Cập nhật `docs/02-standards/testing-guide.md` + tick `[x]`.
- [ ] **`TASK-414`** **Locust Load Stress Test & Multi-Cloud Production Release**
  - **Feature**: Evaluation & DevOps
  - **Target Files**: `backend/tests/load_test/locustfile.py`, `docs/03-architecture/deployment-guide.md`
  - **Acceptance Criteria**: Giả lập 50--100 CCU trong 10--20 phòng trên môi trường production thật (Vercel + Render + Supabase + Upstash); duy trì thông lượng 150--250 req/s, tỷ lệ lỗi $< 0.5\%$, bộ nhớ worker $\le 512$\,MB RAM.
  - **Docs & Tracking**: Cập nhật `docs/03-architecture/deployment-guide.md` + tick `[x]`.
