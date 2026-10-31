# 📊 Task Board & Master Sprint Plan — 6 Thành Viên Chạy Song Song
## Dự án: TripMate AI — Intelligent Group Activity & Travel Planning Platform

> Xem bảng chia nhỏ micro-task chi tiết đến từng file & tiêu chí nghiệm thu tại **[TASKS.md](../TASKS.md)**.  
> Board này theo dõi tiến độ tổng thể với **6 cột dọc theo 6 thành viên** (Tạ Quang Huy, Hà Đăng Huy, Phạm Đình Ánh Dương, Nguyễn Minh Đức, Nguyễn Tùng Dương, Đinh Tiến Luân).

---

## 🚀 1. Sprint 0 — Contract Session (Ngày 1–2, Bắt buộc cả 6 người tham gia)

Xem quy trình chi tiết tại [contract-first-workflow.md](../01-workflow/contract-first-workflow.md) và micro-tasks tại [TASKS.md](../TASKS.md) (TASK-001 đến TASK-011).

- [ ] `TASK-001` `[BE-Core - Tạ Quang Huy]`: Thiết kế Schemas DB Supabase PostgreSQL 16 (`core`, `checkpoints`, `vectors`) & Supavisor Pooler port 6543
- [X] `TASK-002` `[BE-Services - Phạm Đình Ánh Dương]`: FastAPI APIRouter Skeleton & Swagger Docs
- [ ] `TASK-003` `[AI Lead - Nguyễn Tùng Dương & Tạ Quang Huy]`: Định nghĩa `AgentState` Two-Phase & Dữ liệu Fixtures JSON
- [x] `TASK-004` `[FE-Core - Hà Đăng Huy]`: MSW Mock Handlers Core APIs
- [ ] `TASK-005` `[FE-Growth - Nguyễn Minh Đức]`: MSW Mock Handlers Realtime AI Streaming Token & WS Events
- [ ] `TASK-006` `[DevOps/Sec - Đinh Tiến Luân]`: Docker Compose & Môi trường phát triển cục bộ
- [ ] `TASK-007` `[DevOps/Sec - Đinh Tiến Luân]`: Pipeline CI GitHub Actions tự động kiểm thử
- [ ] `TASK-008` `[DevOps/Sec - Đinh Tiến Luân]`: Cấu hình Pre-commit Hooks & Linter Ruff/Black
- [ ] `TASK-009` `[FE-Growth - Nguyễn Minh Đức]`: Design Tokens & Design System Spec (Tailwind & shadcn)
- [ ] `TASK-010` `[FE-Growth - Nguyễn Minh Đức]`: User Flows & Wireframes (Two-Stage Consensus & Dynamic Living Itinerary)
- [ ] `TASK-011` `[FE-Growth - Nguyễn Minh Đức]`: Hi-fi Mockups, Thư viện Component & Tiêu chuẩn WCAG AA

**Mốc ra khỏi Sprint 0**: Hợp đồng kỹ thuật (Contract) đã merge vào `main`, toàn bộ 6 thành viên bắt đầu code song song độc lập.

---

## ⚡ 2. Sprint 1–4 — 6 Track Chạy Song Song Độc Lập

| Track / Thành viên | Sprint 1 | Sprint 2 | Sprint 3 | Sprint 4 |
|---|---|---|---|---|
| **BE-Core & Consensus Engine**<br>*(Tạ Quang Huy)* | Supabase Core Models & Initial Migration (TASK-101) | Room CRUD APIs & RolesGuard Host vs Member (TASK-201, 202, 204) | Two-Stage Consensus Engine: Macro Lock, Stop Voting, 1-Click Swap, Final Lock & Living Itinerary (TASK-301..307) | FastAPI WebSocket Room Server & Redis Pub/Sub Live Sync (TASK-401..403) |
| **BE-Platform & FE-Core**<br>*(Hà Đăng Huy)* | HTTPX Async + Upstash Redis Cache & PyBreaker Base (TASK-107, 108) / Auth UI (TASK-111..113) | Places API, Lodging/Tours (Agoda/Klook), Weather & Currency (TASK-205..208) / Room Dashboard & Mapbox GL Canvas (TASK-212..215) | PyBreaker Fault Resilience Tuning / Interactive Timeline Draggable Cards & Consensus UI (TASK-314, 316) | Component Testing, Mapbox Navigation Polish & Responsive Cross-Browser Testing |
| **BE-Services & Settlement**<br>*(Phạm Đình Ánh Dương)* | Supabase Auth APIs, OAuth2, Password Hashing & JWT Rotation (TASK-102..106) | Invite via Link APIs & Pending Member Management (TASK-203) | Email Notifications (SMTP), PDF Lịch Trình (WeasyPrint) & Calendar (.ics) Export (TASK-311..313) | Thu Quỹ Nhóm & Thuật Toán Bù Trừ Nợ Tối Ưu Min-Cash-Flow (TASK-404, 415) |
| **FE-Growth & AI Experience**<br>*(Nguyễn Minh Đức)* | Landing Page Hero Showcase & Cấu hình Đa ngôn ngữ i18n (TASK-114, 115) | Dựng UI Room Chat Mock & Thẻ Xem Trước Khung Lộ Trình Vĩ Mô | Thẻ Bình Chọn Điểm Dừng (Stop Voting Cards UP/DOWN kèm 1-Click Swap) & Packing Checklist UI (TASK-315, 317) | Realtime Room Chat Token Streaming UI (TTFT < 800ms), UI Quyết Toán Chi Phí & Admin Dashboard (TASK-406..410) |
| **AI Agent Lead**<br>*(Nguyễn Tùng Dương)* | LangGraph Two-Phase State Machine & Model Abstraction DeepSeek-V4 (TASK-109, 110) | Phase 1 Macro State & Four-Tier Grounding: Pydantic Schema, Live Map Check, Haversine Geo-Clustering (TASK-209..211) | Phase 2 Micro State, Pre-fetched Backup Options & Typed Checkpoints via AsyncPostgresSaver (TASK-308..310) | Dynamic On-The-Go Adaptation Node (Khi trời mưa), Grounding Benchmark (100 Prompts Verification >= 98%) |
| **DevOps & Security**<br>*(Đinh Tiến Luân)* | FastAPI Security Middlewares, Supabase RLS Audit & Vercel Edge Deploy (TASK-116..118) | Render Deploy Pipeline (FastAPI Web Service + Anti-Sleep Ping `/api/healthz` + AI Worker) (TASK-216) | OpenTelemetry Distributed Tracing & Circuit Breaker Chaos Testing | Input Sanitization Audit, OWASP Pentest & Locust Load Stress Test (50-100 CCU, 150-250 req/s) (TASK-411..414) |

---

## 👥 3. Bảng Theo Dõi Tiến Độ Cá Nhân (6 Thành Viên)

| Thành viên | Phân công vai trò kỹ thuật | File task chi tiết | Danh mục mã Micro-Tasks | Trạng thái | Blocker |
|---|---|---|---|:---:|:---:|
| **Tạ Quang Huy** | Backend Core & AI DAL Bridge | [person-1-backend-core.md](person-1-backend-core.md) | TASK-001, TASK-101, TASK-201, 202, 204, TASK-301..307, TASK-401..403 | 🟡 In Progress (4/15 Done) | — |
| **Hà Đăng Huy** | Backend Platform & Frontend Core | [person-2-backend-platform.md](person-2-backend-platform.md) / [person-4-frontend-core.md](person-4-frontend-core.md) | TASK-107, 108, TASK-205..208, TASK-004, TASK-111..113, TASK-212..215, TASK-314, 316 | 🟡 In Progress (TASK-004, 107 Done) | — |
| **Phạm Đình Ánh Dương** | Backend Services & Settlement | [person-2-backend-platform.md](person-2-backend-platform.md) | TASK-002, TASK-102..106, TASK-203, TASK-311..313, TASK-404, 415 | 🟡 In Progress (TASK-002 Done) | — |
| **Nguyễn Minh Đức** | Frontend Growth & AI Experience | [person-5-frontend-growth.md](person-5-frontend-growth.md) | TASK-005, TASK-009..011, TASK-114, 115, TASK-315, 317, TASK-406..410 | 🔲 To Do | — |
| **Nguyễn Tùng Dương** | AI Agent Lead (DeepSeek-V4) | [person-3-ai-engineer.md](person-3-ai-engineer.md) | TASK-003, TASK-109, 110, TASK-209..211, TASK-308..310 | 🔲 To Do | — |
| **Đinh Tiến Luân** | Cyber Security & DevOps Engineer | [person-6-security-devops.md](person-6-security-devops.md) | TASK-006..008, TASK-116..118, TASK-216, TASK-411..414 | 🔲 To Do | — |

*Chú thích trạng thái:* 🔲 To Do · 🟡 In Progress · 🔵 In Review · ✅ Done · 🔴 Blocked
