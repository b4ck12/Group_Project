# 📋 Danh Sách Tính Năng Kỹ Thuật (Feature List)
## Dự án: TripMate AI — Intelligent Group Activity & Travel Planning Platform

> Danh mục tính năng hoàn chỉnh của nền tảng TripMate AI, được chuẩn hóa theo tài liệu Technical Proposal, phân bổ cho 6 thành viên triển khai trong 4 Sprint.

---

## 🎯 Phân Loại Hai Phạm Vi Kế Hoạch Cốt Lõi (Dual Planning Scopes)

| Phạm vi | Đặc điểm nghiệp vụ | Xử lý kỹ thuật |
|---|---|---|
| ☕ **Đi chơi trong ngày (Day Hangouts)** | Dành cho các buổi hẹn hò, cafe, ăn uống, tụ tập ngẫu hứng cuối tuần (*"cafe $\rightarrow$ board game $\rightarrow$ lẩu"*). | Ưu tiên địa điểm đang mở cửa, khoảng cách $\le 1.5$\,km, kiểm tra giờ đóng cửa và chỗ gửi xe, không cần đặt khách sạn. |
| ✈️ **Kỳ nghỉ nhiều ngày (Multi-Day Vacations)** | Lịch trình du lịch hoàn chỉnh nhiều ngày tại Việt Nam hoặc ASEAN miễn visa (*"4 ngày 3 đêm tại Đà Nẵng - Hội An"*). | Phân bổ nhịp độ theo ngày, tích hợp gợi ý khách sạn, nhà hàng đặc sản, vé vui chơi Klook, tuyến đường tối ưu trên Mapbox. |

---

## 🔐 Nhóm 1 — Xác Thực, Danh Tính & Bảo Mật Đa Thuê Bao (Auth & Security)

| # | Mã Task | Tính năng | Mô tả chi tiết kỹ thuật | Người phụ trách |
|:---:|:---:|---|---|:---:|
| 1 | `TASK-103` | **Đăng nhập OAuth2** | Đăng nhập an toàn qua Google OAuth2 / Facebook SDK, tự động tạo tài khoản hoặc liên kết profile. | Phạm Đình Ánh Dương |
| 2 | `TASK-102` | **Đăng ký tài khoản mật khẩu** | Đăng ký bằng Email + Mật khẩu, mã hóa chuẩn `bcrypt` (cost factor $\ge 10$), xác thực Pydantic schema. | Phạm Đình Ánh Dương |
| 3 | `TASK-105` | **Quên & Đặt lại mật khẩu** | Luồng reset password gửi email chứa token 1 lần (TTL 15 phút) qua SMTP server bất đồng bộ. | Phạm Đình Ánh Dương |
| 4 | `TASK-104` | **Xoay vòng JWT Token** | Cơ chế Access Token (15 phút) và Refresh Token (7 ngày) lưu trong cookie `httpOnly`, chống rò rỉ XSS. | Phạm Đình Ánh Dương |
| 5 | `TASK-106` | **Quản lý hồ sơ cá nhân** | Xem và cập nhật thông tin cá nhân (họ tên, ảnh đại diện avatar), tích hợp Supabase Auth. | Phạm Đình Ánh Dương |
| 6 | `TASK-116` | **Bảo mật Đa thuê bao (Supabase RLS)** | Áp dụng chính sách Row Level Security ở tầng PostgreSQL để cách ly dữ liệu giữa các phòng. | Đinh Tiến Luân |

---

## 🏠 Nhóm 2 — Quản Lý Phòng & Không Gian Cộng Tác (Room & Member Management)

| # | Mã Task | Tính năng | Mô tả chi tiết kỹ thuật | Người phụ trách |
|:---:|:---:|---|---|:---:|
| 7 | `TASK-201` | **Khởi tạo phòng kế hoạch** | Tạo phòng với tên chuyến đi, ngày bắt đầu/kết thúc, phân loại Day Hangout hoặc Vacation. | Tạ Quang Huy |
| 8 | `TASK-203` | **Mời thành viên qua Link** | Sinh liên kết chia sẻ tức thì (`/join/{token}`), quản lý danh sách thành viên (Pending / Accepted). | Phạm Đình Ánh Dương |
| 9 | `TASK-204` | **Phân quyền Host vs Member** | Phân định rạch ròi: `Host` (khóa kế hoạch, đổi cài đặt phòng) và `Member` (chat, vote điểm, swap địa điểm). | Tạ Quang Huy |
| 10 | `TASK-213` | **Dashboard tổng quan phòng** | Giao diện quản lý các chuyến đi của người dùng, phân loại chuyến sắp đi, lịch sử và trạng thái phòng. | Hà Đăng Huy |

---

## ⚡ Nhóm 3 — Động Cơ Đồng Thuận 2 Giai Đoạn (Two-Stage Consensus Engine)

| # | Mã Task | Tính năng | Mô tả chi tiết kỹ thuật | Người phụ trách |
|:---:|:---:|---|---|:---:|
| 11 | `TASK-301` | **Mô hình dữ liệu Plan & Stops** | Schema chuẩn hóa lưu trữ lộ trình vĩ mô và danh sách chi tiết các điểm dừng (`plan_stops`). | Tạ Quang Huy |
| 12 | `TASK-302` | **Giai đoạn 1: Khóa Lộ Trình Vĩ Mô (Macro Lock)** | Host bấm nút khóa khung chương trình vĩ mô (**Consensus Checkpoint 1**) sau khi cả nhóm đã thảo luận thống nhất. | Tạ Quang Huy |
| 13 | `TASK-304` | **Giai đoạn 2: Bình chọn Điểm dừng (Stop Voting)** | Thành viên vote **UP** hoặc **DOWN** trên từng điểm dừng, cập nhật atomic counter ngăn race condition. | Tạ Quang Huy |
| 14 | `TASK-305` | **Đổi địa điểm dự phòng trong 1 click (1-Click Swap)** | Khi điểm dừng bị vote DOWN, người dùng bấm 1 nút để thay thế bằng điểm dự phòng đã nạp sẵn (pre-fetched). | Tạ Quang Huy |
| 15 | `TASK-306` | **Chốt Kế Hoạch Chính Thức (Final Confirmation)** | Host bấm xác nhận kế hoạch hoàn chỉnh (**Consensus Checkpoint 2**), khóa toàn bộ lộ trình và kích hoạt xuất file. | Tạ Quang Huy |
| 16 | `TASK-307` | **Lịch trình Động (Living Itinerary & Dynamic Adaptation)** | Khi gặp biến cố bất ngờ trong chuyến đi (trời mưa), cập nhật duy nhất 1 dòng trong bảng `plan_stops`. | Tạ Quang Huy |

---

## 🤖 Nhóm 4 — AI Agent Hợp Nhất & Hàng Rào Chống Ảo Giác (Unified AI & Grounding)

| # | Mã Task | Tính năng | Mô tả chi tiết kỹ thuật | Người phụ trách |
|:---:|:---:|---|---|:---:|
| 17 | `TASK-109` | **LangGraph State Machine (Two-Phase)** | Máy trạng thái LangGraph Python chạy tuần tự qua 2 pha: Phase 1 (Macro State) và Phase 2 (Micro State). | Nguyễn Tùng Dương |
| 18 | `TASK-110` | **Model Abstraction Layer** | Bọc mô hình chính **DeepSeek-V4**, tự động fallback sang GPT-4o, Claude 3.5, hoặc Gemini 1.5 Pro. | Nguyễn Tùng Dương |
| 19 | `TASK-209` | **Tier 1: Ràng buộc Pydantic Schema** | Chuẩn hóa đầu ra LLM bằng Pydantic v2 (tên, phân khúc, thời lượng, category), loại bỏ text lan man. | Nguyễn Tùng Dương |
| 20 | `TASK-210` | **Tier 2: Kiểm tra Bản đồ & Khách sạn Thực tế (Live Map & Hotel Check)** | Đối chiếu dữ liệu đa nguồn: Google Maps, Google Search, Google Hotels, TripAdvisor, Airbnb, Trip.com, Hotels.com, Trivago, Expedia để xác thực Place ID, giá phòng và giờ mở cửa. | Nguyễn Tùng Dương |
| 21 | `TASK-211` | **Tier 3: Thuật toán Gom cụm Địa lý (Distance Guard)** | Áp dụng công thức Haversine gom cụm các điểm dừng trong bán kính $\le 2.5$\,km ($\le 20$\,phút di chuyển). | Nguyễn Tùng Dương |
| 22 | `TASK-308` | **Nạp sẵn Phương án Dự phòng (Pre-fetched Backups)** | Tự động truy vấn và chuẩn bị sẵn 2 phương án thay thế cho mỗi điểm dừng chính phục vụ 1-Click Swap. | Nguyễn Tùng Dương |
| 23 | `TASK-401` | **Lưu vết Checkpoint (AsyncPostgresSaver)** | Ghi nhận trạng thái hội thoại vào schema `checkpoints` qua Data Access Layer (DAL) có xác thực. | Nguyễn Tùng Dương |

---

## 🌐 Nhóm 5 — Tích Hợp API Du Lịch Bên Ngoài & Độ Bền PyBreaker (Travel Provider Adapters)

| # | Mã Task | Tính năng | Mô tả chi tiết kỹ thuật | Người phụ trách |
|:---:|:---:|---|---|:---:|
| 24 | `TASK-108` | **Multi-Provider POI Search Adapter** | Tra cứu địa điểm, nhà hàng qua Google Maps (Places API New), Google Search, TripAdvisor bằng `httpx` async bọc qua `BaseTravelProvider`. | Hà Đăng Huy |
| 25 | `TASK-205` | **Multi-Provider Lodging & Hotel Adapter** | Kết nối dữ liệu lưu trú đa nguồn: Google Hotels, Airbnb, Trip.com, Hotels.com, Trivago, Expedia, Klook, 12Go Asia qua Strategy Pattern. | Hà Đăng Huy |
| 26 | `TASK-207` | **Dự báo Thời tiết (OpenWeatherMap)** | Tra cứu thời tiết theo tọa độ điểm đến, lưu cache 3 giờ để cảnh báo mưa gió cho nhóm. | Hà Đăng Huy |
| 27 | `TASK-107` | **Lớp Ngắt Mạch PyBreaker Circuit Breaker** | Ngắt mạch tự động (timeout 2.5s) khi API ngoài quá tải, chuyển luồng về L2 Cache/DB fallback. | Hà Đăng Huy |
| 28 | `TASK-208` | **Upstash Redis L2 Caching Service** | Lưu trữ kết quả tra cứu địa điểm và khách sạn trong 24 giờ trên Upstash Redis, giảm 80% chi phí API calls. | Hà Đăng Huy |

---

## 💻 Nhóm 6 — Giao Diện Người Dùng & Bản Đồ Lộ Trình (Frontend Experience)

| # | Mã Task | Tính năng | Mô tả chi tiết kỹ thuật | Người phụ trách |
|:---:|:---:|---|---|:---:|
| 29 | `TASK-111` | **Design System: Flexbox & Responsive Layout** | Xây dựng 100% layout bằng Flexbox & CSS Grid, đáp ứng mượt mà Mobile (375px+), Tablet, Desktop Split-Pane (1024px+ / 1440px+), chuẩn WCAG AA. | Nguyễn Minh Đức |
| 30 | `TASK-114` | **Trang Landing Page & Giới thiệu** | Trang chủ hiện đại giới thiệu tính năng, mô phỏng luồng 2-Stage Consensus, nút Call-to-Action. | Nguyễn Minh Đức |
| 31 | `TASK-115` | **Hỗ trợ Đa ngôn ngữ (i18n)** | Chuyển đổi ngôn ngữ Tiếng Việt / Tiếng Anh mượt mà bằng thư viện `react-i18next`. | Nguyễn Minh Đức |
| 32 | `TASK-215` | **Canvas Bản đồ Tương tác Mapbox GL** | Hiển thị các điểm dừng trên bản đồ số, vẽ tuyến đường di chuyển trực quan giữa các điểm. | Hà Đăng Huy |
| 33 | `TASK-314` | **Dòng Thời Gian Kế Hoạch (Interactive Timeline)** | Danh sách thẻ điểm dừng trực quan, hỗ trợ kéo thả sắp xếp thứ tự và hiển thị thời gian lưu lại. | Hà Đăng Huy |
| 34 | `TASK-406` | **Giao diện Room Chat & Token Streaming** | Màn hình chat phòng thời gian thực, stream từng token của AI (TTFT $< 800$\,ms) qua WebSockets. | Nguyễn Minh Đức |
| 35 | `TASK-408` | **Thẻ Bình Chọn Điểm Dừng (Stop Voting Cards)** | Thẻ hiển thị hình ảnh, giá, nút vote UP/DOWN và nút 1-Click Swap thay thế địa điểm tức thì. | Nguyễn Minh Đức |
| 36 | `TASK-312` | **Xuất File Lịch Trình PDF** | Tạo file PDF đẹp mắt, chuyên nghiệp chứa bản đồ, timeline, chi phí dự kiến qua WeasyPrint. | Phạm Đình Ánh Dương |
| 37 | `TASK-313` | **Xuất File Lịch (.ics Calendar Export)** | Đồng bộ toàn bộ lịch trình chuyến đi vào Google Calendar, Apple Calendar chỉ với 1 click. | Phạm Đình Ánh Dương |

---

## 💰 Nhóm 7 — Quản Lý Tài Chính Nhóm & Giám Sát Hệ Thống (Expenses & Ops)

| # | Mã Task | Tính năng | Mô tả chi tiết kỹ thuật | Người phụ trách |
|:---:|:---:|---|---|:---:|
| 38 | `TASK-404` | **Ghi nhận Thu Quỹ & Chi Phí Nhóm** | Hỗ trợ thu quỹ trước (`ExpenseType.ADVANCE`) và ghi nhận hóa đơn chi tiêu thực tế phát sinh. | Phạm Đình Ánh Dương |
| 39 | `TASK-405` | **Thuật toán Bù trừ Nợ Tối ưu (Settlement)** | Tính toán số dư ròng của từng người và gợi ý số lượng giao dịch chuyển khoản ít nhất (Min-Cash-Flow). | Phạm Đình Ánh Dương |
| 40 | `TASK-409` | **Giao diện Quyết toán Chi phí** | Màn hình hiển thị tổng quỹ, chi tiết ai đã chi, ai nợ ai bao nhiêu tiền kèm nút xác nhận đã bank. | Nguyễn Minh Đức |
| 41 | `TASK-410` | **Dashboard Giám Sát Quản Trị (Admin UI)** | Thống kê số lượng phòng hoạt động, token LLM tiêu thụ, cache hit rate và thời gian phản hồi. | Nguyễn Minh Đức |
| 42 | `TASK-414` | **Hạ tầng Giám sát OpenTelemetry & LangSmith** | Đo lường độ trễ end-to-end (Gateway $\rightarrow$ Redis $\rightarrow$ AI Worker $\rightarrow$ DB), theo dõi sức khỏe hệ thống. | Đinh Tiến Luân |
