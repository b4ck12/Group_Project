import React from 'react';

export const AdminView: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="bg-pureWhite p-6 rounded-2xl border border-ash shadow-sm">
        <div className="pb-4 border-b border-ash">
          <span className="text-xs font-bold text-ochre uppercase tracking-wider font-mono">TASK-410</span>
          <h2 className="font-serif text-2xl font-bold text-ink">Bảng Điều Khiển Quản Trị & Hiệu Năng</h2>
          <p className="text-xs text-graphite mt-1">Giám sát mức tiêu thụ Token, tỉ lệ Cache Hit và thời gian phản hồi.</p>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
          <div className="p-4 rounded-xl bg-surface/60 border border-ash/60">
            <span className="text-[11px] font-semibold text-muted">Tokens Tiêu Thụ</span>
            <div className="text-2xl font-serif font-bold text-ink mt-1">42.850</div>
            <span className="text-[10px] font-mono text-moss">↑ 12% so với hôm qua</span>
          </div>

          <div className="p-4 rounded-xl bg-surface/60 border border-ash/60">
            <span className="text-[11px] font-semibold text-muted">Tỉ Lệ Cache Hit</span>
            <div className="text-2xl font-serif font-bold text-moss mt-1">89.4%</div>
            <span className="text-[10px] font-mono text-muted">Tiết kiệm 74% chi phí</span>
          </div>

          <div className="p-4 rounded-xl bg-surface/60 border border-ash/60">
            <span className="text-[11px] font-semibold text-muted">Độ Trễ Phản Hồi TB</span>
            <div className="text-2xl font-serif font-bold text-navy mt-1">142ms</div>
            <span className="text-[10px] font-mono text-moss">TTFT siêu tốc</span>
          </div>

          <div className="p-4 rounded-xl bg-surface/60 border border-ash/60">
            <span className="text-[11px] font-semibold text-muted">Chi Phí Ước Tính</span>
            <div className="text-2xl font-serif font-bold text-terracotta mt-1">$1.42</div>
            <span className="text-[10px] font-mono text-muted">Ngân sách tối ưu</span>
          </div>
        </div>

        {/* Realtime Event Logs */}
        <div className="mt-6 border border-ash rounded-xl p-4 bg-canvas/30">
          <h3 className="font-serif text-sm font-bold text-ink mb-3">Nhật Ký Tác Vụ Mới Nhất</h3>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between p-2 rounded bg-pureWhite border border-ash/60">
              <span className="text-moss font-bold">[WEATHER_SERVICE]</span>
              <span className="text-graphite">Phát hiện khả năng mưa rào 65% lúc 15:30 tại Hội An</span>
              <span className="text-muted">142ms</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-pureWhite border border-ash/60">
              <span className="text-navy font-bold">[TRANSIT_ROUTER]</span>
              <span className="text-graphite">Tính toán cự ly Reaching Out Teahouse (cách 110m)</span>
              <span className="text-muted">86ms</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-pureWhite border border-ash/60">
              <span className="text-ochre font-bold">[CONSENSUS_ENGINE]</span>
              <span className="text-graphite">Quorum đồng thuận đạt 100% (3/3 phiếu bầu)</span>
              <span className="text-muted">35ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
