# Hướng Dẫn Viết Tài Liệu Kỹ Thuật & Tracking (Documentation Guide)

> **Nguyên tắc bất biến**: **"Docs as Code"** & **"No Docs = Not Done & No Merge"**.  
> Toàn bộ tài liệu sống trong thư mục `/docs` trong repo, được versioning qua Git và review qua Pull Request giống như source code. Mọi thành viên bắt buộc phải viết docs và cập nhật tracking đồng thời với code.

---

## 1. Mục Đích Của Việc Viết Docs & Tracking Cho Dự Án

Trong dự án TripMate AI với 6 thành viên và kiến trúc tích hợp phức tạp:
1. **Theo dõi tiến độ thời gian thực (Progress Tracking)**: Trưởng nhóm và các thành viên luôn nắm được tiến độ chính xác của từng task thông qua `docs/TASKS.md` và `docs/04-tasks/person-X-*.md`.
2. **Loại bỏ việc hỏi đi hỏi lại**: Khi Frontend cần gọi API, họ chỉ cần mở `docs/02-standards/api-design-guide.md`; khi AI Engineer cần lưu state, họ mở `docs/03-architecture/database-schema.md`.
3. **Bảo vệ quyền lợi cá nhân**: Đóng góp của từng thành viên được minh chứng rõ ràng thông qua lịch sử commit docs và task board.
4. **Đáp ứng yêu cầu đồ án tốt nghiệp / hội đồng đánh giá**: Có bộ tài liệu kỹ thuật hoàn chỉnh, chuẩn mực, bám sát proposal.

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
 * @param onVote - Hàm callback xử lý vote UP / DOWN (gửi WebSocket payload)
 * @param onSwap - Hàm callback kích hoạt đổi sang địa điểm dự phòng đã pre-fetch
 */
export const StopVotingCard: React.FC<StopVotingCardProps> = ({ stop, onVote, onSwap }) => {
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
