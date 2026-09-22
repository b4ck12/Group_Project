# Code Review Checklist & Documentation Gate

> **Tiêu chí tối cao**: **"No Docs = No Merge"**.  
> Người review có toàn quyền và nghĩa vụ bấm **Request Changes** nếu PR có thay đổi code nhưng thiếu cập nhật tài liệu kỹ thuật hoặc chưa tick tracking tiến độ trên task board.

---

## 🧑‍💻 1. Dành Cho Tác Giả PR (Tự kiểm tra trước khi gán Reviewer)

- [ ] PR chỉ giải quyết **1 task duy nhất** (`TASK-xxx`), diff lý tưởng < 400 dòng.
- [ ] Đã tự chạy lint + test local: `poetry run ruff check . && poetry run pytest` (Backend) hoặc `pnpm run lint && pnpm run test` (Frontend), CI GitHub Actions xanh 100%.
- [ ] **Tài liệu kỹ thuật**: Đã cập nhật đầy đủ các file docs liên quan (`api-design-guide.md`, `database-schema.md`, `ai-agent-architecture.md`, `deployment-guide.md`, `.env.example`).
- [ ] **Tiến độ Tracking**: Đã đổi `[ ]` thành `[x]` trong file task cá nhân (`docs/04-tasks/person-X-*.md`) và master board (`docs/TASKS.md`) kèm thông tin PR.
- [ ] Không còn `console.log`, `print()`, code debug thừa, không có comment TODO vô nghĩa.
- [ ] Tuyệt đối không commit secrets / API keys / mật khẩu database lên repo.
- [ ] Đã điền đầy đủ PR template theo [.github/PULL_REQUEST_TEMPLATE.md](../../.github/PULL_REQUEST_TEMPLATE.md).
- [ ] Đã tự xem lại toàn bộ Git diff của chính mình trên giao diện GitHub trước khi tag Reviewer.

---

## 🧐 2. Dành Cho Reviewer (Kiểm tra chặn trước khi Approve)

### 2.1. Cổng Tài Liệu & Tracking (BẮT BUỘC KIỂM TRA ĐẦU TIÊN)
- [ ] **Checklist Docs**: Tác giả đã tick chọn danh sách docs đã sửa trong PR Description chưa?
- [ ] **Task Tracking**: Trong commit của PR đã có thay đổi tick `[x] TASK-xxx` trong `docs/TASKS.md` và file cá nhân chưa?
- [ ] **Khớp Schema / Contract**: Kiểu dữ liệu Pydantic / TypeScript trong code có khớp chuẩn xác với tài liệu kỹ thuật không?
> ⛔ **Nếu thiếu docs hoặc tracking**: Reviewer bấm ngay **Request Changes** với ghi chú `[blocking] Thiếu cập nhật tài liệu kỹ thuật và task tracking theo quy định dự án`.

### 2.2. Tính Đúng Đắn & Nghiệp Vụ (Correctness)
- [ ] Logic có thỏa mãn đầy đủ Acceptance Criteria của task trong `docs/TASKS.md` không?
- [ ] Có xử lý các edge cases: danh sách rỗng, null, timeout từ external travel APIs, dữ liệu không hợp lệ?
- [ ] Có đảm bảo tính toàn vẹn dữ liệu khi nhiều người cùng thao tác (ví dụ: atomic updates khi vote điểm dừng)?

### 2.3. Bảo Mật (Security)
- [ ] Input từ người dùng được validate và lọc sạch mã độc (sanitized) qua Pydantic v2 trước khi xử lý hoặc truyền vào prompt LLM?
- [ ] Endpoint có đúng Auth Guard và phân quyền theo vai trò (Host/Owner vs Member/Viewer) không?
- [ ] Không log thông tin nhạy cảm (mật khẩu, JWT token, full headers) ra hệ thống logging.

### 2.4. Hiệu Năng & Khả Năng Mở Rộng (Performance)
- [ ] Không gây ra N+1 query vào PostgreSQL (dùng `selectinload` / join phù hợp trong SQLAlchemy).
- [ ] Có sử dụng Redis cache với TTL hợp lý khi gọi external APIs (Google Places, Weather, Currency).
- [ ] AI Agent: Đảm bảo graph bounded memory, có `recursion_limit` và không rơi vào vòng lặp vô tận.

### 2.5. Kiểm Thử (Testing)
- [ ] Có unit test / integration test đi kèm cho logic mới không?
- [ ] Test có bao phủ cả trường hợp lỗi (unhappy path, circuit breaker trip), không chỉ test trường hợp thành công?

---

## 🏷️ 3. Mức Độ Comment Khi Review

| Tiền tố | Ý nghĩa | Hành động yêu cầu |
|---|---|---|
| `[blocking]` | Lỗi nghiêm trọng, hổng bảo mật, thiếu docs, thiếu test | **Bắt buộc sửa** trước khi được phép merge. |
| `[suggestion]` | Gợi ý tối ưu code hoặc cách viết thanh thoát hơn | Tác giả tự cân nhắc, không chặn merge nếu có lý do hợp lý. |
| `[question]` | Cần tác giả giải thích rõ hơn về dụng ý kỹ thuật | Tác giả trả lời trên PR. |
| `[nit]` | Lỗi chính tả nhỏ, format lặt vặt | Sửa nhanh hoặc merge nếu không ảnh hưởng logic. |

---

## ⏱️ 4. Thời Gian Phản Hồi Review

- Reviewer có trách nhiệm phản hồi PR trong vòng **24 giờ làm việc**.
- Nếu PR liên quan đến Contract API hoặc DB Schema cốt lõi, reviewer cần ưu tiên review ngay trong vòng **4–6 giờ** để không làm nghẽn tiến độ của các thành viên đang phụ thuộc.
