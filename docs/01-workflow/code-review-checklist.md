# Code Review Checklist & Documentation Gate
## Quy Trình Đánh Giá Mã Nguồn & Cổng Kiểm Soát Chất Lượng — TripMate AI

> **Tiêu chí tối cao**: **"No Docs = No Merge"** & **"Clean Code Gate"**.  
> Người review có toàn quyền và nghĩa vụ bấm **Request Changes** nếu PR vi phạm các nguyên lý thiết kế (SOLID, Low Coupling, High Cohesion), để dồn CSS/HTML/Logic hỗn tạp ở Frontend, lạm dụng hardcode hoặc thiếu Unit/Integration tests.

---

## 🧑‍💻 1. Dành Cho Tác Giả PR (Tự kiểm tra trước khi gán Reviewer)

- [ ] PR chỉ giải quyết **1 task duy nhất** (`TASK-xxx`), diff lý tưởng < 400 dòng.
- [ ] Đã tự chạy lint + test local: `poetry run ruff check . && poetry run pytest` (Backend) hoặc `pnpm run lint && pnpm run test` (Frontend), CI GitHub Actions xanh 100%.
- [ ] **Kiến trúc & Clean Code**:
  - Tuân thủ nguyên lý **SOLID**, phân chia module rõ ràng, giảm phụ thuộc (**Low Coupling**) và tăng gắn kết (**High Cohesion**).
  - Không có hàm nào vượt quá **50 dòng code**, không có class nào vượt quá **200 dòng code**.
  - Không có hàm nào nhận từ **4 tham số** trở lên mà không gom thành DTO/Options object.
- [ ] **Frontend Phân Tách Rõ Ràng**:
  - Tách bạch 3 lớp: **Cấu trúc HTML/JSX**, **Định kiểu CSS (CSS Module/Tailwind)**, và **Nghiệp vụ (Custom Hook/Service)**.
  - Tuyệt đối **không viết inline style** `style={{ ... }}` hoặc hardcode mã màu/font-size bừa bãi.
- [ ] **Hạn Chế Hardcode**:
  - Tuyệt đối không còn **magic numbers** hay **magic strings**.
  - Đã chuyển toàn bộ các giá trị cố định vào Constants, Enums hoặc `.env` / Config.
- [ ] **Quy Chuẩn Đặt Tên (Naming Convention)**:
  - Tuân thủ đúng chuẩn theo [naming-conventions.md](../02-standards/naming-conventions.md) (camelCase, PascalCase, UPPER_SNAKE_CASE, snake_case).
- [ ] **Kiểm Thử (Unit & Integration Test)**:
  - Đã viết unit test / integration test cho logic mới theo mẫu AAA (Arrange - Act - Assert).
  - Test bao phủ cả Happy Path và Unhappy Path (trường hợp biên, lỗi validate, ngoại lệ).
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

### 2.2. Clean Code, SOLID & Kiến Trúc Phân Lớp
- [ ] **Single Responsibility**: Mỗi file/hàm/component có làm đúng 1 việc không? Có component nào vừa lo hiển thị, vừa tự fetch data, vừa tự format tiền tệ không?
- [ ] **Frontend SoC**: Phần hiển thị (JSX) có bị lẫn lộn với CSS inline hoặc logic tính toán nặng không? CSS đã được đưa vào `*.module.css` chưa?
- [ ] **Low Coupling**: Có bị phụ thuộc chéo (circular dependencies) hoặc import vòng vèo không?
- [ ] **Concise Code**: Các hàm có ngắn gọn (< 50 dòng) và tên hàm thể hiện đúng mức độ trừu tượng không?
- [ ] **No Hardcode**: Có con số bí ẩn (magic numbers) hay chuỗi ký tự cố định nào chưa được đưa vào hằng số / Enum không?
- [ ] **Naming Conventions**: Tên biến, hàm, class, file, route có tuân thủ đúng chuẩn không?

### 2.3. Tính Đúng Đắn & Nghiệp Vụ (Correctness)
- [ ] Logic có thỏa mãn đầy đủ Acceptance Criteria của task trong `docs/TASKS.md` không?
- [ ] Có xử lý các edge cases: danh sách rỗng, null, timeout từ external travel APIs, dữ liệu không hợp lệ?
- [ ] Có đảm bảo tính toàn vẹn dữ liệu khi nhiều người cùng thao tác (ví dụ: atomic updates khi vote điểm dừng)?

### 2.4. Bảo Mật (Security)
- [ ] Input từ người dùng được validate và lọc sạch mã độc (sanitized) qua Pydantic v2 trước khi xử lý hoặc truyền vào prompt LLM?
- [ ] Endpoint có đúng Auth Guard và phân quyền theo vai trò (Host/Owner vs Member/Viewer) không?
- [ ] Không log thông tin nhạy cảm (mật khẩu, JWT token, full headers) ra hệ thống logging.

### 2.5. Hiệu Năng & Khả Năng Mở Rộng (Performance)
- [ ] Không gây ra N+1 query vào PostgreSQL (dùng `selectinload` / join phù hợp trong SQLAlchemy).
- [ ] Có sử dụng Redis cache với TTL hợp lý khi gọi external APIs (Google Places, Weather, Currency).
- [ ] AI Agent: Đảm bảo graph bounded memory, có `recursion_limit` và không rơi vào vòng lặp vô tận.

### 2.6. Kiểm Thử (Testing)
- [ ] Có unit test / integration test đi kèm cho logic mới không?
- [ ] Test có theo cấu trúc AAA (Arrange - Act - Assert) rõ ràng không?
- [ ] Test có bao phủ cả trường hợp lỗi (unhappy path, circuit breaker trip), không chỉ test trường hợp thành công?
- [ ] External dependencies có được mock cẩn thận không (không gọi network thật trong unit test)?

---

## 🏷️ 3. Mức Độ Comment Khi Review

| Tiền tố | Ý nghĩa | Hành động yêu cầu |
|---|---|---|
| `[blocking]` | Lỗi nghiêm trọng, hổng bảo mật, thiếu docs, thiếu test, vi phạm clean code / hardcode nặng | **Bắt buộc sửa** trước khi được phép merge. |
| `[suggestion]` | Gợi ý tối ưu code, tách nhỏ hàm hoặc cách viết thanh thoát hơn | Tác giả tự cân nhắc, không chặn merge nếu có lý do hợp lý. |
| `[question]` | Cần tác giả giải thích rõ hơn về dụng ý kỹ thuật | Tác giả trả lời trên PR. |
| `[nit]` | Lỗi chính tả nhỏ, format lặt vặt | Sửa nhanh hoặc merge nếu không ảnh hưởng logic. |

---

## ⏱️ 4. Thời Gian Phản Hồi Review

- Reviewer có trách nhiệm phản hồi PR trong vòng **24 giờ làm việc**.
- Nếu PR liên quan đến Contract API hoặc DB Schema cốt lõi, reviewer cần ưu tiên review ngay trong vòng **4–6 giờ** để không làm nghẽn tiến độ của các thành viên đang phụ thuộc.
