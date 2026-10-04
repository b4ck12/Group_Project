# Hướng Dẫn Viết Tài Liệu Kỹ Thuật & Tracking (Documentation Guide)
## Chuẩn Mực Tài Liệu Hướng Dẫn & Onboarding — TripMate AI

> **Nguyên tắc bất biến**: **"Docs as Code"** & **"No Docs = Not Done & No Merge"**.  
> Toàn bộ tài liệu kỹ thuật nằm trong thư mục `/docs` của repository, được versioning qua Git và review qua Pull Request giống như source code. Mọi tính năng, module khi phát triển bắt buộc phải có tài liệu hướng dẫn rõ ràng để người khác có thể đọc hiểu, vận hành, kiểm thử và bảo trì mà không cần tác giả gốc giải thích trực tiếp.

---

## 📖 1. Yêu Cầu Tài Liệu Hướng Dẫn Cho Từng Module (Module README)

Để hệ thống đạt chuẩn phần mềm chuyên nghiệp, mỗi module hoặc feature lớn trong dự án bắt buộc phải có file `README.md` nội bộ:

### 1.1. Vị trí các file Module README bắt buộc
- **Backend submodules**:
  - `backend/app/api/v1/README.md`: Hướng dẫn danh mục API v1, authentication headers, error convention.
  - `backend/app/services/README.md`: Tổng quan các business service và cách inject dependencies.
  - `backend/app/ai_agents/README.md`: Cấu trúc đồ thị LangGraph, input/output state, cách thêm 1 agent mới.
- **Frontend feature modules**:
  - `frontend/src/features/event-planning/README.md`: Giải thích luồng dữ liệu lập kế hoạch, danh sách components, hooks và các state chính.
  - `frontend/src/features/ai-chat/README.md`: Cơ chế streaming WebSocket/SSE, component hiển thị tin nhắn gợi ý.
  - `frontend/src/components/ui/README.md`: Design system catalogue, hướng dẫn sử dụng Button, Modal, Badge kèm props mẫu.

### 1.2. Mẫu khung nội dung tiêu chuẩn cho Module README
```markdown
# [Tên Feature / Module]

## 1. Mục Đích & Trách Nhiệm (Responsibility)
Mô tả 2-3 câu về chức năng cốt lõi của module này (tuân theo nguyên lý Single Responsibility).

## 2. Cấu Trúc Thư Mục (Directory Structure)
- `components/`: Mô tả các sub-components giao diện.
- `hooks/`: Các custom hook xử lý state và side-effects.
- `services/`: Client giao tiếp API backend.
- `types/`: Data contracts và interfaces.

## 3. Hướng Dẫn Tích Hợp & Sử Dụng (Usage Example)
Ví dụ code ngắn gọn (10-15 dòng) về cách một module khác import và sử dụng module này.

## 4. Ràng Buộc & Lưu Ý Kỹ Thuật (Gotchas / Edge Cases)
Các điểm cần lưu ý khi chỉnh sửa (ví dụ: cần giữ nguyên invariant gì, xử lý concurrency, rate limit).
```

---

## 2. Quy Chuẩn Cập Nhật Docs Theo Loại Task

Mỗi khi hoàn thành một task, thành viên bắt buộc cập nhật các file docs sau trong cùng Pull Request (tham khảo chi tiết tại [post-task-documentation.md](../01-workflow/post-task-documentation.md)):

| Loại thay đổi | File cần cập nhật | Yêu cầu nội dung |
|---|---|---|
| **API Endpoint (REST / WebSocket)** | `docs/02-standards/api-design-guide.md` | Method, URL path, Auth Guard/Role, Request Body JSON, Response JSON, Error Codes. |
| **Database Model / Migration** | `docs/03-architecture/database-schema.md` | Schema (`core`, `checkpoints`, `vectors`), Tên bảng, cột, kiểu dữ liệu, quan hệ FK, indexes, file Alembic migration. |
| **AI Agent / LangGraph** | `docs/03-architecture/ai-agent-architecture.md` | Two-Phase State changes, Node LangGraph, Four-Tier Grounding, Pydantic DTOs, Model fallback. |
| **Hạ tầng / Deploy / Biến MT** | `docs/03-architecture/deployment-guide.md`<br>`.env.example` | Cấu hình Vercel, Render, Supabase, Upstash Redis, danh sách biến môi trường mới và giá trị mẫu. |
| **Màn hình UI / User Flow** | `docs/06-design/user-flows.md`<br>`frontend/src/mocks/handlers/` | Mô tả luồng tương tác, route URL, component layout, cập nhật Mock Service Worker (MSW). |
| **Tracking Hoàn Thành Task** | `docs/04-tasks/person-X-*.md`<br>`docs/TASKS.md` | Chuyển `[ ]` thành `[x]` kèm mã PR, tên người làm và ngày hoàn thành. |

---

## 3. Quy Chuẩn Comment & Docstring Trong Mã Nguồn

### 3.1. Backend Python (FastAPI / LangGraph) — Google Style Docstring
Tất cả các hàm public, service method, API router, và LangGraph nodes bắt buộc có docstring:
```python
async def execute_micro_curation(
    state: AgentState, 
    db_session: AsyncSession
) -> AgentState:
    """Thực hiện Phase 2 Micro Curation: tra cứu địa điểm và áp dụng geo-clustering.

    Truy vấn Google Places API thông qua PyBreaker circuit breaker (timeout 2.5s),
    áp dụng thuật toán Haversine gom cụm các điểm dừng trong bán kính <= 2.5km,
    đồng thời chuẩn bị 2 điểm dừng dự phòng cho cơ chế 1-click swap.

    Args:
        state: Trạng thái LangGraph hiện tại chứa roadmap vĩ mô đã được Host lock.
        db_session: Phiên làm việc cơ sở dữ liệu Supabase kết nối qua Supavisor pooler.

    Returns:
        AgentState đã được bổ sung danh sách điểm dừng chi tiết (plan_stops).

    Raises:
        CircuitBreakerOpenException: Khi external travel APIs bị lỗi liên tiếp.
    """
    ...
```
- **Quy tắc**: Không comment những gì code đã thể hiện rõ ràng. Chỉ giải thích lý do kỹ thuật ("Tại sao?") đối với các đoạn logic phức tạp hoặc nghiệp vụ đặc thù.

### 3.2. Frontend React / TypeScript — TSDoc
Với các custom hooks, API clients, và complex UI components:
```typescript
/**
 * Component hiển thị thẻ điểm dừng chi tiết kèm cơ chế bình chọn và 1-click swap.
 *
 * @param stop - Thông tin điểm dừng được chuẩn hóa từ database
 * @param isVoted - Trạng thái người dùng hiện tại đã thích điểm dừng này chưa
 * @param onVoteToggle - Hàm callback xử lý vote UP / DOWN (gửi WebSocket payload)
 * @param onSwapClick - Hàm callback kích hoạt đổi sang địa điểm dự phòng đã pre-fetch
 */
export const PlanStopCard: React.FC<PlanStopCardProps> = ({ 
  stop, 
  isVoted, 
  onVoteToggle, 
  onSwapClick 
}) => {
  ...
};
```

---

## 4. Architecture Decision Records (ADR)

Khi đưa ra một quyết định kỹ thuật lớn làm thay đổi cấu trúc hệ thống (ví dụ: chuyển từ multi-agent rời rạc sang Unified Agent DeepSeek-V4 với Two-Phase States, dùng Supabase pooler port 6543, dùng Upstash Redis Streams), bắt buộc tạo một file ADR mới trong thư mục `docs/03-architecture/adr/ADR-xxx.md`:

```markdown
# ADR-00X: [Tiêu đề quyết định]

- **Trạng thái**: Accepted / Superseded / Deprecated
- **Người đề xuất**: [Tên thành viên]
- **Ngày quyết định**: [YYYY-MM-DD]

## 1. Bối cảnh & Vấn đề (Context)
## 2. Các phương án đã xem xét (Options Considered)
## 3. Quyết định lựa chọn (Decision Outcome)
## 4. Hệ quả & Đánh đổi (Consequences)
```

---

## 5. Quy Chuẩn Định Dạng Markdown

- Phân cấp tiêu đề hợp lý (`#` -> `##` -> `###`), không bỏ cấp.
- Luôn khai báo ngôn ngữ cho code block (ví dụ: ```` ```python ````, ```` ```typescript ````, ```` ```json ````, ```` ```mermaid ````).
- Mọi đường dẫn file phải dùng link markdown tương đối (relative path) để tránh gãy link khi đổi môi trường.
- Tên file tài liệu dùng `kebab-case.md` bằng tiếng Anh. Nội dung tài liệu viết bằng Tiếng Việt rõ ràng, mạch lạc, thuật ngữ kỹ thuật giữ nguyên tiếng Anh.
