# 👤 Person 1 — Tạ Quang Huy (Backend Dev A: Core Domain, Two-Stage Consensus & AI DAL Bridge)

> **Người phụ trách**: **Tạ Quang Huy**  
> **Trách nhiệm kỹ thuật**: Kiến trúc cơ sở dữ liệu Supabase PostgreSQL 16 (`core`, `checkpoints`), cấu hình Supavisor connection pooler port 6543, Room CRUD APIs, Two-Stage Consensus Engine (Macro Lock & Final Lock), RolesGuard (Host vs Member), Data Access Layer (DAL) Bridge cho AI Agent, và FastAPI WebSocket Room Server.  
> **Tham gia bắt buộc**: Contract Session (Sprint 0), Integration Day cuối mỗi Sprint.  
> **Quy định tracking bắt buộc**: Sau khi hoàn thành code và test mỗi task, đổi `[ ]` thành `[x]` kèm link PR, ngày hoàn thành và cập nhật tài liệu kỹ thuật tương ứng theo [post-task-documentation.md](../01-workflow/post-task-documentation.md).

---

## 📊 Progress Tracker

| Sprint | Số Tasks | Đã hoàn thành | Trạng thái |
|:---:|:---:|:---:|:---:|
| **Sprint 0** | 1 Task | 1/1 | ✅ Done (TASK-001) |
| **Sprint 1** | 1 Task | 1/1 | ✅ Done (TASK-101) |
| **Sprint 2** | 3 Tasks | 3/3 | ✅ Done (TASK-201, 202, 204) |
| **Sprint 3** | 7 Tasks | 1/7 | 🟡 In Progress |
| **Sprint 4** | 3 Tasks | 0/3 | 🔲 To Do |
| **Tổng cộng** | **15 Tasks** | 6/15 | 🟡 Đang thực hiện (6/15 hoàn thành) |

---

## 🛠️ Detailed Sprint Backlog

### Sprint 0 — Contract Session & Database Architecture Design
- [x] **`TASK-001`** **Thiết kế Schemas DB Supabase PostgreSQL 16 & Supavisor Pooler**
  - **Mục tiêu**: Chuẩn hóa mô hình dữ liệu cho Supabase PostgreSQL 16 phân tách 2 schema (`core`, `checkpoints`).
  - **Target Files**: `backend/app/models/` (`user.py`, `event.py`, `plan.py`, `stop.py`, `vote.py`, `chat_message.py`), `backend/app/schemas/`
  - **Acceptance Criteria**: Hỗ trợ đầy đủ `scope` (DAY_HANGOUT | VACATION), `macro_locked`, `final_locked`, quan hệ `Event` - `Plan` 1-to-N, `plan_stops` với `place_ref_id`, `transport_mode`, `recommended_dishes`, `backup_options` JSONB và lưu vết 4 giai đoạn không ghi đè. Cấu hình Supavisor Pooler port 6543. Migration Alembic sạch.
  - **Docs & Tracking**: Cập nhật `docs/03-architecture/database-schema.md` + tick `[x]` task board.

### Sprint 1 — Supabase Core Models & Initial Migration
- [x] **`TASK-101`** **Khởi tạo Database Models Core & Alembic Initial Migration**
  - **Mục tiêu**: Khởi tạo bảng `core.users` và `core.event_members`.
  - **Target Files**: `backend/app/models/user.py`, `backend/alembic/versions/`
  - **Acceptance Criteria**: Bảng `users` và `event_members` tạo thành công với các trường `id`, `email`, `password_hash`, `full_name`, `avatar_url`, `role` (HOST, MEMBER, VIEWER). Kết nối qua Supavisor pooler port 6543.
  - **Docs & Tracking**: Cập nhật `database-schema.md` + tick `[x]` task board.

### Sprint 2 — Room Management & RolesGuard
- [x] **`TASK-201`** **Event Database Models (Day Hangouts & Vacations)**
  - **Mục tiêu**: Bảng `core.events` hỗ trợ 2 phạm vi kế hoạch linh hoạt.
  - **Target Files**: `backend/app/models/event.py`, `backend/alembic/versions/`
  - **Acceptance Criteria**: Các trường `scope` (`DAY_HANGOUT` | `VACATION`), `macro_locked`, `final_locked`, `start_date`, `end_date`, `budget_tier`.
  - **Docs & Tracking**: Cập nhật `database-schema.md` + tick `[x]`.
- [x] **`TASK-202`** **Room CRUD APIs**
  - **Mục tiêu**: Các endpoint quản trị phòng lập kế hoạch.
  - **Target Files**: `backend/app/api/v1/events.py`, `backend/app/services/event_service.py`
  - **Acceptance Criteria**: `POST /events` tạo phòng và tự động gán creator làm `HOST`. `GET /events` lấy danh sách phòng của user. `PATCH /events/{id}` cập nhật thông tin phòng.
  - **Docs & Tracking**: Cập nhật `api-design-guide.md` + tick `[x]`.
- [x] **`TASK-204`** **RolesGuard Dependency (Host vs Member Permissions)**
  - **Mục tiêu**: Phân định rạch ròi quyền Host (khóa kế hoạch) và Member (chat, vote).
  - **Target Files**: `backend/app/api/v1/dependencies.py`
  - **Acceptance Criteria**: Dependency `require_host` chặn các thao tác khóa kế hoạch nếu người dùng không phải là Host (`403 Forbidden`).
  - **Docs & Tracking**: Cập nhật `api-design-guide.md` + tick `[x]`.

### Sprint 3 — Two-Stage Consensus Engine & Living Itinerary
- [x] **`TASK-301`** **Normalized `plan_stops` & `plan_votes` Database Models**
  - **Mục tiêu**: Cấu trúc lưu trữ điểm dừng chuẩn hóa cho cơ chế vote và swap.
  - **Target Files**: `backend/app/models/plan.py`, `backend/app/models/stop.py`, `backend/alembic/versions/`
  - **Acceptance Criteria**: Bảng `plan_stops` hỗ trợ lưu Place ID, tọa độ lat/lng, backup options JSONB; bảng `plan_votes` có ràng buộc unique `(stop_id, user_id)`.
  - **Docs & Tracking**: Cập nhật `database-schema.md` + tick `[x]`.
- [ ] **`TASK-302`** **Macro Consensus Lock API (Consensus Checkpoint 1)**
  - **Mục tiêu**: Host bấm khóa khung lộ trình vĩ mô sau khi nhóm thảo luận thống nhất.
  - **Target Files**: `backend/app/api/v1/plans.py` *(không tạo file `consensus.py` — mọi route Consensus gộp chuẩn vào `plans.py` và `votes.py`)*
  - **Acceptance Criteria**: `POST /events/{id}/plans/{planId}/macro-lock` chuyển trạng thái `macro_locked = true` (chỉ Host thực hiện), kích hoạt AI chuyển sang Phase 2.
  - **Docs & Tracking**: Cập nhật `api-design-guide.md` + tick `[x]`.
- [ ] **`TASK-303`** **Granular Stop Management & Ordering APIs**
  - **Mục tiêu**: Chỉnh sửa thứ tự và thời lượng lưu lại tại các điểm dừng.
  - **Target Files**: `backend/app/api/v1/plans.py`
  - **Acceptance Criteria**: `PATCH /events/{id}/plans/{planId}/stops` hỗ trợ đổi thứ tự điểm dừng và ghi chú.
  - **Docs & Tracking**: Cập nhật `api-design-guide.md` + tick `[x]`.
- [ ] **`TASK-304`** **Candidate Stop Voting API (Multi-Choice Poll)**
  - **Mục tiêu**: Mở thẻ trạm hiển thị đồng thời danh sách `candidate_options` đạt chuẩn; thành viên bỏ phiếu chọn `candidate_id` với câu lệnh SQL an toàn, triệt tiêu race condition.
  - **Target Files**: `backend/app/api/v1/votes.py`, `backend/app/services/vote_service.py`
  - **Acceptance Criteria**: `POST /events/{id}/plans/{planId}/stops/{stopId}/vote` nhận `candidate_id`, lưu `plan_votes` (unique `stop_id, user_id`), trả về `StopVoteResponse` gồm danh sách ứng viên kèm số phiếu và danh sách `voters`.
  - **Docs & Tracking**: Cập nhật `api-design-guide.md` + `security-guidelines.md` + tick `[x]`.
- [ ] **`TASK-305`** **Progressive Unlock (Quorum Auto-advance) & Multi-Option Backup Swap API**
  - **Mục tiêu**: Tự động chốt trạm khi đạt Quorum ($\ge 60\%\text{--}70\%$) và mở khóa tuần tự trạm kế tiếp (`next_unlocked_stop_id`); hỗ trợ đổi sang phương án dự phòng không ghi đè khi cần.
  - **Target Files**: `backend/app/api/v1/votes.py`, `backend/app/api/v1/plans.py`
  - **Acceptance Criteria**: Đạt Quorum tự cập nhật `selected_candidate_id` và `stop_status = SELECTED_AFTER_VOTE`; `POST /events/{id}/plans/{planId}/stops/{stopId}/swap` hỗ trợ cả `target_backup_place_ref_id` lẫn `cycle_next: true`, đánh dấu stop cũ `REJECTED_IN_VOTE` + trỏ `replaced_by_stop_id` sang stop mới.
  - **Docs & Tracking**: Cập nhật `api-design-guide.md` + tick `[x]`.
- [ ] **`TASK-306`** **Final Plan Confirmation & Auto-Clone Snapshot API (Consensus Checkpoint 2)**
  - **Mục tiêu**: Host chốt kế hoạch chính thức sau khi mọi điểm dừng đạt đồng thuận cao, đồng thời bảo toàn bất biến bản `Plan v1` bằng quy tắc Deep-Copy không ghi đè.
  - **Target Files**: `backend/app/api/v1/plans.py` *(không tạo `consensus.py`)*
  - **Acceptance Criteria**: `POST /events/{id}/plans/{planId}/final-lock` (chỉ Host thực hiện): đóng băng `v1` (`is_active = False`), **clone thành `Plan v2` (`FINALIZED`, `parent_plan_id = v1`) + `INSERT` mới các `PlanStop` đã chốt (`is_finalized_stop = True`)**, tuyệt đối **không `UPDATE plan_id` của stop cũ**, đặt `final_locked = true`, trả về `PlanResponse` của `v2`.
  - **Docs & Tracking**: Cập nhật `api-design-guide.md` + tick `[x]`.
- [ ] **`TASK-307`** **Living Itinerary Dynamic Adaptation & On-Trip Auto-Clone API**
  - **Mục tiêu**: Cho phép thay thế 1 điểm dừng khi có biến cố thực tế (trời mưa) mà vẫn giữ bất biến lịch trình đã chốt (`v2`) theo quy tắc Deep-Copy.
  - **Target Files**: `backend/app/api/v1/plans.py` *(không tạo `consensus.py`)*
  - **Acceptance Criteria**: `POST /events/{id}/plans/{planId}/stops/{stopId}/adapt`: nếu plan đang ở `FINALIZED` (`v2`) thì tự động **clone `v2 → v3` (`ONGOING`, `parent_plan_id = v2`)**, giữ `v2` bất biến; trên `v3` đánh dấu stop cũ `SKIPPED_ON_TRIP` + trỏ `replaced_by_stop_id` sang stop mới (`ADAPTED_ON_TRIP`), trả kèm `cloned_plan_id` trong `StopAdaptationResponse`.
  - **Docs & Tracking**: Cập nhật `api-design-guide.md` + tick `[x]`.

### Sprint 4 — WebSocket Room Server & Redis Pub/Sub Live Sync
- [ ] **`TASK-401`** **FastAPI WebSocket Room Server**
  - **Mục tiêu**: Quản lý các kết nối WebSocket theo từng phòng (`/ws/rooms/{room_id}`).
  - **Target Files**: `backend/app/api/v1/ws.py`, `backend/app/services/room_socket_manager.py`
  - **Acceptance Criteria**: Phản hồi tức thì thao tác người dùng dưới 80ms ACK qua WebSocket.
  - **Docs & Tracking**: Cập nhật `api-design-guide.md` + tick `[x]`.
- [ ] **`TASK-402`** **Redis Streams & Redis Pub/Sub Event Synchronization**
  - **Mục tiêu**: Đẩy task qua Redis Streams (`XADD`) và phát sóng sự kiện qua Redis Pub/Sub (`plan:updated`).
  - **Target Files**: `backend/app/core/redis_events.py`
  - **Acceptance Criteria**: AI Worker cập nhật plan xong bắn sự kiện qua Pub/Sub; các instance Gateway nhận sự kiện và gửi WebSockets xuống client.
  - **Docs & Tracking**: Cập nhật `system-architecture.md` + tick `[x]`.
- [ ] **`TASK-403`** **Token & Latency Metrics Logger**
  - **Mục tiêu**: Ghi nhận telemetry độ trễ và lượng token tiêu thụ.
  - **Target Files**: `backend/app/services/metrics_logger.py`
  - **Acceptance Criteria**: Ghi nhận `input_tokens`, `output_tokens`, `ttft_ms`, `total_duration_ms` vào bảng `agent_logs`.
  - **Docs & Tracking**: Cập nhật `database-schema.md` + tick `[x]`.
