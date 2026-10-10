# 🎨 Design Docs — UI/UX & Design System (Sprint 0)
## Dự án: TripMate AI — Intelligent Group Activity & Travel Planning Platform

> Đây là **nguồn chân lý thiết kế (single source of truth)** cho toàn bộ giao diện người dùng của nền tảng TripMate AI.
> Được khởi tạo ở **Sprint 0** song song với Contract Session, định hình toàn bộ trải nghiệm cho cả 6 thành viên trước khi bắt tay vào code.

---

## 🔄 Quy Trình Triển Khai Thiết Kế (Design $\rightarrow$ Code)

```
TASK-009 (Design Tokens: Primary Blue, Accent Teal) ──► TASK-111 (Tailwind & shadcn Design System) ──► Mọi màn hình
TASK-010 (User Flows: Two-Stage Consensus & Living Itinerary) ──► Layout & Components (Interactive Timeline, Stop Cards)
TASK-011 (Hi-fi Mockups + Component Library + WCAG AA) ──► Figma & Specs cho Frontend Dev A & B
```

- **Nguyễn Minh Đức (FE Dev B)**: Định nghĩa design tokens (TASK-009), vẽ flowchart & wireframes (TASK-010), xây dựng mockup hi-fi và thư viện component (TASK-011).
- **Hà Đăng Huy (FE Dev A)**: Áp dụng design tokens vào dự án Vite + Tailwind (TASK-111) để dựng Dashboard, Interactive Timeline và Mapbox Canvas.
- **Đối chiếu tại Integration Day**: Cuối mỗi Sprint, kiểm tra đối chiếu giao diện thực tế với mockup thiết kế để tránh lệch pixel và sai sót trải nghiệm người dùng.

---

## 📁 Cấu Trúc Thư Mục Tài Liệu Thiết Kế

```
docs/06-design/
├── README.md            ← File này: Tổng quan & Quy trình thiết kế
├── design-tokens.md     ← Bảng màu (Primary Blue #12305c, Accent Teal #186c8e), Typography, Spacing, Radius (TASK-009)
├── user-flows.md        ← Flowchart các luồng: Two-Stage Consensus, 1-Click Swap, Living Itinerary khi trời mưa (TASK-010)
├── wireframes/          ← Wireframe từng màn hình: Room Chat, Timeline, Voting Cards, Mapbox Canvas (TASK-010)
└── mockups.md           ← Link Hi-fi mockups trên Figma + Checklist kiểm tra tương phản WCAG AA (TASK-011)
```

---

## 🧭 Các Luồng Trải Nghiệm Cốt Lõi Phải Cover (User Flows)

1. **Đăng nhập / Đăng ký (OAuth2 & Email)** $\rightarrow$ **Danh sách phòng & Chọn phạm vi** (`DAY_HANGOUT` hoặc `VACATION`).
2. **Khởi tạo phòng & Mời bạn bè qua Link** $\rightarrow$ Quản lý thành viên (Host vs Member).
3. **Pha 1: Thu thập mong muốn qua Room Chat** $\rightarrow$ AI đề xuất Roadmap Vĩ mô $\rightarrow$ **Host Khóa Lộ Trình (Macro Lock - Consensus 1)**.
4. **Pha 2: Dòng thời gian tương tác (Interactive Timeline)** $\rightarrow$ **Thẻ bình chọn điểm dừng (Vote UP / DOWN)** $\rightarrow$ **1-Click Swap** đổi địa điểm dự phòng.
5. **Chốt Kế Hoạch Chính Thức (Final Lock - Consensus 2)** $\rightarrow$ Bản đồ Mapbox GL Canvas $\rightarrow$ Xuất file PDF & Calendar (.ics).
6. **Lịch trình Động (Living Itinerary)** $\rightarrow$ Thông báo Toast thích ứng khi đổi quán cafe lúc trời mưa.
7. **Quản lý Tài chính Chuyến Đi** $\rightarrow$ Thu quỹ trước $\rightarrow$ Hóa đơn chi tiêu $\rightarrow$ Giao diện Quyết toán nợ tối ưu (Min-Cash-Flow).
8. **Admin Dashboard UI** $\rightarrow$ Biểu đồ tiêu thụ token, active rooms và cache hit rate.

---

## 📐 Nguyên Tắc Thiết Kế Bắt Buộc & Tiêu Chuẩn Giao Diện (App Design Standards)

### 1. Bố Cục Flexbox & Grid Hiện Đại (Flexbox-First Standard)
- **100% Flexbox & CSS Grid**: Mọi layout từ Header, Sidebar, Room Chat, Timeline Cards đến Map Toolbar đều xây dựng bằng `display: flex` hoặc CSS Grid. Tuyệt đối không dùng hardcoded pixel layout hoặc absolute positioning cho cấu trúc chính.
- **Fluid & Adaptive Growth**: Tận dụng các thuộc tính `flex: 1`, `flex-wrap: wrap`, `gap-4`, `justify-between` để các khối giao diện tự co giãn tự nhiên theo tỷ lệ khung hình.

### 2. Tiêu Chuẩn Đáp Ứng Đa Thiết Bị (Fully Responsive Multi-Screen Specs)
- **Mobile-First (375px — 767px)**:
  - Bố cục 1 cột tối ưu cho ngón tay cái.
  - Room Chat và Stop Voting được bố trí dạng bottom-sheet vuốt trượt hoặc tab chuyển đổi nhanh.
  - Kích thước touch target $\ge 44 \times 44$\,px.
- **Tablet (768px — 1023px)**:
  - Bố cục 2 cột linh hoạt: Chatbox thu gọn bên cạnh Timeline và Voting Cards.
- **Desktop & Ultra-wide (1024px — 1440px+)**:
  - Giao diện Split-Pane 3 cột đồng thời: Cột 1 (Room Chat & Thành viên) — Cột 2 (Dòng thời gian & Thẻ bình chọn) — Cột 3 (Canvas bản đồ Mapbox GL toàn cảnh).
  - Không reload trang, cập nhật realtime không layout shift (CLS < 0.1).

### 3. Modular Component Design (Thiết Kế Thành Phần Mô-Đun Hóa)
- **Độc lập và Tái sử dụng**: Mỗi UI component (ví dụ: `StopCard`, `HotelBookingBadge`, `VotingActionGroup`) là một mô-đun độc lập, nhận props rõ ràng.
- **Thẻ hiển thị đối tác du lịch**: Hỗ trợ badge hiển thị nguồn giá và phòng từ các đối tác tích hợp (**Google Maps, Google Hotels, TripAdvisor, Airbnb, Trip.com, Hotels.com, Trivago, Expedia**).
- **Đầy đủ 6 trạng thái Component**: Default, Hover, Active, Disabled, Loading (Skeleton), Empty, Error.
- **Design Tokens là nguồn sự thật**: Tuyệt đối không hardcode mã màu hex; luôn dùng token class của Tailwind (`bg-primary-blue`, `text-accent-teal`).
- **Tiêu chuẩn Tiếp cận (WCAG AA)**: Tỷ lệ tương phản văn bản $\ge 4.5:1$, hỗ trợ điều hướng bàn phím (Keyboard navigation).
- **Hỗ trợ Đa ngôn ngữ (i18n)**: Toàn bộ text nhúng qua `react-i18next` (Tiếng Việt và English).

### 4. Triết Lý Công Kỹ Nghệ: Dễ Maintain, Dễ Dev, Dễ Hiểu
- 🛠️ **Dễ Maintain**: Component nhỏ gọn ($\le 120$ dòng JSX), tách biệt styling và logic hooks.
- 💻 **Dễ Dev**: Mock Service Worker (MSW) cho phép render thử mọi trạng thái component mà không cần kết nối backend thật.
- 📖 **Dễ Hiểu**: Đặt tên component theo chức năng nghiệp vụ tự nhiên, tuân thủ Storybook/Figma design specs.
