# 🗄️ Database Schema & Supabase Data Architecture
## Dự án: TripMate AI — Intelligent Group Activity & Travel Planning Platform

> Tài liệu chuẩn hóa kiến trúc cơ sở dữ liệu cho dự án TripMate AI, triển khai trên nền tảng **Supabase PostgreSQL 16 + pgvector**, kết nối qua **Supavisor Connection Pooler (port 6543, Transaction Mode)**, phân tách 3 schema độc lập (`core`, `checkpoints`, `vectors`), và áp dụng chính sách bảo mật **Row Level Security (RLS)** theo đúng Technical Proposal.

---

## 🏛️ 1. Cấu Trúc Phân Tách Schema (3 Isolated Schemas)

Để tối ưu hóa hiệu năng, bảo mật và khả năng mở rộng, cơ sở dữ liệu được phân chia thành 3 schema độc lập:

```mermaid
flowchart TD
    subgraph S1 ["1. 'core' Schema (Relational ACID Data)"]
        U["users"]
        E["events"]
        EM["event_members"]
        P["plans"]
        PS["plan_stops (Normalized)"]
        PV["plan_votes (Atomic Counters)"]
        CM["chat_messages"]
        INV["invitations"]
        EXP["expenses & expense_splits"]
        SET["settlements"]
    end

    subgraph S2 ["2. 'checkpoints' Schema (LangGraph Persistence)"]
        CK["checkpoints (AsyncPostgresSaver)"]
        CKB["checkpoint_blobs"]
        CKW["checkpoint_writes"]
    end

    subgraph S3 ["3. 'vectors' Schema (Semantic POI Gems)"]
        VEC["poi_embeddings (pgvector - 1536 dim)"]
        HNSW["HNSW Index for Fast Cosine Similarity"]
    end

    style S1 fill:#f0f4f8,stroke:#12305c,stroke-width:1.5px;
    style S2 fill:#e2f4f4,stroke:#186c8e,stroke-width:1.5px;
    style S3 fill:#e8f5e9,stroke:#2e7d32,stroke-width:1.5px;
```

1. **`core` Schema**: Chứa toàn bộ dữ liệu quan hệ nghiệp vụ của ứng dụng (người dùng, phòng, điểm dừng, bình chọn, tin nhắn chat, quản lý tài chính).
2. **`checkpoints` Schema**: Dành riêng cho **LangGraph Python (`AsyncPostgresSaver`)** để lưu vết trạng thái `AgentState` theo từng phiên phòng (`event_id`), giúp khôi phục phiên tức thì nếu worker khởi động lại.
3. **`vectors` Schema**: Sử dụng tiện ích mở rộng `pgvector` để lưu trữ vector embeddings của các địa điểm du lịch, nhà hàng, quán cafe đặc sắc hỗ trợ tra cứu tương đồng.

---

## ⚡ 2. Cấu Hình Supavisor Connection Pooler (Port 6543)

- **Vấn đề**: Khi $50$--$100$ người dùng đồng thời (CCU) trong $10$--$20$ phòng cùng chat và vote, số lượng kết nối client có thể tăng vọt lên hơn 200 connection, dễ làm cạn kiệt connection pool của PostgreSQL.
- **Giải pháp theo Proposal**: Hệ thống kết nối qua **Supavisor Pooler tại port 6543 ở chế độ Transaction Mode**:
  - Multiplex **200+ phiên client đồng thời** chỉ thông qua **15 kết nối vật lý** tới PostgreSQL.
  - Sử dụng biến môi trường:
    ```env
    # Kết nối qua Supavisor Pooler (Dùng cho FastAPI Web Service & LangGraph Worker)
    DATABASE_URL=postgresql+asyncpg://postgres.project_ref:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require
    # Kết nối trực tiếp Direct Connection (Chỉ dùng cho Alembic migration)
    DIRECT_URL=postgresql+asyncpg://postgres:[PASSWORD]@db.project_ref.supabase.co:5432/postgres?sslmode=require
    ```

---

## 📊 3. Sơ Đồ Quan Hệ Thực Thể (ERD - `core` Schema)

```mermaid
erDiagram
    User ||--o{ EventMember : joins
    User ||--o{ Plan : creates
    User ||--o{ PlanVote : votes
    User ||--o{ ChatMessage : sends
    User ||--o{ Invitation : sent_or_received
    User ||--o{ Expense : pays
    User ||--o{ ExpenseSplit : owes

    Event ||--o{ EventMember : contains
    Event ||--o{ Plan : has
    Event ||--o{ ChatMessage : holds
    Event ||--o{ Invitation : invites
    Event ||--o{ Expense : tracks
    Event ||--o{ Settlement : settles

    Plan ||--o{ PlanStop : includes
    PlanStop ||--o{ PlanVote : receives
    PlanStop ||--o{ Expense : costs

    Expense ||--o{ ExpenseSplit : divides
    Settlement ||--|| User : from_user
    Settlement ||--|| User : to_user
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

### 4.2. Bảng `events` & `plans` (Phòng & Kế hoạch)
```sql
-- events: Phòng cộng tác lập kế hoạch
CREATE TABLE core.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    scope VARCHAR(50) NOT NULL DEFAULT 'VACATION', -- DAY_HANGOUT, VACATION
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    destination VARCHAR(255),
    budget_tier VARCHAR(50), -- BUDGET, MODERATE, LUXURY
    macro_locked BOOLEAN DEFAULT FALSE, -- Chốt Consensus 1
    final_locked BOOLEAN DEFAULT FALSE, -- Chốt Consensus 2
    created_by UUID REFERENCES core.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- plans: Kế hoạch chứa lộ trình tổng quan
CREATE TABLE core.plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES core.events(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, VOTING, CONFIRMED, ARCHIVED
    macro_roadmap JSONB, -- Khung chủ đề các ngày (Pha 1 LangGraph)
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.3. Bảng `plan_stops` & `plan_votes` (Điểm dừng Chuẩn hóa & Bình chọn Atomic)
> **Điểm mấu chốt theo Proposal**: Bảng `plan_stops` lưu trữ từng điểm dừng độc lập để hỗ trợ cập nhật nguyên tử duy nhất 1 dòng khi thực hiện **1-Click Swap** hoặc **Dynamic On-The-Go Adaptation (khi trời mưa)**.

```sql
-- plan_stops: Chi tiết các điểm dừng đã qua 4-Tier Grounding
CREATE TABLE core.plan_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES core.plans(id) ON DELETE CASCADE,
    day_number INT NOT NULL DEFAULT 1,
    time_slot VARCHAR(50) NOT NULL, -- MORNING, AFTERNOON, EVENING
    order_index INT NOT NULL,
    place_name VARCHAR(255) NOT NULL,
    place_ref_id VARCHAR(255) NOT NULL, -- Google Place ID thật 100%
    category VARCHAR(50) NOT NULL, -- RESTAURANT, CAFE, ATTRACTION, HOTEL, ENTERTAINMENT
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    duration_minutes INT DEFAULT 90,
    estimated_cost DECIMAL(12, 2) DEFAULT 0,
    up_votes INT DEFAULT 0,
    down_votes INT DEFAULT 0,
    backup_options JSONB, -- 2 phương án dự phòng cho 1-Click Swap
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- plan_votes: Phiếu vote của từng thành viên cho điểm dừng
CREATE TABLE core.plan_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stop_id UUID NOT NULL REFERENCES core.plan_stops(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    vote_value VARCHAR(10) NOT NULL, -- UP, DOWN
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_stop_user_vote UNIQUE (stop_id, user_id)
);
```

### 4.4. Bảng `chat_messages` (Tin nhắn Phòng Cộng tác)
```sql
CREATE TABLE core.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES core.events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES core.users(id) ON DELETE SET NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'USER', -- USER, ASSISTANT, SYSTEM
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_chat_event_time ON core.chat_messages(event_id, created_at);
```

### 4.5. Bảng Quản Lý Tài Chính 3 Bảng Tối Ưu (`expenses`, `expense_splits`, `settlements`)
```sql
-- expenses: Ghi nhận thu quỹ trước (ADVANCE) hoặc chi tiêu thực tế (PAYMENT)
CREATE TABLE core.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES core.events(id) ON DELETE CASCADE,
    paid_by UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    type VARCHAR(50) DEFAULT 'PAYMENT', -- ADVANCE, PAYMENT
    split_type VARCHAR(50) DEFAULT 'EQUAL', -- EQUAL, EXACT, PERCENTAGE
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- expense_splits: Chi tiết phân bổ chi phí cho từng người thụ hưởng
CREATE TABLE core.expense_splits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_id UUID NOT NULL REFERENCES core.expenses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    CONSTRAINT uq_expense_user_split UNIQUE (expense_id, user_id)
);

-- settlements: Kết quả gợi ý chuyển khoản tối ưu (Min-Cash-Flow)
CREATE TABLE core.settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES core.events(id) ON DELETE CASCADE,
    from_user_id UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    is_settled BOOLEAN DEFAULT FALSE,
    settled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🛡️ 5. Chính Sách Bảo Mật Row Level Security (RLS)

Để bảo đảm tính riêng tư đa thuê bao (multi-tenant privacy):

```sql
-- Kích hoạt RLS cho toàn bộ các bảng trong core schema
ALTER TABLE core.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE core.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE core.plan_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE core.chat_messages ENABLE ROW LEVEL SECURITY;

-- Chính sách: Chỉ thành viên trong phòng mới được xem kế hoạch
CREATE POLICY member_view_plans ON core.plans
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM core.event_members em
            WHERE em.event_id = core.plans.event_id
              AND em.user_id = auth.uid()
        )
    );

-- Chính sách: Chỉ Host mới được xác nhận khóa kế hoạch
CREATE POLICY host_lock_plan ON core.events
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM core.event_members em
            WHERE em.event_id = core.events.id
              AND em.user_id = auth.uid()
              AND em.role = 'HOST'
        )
    );
```