# 🧭 TripMate AI — Frontend Interactive Demo Prototype (fe_demo)

> Thư mục chứa bản mẫu giao diện người dùng (Interactive Prototype) hoàn chỉnh được xây dựng thuần bằng **HTML, CSS, JS theo mô-đun hóa rõ ràng (Modularity)**, ứng dụng các thư viện trực quan (Leaflet, Lucide Icons, Chart.js, Canvas Confetti) để làm kim chỉ nam thực tế cho việc phát triển các components React sau này.

---

## 🚀 Cách Mở & Xem Demo

Bạn có thể mở trực tiếp các file `.html` bằng bất kỳ trình duyệt nào (Chrome, Edge, Firefox), hoặc chạy local server:

```powershell
# Chạy máy chủ tĩnh cục bộ bằng Python hoặc Node:
python -m http.server 3000 --directory design/fe_demo
# Hoặc bằng npx serve:
npx serve design/fe_demo
```

Truy cập: `http://localhost:3000`

---

## 📁 Cấu Trúc Mô-Đun Hóa (Modular Architecture)

```
design/fe_demo/
├── index.html            # Trang chủ Khám phá Du lịch, Tìm kiếm & Lên lịch (TASK-114)
├── auth.html             # Màn hình Đăng nhập / Đăng ký tài khoản OAuth & Email
├── room.html             # Màn hình làm việc phòng nhóm 3 cột chủ lực (TASK-406, 315)
├── checklist.html        # Trang Checklist hành lý thông minh (TASK-317)
├── admin.html            # Trang Admin Dashboard theo dõi Token & Cache (TASK-410)
├── README.md             # Hướng dẫn chi tiết này
└── assets/
    ├── css/              # Phân tách mô-đun CSS chuyên biệt
    │   ├── base.css      # Design Tokens, Biến CSS, Reset, Typography
    │   ├── components.css# Nút bấm (Buttons), Badges, Pills, Modals, Toasts
    │   ├── layout.css    # Khung Top Navigation và Bố cục 3 cột (3-Pane Split-Screen)
    │   ├── chat.css      # Khung chat, bong bóng tin nhắn, Cursor stream AI
    │   ├── timeline.css  # Thẻ điểm dừng, Nút Swap, Trục di chuyển kết nối
    │   └── map.css       # Bản đồ Leaflet/Mapbox, Pin số tùy chỉnh, Popup Mini Card
    └── js/               # Phân tách mô-đun JS nghiệp vụ
        ├── mock-data.js  # Nguồn dữ liệu giả lập chuẩn theo DB Schema Supabase
        ├── app.js        # Điều khiển chung: Toast notification, Modals, Scope switcher
        ├── chat.js       # Giả lập stream token AI Concierge & trò chuyện nhóm
        ├── timeline.js   # Logic bỏ phiếu UP/DOWN, Swap đổi điểm, Chốt Final Lock
        ├── map.js        # Tích hợp bản đồ Leaflet, đồng bộ pin khi hover thẻ điểm dừng
        └── checklist.js  # Quản lý tương tác danh sách hành lý cá nhân
```

---

## 🌟 Các Tính Năng Nghiệp Vụ Cốt Lõi Được Mô Phỏng Trực Quan

1. **Giao diện 3 cột song song (3-Pane Split View trên `room.html`)**:
   - Cột 1 (Trái 320px): Chat nhóm thời gian thực & Cửa sổ stream token của DeepSeek-V4.
   - Cột 2 (Giữa Flex-1): Dòng thời gian tương tác (Living Itinerary) & Thẻ bình chọn điểm dừng.
   - Cột 3 (Phải 440px): Bản đồ CartoDB/Leaflet vector đồng bộ di chuyển tức thì.
2. **Bỏ phiếu điểm dừng (Granular Stop Voting)**:
   - Bấm nút Thumbs Up / Thumbs Down để tăng/giảm số phiếu.
   - Thanh tiến trình đồng thuận (Consensus Quorum) tự động cập nhật theo tỷ lệ phiếu bầu.
3. **Đổi điểm dự phòng Swap**:
   - Bấm nút **Swap** trên thẻ điểm dừng: Thẻ lập tức chuyển đổi sang phương án dự phòng chất lượng cao, vị trí trên bản đồ và đường vẽ polyline tự động cập nhật mượt mà, kèm thông báo Toast nổi.
4. **Trục kết nối di chuyển chuẩn Uber (Transit Step Wayfinding)**:
   - Hiển thị thời gian di chuyển, cự ly và phương tiện (Đi bộ, Ô tô/Grab).
   - Huy hiệu xanh kiểm tra khoảng cách Haversine ($\le 2.5$\,km).
5. **Mô phỏng thích ứng động khi trời mưa (Dynamic Living Itinerary)**:
   - Bấm chip gợi ý *"🌧️ Đổi quán cafe trời mưa"* hoặc nút *"Demo Trời Mưa"*: AI Agent stream phản hồi và tự động đổi quán cafe ngoài trời sang quán cafe có không gian ấm cúng trong nhà.
6. **Chốt kế hoạch chính thức (Final Lock)**:
   - Host bấm nút *"Host Chốt Lịch (Final Lock)"*: Bắn pháo hoa ăn mừng (Canvas Confetti) và khóa toàn bộ trạng thái bình chọn.
