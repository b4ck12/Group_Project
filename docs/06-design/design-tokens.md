# 🎨 Design Tokens & Theme Specification
## Dự án: TripMate AI — Intelligent Group Activity & Travel Planning Platform

> Tài liệu đặc tả Design Tokens theo yêu cầu **TASK-009** (Feature #29), được tổng hợp từ tài liệu thiết kế master **[DESIGN.md](../../design/DESIGN.md)** và 4 phong cách tham chiếu tại thư mục [`design/`](../../design).

---

## 📌 Tổng Quan Hệ Thống Tokens
Hệ thống Design Tokens của TripMate AI được xây dựng dựa trên sự kết hợp hài hòa giữa:
1. **Airbnb**: Typography phân cấp rõ ràng, hình ảnh địa điểm chân thực, không dùng bóng đổ lem nhem.
2. **Campsite**: Nền giấy ấm áp (`#fffdf9`), các thẻ trạng thái bo tròn Pill `9999px`.
3. **Amie**: Dòng thời gian tương tác, cấu trúc lựa chọn nút kép, màu nhấn Sky `#0ea5e9`.
4. **Uber**: Trục nối di chuyển trực quan (Transit steps), thanh chốt cố định ở đáy màn hình.

---

## 🎨 1. Bảng Màu Chuẩn (Color Tokens)

```typescript
export const colors = {
  // Brand Authorities & Accents (Proposal)
  brand: {
    navy: "#12305c",     // Primary Navy (Host actions, Header, Wordmark)
    teal: "#186c8e",     // Accent Teal (Navigation active, highlights)
    sky: "#0ea5e9",      // Sky Action (AI stream cursor, 1-Click Swap CTA)
  },
  
  // Surfaces & Backgrounds (Campsite + Airbnb)
  surface: {
    canvas: "#fffdf9",   // Warm Paper Canvas (Toàn bộ nền ứng dụng)
    pure: "#ffffff",     // Pure White (Stop Cards, Dialogs)
    mist: "#f6f8fa",     // Mist Gray (Alternate section banding)
    pebble: "#ebebeb",   // Pebble (Divider, background tracks)
  },

  // Typography & Content (Uber + Amie)
  content: {
    ink: "#0f172a",      // Ink Black (Headlines, prices)
    graphite: "#475569", // Graphite (Body text, chat messages)
    steel: "#94a3b8",    // Steel Muted (Timestamps, secondary notes)
  },

  // Consensus & Operational Statuses
  consensus: {
    green: "#10b981",    // Quorum reached, Stop ACCEPTED, Final Lock
    amber: "#f59e0b",    // Stop VOTING, Macro Lock, Weather alert
    rose: "#ef4444",     // Stop REJECTED, Downvoted
    transit: "#0284c7",  // Uber-like Transit Steps (Walk, Car, Transit)
  }
} as const;
```

---

## 🔤 2. Typography & Phông Chữ

* **Phông chữ chủ đạo**: `Inter, -apple-system, BlinkMacSystemFont, sans-serif`
* **Phông chữ số & dữ liệu**: `ui-monospace, SFMono-Regular, Menlo, monospace`
* **Tracking âm**:
  * Display / Hero: `-0.03em`
  * Heading 1 (Section): `-0.025em`
  * Heading 2 (Day / Card): `-0.015em`

---

## 📐 3. Bo Góc & Khoảng Cách (Radius & Spacing)

* **Spacing Grid**: Bội số của `4px` (`4, 8, 12, 16, 20, 24, 32, 48, 64px`).
* **Border Radius**:
  * `pill`: `9999px` (Badges, Voting counters, Filter chips, User avatars)
  * `modal`: `16px` (Dialogs, Bottom-sheets, Drawers)
  * `card`: `12px` (Stop Cards, Media blocks, Chat log)
  * `control`: `8px` (Inputs, Buttons, Dropdown items)
  * `sm`: `4px` (Tags, Category indicators)

---

## 🔍 Xem Tài Liệu Chi Tiết

Để xem toàn bộ sơ đồ bố cục 3 cột (3-Pane Split-Screen), đặc tả từng component (Stop Voting Card, Transit Step, AI Chat Bubble), cấu hình `tailwind.config.js` và tiêu chuẩn WCAG AA, vui lòng xem tại:
👉 **[DESIGN.md](../../design/DESIGN.md)**
