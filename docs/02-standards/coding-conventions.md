# Clean Code & Professional Engineering Conventions
## Chuẩn Mực Lập Trình Chuyên Nghiệp — TripMate AI

> **Mục tiêu**: Xây dựng hệ thống phần mềm chuyên nghiệp, chất lượng cao, dễ bảo trì (maintainable), dễ mở rộng (extensible), dễ đọc hiểu (readable) cho cả thành viên mới và hội đồng đánh giá.  
> Mọi dòng code commit vào repository bắt buộc phải tuân thủ triệt để các nguyên lý: **Clean Code**, **SOLID**, **Low Coupling - High Cohesion**, **Hạn chế Hardcode**, **Hàm/Class ngắn gọn**, và **Phân tách Frontend/Backend rõ ràng**.

---

## 🏛️ 1. Triết Lý Thiết Kế Phần Mềm (Software Design Principles)

### 1.1. Nguyên lý SOLID trong thực tế
Dự án áp dụng triệt để 5 nguyên tắc SOLID cho cả Backend (Python/FastAPI) và Frontend (React/TypeScript):

| Nguyên tắc | Định nghĩa & Ý nghĩa | Áp dụng trong Backend | Áp dụng trong Frontend |
|---|---|---|---|
| **S - Single Responsibility** (Đơn trách nhiệm) | Một class/module/component chỉ nên có **một lý do duy nhất để thay đổi**. | Tách riêng: API Router (nhận request), Service (nghiệp vụ), Repository (truy vấn DB), Serializer/Schema (format dữ liệu). | Tách riêng: Component chỉ lo render JSX, Custom Hook lo state/logic, Service lo gọi API, CSS/Style lo giao diện. Không gom tất cả vào 1 file! |
| **O - Open/Closed** (Mở rộng - Đóng sửa đổi) | Module mở cho việc mở rộng (extension) nhưng đóng với việc sửa đổi (modification). | Sử dụng Strategy Pattern hoặc Handler Registry khi thêm nhà cung cấp (Google Places vs Mapbox, DeepSeek vs GPT-4o) mà không sửa core pipeline. | Thiết kế UI component nhận `children`, `renderProps` hoặc variant props thay vì sửa trực tiếp component gốc mỗi khi thêm trạng thái. |
| **L - Liskov Substitution** (Thay thế Liskov) | Class con phải có thể thay thế class cha mà không làm gãy logic hệ thống. | Các class triển khai Cache (`RedisCache`, `InMemoryCache`) phải kế thừa chung 1 Base Interface `BaseCache` và tuân thủ đúng signature/exceptions. | Mọi Custom Button component kế thừa đầy đủ `React.ButtonHTMLAttributes<HTMLButtonElement>` mà không phá vỡ hành vi native HTML. |
| **I - Interface Segregation** (Phân tách Interface) | Không ép client phải phụ thuộc vào interface chứa phương thức họ không dùng. | Thay vì 1 `GeneralService` khổng lồ có 50 methods, tách nhỏ thành `EventQueryService`, `EventVotingService`, `EventExportService`. | Không truyền cả object `Event` 30 fields vào một component chỉ cần hiển thị `title` và `date` — chỉ nhận đúng props cần thiết. |
| **D - Dependency Inversion** (Đảo ngược phụ thuộc) | Module cấp cao không phụ thuộc module cấp thấp. Cả hai cùng phụ thuộc vào Abstraction. | Router/Service phụ thuộc vào Abstract Interface/Base Class, truyền instance qua FastAPI `Depends()`, không tự `import db_session` hay `new Service()` trực tiếp. | UI Component không phụ thuộc trực tiếp vào Axios/Fetch instance toàn cục; inject qua Service functions hoặc Custom Hooks. |

---

### 1.2. Low Coupling (Giảm Phụ Thuộc) & High Cohesion (Tăng Sự Gắn Kết)

```
       [ KÉM: High Coupling + Low Cohesion ]                [ TỐT: Low Coupling + High Cohesion ]
  ┌───────────────────────────────────────────┐      ┌─────────────┐      ┌─────────────┐
  │ Component / File Khổng Lồ (God Object)    │      │ Module A    │─────>│ Module B    │
  │ - Chứa 300 dòng JSX                       │      │ (UI Pure)   │      │ (State Hook)│
  │ - Chứa 200 dòng CSS inline                │      └─────────────┘      └─────────────┘
  │ - Tự gọi fetch(), tự parse JSON           │             │                    │
  │ - Xử lý tính toán ngân sách, lọc địa điểm │             ▼                    ▼
  │ - Trực tiếp đọc/ghi biến toàn cục         │      ┌─────────────┐      ┌─────────────┐
  └───────────────────────────────────────────┘      │ Module C    │<─────│ Module D    │
                                                     │ (CSS Module)│      │ (API Client)│
                                                     └─────────────┘      └─────────────┘
```

- **Tăng tính gắn kết (High Cohesion)**:
  - Mọi hàm, class, hoặc package chỉ tập trung làm tốt một nghiệp vụ cụ thể.
  - Các phần tử thường xuyên thay đổi cùng nhau phải được đặt cạnh nhau (colocation theo feature/domain).
- **Giảm sự phụ thuộc (Low Coupling)**:
  - Các module giao tiếp với nhau thông qua **Contract rõ ràng** (TypeScript Interface, Pydantic Schema, DTO).
  - Không truy cập private attributes hoặc internal state của module khác.
  - Tuyệt đối cấm **Circular Dependency** (A import B, B lại import A). Sử dụng Dependency Injection hoặc Event Bus để phá vỡ vòng phụ thuộc.

---

## 🎨 2. Chuẩn Mực Frontend (React + TypeScript): Phân Tách Rõ Ràng

Frontend TripMate AI bắt buộc tuân theo nguyên tắc **Separation of Concerns (SoC)**. Một tính năng không bao giờ được viết dồn trong một file duy nhất.

### 2.1. Cấu trúc thư mục theo Feature-Driven & Modular Layout

```
frontend/src/
├── features/                     # Chia module nghiệp vụ rõ ràng
│   ├── event-planning/           # Feature: Lập kế hoạch sự kiện
│   │   ├── components/           # Sub-components chuyên biệt cho feature
│   │   │   ├── EventCard.tsx
│   │   │   ├── EventCard.module.css  # CSS tách riêng!
│   │   │   ├── PlanTimeline.tsx
│   │   │   └── PlanTimeline.module.css
│   │   ├── hooks/                # Custom hooks quản lý logic/state
│   │   │   ├── useEventPlan.ts
│   │   │   └── usePlanVoting.ts
│   │   ├── services/             # API caller functions (Axios/React Query)
│   │   │   └── eventApi.ts
│   │   ├── types/                # Types/Interfaces độc quyền của feature
│   │   │   └── event.types.ts
│   │   ├── constants/            # Hằng số, config riêng của feature
│   │   │   └── event.constants.ts
│   │   └── index.ts              # Public API của feature (Export những gì cần thiết)
│   └── ai-chat/                  # Feature: Chatbox trợ lý AI
├── components/                   # Shared UI Components dùng chung toàn app
│   ├── ui/                       # Button, Modal, Input, Badge, Dropdown...
│   │   ├── Button/
│   │   │   ├── Button.tsx        # Cấu trúc HTML/JSX
│   │   │   ├── Button.module.css # Stylesheet tách riêng (hoặc Tailwind classes sạch)
│   │   │   ├── Button.types.ts   # Props interface
│   │   │   └── index.ts
│   └── layout/                   # Header, Sidebar, Footer, Container
├── hooks/                        # Global reusable hooks (useDebounce, useAuth, useWebSocket)
├── services/                     # HTTP Client Base (Axios instance, interceptors, token refresh)
├── stores/                       # Global Zustand stores (authStore, uiStore)
├── styles/                       # Global styling & Design System
│   ├── variables.css             # CSS Variables: Colors, spacing, shadows, fonts
│   ├── reset.css
│   └── globals.css
└── utils/                        # Pure utility functions (date format, currency converter)
```

### 2.2. Phân Tách HTML/JSX, CSS và Logic Nghiệp Vụ

#### ❌ ANTI-PATTERN: File hỗn tạp (CẤM TUYỆT ĐỐI)
```tsx
// KHÔNG ĐƯỢC VIẾT THẾ NÀY: Gom JSX + CSS inline + API fetch + State tính toán vào 1 file
export const BadPlanView = () => {
  const [data, setData] = useState<any[]>([]);
  useEffect(() => {
    fetch('http://localhost:8000/api/v1/plans').then(r => r.json()).then(setData); // Hardcode URL, gọi trực tiếp
  }, []);

  return (
    <div style={{ display: 'flex', padding: '20px', backgroundColor: '#f0f0f0' }}> {/* Hardcode CSS inline */}
      {data.map(item => (
        <div style={{ margin: '10px', color: item.status === 'LOCKED' ? 'red' : 'green' }}>
          <h3>{item.name}</h3>
          <button onClick={() => { /* 40 dòng xử lý cập nhật state và gọi api */ }}>Vote</button>
        </div>
      ))}
    </div>
  );
};
```

#### ✅ BEST PRACTICE: Phân tách 3 lớp độc lập
1. **Lớp Giao Diện (Presentation Component)**: Chỉ chịu trách nhiệm hiển thị cấu trúc HTML/JSX và class name.
   ```tsx
   // features/event-planning/components/PlanStopCard.tsx
   import React from 'react';
   import styles from './PlanStopCard.module.css';
   import type { PlanStopCardProps } from './PlanStopCard.types';

   export const PlanStopCard: React.FC<PlanStopCardProps> = ({
     stop,
     isVoted,
     onVoteToggle,
     onSwapClick,
   }) => {
     return (
       <div className={`${styles.card} ${isVoted ? styles.voted : ''}`}>
         <div className={styles.header}>
           <h4 className={styles.title}>{stop.placeName}</h4>
           <span className={styles.badge}>{stop.category}</span>
         </div>
         <p className={styles.address}>{stop.formattedAddress}</p>
         <div className={styles.actions}>
           <button
             type="button"
             className={styles.voteButton}
             onClick={() => onVoteToggle(stop.id)}
           >
             {isVoted ? 'Đã thích' : 'Bình chọn'}
           </button>
           <button
             type="button"
             className={styles.swapButton}
             onClick={() => onSwapClick(stop.id)}
           >
             Đổi địa điểm
           </button>
         </div>
       </div>
     );
   };
   ```

2. **Lớp Định Kiểu (CSS Separation)**:
   - Dùng **CSS Modules** (`*.module.css`) hoặc **Tailwind CSS Utility classes chuẩn hóa**.
   - Tuyệt đối **không viết inline style** (`style={{ ... }}`), trừ trường hợp vị trí động tính bằng pixel thời gian thực (ví dụ tọa độ kéo thả drag-and-drop).
   - Màu sắc, kích thước phải dùng **CSS Variables / Design Tokens**:
   ```css
   /* features/event-planning/components/PlanStopCard.module.css */
   .card {
     display: flex;
     flex-direction: column;
     padding: var(--spacing-md);
     background-color: var(--color-surface);
     border-radius: var(--radius-lg);
     border: 1px solid var(--color-border);
     transition: border-color var(--transition-fast);
   }

   .card.voted {
     border-color: var(--color-primary);
     background-color: var(--color-primary-subtle);
   }

   .title {
     font-size: var(--font-size-md);
     font-weight: 600;
     color: var(--color-text-main);
   }
   ```

3. **Lớp Logic & State (Custom Hook)**:
   ```typescript
   // features/event-planning/hooks/usePlanVoting.ts
   import { useMutation, useQueryClient } from '@tanstack/react-query';
   import { eventApi } from '../services/eventApi';

   export const usePlanVoting = (eventId: string) => {
     const queryClient = useQueryClient();

     const voteMutation = useMutation({
       mutationFn: (stopId: string) => eventApi.toggleStopVote(eventId, stopId),
       onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['event-plan', eventId] });
       },
     });

     return {
       voteStop: voteMutation.mutate,
       isVoting: voteMutation.isPending,
     };
   };
   ```

---

## ⚙️ 3. Chuẩn Mực Backend (Python FastAPI): Kiến Trúc Phân Lớp & SOLID

Backend TripMate AI tuân thủ **Layered Architecture** chặt chẽ. Luồng dữ liệu đi 1 chiều:  
`Router (HTTP Controller) ➔ Service (Business Logic) ➔ Repository / DAL (Database Access) ➔ Model (SQLAlchemy)`

```
  [ HTTP Request ]
         │
         ▼
  ┌──────────────┐   Validate request body với Pydantic Schemas
  │  API Router  │   Xác thực quyền với Depends(get_current_user)
  └──────────────┘   KHÔNG chứa business logic, KHÔNG query DB trực tiếp
         │
         ▼
  ┌──────────────┐   Xử lý toàn bộ logic nghiệp vụ, tính toán, rules
  │Service Layer │   Gọi AI Agents, gọi các external APIs qua Adapters
  └──────────────┘   Hàm async def, ném Domain Exceptions
         │
         ▼
  ┌──────────────┐   Đóng gói câu truy vấn SQLAlchemy (Select, Insert, Update)
  │  Repository  │   Không quan tâm HTTP status code hay request context
  └──────────────┘
         │
         ▼
  [ Database / Cache ]
```

### 3.1. Các quy tắc phân lớp bắt buộc
1. **API Router**:
   - Chỉ đảm nhiệm: Nhận request, validate dữ liệu đầu vào qua Pydantic schema, kiểm tra quyền (RBAC/Dependencies), gọi Service, và trả về HTTP response với schema chuẩn.
   - Kích thước router endpoint: **Không quá 25 dòng code**.
2. **Service Layer**:
   - Đảm nhận toàn bộ quy tắc nghiệp vụ: gom cụm địa điểm, chuyển trạng thái chốt (Lock), điều phối AI Agent, gửi WebSocket notification.
   - Độc lập hoàn toàn với framework Web: Không nhận `Request` object hay `Response` object trực tiếp để có thể viết Unit Test dễ dàng bằng mock/stub.
3. **Repository Layer / Data Access**:
   - Tách biệt các câu lệnh query phức tạp (JOIN, Window Functions, aggregation) ra khỏi Service.
   - Thao tác qua SQLAlchemy `AsyncSession`. Không hardcode raw SQL queries bừa bãi.
4. **Pydantic v2 DTOs**:
   - Tách biệt rõ: `EventCreateRequest`, `EventUpdateRequest`, `EventResponse`, `EventDetailResponse`.
   - Luôn bật `model_config = ConfigDict(extra="forbid")` cho request payload để chặn các thuộc tính lạ hoặc tấn công mass assignment.

---

## 📏 4. Quy Chuẩn Hàm và Class Ngắn Gọn (Concise Functions & Classes)

Code dễ đọc và dễ bảo trì khi mỗi đơn vị code có kích thước nhỏ gọn và ngữ nghĩa tường minh.

### 4.1. Quy tắc về Hàm (Functions)
- **Độ dài hàm**:
  - Tối ưu: **10 – 30 dòng code**.
  - Tối đa tuyệt đối: **50 dòng code**. Nếu vượt quá 50 dòng, bắt buộc phải refactor và tách thành các private helper functions.
- **Mức độ trừu tượng đơn nhất (Single Level of Abstraction - SLA)**:
  - Một hàm chỉ nên thực hiện công việc ở cùng một mức trừu tượng.
  - Ví dụ: Hàm `create_event_plan` không nên vừa chứa logic điều phối cấp cao, vừa chứa 40 dòng tính toán khoảng cách tọa độ Haversine. Hãy tách phép tính Haversine ra hàm `calculate_haversine_distance()`.
- **Số lượng tham số đầu vào (Function Parameters)**:
  - Tối đa: **3 tham số**.
  - Nếu cần truyền từ 4 tham số trở lên:
    - Trong Python: Đóng gói thành Pydantic Schema hoặc Dataclass.
    - Trong TypeScript: Đóng gói thành Options Object có Type/Interface tương ứng (`{ eventId, filter, pagination }: GetEventsParams`).
- **Hạn chế Side Effects**: Hàm tính toán (pure function) không được sửa đổi state toàn cục hoặc tham số truyền vào.

### 4.2. Quy tắc về Class và Component
- **Độ dài Class**: Không vượt quá **200 – 250 dòng code**. Nếu dài hơn, class đang vi phạm nguyên lý Single Responsibility (God Class).
- **Độ dài React Component**: Không vượt quá **150 dòng code**. Nếu component dài hơn:
  - Tách các đoạn JSX lặp lại hoặc khối con phức tạp thành sub-components.
  - Đưa toàn bộ `useState`, `useEffect`, `useCallback` phức tạp vào Custom Hook.

---

## 🚫 5. Hạn Chế Tuyệt Đối Hardcode (No Magic Numbers / Strings)

Mọi giá trị có ý nghĩa nghiệp vụ bắt buộc phải được định danh qua **Hằng số (Constants)**, **Enums**, hoặc **Configuration Classes**.

### 5.1. Những gì bị coi là Hardcode (Nghiêm cấm commit)
1. **Magic Numbers**: Các con số tự nhiên xuất hiện không rõ lý do trong logic tính toán:
   ```python
   # ❌ SAI: Con số 2.5 và 20 là gì?
   if distance > 2.5 or travel_time > 20:
       reject()

   # ✅ ĐÚNG: Định danh hằng số rõ nghĩa
   MAX_STOP_DISTANCE_KM: Final[float] = 2.5
   MAX_TRANSIT_TIME_MINUTES: Final[int] = 20

   if distance > MAX_STOP_DISTANCE_KM or travel_time > MAX_TRANSIT_TIME_MINUTES:
       reject()
   ```
2. **Magic Strings**: Chuỗi trạng thái, vai trò, type dùng rải rác:
   ```typescript
   // ❌ SAI
   if (user.role === 'admin' && event.status === 'locked') { ... }

   // ✅ ĐÚNG: Dùng Enum hoặc const union
   export enum UserRole {
     ADMIN = 'ADMIN',
     MEMBER = 'MEMBER',
     VIEWER = 'VIEWER',
   }
   if (user.role === UserRole.ADMIN && event.status === EventStatus.LOCKED) { ... }
   ```
3. **Hardcode URLs & Endpoints**:
   - Frontend không được viết `http://localhost:8000/api/v1/...` trực tiếp trong component. Phải thông qua biến môi trường `VITE_API_BASE_URL` và file cấu hình `apiEndpoints.ts`.
4. **Hardcode Colors & CSS Values**:
   - Không viết mã màu `#2563eb` rải rác trong các file CSS/TSX. Định nghĩa trong `variables.css` hoặc file cấu hình Tailwind theme:
   ```css
   :root {
     --color-primary: #2563eb;
     --color-primary-hover: #1d4ed8;
     --color-danger: #dc2626;
     --spacing-sm: 8px;
     --spacing-md: 16px;
   }
   ```
5. **Cấu hình hệ thống (Timeouts, Limits, Thresholds)**:
   - Backend dùng Pydantic `BaseSettings` nạp từ biến môi trường (`app/core/config.py`).
   - Mọi biến bí mật (Secret, API Key, DB URI) chỉ đọc từ `.env`.

---

## 🧪 6. Chuẩn Mực Kiểm Thử (Unit Test & Integration Test)

Code chuyên nghiệp bắt buộc đi kèm kiểm thử tự động. Mọi pull request tính năng mới phải có test case tương ứng.

### 6.1. Nguyên tắc kiểm thử AAA (Arrange - Act - Assert)
Mọi test case phải phân tách 3 giai đoạn rõ ràng:
```python
@pytest.mark.asyncio
async def test_vote_stop_should_increase_count():
    # 1. Arrange: Chuẩn bị dữ liệu và mock
    user_id = uuid4()
    stop_id = uuid4()
    initial_votes = 2
    mock_repo = AsyncMock()
    mock_repo.get_vote_count.return_value = initial_votes + 1
    voting_service = PlanVotingService(repository=mock_repo)

    # 2. Act: Thực thi hàm cần kiểm thử
    result = await voting_service.cast_vote(user_id=user_id, stop_id=stop_id)

    # 3. Assert: Kiểm chứng kết quả đầu ra
    assert result.total_votes == 3
    mock_repo.record_vote.assert_called_once_with(user_id, stop_id)
```

### 6.2. Phân biệt Unit Test và Integration Test
- **Unit Test**:
  - Chạy nhanh (vài mili-giây/test), chạy độc lập không phụ thuộc vào internet, database thật hay bên thứ ba.
  - Toàn bộ external calls (Google Places API, OpenWeather, DeepSeek LLM, PostgreSQL) đều phải được **Mock / Stub**.
  - Kiểm thử: Thuật toán gom cụm Haversine, hàm format tiền tệ, validation schema, business rules của Service, pure UI components.
- **Integration Test**:
  - Kiểm thử sự tương tác giữa nhiều thành phần: FastAPI Route + SQLAlchemy + Test Database (Docker PostgreSQL / SQLite in-memory).
  - Kiểm thử flow tích hợp: Login lấy JWT ➔ Dùng JWT tạo Event ➔ Mời Member ➔ Member gửi Vote ➔ Chốt Event.
  - Sử dụng `httpx.AsyncClient` và database fixture tự rollback sau mỗi test.

---

## 📚 7. Tài Liệu Hướng Dẫn & Tính Tự Thuyết Minh (Self-Documenting Code)

1. **Self-Documenting Code First**:
   - Đặt tên biến, hàm, class sao cho người đọc hiểu ngay mục đích mà không cần đọc comment.
   - Tránh comment thừa giải thích cú pháp hiển nhiên:
     ```python
     # ❌ SAI: Comment thừa thãi
     # Tăng biến i lên 1
     i += 1

     # ✅ ĐÚNG: Chỉ comment giải thích "Tại sao?", các ràng buộc nghiệp vụ hoặc thuật toán đặc biệt
     # Áp dụng công thức Haversine với bán kính Trái Đất R = 6371km để tính khoảng cách cung tròn
     ```
2. **Docstrings & TSDoc**:
   - Python: Sử dụng **Google Style Docstring** cho mọi hàm nghiệp vụ, Service, Repository, LangGraph node (xem mẫu ở [documentation-guide.md](documentation-guide.md)).
   - TypeScript: Sử dụng **TSDoc** cho Custom Hooks, Utilities, và Props Interfaces.
3. **Module README**:
   - Mỗi thư mục module lớn (ví dụ `app/ai_agents/`, `frontend/src/features/event-planning/`) nên có một file `README.md` ngắn tóm tắt:
     - Mục đích của module.
     - Danh sách component / submodules chính.
     - Cách sử dụng và ví dụ gọi mẫu.

---

## 📋 8. Bảng Tự Kiểm Tra (Clean Code Checklist)

Trước khi tạo Pull Request, lập trình viên tự rà soát danh sách sau:

- [ ] Code có tuân thủ **SOLID**? Mỗi class/module có đơn trách nhiệm không?
- [ ] Tính gắn kết cao (**High Cohesion**), phụ thuộc thấp (**Low Coupling**)? Có bị vòng lặp import không?
- [ ] Ở Frontend: Đã tách riêng **HTML/JSX**, **CSS (CSS Modules/Tailwind)**, và **Logic (Custom Hooks/Services)** chưa?
- [ ] Có còn bất kỳ **inline style** `style={{ ... }}` hay mã màu/khoảng cách hardcode nào không?
- [ ] Không còn **magic numbers**, **magic strings**, URLs hardcode? Đã chuyển vào Constants/Enums?
- [ ] Hàm có **< 50 dòng**, số tham số **≤ 3**? Class có **< 200 dòng**?
- [ ] Đã viết đầy đủ **Unit Test** hoặc **Integration Test** cho logic mới (bao phủ cả Happy Path & Unhappy Path)?
- [ ] Đã thêm **Type Hints (Python)** và **Strict Types (TypeScript)**, không dùng `Any` / `any` bừa bãi?
- [ ] Đã chạy linter & formatter: `ruff check` và `pnpm run lint` xanh 100%?
