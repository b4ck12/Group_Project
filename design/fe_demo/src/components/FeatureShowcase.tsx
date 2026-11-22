import React from 'react';
import { Compass, Users, CloudRain, Navigation, Utensils, CheckSquare } from 'lucide-react';

const FEATURES = [
  {
    icon: Compass,
    iconColor: 'text-ochre',
    iconBg: 'bg-ochre/15 border-ochre/30',
    title: 'Lên Lịch Trình Tự Động & Cá Nhân Hóa',
    desc: 'Tự động tính toán các điểm dừng tối ưu theo gu du lịch, sắp xếp khung giờ hợp lý giúp cả nhóm du ngoạn thong dong không mệt mỏi.'
  },
  {
    icon: Users,
    iconColor: 'text-heart',
    iconBg: 'bg-rose-50 border-rose-200',
    title: 'Bình Chọn Đồng Thuận Dân Chủ',
    desc: 'Thả tim và biểu quyết trực tiếp trên từng thẻ điểm dừng. Thanh Quorum hiển thị tỷ lệ đồng thuận minh bạch, chấm dứt cảnh 9 người 10 ý.'
  },
  {
    icon: CloudRain,
    iconColor: 'text-terracotta',
    iconBg: 'bg-terracotta/15 border-terracotta/30',
    title: 'Cố Vấn Thích Ứng Thời Tiết',
    desc: 'Phát hiện trước nguy cơ mưa rào hoặc thời tiết cực đoan, tự động kích hoạt tính năng hoán đổi sang không gian trong nhà ấm cúng tức thì.'
  },
  {
    icon: Navigation,
    iconColor: 'text-navy',
    iconBg: 'bg-navy/10 border-navy/20',
    title: 'Định Tuyến & Đo Cự Ly Chuẩn Xác',
    desc: 'Kiểm soát cự ly di chuyển giữa các trạm dừng (≤ 2.5km), gợi ý phương tiện di chuyển thong thả: đi bộ ngõ cổ, xe đạp hoặc xe ôm bản địa.'
  },
  {
    icon: Utensils,
    iconColor: 'text-ochre',
    iconBg: 'bg-ochre/15 border-ochre/30',
    title: 'Khám Phá Menu Đặc Sản Bản Địa',
    desc: 'Xem ngay danh sách món ăn khuyên thử tại từng quán dừng chân, có bộ lọc phân loại khẩu vị ăn chay, ăn cay và mức giá công khai.'
  },
  {
    icon: CheckSquare,
    iconColor: 'text-moss',
    iconBg: 'bg-moss/15 border-moss/30',
    title: 'Hành Lý Thông Minh & Phân Chia Trách Nhiệm',
    desc: 'Tự động lên danh sách vật dụng cần thiết theo dự báo thời tiết của điểm đến, phân chia cụ thể ai mang gì để tránh bỏ sót đồ quan trọng.'
  }
];

export const FeatureShowcase: React.FC = () => {
  return (
    <section id="features" className="my-16 pt-12 border-t border-ash/80">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-ash text-graphite text-xs font-semibold uppercase tracking-wider mb-3">
          <span>Tính Năng Vượt Trội</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
          Giải Pháp Toàn Diện Cho Chuyến Đi Của Nhóm Bạn
        </h2>
        <p className="mt-3 text-sm text-graphite leading-relaxed">
          Được thiết kế tinh gọn theo triết lý phẳng hiện đại, kết hợp cùng cố vấn bản địa giúp mọi kế hoạch du lịch trở nên nhẹ nhàng và tràn đầy cảm xúc.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map((feat, index) => {
          const IconComponent = feat.icon;
          return (
            <div 
              key={index}
              className="p-5 rounded-2xl bg-pureWhite border border-ash/80 shadow-sm hover:shadow-md hover:border-ochre/50 transition-all duration-200 group"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border mb-4 ${feat.iconBg}`}>
                <IconComponent className={`w-5 h-5 ${feat.iconColor}`} />
              </div>
              <h3 className="text-base font-bold text-ink mb-2 group-hover:text-terracotta transition-colors">
                {feat.title}
              </h3>
              <p className="text-xs text-graphite leading-relaxed">
                {feat.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
