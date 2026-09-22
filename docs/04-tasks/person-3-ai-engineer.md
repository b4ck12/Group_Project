# 👤 Person 3 — Nguyễn Tùng Dương & Tạ Quang Huy (AI Agent Team: LangGraph & DeepSeek-V4)

> **Người phụ trách**: 
> - **Nguyễn Tùng Dương** (AI Agent Lead: Unified Agent Architecture, Two-Phase State Machine, Model Abstraction Layer, Four-Tier Grounding Pipeline, Haversine Geo-Clustering)
> - **Tạ Quang Huy** (AI Integration Bridge: Data Access Layer DAL, Typed Checkpointing Bridge & Tool Calling)  
> **Sở hữu**: Toàn bộ hệ thống AI Agent trên nền tảng LangGraph Python và mô hình DeepSeek-V4 theo đúng Technical Proposal. Chạy song song từ Sprint 1 bằng **mock fixtures JSON**, không phụ thuộc vào tiến độ database thật.  
> **Quy định tracking bắt buộc**: Sau khi hoàn thành code và test mỗi task, đổi `[ ]` thành `[x]` kèm link PR, ngày hoàn thành và cập nhật tài liệu kỹ thuật tương ứng theo [post-task-documentation.md](../01-workflow/post-task-documentation.md).

---

## 📊 Progress Tracker

| Sprint | Số Tasks | Phụ trách | Đã hoàn thành | Trạng thái |
|:---:|:---:|:---:|:---:|:---:|
| **Sprint 0** | 1 Task | Nguyễn Tùng Dương & Tạ Quang Huy | 0/1 | 🔲 To Do |
| **Sprint 1** | 2 Tasks | Nguyễn Tùng Dương | 0/2 | 🔲 To Do |
| **Sprint 2** | 3 Tasks | Nguyễn Tùng Dương | 0/3 | 🔲 To Do |
| **Sprint 3** | 3 Tasks | Nguyễn Tùng Dương & Tạ Quang Huy | 0/3 | 🔲 To Do |
| **Sprint 4** | 2 Tasks | Nguyễn Tùng Dương & Tạ Quang Huy | 0/2 | 🔲 To Do |
| **Tổng cộng** | **11 Tasks** | 2 Thành viên | 0/11 | 🔲 Sẵn sàng bắt tay vào làm |

---

## 🛠️ Detailed Sprint Backlog

### Sprint 0 — State Schema & Fixture Data Definition
- [ ] **`TASK-003`** `[AI - Nguyễn Tùng Dương & Tạ Quang Huy]` **LangGraph State Schema & Fixture Data Definition**
  - **Feature**: #17
  - **Target Files**: `backend/app/ai_agents/state.py`, `backend/app/ai_agents/fixtures/` (`mock_places.json`, `mock_roadmaps.json`)
  - **Acceptance Criteria**: Định nghĩa Pydantic `AgentState` chứa `phase`, `macro_locked`, `final_locked`, `daily_themes`, `plan_stops`, `backup_options`. Dữ liệu mock fixtures validate pass 100% với DB models.
  - **Docs & Tracking**: Cập nhật `docs/03-architecture/ai-agent-architecture.md` + tick `[x]`.

### Sprint 1 — Two-Phase State Machine & Model Abstraction Layer
- [ ] **`TASK-109`** `[AI - Nguyễn Tùng Dương]` **LangGraph Two-Phase State Machine Skeleton**
  - **Feature**: #17
  - **Target Files**: `backend/app/ai_agents/state_machine.py`
  - **Acceptance Criteria**: Xây dựng đồ thị máy trạng thái gồm 2 pha (Phase 1 Macro State và Phase 2 Micro State), kiểm soát chuyển pha dựa trên cờ `macro_locked`. Giới hạn `recursion_limit=15`.
  - **Docs & Tracking**: Cập nhật `ai-agent-architecture.md` + tick `[x]`.
- [ ] **`TASK-110`** `[AI - Nguyễn Tùng Dương]` **DeepSeek-V4 Provider & Model Abstraction Layer**
  - **Feature**: #18
  - **Target Files**: `backend/app/ai_agents/model_abstraction.py`
  - **Acceptance Criteria**: Gọi mô hình chính `deepseek-v4`, tích hợp cơ chế tự động fallback trong suốt sang OpenAI GPT-4o, Claude 3.5 Sonnet hoặc Gemini 1.5 Pro khi DeepSeek gặp lỗi.
  - **Docs & Tracking**: Cập nhật `ai-agent-architecture.md` + tick `[x]`.

### Sprint 2 — Phase 1 Macro State & Four-Tier Grounding Setup
- [ ] **`TASK-209`** `[AI - Nguyễn Tùng Dương]` **Tier 1: Pydantic Schema Enforcement for Macro Drafting**
  - **Feature**: #19
  - **Target Files**: `backend/app/ai_agents/schemas.py`, `backend/app/ai_agents/nodes/macro_planner.py`
  - **Acceptance Criteria**: Soạn thảo số ngày và chủ đề từng ngày mà KHÔNG gọi API ngoài. Ép đầu ra LLM vào schema Pydantic nghiêm ngặt, loại bỏ text tự do lan man.
  - **Docs & Tracking**: Cập nhật `ai-agent-architecture.md` + tick `[x]`.
- [ ] **`TASK-210`** `[AI - Nguyễn Tùng Dương]` **Tier 2: Live Map Check Verification Service**
  - **Feature**: #20
  - **Target Files**: `backend/app/ai_agents/grounding/map_verifier.py`
  - **Acceptance Criteria**: Đối chiếu từng địa điểm với Google Places API và OSM, xác thực `place_id` và giờ mở cửa thật 100%.
  - **Docs & Tracking**: Cập nhật `ai-agent-architecture.md` + tick `[x]`.
- [ ] **`TASK-211`** `[AI - Nguyễn Tùng Dương]` **Tier 3: Haversine Geo-Clustering Algorithm (Distance Guard)**
  - **Feature**: #21
  - **Target Files**: `backend/app/ai_agents/grounding/geo_clustering.py`
  - **Acceptance Criteria**: Gom cụm các điểm dừng trong cùng nửa ngày vào bán kính $\le 2.5$\,km ($\le 20$\,phút di chuyển) bằng công thức Haversine, loại bỏ lộ trình ziczac.
  - **Docs & Tracking**: Cập nhật `ai-agent-architecture.md` + tick `[x]`.

### Sprint 3 — Phase 2 Micro Curation State & Typed Checkpointing
- [ ] **`TASK-308`** `[AI - Nguyễn Tùng Dương]` **Phase 2: Micro Curation State & Backup Stops Pre-fetching**
  - **Feature**: #22
  - **Target Files**: `backend/app/ai_agents/nodes/micro_curator.py`
  - **Acceptance Criteria**: Sau khi có Macro Lock, AI truy vấn Google Places/Agoda qua PyBreaker, áp dụng gom cụm 2--3 km và chuẩn bị sẵn 2 backup options cho mỗi điểm dừng chính phục vụ 1-Click Swap.
  - **Docs & Tracking**: Cập nhật `ai-agent-architecture.md` + tick `[x]`.
- [ ] **`TASK-309`** `[AI - Tạ Quang Huy]` **Typed State Persistence with `AsyncPostgresSaver` via DAL**
  - **Feature**: #23
  - **Target Files**: `backend/app/ai_agents/dal.py`
  - **Acceptance Criteria**: Lưu vết checkpoint của `AgentState` vào schema `checkpoints` của Supabase, hỗ trợ khôi phục phiên tự động khi container restart.
  - **Docs & Tracking**: Cập nhật `database-schema.md` + tick `[x]`.
- [ ] **`TASK-310`** `[AI - Nguyễn Tùng Dương]` **Dynamic On-The-Go Adaptation Agent Node**
  - **Feature**: #16
  - **Target Files**: `backend/app/ai_agents/nodes/adaptive_replanner.py`
  - **Acceptance Criteria**: Xử lý yêu cầu khẩn cấp trong chuyến đi (tìm quán cafe trong nhà gần vị trí hiện tại khi trời mưa), sinh thay đổi cho 1 stop duy nhất.
  - **Docs & Tracking**: Cập nhật `ai-agent-architecture.md` + tick `[x]`.

### Sprint 4 — Dynamic Adaptation & Grounding Benchmark
- [ ] **`TASK-401`** `[AI - Nguyễn Tùng Dương]` **LangGraph Worker Consumer via Redis Streams**
  - **Feature**: #17
  - **Target Files**: `backend/app/worker.py`
  - **Acceptance Criteria**: Background worker trên Render đọc task từ Redis Streams (`XREADGROUP`), chạy LangGraph graph và bắn sự kiện qua Redis Pub/Sub. Bounded memory $\le 280$\,MB / $512$\,MB RAM.
  - **Docs & Tracking**: Cập nhật `system-architecture.md` + tick `[x]`.
- [ ] **`TASK-413`** `[AI - Nguyễn Tùng Dương & Tạ Quang Huy]` **Grounding Benchmark Verification (100 Prompts Test)**
  - **Feature**: AI Evaluation
  - **Target Files**: `backend/tests/evaluation/grounding_benchmark.py`
  - **Acceptance Criteria**: Chạy script 100 prompts tự động qua Google Places API; đạt tỷ lệ xác thực $\ge 98\%$ và **0% địa điểm ảo**.
  - **Docs & Tracking**: Cập nhật `testing-guide.md` + tick `[x]`.
