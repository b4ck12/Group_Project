# 🧪 Testing Guide & Quality Assurance Standard
## Quy Chuẩn Kiểm Thử Phần Mềm — TripMate AI

> Tài liệu chuẩn hóa quy trình kiểm thử chất lượng phần mềm, bao gồm **Unit Test**, **Integration Test**, và **Phương pháp đánh giá thực nghiệm (Evaluation Methodology)** theo đúng Mục 5.2 của Technical Proposal nhằm bảo đảm độ tin cậy của mã nguồn, khả năng kháng lỗi của AI Agent và hiệu năng của hệ thống Cloud.

---

## 🎯 1. Chiến Lược Kiểm Thử Kim Tự Tháp (Testing Pyramid)

Hệ thống tuân thủ kim tự tháp kiểm thử với tỷ trọng lớn dành cho Unit Test (nhanh, rẻ, cô lập) và Integration Test (kiểm chứng giao tiếp module và DB).

```
             / \
            /   \        E2E & Load Testing (Locust: 50-100 CCU, 150-250 req/s)
           /  ▲  \       Grounding Benchmark (100 Prompts, Places API verification >= 98%)
          /───────\
         /         \     Integration Testing (Pytest AsyncClient, Supabase DB, Upstash Redis, MSW)
        /     ▲     \    Circuit Breaker & Fallback Chaos Tests (PyBreaker 2.5s timeout)
       /─────────────\
      /               \  Unit Testing (Pytest FastAPI Services/Routers, Vitest React Components/Hooks,
     /        ▲        \ Pydantic Validation, Haversine Geo-clustering Algorithm)
    /───────────────────\
```

---

## 🔬 2. Quy Chuẩn Unit Test (Kiểm Thử Đơn Vị)

### 2.1. Yêu cầu cốt lõi đối với Unit Test
1. **Độc lập và Cô lập (Isolation)**:
   - Một unit test không được kết nối mạng thật, không gọi external API thật (Google Places, Mapbox, DeepSeek), và không phụ thuộc vào thứ tự chạy của các test khác.
   - Toàn bộ dependencies phải được Mock hoặc Stub (`unittest.mock.AsyncMock` ở Backend, `vi.fn()` / `vi.mock()` ở Frontend).
2. **Nguyên tắc cấu trúc AAA (Arrange - Act - Assert)**:
   - **Arrange**: Thiết lập dữ liệu đầu vào, khởi tạo mock dependencies và kết quả giả lập.
   - **Act**: Gọi duy nhất 1 phương thức/hàm cần kiểm thử.
   - **Assert**: Kiểm tra kết quả trả về, trạng thái thay đổi hoặc xác nhận mock method được gọi đúng tham số.
3. **Bao phủ biên và ngoại lệ (Boundary & Edge Cases)**:
   - Bắt buộc kiểm thử: Danh sách rỗng (`[]`), chuỗi rỗng (`""`), giá trị `None` / `null`, số âm, tọa độ địa lý ngoài biên hợp lệ, token hết hạn, vượt quá giới hạn ký tự.
   - Kiểm thử cả luồng thành công (Happy Path) và luồng sinh lỗi (Unhappy Path: validate thất bại, ném exception mong muốn).
4. **Không Hardcode dữ liệu trong Test**:
   - Dùng Factory hoặc Fixture để sinh dữ liệu test mẫu (`user_factory()`, `mock_stop_data()`), tránh copy-paste các object JSON khổng lồ giữa các test cases.

### 2.2. Ví dụ Unit Test Backend (Pytest + AsyncMock)
```python
# tests/unit/test_plan_voting_service.py
import pytest
from unittest.mock import AsyncMock
from uuid import uuid4
from app.services.plan_voting_service import PlanVotingService
from app.core.exceptions import EventLockedException

@pytest.mark.asyncio
async def test_cast_vote_when_event_locked_should_raise_exception():
    # Arrange
    mock_repo = AsyncMock()
    mock_repo.is_event_locked.return_value = True
    service = PlanVotingService(repository=mock_repo)
    user_id = uuid4()
    stop_id = uuid4()

    # Act & Assert
    with pytest.raises(EventLockedException) as exc_info:
        await service.cast_vote(user_id=user_id, stop_id=stop_id)

    assert "Sự kiện đã bị khóa, không thể bình chọn" in str(exc_info.value)
    mock_repo.record_vote.assert_not_called()
```

### 2.3. Ví dụ Unit Test Frontend (Vitest + React Testing Library)
```typescript
// features/event-planning/components/PlanStopCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PlanStopCard } from './PlanStopCard';

describe('PlanStopCard Component', () => {
  const mockStop = {
    id: 'stop-123',
    placeName: 'Bảo tàng Điêu khắc Chăm',
    category: 'CULTURE',
    formattedAddress: 'Số 2, Đường 2 Tháng 9, Hải Châu, Đà Nẵng',
  };

  it('renders stop information correctly', () => {
    // Arrange & Act
    render(
      <PlanStopCard
        stop={mockStop}
        isVoted={false}
        onVoteToggle={vi.fn()}
        onSwapClick={vi.fn()}
      />
    );

    // Assert
    expect(screen.getByText('Bảo tàng Điêu khắc Chăm')).toBeInTheDocument();
    expect(screen.getByText(/Hải Châu, Đà Nẵng/)).toBeInTheDocument();
  });

  it('fires onVoteToggle when user clicks vote button', () => {
    // Arrange
    const handleVoteToggle = vi.fn();
    render(
      <PlanStopCard
        stop={mockStop}
        isVoted={false}
        onVoteToggle={handleVoteToggle}
        onSwapClick={vi.fn()}
      />
    );

    // Act
    const voteButton = screen.getByRole('button', { name: /Bình chọn/i });
    fireEvent.click(voteButton);

    // Assert
    expect(handleVoteToggle).toHaveBeenCalledTimes(1);
    expect(handleVoteToggle).toHaveBeenCalledWith('stop-123');
  });
});
```

---

## 🔗 3. Quy Chuẩn Integration Test (Kiểm Thử Tích Hợp)

Integration Test xác thực sự phối hợp nhịp nhàng giữa nhiều module: Router ➔ Service ➔ Database, hoặc Component ➔ Custom Hook ➔ Mock Server.

### 3.1. Integration Test Backend với Test Database & Auto-Rollback
- **Nguyên tắc**: Mỗi test case chạy trên 1 database transaction riêng biệt và tự động `ROLLBACK` sau khi test xong. Không để dữ liệu rác tồn đọng làm ảnh hưởng test khác.
- Sử dụng `httpx.AsyncClient` để gửi HTTP request giả lập qua FastAPI application:
```python
# tests/integration/test_events_api.py
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_event_and_retrieve_details(
    client: AsyncClient, 
    auth_headers: dict[str, str]
):
    # Act 1: Tạo mới sự kiện
    create_payload = {
        "title": "Chuyến đi Đà Nẵng 3 ngày 2 đêm",
        "destination": "Đà Nẵng",
        "startDate": "2026-11-01T08:00:00Z",
        "endDate": "2026-11-03T20:00:00Z",
        "budgetTier": "MODERATE"
    }
    response = await client.post("/api/v1/events", json=create_payload, headers=auth_headers)
    assert response.status_code == 201
    created_event = response.json()
    event_id = created_event["id"]

    # Act 2: Lấy chi tiết sự kiện vừa tạo
    get_res = await client.get(f"/api/v1/events/{event_id}", headers=auth_headers)
    assert get_res.status_code == 200
    detail = get_res.json()
    assert detail["title"] == create_payload["title"]
    assert detail["destination"] == "Đà Nẵng"
```

### 3.2. Integration Test Frontend với Mock Service Worker (MSW)
- Thay vì gọi API backend thật, dùng MSW (`msw/node`) để intercept network request tại tầng Service Worker.
- Kiểm thử luồng: Render component ➔ Custom Hook fetch dữ liệu từ MSW ➔ Hiển thị danh sách địa điểm lên màn hình.

---

## 🤖 4. Đánh Giá Năng Lực AI Agent (AI Agent Evaluation Methodology)

Theo Mục 5.2.1 trong Technical Proposal, AI Agent hợp nhất bắt buộc phải vượt qua 3 bài test thực nghiệm:

### 4.1. Grounding & Hallucination Test (Kiểm Thử Ảo Giác)
- **Phương pháp**: Chạy script tự động với bộ dữ liệu **100 test prompts** đa dạng tại nhiều thành phố (Đà Nẵng, Hà Nội, TP.HCM, Bangkok, Singapore).
- **Cơ chế xác minh**: Script tự động bóc tách từng điểm dừng do AI sinh ra và gọi trực tiếp lên Google Places API để xác thực sự tồn tại của `place_id`.
- **Chỉ số đo lường (KPI Metric)**:
  $$\text{Verification Rate} = \frac{\text{Số POIs được xác thực có Place ID}}{\text{Tổng số POIs do AI đề xuất}} \ge 98\%$$
  - **Mục tiêu tuyệt đối**: **0% địa điểm giả lập (0% fake POIs)**.

### 4.2. Constraint Satisfaction Test (Kiểm Thử Tuân Thủ Ràng Buộc)
- **Phương pháp**: Kiểm tra tính hợp lệ của các điểm dừng đối với các ràng buộc khắt khe:
  - Khung ngân sách (Budget tier).
  - Khẩu vị và kiêng kỵ ẩm thực (Dietary preferences).
  - **Gom cụm địa lý**: Khoảng cách giữa 2 điểm liên tiếp $\le 2.5$\,km (công thức Haversine) và thời gian di chuyển $\le 20$\,phút.
- **Chỉ số đo lường (KPI Metric)**: **Tỷ lệ đạt ràng buộc $\ge 95\%$**.

### 4.3. User Acceptance & Consensus Speed Test (Thử Nghiệm Người Dùng Thực Tế)
- **Phương pháp**: Thử nghiệm thực tế với **10 nhóm người dùng thật** (mỗi nhóm $3$--$6$ thành viên), ghi nhận telemetry bình chọn và thời gian hoàn thành chốt kế hoạch.
- **Chỉ số đo lường (KPI Metric)**:
  - Tỷ lệ chấp thuận ngay ở lượt đề xuất đầu tiên $\ge 85\%$.
  - Thời gian đạt đồng thuận từ lúc tạo phòng đến khi chốt Final Lock: **$< 15$ phút** (so với 2--3 ngày trước đây).

---

## ⚡ 5. Đánh Giá Hiệu Năng Hệ Thống Cloud (System Performance Evaluation)

Theo Mục 5.2.2 trong Technical Proposal:

### 5.1. Latency & Distributed Tracing Test (Đo Lường Độ Trễ Phân Tán)
Sử dụng **OpenTelemetry** và **LangSmith** để đo đạc thời gian xử lý qua từng chặng:
- **Phản hồi thao tác người dùng (User Action / Vote ACK)**: $< 80$\,ms.
- **Streaming token đầu tiên của AI (TTFT)**: $< 800$\,ms.
- **Thời gian đồng bộ WebSocket giữa nhiều người dùng**: $< 100$\,ms.
- **Thời gian soạn thảo Roadmap vĩ mô (Macro Drafting)**: $6$--$12$\,s.
- **Thời gian tuyển chọn chi tiết (Micro Grounding)**: $10$--$20$\,s.
- **Thời gian đổi điểm dừng 1-Click Swap**: $3$--$6$\,s.

### 5.2. Load & Concurrency Stress Test (Kiểm Thử Chịu Tải Bằng Locust)
- **Kịch bản**: Giả lập **$50$--$100$ người dùng đồng thời (CCU)** trong $10$--$20$ phòng lập kế hoạch hoạt động song song, liên tục gửi tin nhắn chat, thực hiện vote điểm dừng và kích hoạt AI sinh kế hoạch.
- **Chỉ số đo lường**:
  - Thông lượng duy trì ổn định: **$150$--$250$\,req/s** trên FastAPI Gateway.
  - Tỷ lệ lỗi (Error Rate): **$< 0.5\%$**.
  - Mức tiêu thụ bộ nhớ của AI Worker trên Render: **$\le 512$\,MB RAM** (bộ nhớ bounded $\le 280$\,MB).

### 5.3. Fault Tolerance & Chaos Test (Kiểm Thử Kháng Lỗi)
- **Kịch bản 1 (Mô phỏng API ngoài bị chậm/lỗi)**: Tạo độ trễ 5 giây vào Google Places API.
  - **Kết quả mong đợi**: **PyBreaker Circuit Breaker** ngắt mạch chính xác tại mốc **2.5 giây** và trả về dữ liệu fallback từ L2 Cache.
- **Kịch bản 2 (Mô phỏng DeepSeek API ngừng hoạt động)**: Tạm thời khóa API key của DeepSeek.
  - **Kết quả mong đợi**: **Model Abstraction Layer** tự động chuyển hướng mượt mà sang OpenAI GPT-4o / Claude / Gemini mà không làm rớt phiên làm việc của người dùng.

---

## 🛠️ 6. Hướng Dẫn Chạy Test Tại Local

### 6.1. Chạy Unit Test & Integration Test Backend (Pytest)
```bash
cd backend

# Chạy toàn bộ test suites kèm đo độ phủ (coverage >= 80%)
poetry run pytest --cov=app --cov-report=term-missing

# Chạy riêng unit test
poetry run pytest tests/unit/

# Chạy riêng integration test
poetry run pytest tests/integration/

# Chạy riêng kiểm thử thuật toán gom cụm khoảng cách Haversine
poetry run pytest tests/unit/test_geo_clustering.py
```

### 6.2. Chạy Frontend Component & Integration Test (Vitest)
```bash
cd frontend

# Chạy test tương tác (watch mode)
pnpm run test

# Chạy test 1 lần (CI mode) kèm coverage
pnpm run test:run --coverage

# Chạy kiểm thử linter
pnpm run lint
```

### 6.3. Chạy Kịch Bản Stress Test (Locust)
```bash
cd backend
poetry run locust -f tests/load_test/locustfile.py --headless -u 100 -r 10 -t 5m --host http://localhost:8000
```
