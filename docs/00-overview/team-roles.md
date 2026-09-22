# 👥 Team & Roles — Mô Hình Phân Công 6 Thành Viên Theo Proposal

> Tài liệu phân công trách nhiệm chi tiết, cơ chế phối hợp song song và ma trận RACI cho 6 thành viên trong dự án **TripMate AI: Intelligent Group Activity & Travel Planning Platform**.

---

## 🎯 1. Nguyên Tắc Phân Công (6 Track Chuyên Biệt Chạy Song Song)

Dự án được phân bổ đồng đều cho 6 thành viên phụ trách các mảng công việc chuyên biệt và kiêm nhiệm phù hợp:

- **Backend Core & AI Integration (1 người)**: **Tạ Quang Huy**
- **Backend Platform & Frontend Core (1 người)**: **Hà Đăng Huy**
- **Backend Services & Settlement (1 người)**: **Phạm Đình Ánh Dương**
- **Frontend AI Experience & Growth UI (1 người)**: **Nguyễn Minh Đức**
- **AI Agent Lead (1 người)**: **Nguyễn Tùng Dương**
- **DevOps & Cyber Security Engineer (1 người)**: **Đinh Tiến Luân**

Mỗi thành viên làm việc song song từ Sprint 0 thông qua **Hợp đồng giao diện (Contract-First)** chốt trước — không ai phải chờ ai. Xem quy trình chi tiết tại [contract-first-workflow.md](../01-workflow/contract-first-workflow.md).

---

## 📋 2. Phân Công Chi Tiết & File Theo Dõi Cá Nhân

| # | Thành viên | Vai trò kỹ thuật chính | Mảng kiến trúc sở hữu | File task cá nhân |
|:---:|---|---|---|:---:|
| 1 | **Tạ Quang Huy** | **Backend Dev A (Core Domain)** & **AI Integration** | Thiết kế Schema DB Supabase gốc (`core`, `checkpoints`), Event/Room CRUD, Two-Stage Consensus APIs (Macro Lock & Final Lock), RolesGuard (Host vs Member), Data Access Layer (DAL) Bridge cho AI Agent, WebSocket Room Server. | [person-1-backend-core.md](../04-tasks/person-1-backend-core.md) |
| 2 | **Hà Đăng Huy** | **Backend Dev B (Platform)** & **Frontend Dev A (Core UI)** | Tích hợp External Travel APIs (Google Places, Agoda, Booking.com, Klook), PyBreaker Circuit Breaker (timeout 2.5s), Upstash Redis Cache; Dựng UI Auth, Room Dashboard, Dòng thời gian tương tác (Interactive Timeline), Bản đồ Mapbox GL. | [person-2-backend-platform.md](../04-tasks/person-2-backend-platform.md) / [person-4-frontend-core.md](../04-tasks/person-4-frontend-core.md) |
| 3 | **Phạm Đình Ánh Dương** | **Backend Dev C (Services & Settlement)** | Tích hợp Supabase Auth & JWT rotation, Hệ thống mời tham gia phòng qua Link (`Invitation`), Notification Services (SMTP), Xuất PDF lịch trình & Calendar (.ics), Quản lý chi phí nhóm & Thuật toán thanh toán nợ tối ưu (Optimal Settlement). | [person-2-backend-platform.md](../04-tasks/person-2-backend-platform.md) |
| 4 | **Nguyễn Minh Đức** | **Frontend Dev B (AI Experience & Growth UI)** | UI Màn hình Chat phòng cộng tác thời gian thực & AI Streaming token, Thẻ bình chọn điểm dừng (Stop Voting Cards UP/DOWN kèm 1-Click Swap), Design Tokens & Design System (Tailwind/shadcn), Đa ngôn ngữ (i18n), UI Quyết toán chi phí & Admin Dashboard. | [person-5-frontend-growth.md](../04-tasks/person-5-frontend-growth.md) |
| 5 | **Nguyễn Tùng Dương** | **AI Agent Lead (LangGraph & DeepSeek-V4)** | Kiến trúc Unified AI Agent trên LangGraph Python, Máy trạng thái 2 pha (Phase 1: Macro State, Phase 2: Micro State), Model Abstraction Layer (DeepSeek-V4 + Fallback GPT-4o/Claude/Gemini), Four-Tier Grounding Pipeline, Thuật toán Haversine Geo-Clustering. | [person-3-ai-engineer.md](../04-tasks/person-3-ai-engineer.md) |
| 6 | **Đinh Tiến Luân** | **DevOps & Cyber Security Engineer** | Thiết lập CI/CD GitHub Actions, Triển khai đám mây (Vercel Edge CDN + Render Web Service/Worker + Supabase DB + Upstash Redis), Cấu hình Keep-Alive ping `/api/healthz`, OpenTelemetry Distributed Tracing, Supabase RLS Audit, Pentest OWASP Top 10, Concurrency Benchmark (Locust/k6). | [person-6-security-devops.md](../04-tasks/person-6-security-devops.md) |

---

## ⚡ 3. Cơ Chế Chạy Song Song Không Bị Nghẽn (Parallel Execution)

| Trở ngại tiềm tàng | Giải pháp xử lý giúp 6 người code độc lập từ Ngày 1 |
|---|---|
| **AI Agent phải chờ Backend hoàn thành Database** | Trong Sprint 0, cả team chốt DB Schema & Pydantic DTOs. AI Agent (Nguyễn Tùng Dương & Tạ Quang Huy) code thẳng lên **mock fixtures JSON** (`fixtures/mock_places.json`) theo đúng Pydantic schema mà không cần DB thật. |
| **Frontend phải chờ Backend xong REST/WS APIs** | Frontend (Hà Đăng Huy & Nguyễn Minh Đức) sử dụng **Mock Service Worker (MSW)** giả lập API response và streaming WebSocket chunks theo đúng OpenAPI spec chốt trước. |
| **Bảo mật và DevOps thường bị dồn về cuối kỳ** | DevOps & Security (Đinh Tiến Luân) thiết lập CI/CD, linter, pre-commit hooks, quy chuẩn bảo mật Pydantic, kết nối Vercel/Render/Supabase ngay từ Sprint 0 và kiểm thử xuyên suốt từng Sprint. |
| **Xung đột khi tích hợp (Merge Conflicts)** | Mỗi người có một file task cá nhân độc lập (`docs/04-tasks/person-X-*.md`) với danh mục file mục tiêu (Target Files) rõ ràng, phân vùng code rành mạch. |

---

## 📊 4. Ma Trận Trách Nhiệm Phối Hợp (RACI Matrix)

*Chú giải:*
- **R (Responsible)**: Người trực tiếp thực hiện công việc.
- **A (Accountable)**: Người chịu trách nhiệm cao nhất về chất lượng đầu ra.
- **C (Consulted)**: Người được tham vấn ý kiến kỹ thuật khi thực hiện.
- **I (Informed)**: Người được thông báo kết quả sau khi hoàn thành.

| Hạng mục công việc kỹ thuật | Tạ Quang Huy (BE Core/AI) | Hà Đăng Huy (BE Plat/FE Core) | Phạm Đình Ánh Dương (BE Serv) | Nguyễn Minh Đức (FE Growth) | Nguyễn Tùng Dương (AI Lead) | Đinh Tiến Luân (DevOps/Sec) |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **DB Schemas & Supavisor Pooler** | **R/A** | C | C | C | C | C |
| **Supabase Auth & JWT Rotation** | C | **R** (UI) | **R/A** | I | I | **R** (Sec Audit) |
| **Room & Two-Stage Consensus APIs** | **R/A** | **R** (UI) | C | **R** (UI) | C (State Sync) | C |
| **External APIs & PyBreaker Resilience** | I | **R/A** | C | I | C (Tool Calling) | C |
| **WebSocket Room Server & Redis Pub/Sub** | **R/A** | I | C | **R** (UI) | C | C |
| **Unified AI Agent & Two-Phase States** | C (DAL Bridge) | I | I | I | **R/A** | **R** (Sec Audit) |
| **Four-Tier Grounding & Geo-Clustering** | C | C (Places) | I | I | **R/A** | I |
| **UI Room Chat, Timeline & Voting Cards** | C | **R** (Timeline) | I | **R/A** (Cards/Chat) | C | I |
| **PDF & .ics Calendar Export** | I | I | **R/A** | C (UI) | I | I |
| **Shared Expenses & Settlement** | C (Review) | I | **R/A** (Logic) | **R** (UI) | I | I |
| **Cloud Deploy (Vercel, Render, Supabase)** | C | C | C | C | C | **R/A** |
| **OpenTelemetry Tracing & Load Benchmarks** | C | C | C | C | C | **R/A** |
| **Docs-as-Code & Progress Tracking** | **R/A** | **R/A** | **R/A** | **R/A** | **R/A** | **R/A** |

---

## 🔄 5. Nguyên Tắc Đồng Bộ & Theo Dõi Tiến Độ Hàng Ngày

1. **Thông báo đổi Contract tức thì**: Khi có bất kỳ thay đổi nào về API endpoint, field trong DB Schema hoặc State của AI Agent, thành viên phải thông báo ngay trên kênh `#contract-changes` trước khi sửa code.
2. **Daily Async Update (Trước 10:00 AM)**: Từng thành viên gửi cập nhật 3 dòng (Hôm qua làm gì, hôm nay làm gì, có blocker gì không) lên kênh chung.
3. **Quy định Docs & Tracking bắt buộc ("No Docs = No Merge")**: Mọi PR đều phải kèm commit tick `[x]` vào task board cá nhân và `docs/TASKS.md`, đồng thời cập nhật tài liệu kỹ thuật tương ứng.
4. **Weekly Integration Sync (Cuối mỗi Sprint)**: 1 buổi họp kiểm thử ghép nối toàn diện giữa Frontend thật (Vercel), Backend thật (Render), AI Worker thật và Database thật (Supabase).
