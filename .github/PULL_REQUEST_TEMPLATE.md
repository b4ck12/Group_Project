## 📌 Thông Tin Task & Đóng Góp
- **Mã Task**: TASK-XXX <!-- Bắt buộc điền mã task từ docs/TASKS.md -->
- **Người thực hiện**: @github-username <!-- Tên thành viên trong nhóm 6 người -->
- **Loại thay đổi**:
  - [ ] `feat`: Tính năng mới
  - [ ] `fix`: Sửa lỗi
  - [ ] `refactor`: Tối ưu cấu trúc code
  - [ ] `docs`: Tài liệu kỹ thuật
  - [ ] `chore`/`test`: Thêm test hoặc config hạ tầng

---

## 📝 Mô Tả Thay Đổi Kỹ Thuật
<!-- Tóm tắt ngắn gọn PR này giải quyết vấn đề gì, thiết kế ra sao và tại sao làm như vậy -->

---

## 📚 Updated Docs & Tracking (BẮT BUỘC - "No Docs = No Merge")
*Đánh dấu `[x]` vào các file tài liệu đã được cập nhật TRONG CHÍNH PR NÀY:*

- [ ] **Task Tracking**: Đã đổi `[ ]` thành `[x]` trong `docs/04-tasks/person-X-*.md` và `docs/TASKS.md`
- [ ] **API Specification**: Đã cập nhật `docs/02-standards/api-design-guide.md` (nếu có thêm/sửa REST/WS endpoint)
- [ ] **Database Schema**: Đã cập nhật `docs/03-architecture/database-schema.md` (nếu có thêm/sửa DB model/migration)
- [ ] **AI Agent Architecture**: Đã cập nhật `docs/03-architecture/ai-agent-architecture.md` (nếu có sửa LangGraph node/state/prompt)
- [ ] **System Architecture / Deploy**: Đã cập nhật `system-architecture.md` hoặc `deployment-guide.md`
- [ ] **Environment Variables**: Đã cập nhật `.env.example` (nếu có thêm biến môi trường mới)
- [ ] **Không thay đổi docs** (Chỉ áp dụng cho hotfix typo hoặc refactor thuần không đổi API/Schema)

---

## 🧪 Kết Quả Kiểm Thử (Testing & Quality)
- [ ] **Backend Tests**: `poetry run pytest` pass 100%
- [ ] **Backend Lint**: `poetry run ruff check .` không có cảnh báo
- [ ] **Frontend Tests & Lint**: `pnpm run lint` và `pnpm run test` pass 100%
- [ ] Đã thêm Unit Test / Integration Test cho logic mới
- [ ] **Security**: Đã kiểm tra không có API Key, Secret Token hoặc Database Password nào bị commit

---

## 🤝 Ảnh Hưởng Đến Nhóm Khác (Cross-Team Impact)
- [ ] Không ảnh hưởng đến contract / schema của thành viên khác
- [ ] Có ảnh hưởng, đã thông báo trên kênh `#contract-changes` cho: <!-- ghi rõ tên thành viên liên quan -->

---

## 📸 Ảnh Chụp Màn Hình / Demo (Nếu có UI hoặc Log kết quả)
<!-- Chèn ảnh demo giao diện hoặc log chạy test thành công -->
