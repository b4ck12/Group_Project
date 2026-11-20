# 🗄️ Database Schema & Supabase Data Architecture
## Dự án: TripMate AI — Intelligent Group Activity & Travel Planning Platform

> Tài liệu chuẩn hóa kiến trúc cơ sở dữ liệu cho dự án TripMate AI, triển khai trên nền tảng **Supabase Managed PostgreSQL 16** (Deploy) và **PostgreSQL 16 Docker** (Local), kết nối qua **Supavisor Connection Pooler (port 6543, Transaction Mode)**, phân tách 2 schema chính (`core`, `checkpoints`), áp dụng chính sách bảo mật **Row Level Security (RLS)**, và giải quyết triệt để các nhận xét phản biện từ Giảng viên Hướng dẫn (Mục 2.1–2.6).

---

## 🏛️ 1. Kiến Trúc CSDL & Phân Định Lưu Trữ (Mục 2.1: Supabase vs. PostgreSQL vs. NoSQL)

### 1.1. Bản chất Supabase vs. PostgreSQL (Local Development vs. Production Deployment)
- **Cơ sở dữ liệu cốt lõi là PostgreSQL 16**: Toàn bộ định nghĩa bảng, kiểu dữ liệu, khóa ngoại (FK), chỉ mục (Index) và stored procedures đều được viết bằng SQL chuẩn cho PostgreSQL 16.
- **Môi trường chạy cục bộ (Local Development)**:
  - Sử dụng trực tiếp container **PostgreSQL 16** (`postgres:16-alpine` trong `docker-compose.yml`) hoặc Supabase CLI local.
  - Chuỗi kết nối trực tiếp tiêu chuẩn: `postgresql+asyncpg://postgres:postgres@localhost:5432/tripmate`.
- **Môi trường triển khai (Production Deployment)**:
  - Sử dụng **Supabase Managed PostgreSQL 16** trên nền tảng điện toán đám mây.
  - Kết nối qua **Supavisor Connection Pooler (port 6543, Transaction Mode)** để multiplex hàng trăm kết nối đồng thời từ các serverless/stateless instance:
    ```env
    DATABASE_URL=postgresql+asyncpg://postgres.project_ref:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require
    ```
  - Tận dụng hạ tầng bảo mật của Supabase: **Supabase Auth** và **Row Level Security (RLS)** phân quyền đa người dùng.
- **Kết luận**: Giữa Local và Deploy hoàn toàn không có sự xung đột hay khác biệt về cú pháp CSDL. Bản chất Supabase Cloud chính là PostgreSQL 16 được tích hợp thêm tầng công cụ quản lý và pooling.

### 1.2. Ép Thuộc Tính: Tại sao dùng SQL truyền thống thì bắt buộc phải Ép (Force) Đầu Ra của AI?
Giảng viên chỉ rõ: *Nếu dùng NoSQL (như MongoDB/DynamoDB) thì AI trả về cấu trúc tự do, thiếu trường nào cũng chấp nhận được; nhưng nếu đã chọn CSDL quan hệ SQL truyền thống thì bắt buộc phải ép (force) đầu ra của AI về chung một định dạng cố định với các thuộc tính bắt buộc.*

TripMate AI hiện thực hóa nguyên tắc này triệt để:
1. **Ép khuôn đầu ra bằng Pydantic Strict Schema (`PlanStopCreate`, `PlaceStopDTO`)**:
   - Sử dụng cơ chế Structured Outputs / Tool Calling của LLM với tham số kiểm định kiểu nghiêm ngặt (`strict=True`).
   - Mọi kết quả gợi ý từ AI bắt buộc phải trả về đủ 100% các trường cốt lõi: **ngày tháng (`stop_date`), thời gian cụ thể (`start_time`, `end_time`), tên địa điểm (`place_name`), mã định danh Place ID (`place_ref_id`), tọa độ GPS (`lat`, `lng`), mức giá ước tính (`estimated_cost`), phương thức di chuyển (`transport_mode`), chi phí di chuyển (`transit_cost`) và danh sách món ăn gợi ý (`recommended_dishes`)**.
   - Nếu LLM sinh thiếu bất kỳ thuộc tính bắt buộc nào, tầng Pydantic Validator ở Gateway sẽ tự động từ chối và ép mô hình sinh lại ngay lập tức trước khi chạm vào CSDL.
2. **Linh hoạt có kiểm soát bằng cột `JSONB` trong PostgreSQL**:
   - Các thông tin mở rộng mang tính biến thiên (danh sách 2 địa điểm dự phòng `backup_options`, metadata bổ sung từ Google Places, thực đơn món ăn chi tiết) được lưu trong cột `JSONB`.
   - Cách tiếp cận này giúp hệ thống vừa bảo đảm tính toàn vẹn tham chiếu (Foreign Keys, ACID, ràng buộc khóa) của SQL truyền thống, vừa có độ mềm dẻo của NoSQL mà **không cần duy trì thêm một CSDL thứ hai**.

### 1.3. Phân bổ lưu trữ dữ liệu rõ ràng trong hệ thống
| Tầng lưu trữ | Công nghệ | Dữ liệu quản lý | Vòng đời dữ liệu |
| :--- | :--- | :--- | :--- |
| **Relational Data (`core` schema)** | **Supabase PostgreSQL 16** (Deploy) / **PostgreSQL 16 Docker** (Local) | `users`, `events`, `event_members`, `invitations`, `plans`, `plan_stops`, `plan_votes`, `chat_messages` | Bền vững (Persistent, ACID transactions) |
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

> **Cải tiến sau phản biện của Giảng viên**:
> 1. **Xóa bỏ hoàn toàn bảng `expenses`**: Hệ thống không tích hợp cổng thanh toán trực tuyến, việc giữ lại bảng chi phí chỉ để hiển thị là dư thừa và làm rối CSDL (Mục 2.3).
> 2. **Làm rõ quan hệ `Event` và `Plan` là `1-to-N`**: Giảng viên chất vấn quan hệ 1-1 làm bảng Event bị thừa. Nhóm khẳng định quan hệ là **1 Event (Workspace phòng) chứa N Plans (Các phiên bản lộ trình theo giai đoạn)**, do đó bảng Event hoàn toàn cần thiết để quản lý phòng cộng tác (Mục 2.2).
> 3. **Bổ sung liên kết lưu vết không ghi đè**: Cột `replaced_by_stop_id` trên `plan_stops` và `parent_plan_id` trên `plans` giúp truy vết lịch sử trọn vẹn qua 4 giai đoạn mà không xóa mất dữ liệu cũ (Mục 2.5).
> 4. **Bổ sung thuộc tính món ăn trong quán**: Cột `recommended_dishes` trên `plan_stops` phục vụ gợi ý món ăn đặc trưng vùng miền và món ăn cụ thể tại quán theo ý kiến thành viên nhóm (Mục 2.4).

```mermaid
erDiagram
    User ||--o{ EventMember : joins
    User ||--o{ Plan : creates
    User ||--o{ PlanVote : votes
    User ||--o{ ChatMessage : sends
    User ||--o{ Invitation : sent_or_received

    Event ||--o{ EventMember : contains
    Event ||--o{ Plan : "workspace holds 1-to-N versioned"
    Event ||--o{ ChatMessage : "holds group channel"
    Event ||--o{ Invitation : invites

    Plan ||--o{ PlanStop : includes
    Plan ||--o{ Plan : "parent_version"
    PlanStop ||--o{ PlanVote : receives
    PlanStop ||--o{ PlanStop : "replaced_by (non-destructive history)"
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
    dietary_preferences JSONB, -- Sở thích ăn uống: chay, dị ứng, kiêng cay...
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
    dietary_notes TEXT, -- Ghi chú ăn uống cụ thể cho chuyến đi này
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_event_member UNIQUE (event_id, user_id)
);
```

### 4.2. Bảng `events` & `plans` (Mục 2.2: Tối ưu Quan hệ 1-to-N & Giải Trình Bảng Event Không Thừa)
- **Chất vấn của GVHD**: *"Tại sao tách rời bảng Event và Plan nếu quan hệ là 1-1? Bảng Event đang bị thừa."*
- **Giải trình & Thiết kế chuẩn hóa**:
  - Quan hệ giữa `Event` và `Plan` **KHÔNG PHẢI LÀ 1-1, MÀ LÀ 1-TO-N (Một Event chứa Nhiều Plan)**.
  - **`events` (Không gian phòng cộng tác / Workspace)**:
    - Tồn tại độc lập ngay từ thời điểm Host tạo phòng để gửi link mời bạn bè (`invitations`), chat thảo luận sở thích (`chat_messages`), cấu hình ngân sách dự kiến và khung thời gian tổng quát.
    - Một Event có thể chưa có Plan nào (giai đoạn mới lập phòng bàn bạc), hoặc có nhiều phiên bản Plan được sinh ra qua các lần tinh chỉnh.
  - **`plans` (Các phiên bản lịch trình cụ thể / Plan Snapshots)**:
    - Đại diện cho từng phiên bản kế hoạch cụ thể của phòng (`version_number = 1, 2, 3...`) ứng với các giai đoạn: vừa tạo (`INITIAL`), đang bình chọn (`VOTING`), đã chốt (`FINALIZED`), và đang thực hiện có chỉnh sửa (`ONGOING`).
    - Có liên kết `parent_plan_id` trỏ về phiên bản kế hoạch trước đó để so sánh lịch sử biến động.

```sql
-- events: Phòng cộng tác lập kế hoạch chuyến đi (Workspace)
CREATE TABLE core.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    scope VARCHAR(50) NOT NULL DEFAULT 'VACATION', -- DAY_HANGOUT, VACATION
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    destination VARCHAR(255) NOT NULL, -- Điểm đến bắt buộc (Location constraint)
    location VARCHAR(255),
    budget_tier VARCHAR(50), -- BUDGET, MODERATE, LUXURY
    total_budget DECIMAL(12, 2), -- Ngân sách ước tính tổng của cả nhóm
    macro_locked BOOLEAN DEFAULT FALSE, -- Chốt Consensus 1 (Lộ trình vĩ mô)
    final_locked BOOLEAN DEFAULT FALSE, -- Chốt Consensus 2 (Điểm dừng chi tiết)
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
    total_estimated_cost DECIMAL(12, 2) DEFAULT 0,
    created_by_id UUID REFERENCES core.users(id) ON DELETE SET NULL,
    macro_roadmap JSONB,
    change_summary VARCHAR(500),
    locked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_event_plan_version UNIQUE (event_id, version_number)
);
```

### 4.3. Bảng `plan_stops` & `plan_votes` (Mục 2.4 & 2.5: Đầy Đủ Thuộc Tính, Món Ăn Trong Quán & Lưu Vết Không Ghi Đè)
Một `Plan` được cấu thành từ một chuỗi tuần tự gồm nhiều điểm dừng (`plan_stops`). Theo yêu cầu của GVHD:
1. **Ép buộc đầy đủ thuộc tính chi tiết (Mục 2.4)**:
   - Ngày tháng cụ thể: `stop_date`, `day_number`.
   - Địa điểm cụ thể: `place_name`, `place_ref_id` (Google Place ID thật 100%), `address`, tọa độ GPS `lat`, `lng`, phân loại `category`.
   - Thời gian cụ thể: `start_time`, `end_time`, `duration_minutes`, `time_slot`.
   - Giá tiền cụ thể: `estimated_cost` (giá tham quan/ăn uống dự toán) và `transit_cost` (tiền di chuyển giữa 2 điểm).
   - Phương thức di chuyển: `transport_mode` (`WALKING`, `MOTORBIKE`, `TAXI_GRAB`, `CAR`, `BUS`, `TRAIN`, `FLIGHT`, `BOAT`).
   - **Gợi ý món ăn tại quán (`recommended_dishes`)**: Lưu danh sách các món ăn signature/đặc sản của quán kèm nhãn phù hợp với khẩu vị từng thành viên nhóm (ăn chay, không cay, không hải sản...).
2. **Quản lý trạng thái và lưu vết không ghi đè (Mục 2.5)**:
   - `stop_status`: Trạng thái chi tiết của điểm dừng (`INITIAL_PROPOSED`, `VOTING_OPEN`, `SELECTED_AFTER_VOTE`, `REJECTED_IN_VOTE`, `FINALIZED_LOCKED`, `ONGOING_ACTIVE`, `ADAPTED_ON_TRIP`, `SKIPPED_ON_TRIP`, `COMPLETED`).
   - `is_initial_stop`: `TRUE` nếu là điểm thuộc danh sách ban đầu do AI gợi ý.
   - `is_finalized_stop`: `TRUE` nếu là điểm thuộc danh sách chính thức đã được Host khóa sau khi vote.
   - `replaced_by_stop_id`: Khóa ngoại tự tham chiếu tới điểm dừng mới thay thế, giúp truy vết toàn vẹn lịch sử thay đổi (ví dụ: điểm bị vote DOWN hoặc đổi lúc trời mưa) mà không làm mất dữ liệu cũ.
   - `change_reason`: Lý do thay đổi (ví dụ: *"Trời mưa lớn tại Bà Nà Hills, đổi sang quán cafe trong nhà"* hoặc *"Nhóm bình chọn đổi quán bún bò"*).

```sql
-- plan_stops: Chi tiết các điểm dừng có đầy đủ thuộc tính và lưu vết lịch sử 4 giai đoạn
CREATE TABLE core.plan_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES core.plans(id) ON DELETE CASCADE,
    day_number INT NOT NULL DEFAULT 1,
    stop_date DATE NOT NULL,
    time_slot VARCHAR(50), -- MORNING, AFTERNOON, EVENING
    order_index INT NOT NULL,
    place_name VARCHAR(255) NOT NULL,
    place_ref_id VARCHAR(255) NOT NULL, -- Google Place ID thật
    address VARCHAR(500),
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    category VARCHAR(50) NOT NULL, -- RESTAURANT, CAFE, ATTRACTION, HOTEL, ENTERTAINMENT
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    duration_minutes INT DEFAULT 90,
    estimated_cost DECIMAL(10, 2) DEFAULT 0,

    -- Thuộc tính di chuyển (Mục 2.4)
    transport_mode VARCHAR(50) DEFAULT 'TAXI_GRAB', -- WALKING, MOTORBIKE, TAXI_GRAB, CAR, BUS, TRAIN, FLIGHT, BOAT
    transit_duration_minutes INT,
    transit_distance_km DOUBLE PRECISION,
    transit_cost DECIMAL(10, 2) DEFAULT 0,

    -- Gợi ý món ăn trong quán theo sở thích thành viên (Mục 2.4)
    recommended_dishes JSONB, -- Ví dụ: [{"dish_name": "Bánh xèo tôm nhảy", "estimated_price": 50000, "tags": ["Đặc sản", "Không cay"]}, {"dish_name": "Bánh tráng cuốn thịt heo", "estimated_price": 70000, "tags": ["Phổ biến"]}]

    -- Quản lý trạng thái và lưu vết lịch sử 4 giai đoạn không ghi đè (Mục 2.5)
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

### 4.4. Bảng `chat_messages` (Kênh Thảo Luận Chung Của Cả Nhóm & Định Hướng Phản Hồi)
Bảng `chat_messages` liên kết trực tiếp với `event_id`, khẳng định đây là **kênh chat chung duy nhất của cả phòng (Group Channel)**:
- Tất cả thành viên trong phòng cùng gửi và nhận tin nhắn trên một dòng thời gian hội thoại duy nhất.
- Cột `message_type` phân biệt rõ ràng:
  - `'CHAT'`: Tin nhắn trao đổi, tán gẫu thông thường giữa các thành viên.
  - `'AGENT_QA'`: Tin nhắn hỏi đáp giải đáp thắc mắc du lịch, kinh nghiệm, gợi ý món ăn đặc sản vùng miền.
  - `'AGENT_TRIGGER'`: Lệnh gọi Agent bắt đầu quy trình lập / điều chỉnh lịch trình (đã qua kiểm tra bộ lọc).
  - `'SYSTEM'`: Thông báo hệ thống (ví dụ: thành viên mới tham gia, lộ trình đã được chốt).

```sql
CREATE TABLE core.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES core.events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES core.users(id) ON DELETE SET NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'USER', -- USER, AI, SYSTEM
    message_type VARCHAR(50) NOT NULL DEFAULT 'CHAT', -- CHAT, AGENT_QA, AGENT_TRIGGER, SYSTEM
    content TEXT NOT NULL,
    metadata JSONB, -- Lưu trữ intent detection hoặc payload gợi ý
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_chat_event_time ON core.chat_messages(event_id, created_at);
```

---

## 🛡️ 5. Kịch Bản Vận Hành Lịch Sử 4 Giai Đoạn (Mục 2.5: Non-destructive Lifecycle)

Hệ thống **tuyệt đối không ghi đè dữ liệu** khi nhóm bình chọn hoặc khi xảy ra thay đổi đột xuất trong chuyến đi. Toàn bộ tiến trình được theo dõi qua 4 giai đoạn rõ ràng:

| Giai đoạn | Trạng thái `Plan` | Trạng thái `PlanStop` | Cơ chế lưu dữ liệu không mất dấu |
| :--- | :---: | :---: | :--- |
| **1. Khởi tạo (Initial Plan)** | `INITIAL` | `INITIAL_PROPOSED` | AI tạo bản kế hoạch đầu tiên (`v1`). Mọi điểm dừng ban đầu được gắn `is_initial_stop = TRUE`. |
| **2. Bình chọn (Voting)** | `VOTING` | `VOTING_OPEN` | Thành viên vote UP/DOWN. Điểm bị loại **không bị xóa/ghi đè** mà chuyển `stop_status = 'REJECTED_IN_VOTE'`. Điểm dự phòng thay thế được chèn với `stop_status = 'SELECTED_AFTER_VOTE'` và điểm cũ trỏ `replaced_by_stop_id` tới điểm mới kèm `change_reason`. |
| **3. Chốt lịch trình (Finalized)** | `FINALIZED` | `FINALIZED_LOCKED` | Host chốt kế hoạch: các điểm đang được chọn được khóa (`locked_at = NOW()`) và gắn `is_finalized_stop = TRUE`. |
| **4. Thực hiện thực tế (Ongoing)** | `ONGOING` | `ONGOING_ACTIVE` / `ADAPTED_ON_TRIP` / `SKIPPED_ON_TRIP` | Khi trời mưa, điểm ngoài trời cũ chuyển sang `stop_status = 'SKIPPED_ON_TRIP'` (lý do: *"Trời mưa lớn"*), điểm trong nhà mới chèn với `stop_status = 'ADAPTED_ON_TRIP'`, trỏ `replaced_by_stop_id`. |

### Ví Dụ Truy Vấn 3 Mốc Lịch Sử Từ Cùng Một Bảng:
1. **Lấy danh sách ban đầu do AI gợi ý**:
   ```sql
   SELECT * FROM core.plan_stops 
   WHERE plan_id = :plan_id AND is_initial_stop = TRUE 
   ORDER BY day_number, order_index;
   ```
2. **Lấy danh sách đã chốt sau khi nhóm bình chọn**:
   ```sql
   SELECT * FROM core.plan_stops 
   WHERE plan_id = :plan_id AND is_finalized_stop = TRUE 
   ORDER BY day_number, order_index;
   ```
3. **Lấy lộ trình thực tế đang đi (bao gồm các điểm thích ứng khi trời mưa)**:
   ```sql
   SELECT * FROM core.plan_stops 
   WHERE plan_id = :plan_id 
     AND stop_status IN ('FINALIZED_LOCKED', 'ONGOING_ACTIVE', 'ADAPTED_ON_TRIP')
   ORDER BY day_number, order_index;
   ```
$\implies$ Nhờ thiết kế này, nhóm có thể mở giao diện so sánh: *"Lúc đầu AI đề xuất gì $\rightarrow$ Nhóm vote chốt cái gì $\rightarrow$ Thực tế đi những đâu"* một cách trọn vẹn 100%!

---

## 🔍 6. Bộ Lọc Đầu Vào Cốt Lõi (Input Filter Layer)

Để tránh lãng phí chi phí token LLM và hạn chế rủi ro ảo giác, hệ thống bổ sung **Bộ lọc đầu vào (Input Filter)** tại Backend Gateway:
1. **Lọc tin nhắn rác (Noise / Spam Filter)**: Phân tách tin nhắn tán gẫu thông thường (`'CHAT'`) khỏi các yêu cầu lập kế hoạch (`'AGENT_TRIGGER'`).
2. **Ép buộc thông tin cốt lõi (Core Planning Parameters Enforcement)**:
   - Trước khi cho phép kích hoạt LangGraph AI Agent để sinh hoặc cập nhật Plan, hệ thống kiểm tra bắt buộc 2 thông tin cốt lõi:
     - **Địa điểm / Điểm đến (`Location / Destination`)**: Không được rỗng (ví dụ: *"Đà Nẵng"*, *"Đà Lạt"*, *"Hà Nội"*).
     - **Thời gian / Ngày đi (`Date / Date Range`)**: Phải xác định rõ ngày bắt đầu và kết thúc (`start_date`, `end_date` hoặc số ngày $N$).
   - Nếu tin nhắn yêu cầu lập lịch trình nhưng thiếu một trong hai thông tin này, Gateway trả về phản hồi yêu cầu người dùng cung cấp thêm thông tin (hoặc mở Modal thu thập thông tin nhanh), **tuyệt đối không chuyển tác vụ sang AI Worker** khi chưa đủ điều kiện đầu vào.
