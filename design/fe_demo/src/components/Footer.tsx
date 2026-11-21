import React from 'react';
import { Compass, Mail, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-pureWhite border-t border-ash/80 mt-20 pt-16 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand Column (Col 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-navy flex items-center justify-center text-ochre shadow-sm">
              <Compass className="w-4 h-4 text-ochre" />
            </div>
            <span className="text-xl font-bold tracking-tight text-ink">TripMate</span>
          </div>
          <p className="text-xs text-graphite leading-relaxed max-w-sm">
            Nền tảng lập kế hoạch du lịch đồng thuận thông minh. Tôn vinh vẻ đẹp cảnh quan di sản Việt Nam qua phong cách xé dán nghệ thuật và trải nghiệm người dùng phẳng hiện đại.
          </p>
          <div className="pt-2 text-xs text-muted font-mono flex items-center gap-2">
            <span>Toạ độ: 15.8801° N, 108.3380° E</span>
            <span>•</span>
            <span>Phố Cổ Hội An</span>
          </div>
        </div>

        {/* Column: Khám Phá */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-ink font-mono mb-4">
            Khám Phá Di Sản
          </h4>
          <ul className="space-y-2.5 text-xs text-graphite">
            <li><a href="#scrapbook" className="hover:text-terracotta transition-colors">Phố Cổ Hội An</a></li>
            <li><a href="#scrapbook" className="hover:text-terracotta transition-colors">Vịnh Hạ Long</a></li>
            <li><a href="#scrapbook" className="hover:text-terracotta transition-colors">Mường Hoa Sa Pa</a></li>
            <li><a href="#scrapbook" className="hover:text-terracotta transition-colors">Tràng An Ninh Bình</a></li>
            <li><a href="#scrapbook" className="hover:text-terracotta transition-colors">Cầu Rồng Đà Nẵng</a></li>
            <li><a href="#scrapbook" className="hover:text-terracotta transition-colors">Cố Đô Huế</a></li>
          </ul>
        </div>

        {/* Column: Tính Năng */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-ink font-mono mb-4">
            Tính Năng
          </h4>
          <ul className="space-y-2.5 text-xs text-graphite">
            <li><a href="#features" className="hover:text-terracotta transition-colors">Lịch Trình Sống Động</a></li>
            <li><a href="#features" className="hover:text-terracotta transition-colors">Bỏ Phiếu Đồng Thuận</a></li>
            <li><a href="#features" className="hover:text-terracotta transition-colors">Thích Ứng Thời Tiết</a></li>
            <li><a href="#features" className="hover:text-terracotta transition-colors">Cự Ly Chuẩn Haversine</a></li>
            <li><a href="#features" className="hover:text-terracotta transition-colors">Thực Đơn Món Khuyên Thử</a></li>
            <li><a href="#features" className="hover:text-terracotta transition-colors">Hành Lý Thông Minh</a></li>
          </ul>
        </div>

        {/* Column: Bản Tin Viễn Du */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-ink font-mono mb-4">
            Bản Tin Viễn Du
          </h4>
          <p className="text-xs text-graphite mb-3 leading-relaxed">
            Đăng ký nhận gợi ý các điểm đến kín đáo và món ăn độc bản mỗi tuần.
          </p>
          <form onSubmit={(e) => { e.preventDefault(); alert('Cảm ơn bạn đã đăng ký nhận bản tin viễn du!'); }} className="space-y-2">
            <div className="relative">
              <input
                type="email"
                placeholder="Email của bạn..."
                required
                className="w-full px-3 py-2 text-xs rounded-xl bg-surface border border-ash text-ink placeholder:text-muted focus:outline-none focus:border-navy"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-3 rounded-lg bg-navy text-pureWhite text-xs font-bold hover:bg-navy/90 transition-all flex items-center justify-center"
              >
                Gửi
              </button>
            </div>
            <span className="text-[10px] text-muted block">Cam kết không gửi thư rác.</span>
          </form>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-ash/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted">
        <div>
          © 2026 TripMate. Tự hào tôn vinh văn hóa & cảnh sắc thiên nhiên Việt Nam.
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:underline">Điều Khoản Dịch Vụ</a>
          <span>•</span>
          <a href="#" className="hover:underline">Chính Sách Bảo Mật</a>
          <span>•</span>
          <span className="flex items-center gap-1">
            Thiết kế với <Heart className="w-3 h-3 text-heart fill-heart inline" /> tại Việt Nam
          </span>
        </div>
      </div>
    </footer>
  );
};
