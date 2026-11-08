# 🗄️ Database Schema & Supabase Data Architecture
## Dự án: TripMate AI — Intelligent Group Activity & Travel Planning Platform

> Tài liệu chuẩn hóa kiến trúc cơ sở dữ liệu cho dự án TripMate AI, triển khai trên nền tảng **Supabase Managed PostgreSQL 16**, kết nối qua **Supavisor Connection Pooler (port 6543, Transaction Mode)**, phân tách 2 schema chính (`core`, `checkpoints`), áp dụng chính sách bảo mật **Row Level Security (RLS)**, và giải quyết triệt để các nhận xét phản biện từ Supervisor (Mục 2.1–2.5).

---

## 🏛️ 1. Kiến Trúc CSDL & Phân Định Lưu Trữ (Mục 2.1: Supabase vs. PostgreSQL vs. NoSQL)

### 1.1. Bản chất Supabase vs. PostgreSQL
- **Supabase** không phải là một hệ quản trị CSDL tách biệt với PostgreSQL, mà là nền tảng **Backend-as-a-Service (BaaS) vận hành trên PostgreSQL 16**.
- Hệ thống sử dụng **PostgreSQL 16 (do Supabase quản lý)** làm nguồn dữ liệu duy nhất cho toàn bộ các thực thể nghiệp vụ của ứng dụng trong schema `core`.
- Tận dụng hạ tầng đám mây của Supabase gồm:
  - **Supavisor Connection Pooler (port 6543)**: Quản lý và ghép 200+ phiên client đồng thời qua 15 kết nối vật lý.
  - **Supabase Auth & Row Level Security (RLS)**: Xác thực người dùng và phân quyền đa thuê bao (multi-tenant privacy).

### 1.2. Tại sao KHÔNG cần dùng thêm NoSQL (như MongoDB/DynamoDB)?
Supervisor đã chỉ rõ: *Chỉ khi đầu ra của AI bị thiếu trường (missing fields) hoặc phát sinh thuộc tính bất định ở mỗi lần chạy thì mới cần NoSQL; nếu dùng SQL truyền thống thì phải ép đầu ra của AI về một định dạng cố định.*

TripMate AI giải quyết triệt để vấn đề này theo định hướng của Supervisor:
1. **Ép khuôn đầu ra bằng Pydantic Strict Schema (`PlanStopCreate`, `POIItem`)**:
   - Mọi kết quả do AI gợi ý đều được validate chặt chẽ trước khi lưu vào CSDL.
   - Các thuộc tính cốt lõi bắt buộc (**ngày tháng, thời gian, tên địa điểm, tọa độ GPS, mức giá ước tính, phương thức di chuyển**) luôn được định kiểu cố định 100% trong bảng `plan_stops`.
2. **Hỗ trợ thuộc tính mở rộng bằng cột `JSON` ngay trong PostgreSQL**:
   - Các thông tin phụ trợ linh hoạt (như danh sách địa điểm dự phòng `backup_options`, metadata bổ sung từ Google Places) được lưu trữ trực tiếp bằng kiểu dữ liệu `JSON` / `JSONB` của PostgreSQL.
   - Nhờ đó, hệ thống vừa giữ được tính toàn vẹn tham chiếu (Foreign Keys, ACID) cho việc quản lý phòng và bình chọn, vừa có sự linh hoạt của NoSQL mà **không cần duy trì một CSDL thứ hai**.

### 1.3. Phân bổ lưu trữ dữ liệu rõ ràng trong hệ thống
| Tầng lưu trữ | Công nghệ | Dữ liệu quản lý | Vòng đời dữ liệu |
| :--- | :--- | :--- | :--- |
| **Relational Data (`core` schema)** | **Supabase PostgreSQL 16** | `users`, `events`, `event_members`, `invitations`, `plans`, `plan_stops`, `plan_votes`, `chat_messages`, `agent_logs` | Bền vững (Persistent, ACID transactions) |
| **State Persistence (`checkpoints`)** | **Supabase PostgreSQL 16** | `checkpoints`, `checkpoint_blobs`, `checkpoint_writes` (LangGraph `AsyncPostgresSaver`) | Bền vững theo phiên phòng (`event_id`) |
| **Ephemeral L2 Cache** | **Upstash Redis 7** | Cache kết quả tìm kiếm Google Places API (`places_search:`, `place_details:`) | Tạm thời (TTL 24 giờ, tự xóa) |

---

## ⚡ 2. Cấu Hình Supavisor Connection Pooler (Port 6543)

- **Vấn đề**: Khi $50$--$100$ người dùng đồng thời (CCU) trong $10$--$20$ phòng cùng chat và vote, số lượng kết nối client có thể tăng vọt lên hơn 200 connection, dễ làm cạn kiệt connection pool của PostgreSQL.
- **Giải pháp**: Hệ thống kết nối qua **Supavisor Pooler tại port 6543 ở chế độ Transaction Mode**:
  - Multiplex **200+ phiên client đồng thời** chỉ thông qua **15 kết nối vật lý** tới PostgreSQL.
  - Sử dụng biến môi trường:
    ```env
    # Kết nối qua Supavisor Pooler (Dùng cho FastAPI Web Service & LangGraph Worker)
    DATABASE_URL=postgresql+asyncpg://postgres.project_ref:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require
    # Kết nối trực tiếp Direct Connection (Chỉ dùng cho Alembic migration DDL)
    DIRECT_URL=postgresql+asyncpg://postgres:[PASSWORD]@db.project_ref.supabase.co:5432/postgres?sslmode=require
    ```

---

## 📊 3. Sơ Đồ Quan Hệ Thực Thể (ERD - `core` Schema Mới)

> **Cải tiến sau phản biện của Supervisor**:
> 1. Xóa bỏ hoàn toàn các bảng chi phí (`expenses`, `expense_splits`, `settlements`) do hệ thống không tích hợp thanh toán (Mục 2.3).
> 2. Chuyển đổi quan hệ giữa `Event` và `Plan` thành **`1-to-N`** (Một phòng Workspace chứa nhiều phiên bản Lịch trình qua các giai đoạn) (Mục 2.2).
> 3. Bổ sung liên kết tự tham chiếu (`parent_plan_id` trên `Plan`, `replaced_by_stop_id` trên `PlanStop`) để quản lý lịch sử thay đổi không ghi đè (Mục 2.5).

```mermaid
erDiagram
    User ||--o{ EventMember : joins
    User ||--o{ Plan : creates
    User ||--o{ PlanVote : votes
    User ||--o{ ChatMessage : sends
    User ||--o{ Invitation : sent_or_received

    Event ||--o{ EventMember : contains
    Event ||--o{ Plan : "workspace holds versioned"
    Event ||--o{ ChatMessage : holds
    Event ||--o{ Invitation : invites

    Plan ||--o{ PlanStop : includes
    Plan ||--o{ Plan : "parent_version"
    PlanStop ||--o{ PlanVote : receives
    PlanStop ||--o{ PlanStop : "replaced_by"
```

---

## 📜 4. Chi Tiết Các Bảng Dữ Liệu Cốt Lõi (`core` Schema)

### 4.1. Bảng `users` & `event_members` (Người dùng & Phân quyền)
```sql
-- users: Thông tin người dùng đồng bộ với Supabase Auth
CREATE TABLE core.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'USER', -- USER, ADMIN
    provider VARCHAR(50) DEFAULT 'LOCAL', -- LOCAL, GOOGLE, FACEBOOK
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- event_members: Quản lý thành viên phòng và phân quyền Host vs Member
CREATE TABLE core.event_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES core.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'MEMBER', -- HOST, MEMBER, VIEWER
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_event_member UNIQUE (event_id, user_id)
);
```

### 4.2. Bảng `events` & `plans` (Mục 2.2: Tối ưu Quan hệ 1-to-N & Quản lý Phiên bản)
- **`events`**: Đóng vai trò là **Không gian phòng cộng tác (Workspace)**, tồn tại ngay từ khi nhóm khởi tạo phòng để mời bạn bè và thảo luận chat, trước khi bất kỳ lộ trình nào được sinh ra.
- **`plans`**: Đóng vai trò là **Các phiên bản lịch trình (Plan Versions / Snapshots)** của phòng đó qua các giai đoạn (`INITIAL`, `VOTING`, `FINALIZED`, `ONGOING`).

```sql
-- events: Phòng cộng tác lập kế hoạch chuyến đi
CREATE TABLE core.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    scope VARCHAR(50) NOT NULL DEFAULT 'VACATION', -- DAY_HANGOUT, VACATION
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    destination VARCHAR(255),
    location VARCHAR(255),
    budget_tier VARCHAR(50), -- BUDGET, MODERATE, LUXURY
    macro_locked BOOLEAN DEFAULT FALSE, -- Chốt Consensus 1
    final_locked BOOLEAN DEFAULT FALSE, -- Chốt Consensus 2
    created_by UUID REFERENCES core.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- plans: Các phiên bản lịch trình theo giai đoạn (1 Event - N Plans)
CREATE TABLE core.plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES core.events(id) ON DELETE CASCADE,
    version_number INT NOT NULL DEFAULT 1,
    parent_plan_id UUID REFERENCES core.plans(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'INITIAL', -- INITIAL, VOTING, FINALIZED, ONGOING, COMPLETED, ARCHIVED
    is_ai_generated BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    total_budget DECIMAL(10, 2),
    created_by_id UUID REFERENCES core.users(id) ON DELETE SET NULL,
    macro_roadmap JSONB,
    change_summary VARCHAR(500),
    locked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_event_plan_version UNIQUE (event_id, version_number)
);
```

### 4.3. Bảng `plan_stops` & `plan_votes` (Mục 2.4 & 2.5: Đầy đủ thuộc tính & Lưu vết không ghi đè)
Mỗi điểm dừng trong bảng `plan_stops` được bổ sung:
1. **Thuộc tính chi tiết (Mục 2.4)**: `stop_date`, `end_time`, `address`, `transport_mode`, `transit_duration_minutes`, `transit_distance_km`, `transit_cost`.
2. **Quản lý trạng thái và lưu vết không ghi đè (Mục 2.5)**:
   - `stop_status`: Trạng thái chi tiết của điểm dừng (`INITIAL_PROPOSED`, `VOTING_OPEN`, `SELECTED_AFTER_VOTE`, `REJECTED_IN_VOTE`, `FINALIZED_LOCKED`, `ONGOING_ACTIVE`, `ADAPTED_ON_TRIP`, `SKIPPED_ON_TRIP`, `COMPLETED`).
   - `is_initial_stop`: Đánh dấu điểm thuộc danh sách ban đầu do AI gợi ý.
   - `is_finalized_stop`: Đánh dấu điểm thuộc danh sách đã chốt sau khi nhóm bình chọn.
   - `replaced_by_stop_id`: Khóa ngoại trỏ tới điểm dừng mới thay thế (khi vote loại bỏ hoặc khi đổi lịch lúc trời mưa) giúp truy vết lịch sử trọn vẹn mà không xóa mất điểm cũ.
   - `change_reason`: Lý do thay đổi (ví dụ: *"Trời mưa lớn tại Bà Nà Hills, đổi sang quán cafe trong nhà"*).

```sql
-- plan_stops: Chi tiết các điểm dừng có đầy đủ thuộc tính và lưu vết lịch sử 4 giai đoạn
CREATE TABLE core.plan_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES core.plans(id) ON DELETE CASCADE,
    day_number INT NOT NULL DEFAULT 1,
    stop_date DATE,
    time_slot VARCHAR(50), -- MORNING, AFTERNOON, EVENING
    order_index INT NOT NULL,
    place_name VARCHAR(255) NOT NULL,
    place_ref_id VARCHAR(255), -- Google Place ID thật
    address VARCHAR(500),
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    category VARCHAR(50), -- RESTAURANT, CAFE, ATTRACTION, HOTEL, ENTERTAINMENT
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    duration_minutes INT DEFAULT 90,
    estimated_cost DECIMAL(10, 2) DEFAULT 0,

    -- Thuộc tính di chuyển (Mục 2.4)
    transport_mode VARCHAR(50), -- WALKING, MOTORBIKE, TAXI_GRAB, CAR, BUS, TRAIN, FLIGHT, BOAT, OTHER
    transit_duration_minutes INT,
    transit_distance_km DOUBLE PRECISION,
    transit_cost DECIMAL(10, 2) DEFAULT 0,

    -- Quản lý trạng thái và lưu vết lịch sử 4 giai đoạn (Mục 2.5)
    stop_status VARCHAR(50) NOT NULL DEFAULT 'INITIAL_PROPOSED',
    is_initial_stop BOOLEAN NOT NULL DEFAULT TRUE,
    is_finalized_stop BOOLEAN NOT NULL DEFAULT FALSE,
    replaced_by_stop_id UUID REFERENCES core.plan_stops(id) ON DELETE SET NULL,
    change_reason VARCHAR(500),
    locked_at TIMESTAMPTZ,

    up_votes INT DEFAULT 0,
    down_votes INT DEFAULT 0,
    backup_options JSONB, -- 2 phương án dự phòng cho 1-Click Swap
    note TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- plan_votes: Phiếu vote của từng thành viên cho điểm dừng cụ thể
CREATE TABLE core.plan_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stop_id UUID NOT NULL REFERENCES core.plan_stops(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    vote_value VARCHAR(10) NOT NULL, -- UP, DOWN, NEUTRAL
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_stop_user_vote UNIQUE (stop_id, user_id)
);
```

### 4.4. Bảng `chat_messages` (Kênh Thảo Luận Chung Của Nhóm)
Bảng `chat_messages` liên kết trực tiếp với `event_id` và người gửi `user_id`, khẳng định đây là **kênh chat chung của cả phòng** nơi các thành viên thảo luận mong muốn và AI Agent lắng nghe ngữ cảnh:

```sql
CREATE TABLE core.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES core.events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES core.users(id) ON DELETE SET NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'USER', -- USER, AI, SYSTEM
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_chat_event_time ON core.chat_messages(event_id, created_at);
```

---

## 🛡️ 5. Kịch Bản Vận Hành Lịch Sử 4 Giai Đoạn (Mục 2.5: Non-destructive Lifecycle)

| Giai đoạn | Trạng thái `Plan` | Trạng thái `PlanStop` | Cơ chế lưu dữ liệu không mất dấu |
| :--- | :---: | :---: | :--- |
| **1. Khởi tạo (Initial Plan)** | `INITIAL` | `INITIAL_PROPOSED` | AI tạo bản kế hoạch đầu tiên (`v1`). Mọi điểm dừng ban đầu được gắn `is_initial_stop = TRUE`. |
| **2. Bình chọn (Voting)** | `VOTING` | `VOTING_OPEN` | Thành viên vote UP/DOWN. Điểm bị loại **không bị xóa/ghi đè** mà chuyển `stop_status = REJECTED_IN_VOTE`. Điểm dự phòng thay thế được chèn với `stop_status = SELECTED_AFTER_VOTE` và điểm cũ trỏ `replaced_by_stop_id` tới điểm mới. |
| **3. Chốt lịch trình (Finalized)** | `FINALIZED` | `FINALIZED_LOCKED` | Host chốt kế hoạch: các điểm đang được chọn được khóa (`locked_at = NOW()`) và gắn `is_finalized_stop = TRUE`. |
| **4. Thực hiện thực tế (Ongoing)** | `ONGOING` | `ONGOING_ACTIVE` / `ADAPTED_ON_TRIP` / `SKIPPED_ON_TRIP` | Khi trời mưa, điểm ngoài trời cũ chuyển sang `stop_status = SKIPPED_ON_TRIP` (lý do: *"Trời mưa lớn"*), điểm trong nhà mới chèn với `ADAPTED_ON_TRIP`. Cả 3 mốc (Ban đầu vs Đã chốt vs Thực tế) đều nguyên vẹn 100%! |
