# Naming Conventions & Code Style Guide
## Quy Chuẩn Đặt Tên Toàn Diện — TripMate AI

> **Mục tiêu**: Đảm bảo toàn bộ codebase (Backend, Frontend, Database, CSS, Test) có tính nhất quán cao, tự thuyết minh (self-documenting), không gây hiểu nhầm và dễ dàng tìm kiếm (searchable).

---

## 💻 1. Frontend (React 18 + TypeScript)

### 1.1. Bảng quy chuẩn đặt tên tổng quát
| Đối tượng | Quy chuẩn (Casing) | Tiền tố / Hậu tố | Ví dụ chuẩn | Ví dụ sai ❌ |
|---|---|---|---|---|
| **Biến & tham số** | `camelCase` | Danh từ rõ nghĩa | `userId`, `selectedStopId`, `memberList` | `u_id`, `x`, `arr` |
| **Hàm & Phương thức** | `camelCase` | Bắt đầu bằng động từ | `createEvent()`, `fetchPlanById()`, `calculateTotalBudget()` | `event()`, `data()`, `process()` |
| **Biến Boolean** | `camelCase` | Bắt đầu bằng `is`, `has`, `can`, `should` | `isLoading`, `hasVoted`, `canEditPlan`, `shouldRefresh` | `loading`, `voted`, `flag`, `check` |
| **Event Handler (Nội bộ component)** | `camelCase` | Tiền tố `handle*` | `handleSubmit`, `handleStopClick`, `handleVoteToggle` | `submitForm`, `onClickBtn` |
| **Callback Props (Truyền vào component)** | `camelCase` | Tiền tố `on*` | `onSubmit`, `onStopClick`, `onVoteToggle` | `submit`, `handleClick` |
| **Custom Hooks** | `camelCase` | Tiền tố `use*` | `useEventPlan`, `usePlanVoting`, `useDebounce` | `eventHook`, `votingState` |
| **Class, Interface, Type Alias** | `PascalCase` | Không dùng tiền tố `I` | `EventService`, `PlanStop`, `UserProfile` | `IUser`, `i_event`, `stop_type` |
| **Component Props Interface** | `PascalCase` | Hậu tố `Props` | `PlanStopCardProps`, `ButtonProps`, `NavbarProps` | `IProps`, `PlanCardData` |
| **Enum** | `PascalCase` (tên), `UPPER_SNAKE_CASE` (giá trị) | Danh từ số ít | `enum EventStatus { DRAFT = 'DRAFT', LOCKED = 'LOCKED' }` | `enum eventStatus { draft = 'draft' }` |
| **Hằng số toàn cục (Constants)** | `UPPER_SNAKE_CASE` | Danh từ mô tả rõ | `DEFAULT_PAGE_SIZE`, `MAX_ATTACHMENT_SIZE_MB` | `defaultSize`, `max_mb` |

### 1.2. Quy chuẩn đặt tên File & Thư mục Frontend
- **File Component**: `PascalCase.tsx` trùng tên component chính bên trong:
  - `PlanStopCard.tsx`, `EventTimeline.tsx`, `Navbar.tsx`
- **File Stylesheet (CSS Module)**: `<ComponentName>.module.css`:
  - `PlanStopCard.module.css`, `Button.module.css`
- **File Custom Hook**: `use<FeatureName>.ts`:
  - `usePlanVoting.ts`, `useEventDetail.ts`
- **File API Service / HTTP Client**: `<feature>Api.ts` hoặc `<domain>.service.ts`:
  - `eventApi.ts`, `authService.ts`
- **File Types / Interfaces**: `<feature>.types.ts`:
  - `event.types.ts`, `voting.types.ts`
- **File Constants**: `<feature>.constants.ts`:
  - `event.constants.ts`
- **Thư mục feature / module**: `kebab-case`:
  - `features/event-planning/`, `features/ai-chat/`, `features/auth/`

### 1.3. Quy chuẩn CSS & Design Tokens
1. **CSS Modules**:
   - Tên class trong file `.module.css` dùng **`camelCase`** để dễ import vào TypeScript mà không cần cú pháp ngoặc vuông:
     ```css
     /* PlanStopCard.module.css */
     .cardContainer { display: flex; }
     .titleActive { color: var(--color-primary); }
     ```
     ```tsx
     // PlanStopCard.tsx
     <div className={styles.cardContainer}>
       <h4 className={styles.titleActive}>{stop.title}</h4>
     </div>
     ```
2. **BEM Convention (Nếu viết CSS Global / Plain CSS)**:
   - Cú pháp: `block__element--modifier`:
     - Khối: `.plan-card`
     - Phần tử con: `.plan-card__header`, `.plan-card__action-btn`
     - Trạng thái / Biến thể: `.plan-card__action-btn--active`, `.plan-card--disabled`
3. **CSS Variables (Design Tokens)**:
   - Tiền tố phân loại rõ ràng:
     - Màu sắc: `--color-primary`, `--color-surface`, `--color-text-muted`
     - Khoảng cách: `--spacing-xs`, `--spacing-sm`, `--spacing-md`, `--spacing-lg`
     - Bo góc: `--radius-sm`, `--radius-md`, `--radius-full`
     - Bóng đổ: `--shadow-sm`, `--shadow-md`, `--shadow-lg`

---

## 🐍 2. Backend (Python 3.11+ FastAPI & LangGraph)

### 2.1. Bảng quy chuẩn đặt tên Backend
| Đối tượng | Quy chuẩn (Casing) | Quy tắc & Ví dụ chuẩn | Ví dụ sai ❌ |
|---|---|---|---|
| **Biến & tham số** | `snake_case` | `user_id`, `event_payload`, `total_amount` | `userId`, `EventData`, `x` |
| **Hàm & Phương thức** | `snake_case` | Động từ đầu: `get_event_by_id()`, `calculate_distance()` | `EventGet()`, `calc()`, `data()` |
| **Hàm / Biến Private (Internal)** | `_snake_case` | Tiền tố dấu gạch dưới: `_verify_signature()`, `_internal_cache` | `verifySignature()`, `__verify` |
| **Class Service / Repository** | `PascalCase` | Hậu tố vai trò: `EventService`, `PlanRepository`, `PlacesClient` | `event_service`, `EventClass` |
| **Pydantic Schema (Request/Response DTO)** | `PascalCase` | Hậu tố rõ ràng: `EventCreateRequest`, `EventResponse`, `StopFilterParams` | `EventDTO`, `EventData`, `ReqEvent` |
| **Custom Exception** | `PascalCase` | Hậu tố `Exception` hoặc `Error`: `EventNotFoundException`, `PlanLockedError` | `NotFound`, `ErrEvent` |
| **LangGraph Agent Node** | `snake_case` | Động từ + danh từ: `macro_drafting_node`, `micro_curation_node` | `Node1`, `MacroAgent` |
| **Hằng số Module** | `UPPER_SNAKE_CASE` | `MAX_RECURSION_LIMIT = 15`, `EARTH_RADIUS_KM = 6371.0` | `maxRecursion`, `radius` |

### 2.2. Quy chuẩn đặt tên File & Thư mục Backend
- **Thư mục & Package**: `snake_case` ngắn gọn:
  - `app/api/v1/`, `app/services/`, `app/repositories/`, `app/ai_agents/`
- **File API Router**: `snake_case.py` theo tên resource số nhiều:
  - `events.py`, `plans.py`, `votes.py`, `places.py`, `auth.py`
- **File Service**: `<entity>_service.py`:
  - `event_service.py`, `plan_voting_service.py`, `ai_agent_service.py`
- **File Schema**: `<entity>_schema.py` hoặc gom trong `schemas/<entity>.py`:
  - `schemas/event.py`, `schemas/plan.py`

---

## 🗄️ 3. Database (PostgreSQL qua SQLAlchemy)

| Đối tượng | Quy chuẩn (Casing) | Cú pháp & Ví dụ | Ghi chú |
|---|---|---|---|
| **SQLAlchemy Model Class** | `PascalCase` | `Event`, `PlanStop`, `UserVote` | Luôn là **Danh từ số ít** |
| **Tên bảng (`__tablename__`)** | `snake_case` | `"events"`, `"plan_stops"`, `"user_votes"` | Luôn là **Danh từ số nhiều** |
| **Cột thuộc tính (Columns)** | `snake_case` | `id`, `start_date`, `created_at`, `is_locked` | Rõ nghĩa, không viết tắt |
| **Khoá ngoại (Foreign Key)** | `snake_case` | `event_id`, `user_id`, `plan_stop_id` | Mẫu `<tên_bảng_số_ít>_id` |
| **Bảng trung gian (Many-to-Many)** | `snake_case` | `event_members`, `stop_voters` | Ghép 2 thực thể liên kết |
| **Index Indexing** | `snake_case` | `idx_events_owner_id`, `idx_plan_stops_event_id` | Mẫu `idx_<tên_bảng>_<tên_cột>` |
| **Unique Constraint** | `snake_case` | `uq_events_code`, `uq_stop_votes_user_stop` | Mẫu `uq_<tên_bảng>_<cột>` |

---

## 🌐 4. API Endpoints & Routes (RESTful API)

- **Nguyên tắc**: Sử dụng **Danh từ số nhiều**, viết thường nối bằng dấu gạch ngang (`kebab-case`).
- **Không dùng động từ trong URI**: Hành động được quy định bởi HTTP Method (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).

```
GET    /api/v1/events                  # Lấy danh sách sự kiện
POST   /api/v1/events                  # Tạo sự kiện mới
GET    /api/v1/events/{id}             # Lấy chi tiết 1 sự kiện
PATCH  /api/v1/events/{id}             # Cập nhật một phần sự kiện
DELETE /api/v1/events/{id}             # Xóa sự kiện

POST   /api/v1/events/{id}/lock        # Hành vi đặc biệt (state transition)
POST   /api/v1/events/{id}/stops/{stop_id}/vote  # Sub-resource action
```

---

## 🧪 5. Kiểm Thử (Unit & Integration Test Naming)

### 5.1. Tên file kiểm thử
- **Backend (Pytest)**: Bắt đầu bằng `test_`:
  - `tests/unit/test_haversine.py`
  - `tests/integration/test_event_api.py`
- **Frontend (Vitest)**: Tên file component hoặc hook kèm `.test.tsx` hoặc `.test.ts`:
  - `PlanStopCard.test.tsx`
  - `usePlanVoting.test.ts`

### 5.2. Tên hàm kiểm thử: Mẫu `test_<hàm_cần_test>_<kịch_bản>_<kết_quả_mong_đợi>`
Mọi hàm test phải trả lời được 3 câu hỏi qua tên của nó:
```python
# Backend examples
def test_calculate_distance_with_valid_coordinates_should_return_correct_km():
    ...

def test_cast_vote_when_event_is_locked_should_raise_conflict_exception():
    ...

def test_create_event_with_missing_title_should_return_422():
    ...
```
```typescript
// Frontend examples
describe('PlanStopCard', () => {
  it('should call onVoteToggle with stopId when vote button is clicked', () => {
    ...
  });

  it('should render active badge when isVoted is true', () => {
    ...
  });
});
```

---

## 🔑 6. Biến Môi Trường (`.env`)

- Cú pháp: **`UPPER_SNAKE_CASE`**.
- Tiền tố theo nhóm module để dễ nhóm và tra cứu:
  - `DATABASE_URL`: Kết nối PostgreSQL Supabase.
  - `REDIS_URL`: Kết nối Upstash Redis.
  - `JWT_SECRET_KEY`, `JWT_ALGORITHM`: Cấu hình Authentication.
  - `DEEPSEEK_API_KEY`, `AI_MODEL_NAME`: Cấu hình AI Engine.
  - `VITE_API_BASE_URL`: Biến phía Frontend (bắt buộc tiền tố `VITE_`).
- Tuyệt đối không commit file `.env` chứa credential thật lên GitHub. Luôn đồng bộ danh sách biến vào `.env.example`.
