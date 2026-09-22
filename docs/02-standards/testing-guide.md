# 🧪 Testing Guide & Evaluation Methodology
## Dự án: TripMate AI — Intelligent Group Activity & Travel Planning Platform

> Tài liệu chuẩn hóa quy trình kiểm thử chất lượng phần mềm, bao gồm Unit Test, Integration Test, và **Phương pháp đánh giá thực nghiệm (Evaluation Methodology)** theo đúng Mục 5.2 của Technical Proposal nhằm kiểm chứng độ tin cậy của AI Agent và hiệu năng của hệ thống Cloud.

---

## 🎯 1. Chiến Lược Kiểm Thử Kim Tự Tháp (Testing Pyramid)

```
            / \
           /   \        E2E & Load Testing (Locust: 50-100 CCU, 150-250 req/s)
          /  ▲  \       Grounding Benchmark (100 Prompts, Places API verification >= 98%)
         /───────\
        /         \     Integration Testing (Pytest AsyncClient, Supabase DB, Upstash Redis)
       /     ▲     \    Circuit Breaker & Fallback Chaos Tests (PyBreaker 2.5s timeout)
      /─────────────\
     /               \  Unit Testing (Pytest FastAPI Routers, Vitest React Components,
    /        ▲        \ Pydantic Schema Validation, Haversine Geo-clustering)
   /───────────────────\
```

---

## 🤖 2. Đánh Giá Năng Lực AI Agent (AI Agent Evaluation Methodology)

Theo Mục 5.2.1 trong Technical Proposal, AI Agent hợp nhất bắt buộc phải vượt qua 3 bài test thực nghiệm:

### 2.1. Grounding & Hallucination Test (Kiểm Thử Ảo Giác)
- **Phương pháp**: Chạy script tự động với bộ dữ liệu **100 test prompts** đa dạng tại nhiều thành phố (Đà Nẵng, Hà Nội, TP.HCM, Bangkok, Singapore).
- **Cơ chế xác minh**: Script tự động bóc tách từng điểm dừng do AI sinh ra và gọi trực tiếp lên Google Places API để xác thực sự tồn tại của `place_id`.
- **Chỉ số đo lường (KPI Metric)**:
  $$\text{Verification Rate} = \frac{\text{Số POIs được xác thực có Place ID}}{\text{Tổng số POIs do AI đề xuất}} \ge 98\%$$
  - **Mục tiêu tuyệt đối**: **0% địa điểm giả lập (0% fake POIs)**.

### 2.2. Constraint Satisfaction Test (Kiểm Thử Tuân Thủ Ràng Buộc)
- **Phương pháp**: Kiểm tra tính hợp lệ của các điểm dừng đối với các ràng buộc khắt khe:
  - Khung ngân sách (Budget tier).
  - Khẩu vị và kiêng kỵ ẩm thực (Dietary preferences).
  - **Gom cụm địa lý**: Khoảng cách giữa 2 điểm liên tiếp $\le 2.5$\,km (công thức Haversine) và thời gian di chuyển $\le 20$\,phút.
- **Chỉ số đo lường (KPI Metric)**: **Tỷ lệ đạt ràng buộc $\ge 95\%$**.

### 2.3. User Acceptance & Consensus Speed Test (Thử Nghiệm Người Dùng Thực Tế)
- **Phương pháp**: Thử nghiệm thực tế với **10 nhóm người dùng thật** (mỗi nhóm $3$--$6$ thành viên), ghi nhận telemetry bình chọn và thời gian hoàn thành chốt kế hoạch.
- **Chỉ số đo lường (KPI Metric)**:
  - Tỷ lệ chấp thuận ngay ở lượt đề xuất đầu tiên $\ge 85\%$.
  - Thời gian đạt đồng thuận từ lúc tạo phòng đến khi chốt Final Lock: **$< 15$ phút** (so với 2--3 ngày trước đây).

---

## ⚡ 3. Đánh Giá Hiệu Năng Hệ Thống Cloud (System Performance Evaluation)

Theo Mục 5.2.2 trong Technical Proposal:

### 3.1. Latency & Distributed Tracing Test (Đo Lường Độ Trễ Phân Tán)
Sử dụng **OpenTelemetry** và **LangSmith** để đo đạc thời gian xử lý qua từng chặng:
- **Phản hồi thao tác người dùng (User Action / Vote ACK)**: $< 80$\,ms.
- **Streaming token đầu tiên của AI (TTFT)**: $< 800$\,ms.
- **Thời gian đồng bộ WebSocket giữa nhiều người dùng**: $< 100$\,ms.
- **Thời gian soạn thảo Roadmap vĩ mô (Macro Drafting)**: $6$--$12$\,s.
- **Thời gian tuyển chọn chi tiết (Micro Grounding)**: $10$--$20$\,s.
- **Thời gian đổi điểm dừng 1-Click Swap**: $3$--$6$\,s.

### 3.2. Load & Concurrency Stress Test (Kiểm Thử Chịu Tải Bằng Locust)
- **Kịch bản**: Giả lập **$50$--$100$ người dùng đồng thời (CCU)** trong $10$--$20$ phòng lập kế hoạch hoạt động song song, liên tục gửi tin nhắn chat, thực hiện vote điểm dừng và kích hoạt AI sinh kế hoạch.
- **Chỉ số đo lường**:
  - Thông lượng duy trì ổn định: **$150$--$250$\,req/s** trên FastAPI Gateway.
  - Tỷ lệ lỗi (Error Rate): **$< 0.5\%$**.
  - Mức tiêu thụ bộ nhớ của AI Worker trên Render: **$\le 512$\,MB RAM** (bộ nhớ bounded $\le 280$\,MB).

### 3.3. Fault Tolerance & Chaos Test (Kiểm Thử Kháng Lỗi)
- **Kịch bản 1 (Mô phỏng API ngoài bị chậm/lỗi)**: Tạo độ trễ 5 giây vào Google Places API.
  - **Kết quả mong đợi**: **PyBreaker Circuit Breaker** ngắt mạch chính xác tại mốc **2.5 giây** và trả về dữ liệu fallback từ L2 Cache.
- **Kịch bản 2 (Mô phỏng DeepSeek API ngừng hoạt động)**: Tạm thời khóa API key của DeepSeek.
  - **Kết quả mong đợi**: **Model Abstraction Layer** tự động chuyển hướng mượt mà sang OpenAI GPT-4o / Claude / Gemini mà không làm rớt phiên làm việc của người dùng.

---

## 🛠️ 4. Hướng Dẫn Chạy Test Tại Local

### 4.1. Chạy Unit Test & Integration Test Backend (Pytest)
```bash
cd backend

# Chạy toàn bộ test suites kèm đo độ phủ (coverage)
poetry run pytest --cov=app --cov-report=term-missing

# Chạy riêng kiểm thử thuật toán gom cụm khoảng cách Haversine
poetry run pytest tests/test_geo_clustering.py

# Chạy riêng kiểm thử Two-Stage Consensus logic
poetry run pytest tests/test_consensus_flow.py

# Chạy kiểm tra Circuit Breaker & Fallback
poetry run pytest tests/test_pybreaker.py
```

### 4.2. Chạy Frontend Component & Integration Test (Vitest)
```bash
cd frontend

# Chạy unit test với Vitest
pnpm run test

# Chạy kiểm thử linter
pnpm run lint
```

### 4.3. Chạy Kịch Bản Stress Test (Locust)
```bash
cd backend
poetry run locust -f tests/load_test/locustfile.py --headless -u 100 -r 10 -t 5m --host http://localhost:8000
```
- `-u 100`: Giả lập 100 người dùng đồng thời.
- `-r 10`: Tăng dần 10 user mỗi giây.
- `-t 5m`: Chạy liên tục trong 5 phút.
