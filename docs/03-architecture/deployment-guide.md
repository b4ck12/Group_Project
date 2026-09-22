# 🚢 Deployment Guide — Multi-Cloud Production Architecture
## Dự án: TripMate AI — Intelligent Group Activity & Travel Planning Platform

> Tài liệu hướng dẫn triển khai sản phẩm thực tế trên 4 nền tảng đám mây phối hợp: **Vercel** (Frontend Edge), **Render** (FastAPI Web Service & LangGraph Worker), **Supabase** (PostgreSQL 16 + Supavisor Pooler), và **Upstash Redis** (Serverless Streams & Cache), bám sát 100% Mục 4.3 trong Technical Proposal.

---

## ☁️ 1. Tổng Quan Kiến Trúc Triển Khai Đám Mây (Multi-Cloud Distribution)

```
[GitHub Repository: minhduc1212/Group_Project]
  │
  ├── merge 'main' ──► GitHub Actions CI/CD Pipeline
  │                         │
  │                         ├──► 1. Vercel Global Edge CDN (Frontend React 18 SPA)
  │                         │       • Zero Cold-Start Edge Network
  │                         │       • VITE_API_BASE_URL trỏ về Render Gateway
  │                         │
  │                         ├──► 2. Render.com Web Service (FastAPI Gateway)
  │                         │       • REST Endpoints & WebSocket Room Server
  │                         │       • Keep-Alive Anti-Sleep Ping (/api/healthz)
  │                         │
  │                         └──► 3. Render.com Background Worker (LangGraph AI Agent)
  │                                 • DeepSeek-V4 Reasoning Engine (RAM <= 512MB)
  │                                 • Consumer Group đọc Redis Streams
  │
  └── Dịch Vụ Đám Mây Managed BaaS:
        ├── 4. Supabase: PostgreSQL 16 + pgvector + Supavisor Pooler (Port 6543, Transaction Mode)
        └── 5. Upstash: Serverless Redis 7 (Redis Streams + Redis Pub/Sub + L2 Cache)
```

| Tầng kiến trúc | Nền tảng Cloud | Loại dịch vụ | Cơ chế kích hoạt / Vận hành |
|---|---|---|---|
| **Frontend** | **Vercel** | Global Edge CDN | Tự động build và deploy khi merge `main`; tự sinh Preview URL cho mỗi PR. |
| **Backend Gateway** | **Render.com** | Web Service (Docker) | FastAPI ASGI app, phục vụ REST & WebSocket, cron ping chống sleep `/api/healthz`. |
| **AI Worker** | **Render.com** | Background Worker | Chạy tiến trình LangGraph Python tiêu thụ tác vụ từ Redis Streams. |
| **Database** | **Supabase** | Managed PostgreSQL 16 | Cung cấp Supavisor pooler (port 6543) và Supabase Auth. |
| **Queue & Cache** | **Upstash** | Serverless Redis 7 | Hàng đợi Redis Streams và kênh phát sóng Redis Pub/Sub. |

---

## 🌐 2. Frontend Deployment — Vercel Edge CDN

### 2.1. Cấu hình `vercel.json`
```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "framework": "vite",
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 2.2. Biến Môi Trường Trên Vercel Dashboard
- `VITE_API_BASE_URL`: `https://tripmate-backend.onrender.com/api/v1`
- `VITE_WS_BASE_URL`: `wss://tripmate-backend.onrender.com/ws`
- `VITE_USE_MOCK`: `false` (sử dụng backend thật trên production)
- `VITE_MAPBOX_ACCESS_TOKEN`: Mapbox public token
- `VITE_SUPABASE_URL`: URL dự án Supabase
- `VITE_SUPABASE_ANON_KEY`: Supabase Anonymous Public Key

---

## ⚙️ 3. Backend Gateway & AI Worker Deployment — Render.com

### 3.1. Blueprint Cấu Hình `render.yaml`
```yaml
services:
  # 1. FastAPI Web Service (Gateway & WebSockets)
  - type: web
    name: tripmate-gateway
    runtime: docker
    repo: https://github.com/minhduc1212/Group_Project
    dockerContext: ./backend
    dockerfilePath: ./backend/Dockerfile.prod
    plan: free
    region: singapore
    envVars:
      - key: ENVIRONMENT
        value: production
      - key: PORT
        value: 8000
      - key: DATABASE_URL
        sync: false # Kết nối Supavisor Pooler port 6543 trên Supabase
      - key: REDIS_URL
        sync: false # Upstash Redis Connection String (rediss://...)
      - key: SECRET_KEY
        generateValue: true
      - key: DEEPSEEK_API_KEY
        sync: false
    healthCheckPath: /api/healthz

  # 2. LangGraph AI Agent Background Worker
  - type: worker
    name: tripmate-ai-worker
    runtime: docker
    repo: https://github.com/minhduc1212/Group_Project
    dockerContext: ./backend
    dockerfilePath: ./backend/Dockerfile.worker
    plan: free
    region: singapore
    envVars:
      - key: ENVIRONMENT
        value: production
      - key: DATABASE_URL
        sync: false
      - key: REDIS_URL
        sync: false
      - key: DEEPSEEK_API_KEY
        sync: false
      - key: OPENAI_API_KEY
        sync: false
```

### 3.2. Cấu Hình Anti-Sleep Keep-Alive Ping (Ngăn Render Free Tier Ngủ Đông)
- Dùng **cron-job.org** hoặc **UptimeRobot** thiết lập gửi HTTP GET request định kỳ mỗi **10 phút** tới endpoint:
  ```
  https://tripmate-gateway.onrender.com/api/healthz
  ```
- Endpoint này phản hồi ngay HTTP `200 OK` (`{"status": "healthy", "service": "tripmate-gateway"}`) mà không tốn tài nguyên truy vấn cơ sở dữ liệu.

---

## 🗄️ 4. Supabase & Upstash Redis Setup

### 4.1. Supabase Database Configuration
1. **Bật Tiện Ích Mở Rộng**: Vào Supabase Dashboard $\rightarrow$ Database $\rightarrow$ Extensions $\rightarrow$ Bật `pgvector` và `uuid-ossp`.
2. **Khởi Tạo Schema Phân Lập**:
   ```sql
   CREATE SCHEMA IF NOT EXISTS core;
   CREATE SCHEMA IF NOT EXISTS checkpoints;
   CREATE SCHEMA IF NOT EXISTS vectors;
   ```
3. **Chạy Migration**: Chạy Alembic trỏ vào Direct Connection URL (port 5432):
   ```bash
   poetry run alembic upgrade head
   ```
4. **Cấu Hình Supavisor Pooler**: Sử dụng Transaction Mode tại port 6543 cho chuỗi kết nối runtime trong ứng dụng.

### 4.2. Upstash Redis Configuration
1. Tạo một Redis Database tại region **ap-southeast-1 (Singapore)** để tối ưu độ trễ với Render và Supabase.
2. Lấy chuỗi kết nối dạng TLS: `rediss://default:[PASSWORD]@[HOST]:6379`.
3. Kiểm tra kết nối Redis Streams qua CLI: `XADD test_stream * test "connection"`.

---

## 🧪 5. Quy Trình Kiểm Chứng Sau Triển Khai (Production Smoke Test)

Trước khi nghiệm thu sản phẩm hoặc demo chính thức, bắt buộc hoàn thành checklist 6 điểm:

1. [ ] **Health Check Gateway**: Truy cập `https://tripmate-gateway.onrender.com/api/healthz` trả về `200 OK`.
2. [ ] **Frontend CDN**: Truy cập domain Vercel load mượt mà, không có lỗi console runtime, SSL hợp lệ.
3. [ ] **Kết Nối WebSocket**: Mở Room Chat, kiểm tra kết nối WebSocket (`WSS`) duy trì ổn định, phản hồi ACK `< 80$\,ms.
4. [ ] **Luồng Đồng Thuận End-to-End**: Thử nghiệm luồng tạo phòng $\rightarrow$ chat mong muốn $\rightarrow$ Macro Lock $\rightarrow$ Stop Voting $\rightarrow$ 1-Click Swap $\rightarrow$ Final Lock $\rightarrow$ Xuất PDF.
5. [ ] **Kháng Lỗi AI Fallback**: Thử nghiệm tắt tạm thời API DeepSeek, xác nhận hệ thống tự động fallback sang GPT-4o / Claude mà không làm rớt phiên làm việc.
6. [ ] **Kiểm Tra Rò Rỉ Secret**: Quét toàn bộ repository bảo đảm không có file `.env` hoặc API key thật bị lộ trên Git.
