# 🛠️ Technology Stack & Cloud Platform Distribution

> Tài liệu chuẩn hóa danh mục công nghệ và phân bổ hạ tầng đám mây cho dự án **TripMate AI: Intelligent Group Activity & Travel Planning Platform**, bám sát 100% Bảng 1 trong Technical Proposal.

---

## ☁️ 1. Bảng Phân Bổ Công Nghệ & Nền Tảng Đám Mây (Core Cloud Stack)

| Tầng (Tier) | Công Nghệ Cốt Lõi | Nền Tảng Cloud | Vai Trò Kiến Trúc & Vận Hành |
|---|---|---|---|
| **Frontend** | **React 18 + Vite + TypeScript** | **Vercel** | Giao diện Single Page Application (SPA), Bố cục Flexbox & Responsive thích ứng đa màn hình, Component-Driven Modular Design, Dòng thời gian tương tác, Thẻ bình chọn điểm dừng, Canvas Mapbox GL trên Edge CDN (Zero cold-start). |
| **Backend Gateway** | **FastAPI (Python 3.11+)** | **Render.com** | ASGI Gateway (Clean Architecture), cung cấp RESTful endpoints, WebSocket Room Server cho cộng tác thời gian thực, cron ping tự động chống sleep (`/api/healthz`), JWT / Role Guards. |
| **AI Agent Layer** | **LangGraph Python** | **Render.com** | Worker AI chạy ngầm tiêu thụ hàng đợi, thực thi Agent hợp nhất DeepSeek-V4 qua 2 pha trạng thái (Macro & Micro curation), giới hạn bộ nhớ $\le 280$\,MB / $512$\,MB RAM. |
| **Model Abstraction** | **LangChain Model Abstraction** | **Cloud LLM APIs** | Mô hình suy luận chính: **DeepSeek-V4**; Cơ chế tự động Fallback trong suốt sang **OpenAI (GPT-4o)**, **Anthropic Claude**, hoặc **Google Gemini** để chống vendor lock-in. |
| **Database & BaaS** | **PostgreSQL 16 + pgvector** | **Supabase** | Lưu trữ quan hệ ACID chuẩn hóa, phân tách 3 schema (`core`, `checkpoints`, `vectors`), kết nối qua **Supavisor Connection Pooler (port 6543, Transaction Mode)** ghép 200+ phiên, bảo mật Row Level Security (RLS). |
| **Queue & Cache** | **Redis 7 / Redis Streams** | **Upstash Redis** | Serverless Redis quản lý hàng đợi tác vụ bất đồng bộ (**Redis Streams** `XADD`/`XREADGROUP`), phát sóng sự kiện đa máy chủ (**Redis Pub/Sub** `plan:updated`), và bộ nhớ đệm L2 Cache lưu POIs (TTL 24h). |
| **Travel & Lodging APIs** | **Multi-Provider Adapters** | **Multi-Provider APIs** | Tích hợp hệ thống tìm kiếm khách sạn & địa điểm đa nguồn: **Google Maps, Google Search, Google Hotels, TripAdvisor, Airbnb, Trip.com, Hotels.com, Trivago, Expedia** qua Adapter/Strategy Pattern. |
| **Resilience & Ops** | **PyBreaker + OpenTelemetry** | **Cloud Observability** | Ngắt mạch tự động (**Circuit Breaker**) bảo vệ các API du lịch bên ngoài (timeout 2.5s), phân tán vết đo lường (Distributed Tracing) và kiểm soát LLM qua **LangSmith**. |

---

## 💻 2. Chi Tiết Từng Tầng Kỹ Thuật

### 2.1. Frontend (React 18 + Vite + TypeScript + Flexbox Responsive)
- **Framework & Runtime**: React 18, Vite (tốc độ HMR cực nhanh), TypeScript 5.x nghiêm ngặt để kiểm soát type an toàn khi 6 người code song song.
- **UI & Layout (Flexbox & CSS Grid)**: Áp dụng triệt để **Flexbox (`display: flex`)** và CSS Grid, thiết kế theo tiêu chuẩn Mobile-First, responsive hoàn hảo trên mọi breakpoint:
  - Mobile (375px+): Giao diện 1 cột với bottom-sheet / drawer vuốt mượt mà cho Room Chat và Stop Voting.
  - Tablet (768px+): Bố cục 2 cột linh hoạt tối ưu không gian hiển thị.
  - Desktop (1024px+ / 1440px+): Split-pane 3 cột đồng thời (Chat - Interactive Timeline - Mapbox GL Canvas) không gây giật lag và zero layout shift (CLS < 0.1).
- **Component-Driven Modular Design**: Chia nhỏ giao diện theo atomic components (shadcn/ui + Tailwind CSS), độc lập trạng thái, đầy đủ 6 states: Default, Hover, Active, Disabled, Skeleton Loading, Empty, Error.
- **State Management**: **Zustand** quản lý client state gọn nhẹ (Room Context, Auth User, Active Stops, Voting Status).
- **Data Fetching & Caching**: **TanStack Query (React Query v5)** tự động cache, revalidate, quản lý loading/error state khi gọi Gateway.
- **Map Canvas**: **Mapbox GL JS** hiển thị bản đồ tương tác, vẽ tuyến đường di chuyển tối ưu giữa các điểm dừng trong cùng một buổi.
- **Mocking Strategy**: **Mock Service Worker (MSW)** giả lập API response theo đúng hợp đồng OpenAPI từ Sprint 0.

### 2.2. Backend Gateway (FastAPI Python 3.11+)
- **Framework & Architecture**: **FastAPI** (chạy trên Uvicorn ASGI Server), hỗ trợ `async/await` native cho thông lượng cao (150--250 req/s), áp dụng **Layered Clean Architecture** phân tách Router, Service, DAL và Adapters.
- **Validation**: **Pydantic v2** đảm bảo dữ liệu đầu vào được validate và sanitize chặt chẽ trước khi xử lý.
- **Authentication**: Supabase Auth + JWT Access/Refresh tokens, cơ chế phân quyền RBAC (Host/Owner vs Member).
- **WebSocket Server**: WebSocket Router quản lý kết nối thời gian thực của từng phòng (`/ws/rooms/{room_id}`), nhận diện tin nhắn chat, vote điểm dừng, phản hồi tức thì dưới 80ms.
- **Keep-Alive Cron Ping**: Tự động gửi request tới `/api/healthz` định kỳ mỗi 10 phút để đảm bảo instance trên Render Web Service luôn sẵn sàng phục vụ người dùng.

### 2.3. AI Agent Layer (LangGraph Python & DeepSeek-V4)
- **Orchestrator**: **LangGraph Python (`langgraph`)** xây dựng máy trạng thái hữu hạn (State Machine) với 2 pha thực thi:
  - *Phase 1 (Macro Planning State)*: Soạn thảo khung chương trình (số ngày, chủ đề từng ngày, nhịp độ).
  - *Phase 2 (Micro Curation State)*: Truy vấn địa điểm thực tế, áp dụng thuật toán gom cụm khoảng cách Haversine ($\le 2.5$\,km).
- **Model Engine**: **DeepSeek-V4** làm mô hình suy luận chính; Model Abstraction Layer bọc ngoài giúp tự động fallback sang GPT-4o, Claude 3.5 Sonnet hoặc Gemini 1.5 Pro khi DeepSeek API quá tải.
- **Checkpointing**: Sử dụng `AsyncPostgresSaver` lưu vết trạng thái `AgentState` vào schema `checkpoints` của PostgreSQL, cho phép khôi phục phiên hội thoại ngay lập tức nếu container bị khởi động lại.

### 2.4. Database & BaaS (Supabase PostgreSQL 16)
- **Engine**: PostgreSQL 16 hỗ trợ quan hệ toàn vẹn, chỉ mục tối ưu, và tiện ích mở rộng `pgvector`.
- **Cấu trúc Schema phân lập**:
  - `core`: Bảng `users`, `events`, `event_members`, `plans`, `plan_stops`, `plan_votes`, `chat_messages`, `expenses`, `settlements`.
  - `checkpoints`: Lưu trữ trạng thái đồ thị của LangGraph.
  - `vectors`: Lưu trữ vector embeddings cho địa điểm.
- **Supavisor Connection Pooler**: Hoạt động tại **port 6543 ở chế độ Transaction Mode**, ghép tải từ hàng trăm request đồng thời qua 15 kết nối vật lý.
- **Bảo mật RLS**: Áp dụng Row Level Security (RLS) để chỉ thành viên trong cùng một phòng mới được truy cập dữ liệu của phòng đó.

### 2.5. Queue & Cache (Upstash Redis 7)
- **Redis Streams (`XADD`/`XREADGROUP`)**: Đóng vai trò Message Broker bất đồng bộ. Khi người dùng yêu cầu AI lên lịch, FastAPI đẩy task vào stream và trả về HTTP ACK tức thì; LangGraph Worker trên Render sẽ kéo task về xử lý.
- **Redis Pub/Sub (`plan:updated`)**: Khi AI Worker ghi xong điểm dừng vào database, nó bắn sự kiện qua Redis Pub/Sub; các node FastAPI Gateway đang lắng nghe sẽ lập tức broadcast dữ liệu mới tới tất cả các client qua WebSockets.
- **L2 Cache (TTL 24h)**: Lưu trữ các kết quả tra cứu địa điểm và thời tiết để giảm tải chi phí và chống rate limit API bên thứ 3.

### 2.6. Travel & Lodging Multi-Provider APIs (Adapter & Strategy Pattern)
- **Khách sạn & Lưu trú**: **Google Hotels, Airbnb, Trip.com, Hotels.com, Trivago, Expedia** — Tích hợp để đối soát phòng trống, so sánh phân khúc giá và định tuyến liên kết đặt phòng.
- **Địa điểm & Điểm tham quan (POIs)**: **Google Maps (Google Places API New), Google Search, TripAdvisor, OpenStreetMap (OSM)** — Xác thực tọa độ GPS, ảnh thực tế, giờ mở cửa và xếp hạng đánh giá cộng đồng.
- **Hoạt động & Vé vui chơi**: **Klook, 12Go Asia** — Đặt vé trải nghiệm và phương tiện trung chuyển liên tỉnh.
- **Thời tiết**: **OpenWeatherMap API** (cache 3 giờ).
- **Kiến trúc Adapter (`BaseTravelProvider`)**: Mọi provider đều kế thừa interface chuẩn hóa, cho phép cắm thêm (plug-and-play) nhà cung cấp mới mà không sửa code nghiệp vụ.
- **Độ Bền PyBreaker Circuit Breaker**: Đặt ngưỡng timeout 2.5 giây. Nếu API bên thứ 3 bị treo hoặc quá tải quá 3 lần liên tiếp, mạch sẽ tự động ngắt (OPEN) trong 60 giây và trả về dữ liệu fallback từ cache hoặc gợi ý đã lưu trong database.

### 2.7. Chuẩn Mực Thiết Kế Ứng Dụng: Modular Design & Bộ Ba Tiêu Chí Kỹ Thuật
- **Architecture Pattern Chuẩn Mực**:
  - *Layered Architecture*: Phân định ranh giới rõ ràng Router $\rightarrow$ Service $\rightarrow$ DAL $\rightarrow$ Adapters, không để logic rò rỉ giữa các tầng.
  - *Component-Driven Architecture*: Tách biệt giao diện (Presentation) khỏi logic (Custom Hooks) và trạng thái (Stores).
- **Modular Design (Tính Mô-đun Hóa)**:
  - Phân vùng theo domain nghiệp vụ (`features/event-planning`, `features/ai-chat`, `features/finance-settlement`).
  - Đảm bảo High Cohesion (nội hàm module gắn kết chặt) và Low Coupling (phụ thuộc lỏng lẻo qua Interface/DTO).
- **Bộ Ba Tiêu Chí Công Kỹ Nghệ**:
  - 🛠️ **Dễ Maintain (Maintainable)**: Tuân thủ SOLID, DRY, hàm ngắn ($\le 30$ dòng), circuit breaker tự phục hồi, kiểm thử tự động.
  - 💻 **Dễ Dev (Developer-Friendly & High DX)**: Quy trình Contract-First với OpenAPI & MSW, TypeScript + Pydantic v2 type safety 100%, Vite HMR cực nhanh.
  - 📖 **Dễ Hiểu (Readable & Intuitive)**: Chuẩn đặt tên Clean Naming, code tự dẫn giải, tài liệu Docs-as-Code bám sát thiết kế hệ thống.

## 👥 3. Tóm Tắt Trách Nhiệm Công Nghệ Theo 6 Thành Viên

| Thành viên | Vai trò | Công nghệ cốt lõi nắm giữ |
|---|---|---|
| **Tạ Quang Huy** | Backend Core & AI Integration | FastAPI, SQLAlchemy 2.0, Supabase Schemas, Supavisor Pooler, WebSockets, Redis Streams/PubSub. |
| **Hà Đăng Huy** | Backend Platform & Frontend Core | HTTPX Async, Google Places API, PyBreaker, Upstash Redis Cache, React 18, Mapbox GL JS, Tailwind. |
| **Phạm Đình Ánh Dương** | Backend Services & Settlement | Supabase Auth, JWT, SMTP Email, WeasyPrint PDF, .ics Calendar, Thuật toán giải quyết nợ tối ưu (Settlement). |
| **Nguyễn Minh Đức** | Frontend Growth & AI Experience | React 18, Realtime WebSockets, AI Streaming UI, Design System, i18n (VI/EN), Recharts Admin UI. |
| **Nguyễn Tùng Dương** | AI Agent Lead | LangGraph Python, DeepSeek-V4, Model Abstraction Layer, Four-Tier Grounding, Geo-Clustering. |
| **Đinh Tiến Luân** | DevOps & Cyber Security | Multi-Cloud (Vercel, Render, Supabase), GitHub Actions CI/CD, OpenTelemetry, LangSmith, OWASP Pentest. |
