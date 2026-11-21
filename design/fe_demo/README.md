# 🧭 TripMate — Modern React Interactive Prototype (`fe_demo`)

> Bản mẫu giao diện người dùng hoàn chỉnh được xây dựng **100% bằng React + TypeScript + Vite + Tailwind CSS + Leaflet**, cấu trúc mô-đun hóa bài bản (`src/components/`, `src/data/`, `src/types.ts`).  
> Ứng dụng tích hợp triết lý thiết kế **Bespoke Editorial Travel Journal**, nền bản đồ thế giới xé dán nghệ thuật, bản đồ lộ trình Leaflet tương tác thực tế và cơ chế gọi **`@agent`** thông minh cùng đồng thuận biểu quyết nhóm.

---

## 🚀 Cách Khởi Chạy Nhanh (Vite Dev Server)

```powershell
# 1. Di chuyển vào thư mục demo
cd design/fe_demo

# 2. Khởi chạy Vite Dev Server:
npm run dev
```

👉 Mở: **`http://localhost:3000`** (Tải siêu tốc HMR, ảnh local không phụ thuộc internet).

---

## 🌟 4 Nâng Cấp Cốt Lõi Vừa Hoàn Thiện

1. **Bản Đồ Lộ Trình Leaflet Thực Tế (Không API Key, Không Watermark)**:
   * Chuyển sang lớp bản đồ **OpenStreetMap Standard** trong [MapPanel.tsx](src/components/MapPanel.tsx), hoàn toàn miễn phí, không yêu cầu API key và không có dòng watermark gây khó chịu.
   * Hiển thị lộ trình thực tế từ Sân bay Quốc tế Đà Nẵng (DAD) theo đại lộ biển về khách sạn Anio Boutique Hotel Hội An và mạng lưới các trạm phố cổ.
2. **Cơ Chế Gọi `@agent` Trong Kênh Chat Nhóm**:
   * Kênh chat là nơi các thành viên (Minh Đức, Hoàng Anh, Lan Vy) trò chuyện tự do.
   * Khi phát sinh tình huống thực tế (như trời mưa rào lúc 15:30 — trường hợp đột xuất không có sẵn trong lịch cố định), người dùng gõ hoặc bấm nút gọi **`@agent`**:
     * Ví dụ: `@agent Chiều nay trời mưa rào, tìm điểm trong nhà ấm cúng thay thế Faifo giúp nhóm với!`
     * Agent sẽ được kích hoạt, phân tích tình huống thực tế và đề xuất địa điểm thay thế trong bán kính gần (*Reaching Out Teahouse*).
3. **Tự Động Hoán Đổi Khi Đủ 3/3 Phiếu Biểu Quyết (Auto-Swap)**:
   * Không có nút Swap đơn phương. Toàn bộ quyết định phải thông qua biểu quyết nhóm.
   * Khi các thành viên biểu quyết Không đồng ý (Vote Đổi) đạt ngưỡng 3/3 thành viên, hệ thống sẽ **TỰ ĐỘNG HOÁN ĐỔI** trạm sang phương án dự phòng (*La Siesta Hotel, Reaching Out Teahouse, Cơm Gà Bà Buội, Rừng Dừa Bảy Mẫu*).
   * Kênh chat tự động phát thông báo chúc mừng đồng thuận và bản đồ Leaflet cập nhật tọa độ mới tức thì.
4. **Sửa Lỗi Ký Tự `&` và Dropdown Bộ Chọn Phẳng Đồng Bộ**:
   * Thay thế font serif cũ bằng **`Plus Jakarta Sans`** và **`Be Vietnam Pro`**, ký tự `&` hiển thị hiện đại, phẳng và thanh thoát.
   * Bộ chọn [PlanningBar.tsx](src/components/PlanningBar.tsx) hoàn toàn là custom dropdown, không còn giao diện thẻ select cũ của Windows.
