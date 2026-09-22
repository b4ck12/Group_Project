# 🧭 TripMate AI: Intelligent Group Activity & Travel Planning Platform
### Unified AI Agent Architecture, Cloud Deployment & Production Engineering

[![CI Pipeline](https://github.com/minhduc1212/Group_Project/actions/workflows/ci.yml/badge.svg)](https://github.com/minhduc1212/Group_Project/actions)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB.svg?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3+-61DAFB.svg?logo=react&logoColor=black)](https://react.dev/)
[![LangGraph](https://img.shields.io/badge/LangGraph-Python-FF6F00.svg)](https://langchain-ai.github.io/langgraph/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres_16-3ECF8E.svg?logo=supabase&logoColor=white)](https://supabase.com/)
[![Upstash](https://img.shields.io/badge/Upstash-Redis_7-00E699.svg?logo=redis&logoColor=white)](https://upstash.com/)

> **Đồ án Kỹ thuật Nhóm (Group Project)**: Nền tảng lập kế hoạch hoạt động nhóm và du lịch thông minh, ứng dụng **mô hình AI Agent hợp nhất (DeepSeek-V4)** chạy trên **LangGraph Python**, kiến trúc đám mây đa nền tảng (**Vercel, Render, Supabase, Upstash Redis**) và quy trình chốt đồng thuận 2 giai đoạn (Two-Stage Consensus Planning Flow).

---

## 👥 Nhóm Thực Hiện (6 Thành Viên)

| STT | Họ và Tên | Vai Trò Chính | Trách Nhiệm Kỹ Thuật | Task File |
|:---:|---|---|---|:---:|
| 1 | **Tạ Quang Huy** | Backend Dev A (Core Domain) & AI Integration | Thiết kế Schema DB gốc Supabase, Event/Room Management, Two-Stage Consensus APIs, RolesGuard, LangGraph DAL Bridge, WebSocket Room Server | [person-1-backend-core.md](docs/04-tasks/person-1-backend-core.md) |
| 2 | **Hà Đăng Huy** | Backend Dev B (Platform) & Frontend Dev A (Core UI) | External Travel APIs (Places, Agoda, Klook), PyBreaker Circuit Breaker, Upstash Redis Cache, React 18 Core UI, Auth, Mapbox GL Canvas | [person-2-backend-platform.md](docs/04-tasks/person-2-backend-platform.md) / [person-4-frontend-core.md](docs/04-tasks/person-4-frontend-core.md) |
| 3 | **Phạm Đình Ánh Dương** | Backend Dev C (Services & Settlement) | Supabase Auth Integration, Link Invitations, Notification Services, PDF & Calendar (.ics) Export, Quản lý tài chính & Optimal Settlement | [person-2-backend-platform.md](docs/04-tasks/person-2-backend-platform.md) |
| 4 | **Nguyễn Minh Đức** | Frontend Dev B (AI Experience & Growth UI) | Realtime Room Chat & AI Streaming UI, Interactive Timeline, Stop Voting Cards (1-Click Swap), Design System, Shared Expenses UI | [person-5-frontend-growth.md](docs/04-tasks/person-5-frontend-growth.md) |
| 5 | **Nguyễn Tùng Dương** | AI Agent Lead (LangGraph & DeepSeek-V4) | Unified AI Agent Architecture, Two-Phase State Machine, Model Abstraction Layer, Four-Tier Grounding Pipeline, Geo-Clustering | [person-3-ai-engineer.md](docs/04-tasks/person-3-ai-engineer.md) |
| 6 | **Đinh Tiến Luân** | Cyber Security & DevOps Engineer | Multi-Cloud Deployment (Vercel + Render + Supabase), CI/CD GitHub Actions, OpenTelemetry Tracing, Pentest OWASP Top 10, Concurrency Benchmark | [person-6-security-devops.md](docs/04-tasks/person-6-security-devops.md) |

---

## 🎯 Điểm Nhấn Kiến Trúc (Theo Technical Proposal)

1. **Quy Trình Đồng Thuận 2 Giai Đoạn (Two-Stage Consensus Planning Flow)**:
   - **Giai đoạn 1 (Macro Consensus)**: Thu thập mong muốn nhóm qua Room Chat $\rightarrow$ AI Agent lên khung lộ trình vĩ mô (chủ đề ngày, nhịp độ) $\rightarrow$ Cả nhóm thảo luận và Host khóa Roadmap (**Consensus Checkpoint 1**) trước khi gọi các API địa điểm tốn kém.
   - **Giai đoạn 2 (Micro Curation & Granular Stop Voting)**: AI Agent truy vấn địa điểm thực tế, áp dụng thuật toán gom cụm địa lý (2--3 km geo-clustering) $\rightarrow$ Thành viên bình chọn UP / DOWN từng điểm dừng, hỗ trợ đổi địa điểm dự phòng trong 1 click (1-Click Swap) $\rightarrow$ Host chốt kế hoạch chính thức (**Consensus Checkpoint 2**).
   - **Lịch trình Động (Living Itinerary)**: Cho phép điều chỉnh linh hoạt ngay trong chuyến đi (ví dụ trời mưa đổi quán cafe) bằng cách cập nhật chính xác 1 dòng duy nhất trong bảng `plan_stops`.
2. **AI Agent Hợp Nhất & Đáng Tin Cậy (Unified DeepSeek-V4 Agent & Four-Tier Grounding)**:
   - Một agent duy nhất trong **LangGraph Python** hoạt động với 2 pha trạng thái tách biệt (**Phase 1: Macro Planning State** và **Phase 2: Micro Curation State**).
   - **Lớp trừu tượng hóa mô hình (Model Abstraction Layer)**: DeepSeek-V4 làm bộ não suy luận chính, tự động fallback sang GPT-4o, Claude, hoặc Gemini để chống vendor lock-in.
   - **Four-Tier Grounding Pipeline**: Loại bỏ hoàn toàn ảo giác AI thông qua (1) Strict Pydantic Schema, (2) Live Map Check (Google Places & OpenStreetMap), (3) Distance Guard ($\le 2.5$\,km, di chuyển $\le 20$\,phút), (4) Granular Member Voting & Pre-fetched Backups.
   - **Typed State Checkpointing**: Lưu vết trạng thái hội thoại vào PostgreSQL qua `AsyncPostgresSaver` kết nối Data Access Layer (DAL).
3. **Hạ Tầng Điện Toán Đám Mây Sẵn Sàng Vận Hành (Cloud Deployment Architecture)**:
   - **Frontend**: React 18 SPA trên **Vercel Global Edge CDN** (Zero cold-start latency).
   - **Backend Gateway**: FastAPI (Python 3.11+) trên **Render.com Web Service** (REST + WebSocket room server, anti-sleep keep-alive ping tới `/api/healthz`).
   - **AI Agent Worker**: LangGraph Worker trên **Render.com** (tiêu thụ RAM $\le 512$\,MB, lắng nghe hàng đợi tác vụ qua Redis Streams).
   - **Cơ Sở Dữ Liệu & BaaS**: **Supabase PostgreSQL 16 + pgvector** với **Supavisor Connection Pooler (port 6543, Transaction Mode)** ghép 200+ phiên người dùng qua 15 kết nối vật lý, bảo mật Row Level Security (RLS).
   - **Hàng Đợi & Bộ Nhớ Đệm**: **Upstash Redis 7** xử lý hàng đợi bất đồng bộ (Redis Streams `XADD`/`XREADGROUP`), phát sóng sự kiện đa máy chủ (Redis Pub/Sub `plan:updated`), và L2 Cache lưu trữ địa điểm 24h.
   - **Độ Bền & Giám Sát**: **PyBreaker Circuit Breaker** (timeout 2.5s, tự động chuyển về cache/DB khi API ngoài lỗi), **OpenTelemetry** truy vết phân tán, và **LangSmith** theo dõi LLM.

---

## 📚 Bản Đồ Tài Liệu Kỹ Thuật (Documentation Map)

> ⚠️ **Quy tắc bắt buộc cho mọi thành viên**: **"No Docs = Not Done & No Merge"**.  
> Mọi thay đổi code đều phải đi kèm cập nhật tài liệu kỹ thuật và đánh dấu tracking tiến độ trên task board tương ứng.

### 00 — Tổng Quan Dự Án
- [🚀 Hướng Dẫn Bắt Đầu & Lộ Trình Đọc Docs (guides.md)](guides.md) — **ĐỌC ĐẦU TIÊN: Lộ trình 15 phút theo đúng vai trò của bạn**
- [Project Overview](docs/00-overview/project-overview.md) — Bài toán, giải pháp, phạm vi, KPIs và tiêu chí đánh giá
- [Danh Sách Tính Năng Chi Tiết (feature.md)](feature.md) — Hệ thống tính năng phân bổ theo proposal
- [Giải Thích Luồng Vận Hành Hệ Thống (explain.md)](explain.md) — Luồng nghiệp vụ chi tiết, 6 interface, 8 bước xử lý, dynamic on-the-go adaptation
- [Tech Stack & Cloud Platforms](docs/00-overview/tech-stack.md) — Bảng công nghệ và phân bổ nền tảng đám mây
- [Team & Roles](docs/00-overview/team-roles.md) — Mô hình phân công 6 người, ma trận RACI và cơ chế phối hợp

### 01 — Quy Trình Làm Việc & Tracking (Workflow)
- [Post-Task Documentation & Tracking Workflow](docs/01-workflow/post-task-documentation.md) — **Quy trình viết docs và tracking bắt buộc sau mỗi task**
- [Contract-First Workflow](docs/01-workflow/contract-first-workflow.md) — Cơ chế làm việc song song không chờ đợi từ Sprint 0
- [Cross-Team Collaboration](docs/01-workflow/cross-team-collaboration.md) — Quy trình hỗ trợ, đổi module và bàn giao task
- [Git Workflow](docs/01-workflow/git-workflow.md) — Phân nhánh, chu trình PR và merge
- [Branch Naming](docs/01-workflow/branch-naming.md) — Quy tắc đặt tên branch chuẩn
- [Commit Convention](docs/01-workflow/commit-convention.md) — Chuẩn Conventional Commits
- [Code Review Checklist](docs/01-workflow/code-review-checklist.md) — Checklist review và cổng chặn tài liệu (Documentation Gate)

### 02 — Tiêu Chuẩn Kỹ Thuật (Standards)
- [Documentation Guide](docs/02-standards/documentation-guide.md) — Hướng dẫn viết tài liệu kỹ thuật, comment và ADR
- [API Design Guide](docs/02-standards/api-design-guide.md) — Chuẩn REST API endpoints, WebSocket payload, và Two-Stage Consensus flows
- [Coding Conventions](docs/02-standards/coding-conventions.md) — Tiêu chuẩn code Python FastAPI (Ruff/Black) & React TypeScript
- [Naming Conventions](docs/02-standards/naming-conventions.md) — Quy tắc đặt tên biến, hàm, schema, model, file
- [Testing Guide](docs/02-standards/testing-guide.md) — Chuẩn kiểm thử Unit, Integration, Grounding Benchmark và Locust stress test

### 03 — Kiến Trúc Hệ Thống (Architecture)
- [System Architecture](docs/03-architecture/system-architecture.md) — Sơ đồ kiến trúc 6 interface, 8 bước thực thi và hạ tầng Cloud
- [AI Agent Architecture](docs/03-architecture/ai-agent-architecture.md) — Thiết kế Unified DeepSeek-V4 Agent, Two-Phase States, Four-Tier Grounding
- [Database Schema](docs/03-architecture/database-schema.md) — Mô hình dữ liệu Supabase PostgreSQL 16 (`core`, `checkpoints`, `vectors`), RLS policies
- [Deployment Guide](docs/03-architecture/deployment-guide.md) — Hướng dẫn triển khai Vercel, Render, Supabase, Upstash Redis

### 04 — Kế Hoạch & Tiến Độ (Tasks & Tracking)
- [Master Task Breakdown (TASKS.md)](docs/TASKS.md) — **Toàn bộ micro-tasks chi tiết cho từng file & acceptance criteria**
- [Task Board Tổng (task-board.md)](docs/04-tasks/task-board.md) — Bảng theo dõi tiến độ tổng thể 6 track song song
- [Person 1 — Tạ Quang Huy (Backend Core & AI Integration)](docs/04-tasks/person-1-backend-core.md)
- [Person 2 — Hà Đăng Huy & Phạm Đình Ánh Dương (Backend Platform & Services)](docs/04-tasks/person-2-backend-platform.md)
- [Person 3 — Nguyễn Tùng Dương & Tạ Quang Huy (AI Agent Team)](docs/04-tasks/person-3-ai-engineer.md)
- [Person 4 — Hà Đăng Huy (Frontend Core Flows UI)](docs/04-tasks/person-4-frontend-core.md)
- [Person 5 — Nguyễn Minh Đức (Frontend AI Experience & Growth UI)](docs/04-tasks/person-5-frontend-growth.md)
- [Person 6 — Đinh Tiến Luân (Cyber Security & DevOps Engineer)](docs/04-tasks/person-6-security-devops.md)

### 05 — Bảo Mật (Security)
- [Security Guidelines](docs/05-security/security-guidelines.md) — Supabase RLS, Atomic voting updates, Prompt Injection Defense, Checkpoint Recovery

---

## 🚀 Khởi Động Nhanh Cho Lập Trình Viên Mới

1. Đọc ngay [guides.md](guides.md) (15 phút) theo đúng vai trò của mình.
2. Thiết lập môi trường phát triển local theo hướng dẫn ở Mục 2 của [guides.md](guides.md).
3. Nhận task được phân công tại [task-board.md](docs/04-tasks/task-board.md).
4. Code, test, cập nhật docs tương ứng, và mở PR tuân thủ [post-task-documentation.md](docs/01-workflow/post-task-documentation.md).
