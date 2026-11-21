import React from 'react';
import {
  Heart,
  ThumbsUp,
  ThumbsDown,
  Utensils,
  Navigation,
  AlertCircle,
  CheckCircle2,
  Compass,
  ArrowRight,
  Calendar,
  Layers,
  MapPin,
  Clock,
  ChevronRight,
  ShieldCheck,
  Check,
  Lock
} from 'lucide-react';
import { Stop, ProposalOption } from '../types';
import { MEMBER_DESIRES } from '../data/mockData';

interface TimelinePanelProps {
  planStage: 'empty' | 'proposals' | 'detailed' | 'finalized';
  proposals: ProposalOption[];
  selectedProposalKey: string;
  onSelectProposal: (key: string) => void;
  onVoteProposal: (key: string) => void;
  onConfirmProposal: (opt: ProposalOption) => void;
  stops: Stop[];
  activeStopId: string;
  setActiveStopId: (id: string) => void;
  onVote: (stopId: string, type: 'up' | 'down' | 'heart') => void;
  onVoteCandidate?: (stopId: string, candidateId: string) => void;
  onConfirmStop?: (stopId: string) => void;
  onOpenFoodModal: (stop: Stop) => void;
  activeDayTab: 'overview' | 'day1' | 'day2' | 'day3';
  setActiveDayTab: (tab: 'overview' | 'day1' | 'day2' | 'day3') => void;
  day1Count?: number;
  day2Count?: number;
  day3Count?: number;
}

export const TimelinePanel: React.FC<TimelinePanelProps> = ({
  planStage,
  proposals,
  selectedProposalKey,
  onSelectProposal,
  onVoteProposal,
  onConfirmProposal,
  stops,
  activeStopId,
  setActiveStopId,
  onVote,
  onVoteCandidate,
  onConfirmStop,
  onOpenFoodModal,
  activeDayTab,
  setActiveDayTab,
  day1Count = 2,
  day2Count = 1,
  day3Count = 1
}) => {
  // VIEW 1: BAN ĐẦU CHƯA CÓ GÌ (Hoàn toàn không có tab ngày, không có + Thêm trạm, không có Quorum)
  if (planStage === 'empty') {
    return (
      <div className="lg:col-span-5 bg-pureWhite rounded-xl border border-ash shadow-sm flex flex-col overflow-hidden">
        {/* Simple Header without day tabs */}
        <div className="p-3.5 border-b border-ash bg-surface/40 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-ink">Bảng Lắng Nghe & Đối Soát Nguyện Vọng Nhóm</h3>
            <p className="text-[10px] text-muted">Thu thập mong muốn, khẩu vị và gu trải nghiệm trước khi tạo lịch</p>
          </div>
          <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-ash text-graphite">
            Chờ Thảo Luận
          </span>
        </div>

        {/* Informative Roadmap */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-start text-center bg-canvas/20 space-y-3">
          <div className="w-10 h-10 rounded-full bg-ochre/15 text-ochre flex items-center justify-center mt-2 shadow-xs">
            <Compass className="w-5 h-5 text-ochre" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-ink">Chưa Khởi Tạo Lịch Trình</h4>
            <p className="mt-0.5 text-xs text-graphite max-w-sm leading-relaxed">
              Các thành viên đang chia sẻ nguyện vọng và gu du lịch qua Kênh Chat.
            </p>
          </div>

          {/* Member Expressed Desires Card */}
          <div className="p-3.5 rounded-xl bg-pureWhite border border-ash/80 text-left w-full shadow-xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-ash/60 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
                <Heart className="w-4 h-4 text-terracotta" />
                <span>Nguyện Vọng & Khẩu Vị Thành Viên Đã Chia Sẻ</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-moss bg-moss/10 px-2 py-0.5 rounded">
                3/3 Thành Viên Đã Lên Tiếng
              </span>
            </div>

            <div className="space-y-2.5">
              {MEMBER_DESIRES.map((member) => (
                <div key={member.memberName} className="p-2.5 rounded-lg bg-surface/50 border border-ash/40">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-5 h-5 rounded-full ${member.avatarColor} text-[10px] font-bold flex items-center justify-center`}>
                        {member.memberName.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-xs font-bold text-ink">{member.memberName}</span>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-pureWhite border border-ash text-graphite font-medium">
                      {member.roleBadge}
                    </span>
                  </div>

                  <div className="space-y-1 pl-6">
                    {member.desires.map((desire, idx) => (
                      <div key={idx} className="text-[11px] text-graphite leading-relaxed">
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-ochre shrink-0"></span>
                          <strong className="text-ink">{desire.title}</strong>
                          <span className="text-[9px] text-muted hidden sm:inline">({desire.category})</span>
                        </div>
                        <p className="text-[10px] text-muted pl-2.5 mt-0.5 italic">{desire.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-2.5 rounded-lg bg-navy/5 border border-navy/15 text-[11px] text-navy leading-relaxed">
              <strong>Luồng xử lý kiến trúc (explain.md):</strong> Agent sẽ tổng hợp toàn bộ các nguyện vọng này, kết hợp với Bộ lọc Đầu vào (Đà Nẵng, 3N2Đ, 3.5tr) để tính toán cự ly tối ưu (Haversine ≤ 2.5km), tuyển chọn danh sách các điểm dừng phù hợp nhất và chia thành các Phương Án Tổng Thể cho nhóm biểu quyết!
            </div>
          </div>

          <div className="text-[10px] text-muted italic pb-2">
            👉 Hãy nhấn nút <strong>Gửi</strong> hoặc <strong>Thực Thi Ngay</strong> trong Kênh Chat để bắt đầu!
          </div>
        </div>
      </div>
    );
  }

  // VIEW 2: BIỂU QUYẾT LỰA CHỌN PHƯƠNG ÁN TỔNG THỂ (Dân chủ: Phải vote đủ Quorum mới được Host chốt)
  if (planStage === 'proposals') {
    const totalMembers = 3;
    const leadingProp = proposals.reduce((prev, current) =>
      (current.votes?.length || 0) > (prev.votes?.length || 0) ? current : prev, proposals[0]);
    const leadingVotes = leadingProp.votes?.length || 0;
    const leadingPercent = Math.round((leadingVotes / totalMembers) * 100);
    const disagreePercent = 100 - leadingPercent;
    const isQuorumReached = leadingVotes >= 2; // >= 67% đồng thuận

    return (
      <div className="lg:col-span-5 bg-pureWhite rounded-xl border border-ash shadow-sm flex flex-col overflow-hidden">
        {/* Header: Voting & Quorum Progress Bar */}
        <div className="p-3.5 border-b border-ash bg-surface/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-ink">Giai Đoạn 1: Biểu Quyết Phương Án Tổng Thể (Macro Proposals)</h3>
              <p className="text-[10px] text-graphite">Cả nhóm cùng bỏ phiếu. Cần tối thiểu 67% (2/3 thành viên) đồng thuận để Host khóa vĩ mô.</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-ochre/15 text-ochre border border-ochre/30">
              3 Phương Án
            </span>
          </div>

          {/* Consensus Quorum Bar & 40% Disagreement Rule */}
          <div className="mt-2.5 pt-2 border-t border-ash/60 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-graphite">Tiến Độ Biểu Quyết Đồng Thuận:</span>
              <span className={`font-mono font-bold ${isQuorumReached ? 'text-moss' : 'text-amber-700'}`}>
                {leadingVotes}/{totalMembers} Thành Viên ({leadingPercent}%) ủng hộ {leadingProp.title.split(':')[0]}
              </span>
            </div>

            <div className="w-full h-2 bg-ash rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isQuorumReached ? 'bg-moss' : 'bg-amber-500'
                }`}
                style={{ width: `${leadingPercent}%` }}
              ></div>
            </div>

            {/* 40% Disagreement Threshold Warning Banner */}
            {disagreePercent >= 40 ? (
              <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-[10px] text-amber-800 flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Cảnh báo chưa đạt đồng thuận ({disagreePercent}% phân tán/chưa đồng ý):</strong> Khi tỷ lệ bất đồng thuận ≥ 40%, nhóm chưa thể chốt lộ trình. Hãy thảo luận thêm trong Kênh Chat hoặc thay đổi phương án!
                </span>
              </div>
            ) : (
              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  <strong>Đã đạt ngưỡng đồng thuận cao ({leadingPercent}%):</strong> Phương Án {leadingProp.key} đã đủ điều kiện để Host khóa vĩ mô!
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 3 Proposal Cards List (Each card has a VOTE button, NOT immediate lock) */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-canvas/20">
          {proposals.map((prop) => {
            const isSelected = selectedProposalKey === prop.key;
            const hasUserVoted = prop.votes?.includes('Minh Đức (Bạn)');

            return (
              <div
                key={prop.key}
                onClick={() => onSelectProposal(prop.key)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-navy shadow-md ring-1 ring-navy/30 bg-pureWhite'
                    : 'border-ash hover:border-ash/80 bg-pureWhite/95'
                }`}
              >
                {/* Header line */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-5 h-5 rounded-full font-mono text-xs font-bold flex items-center justify-center ${
                      isSelected ? 'bg-navy text-pureWhite' : 'bg-surface text-ink'
                    }`}>
                      {prop.key}
                    </span>
                    <h4 className="text-xs font-bold text-ink">{prop.title}</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-ochre/15 text-ochre">
                    {prop.tag}
                  </span>
                </div>

                <p className="text-[11px] text-graphite leading-relaxed">
                  {prop.vibe}
                </p>

                {/* Days Overview */}
                {prop.daysOverview && (
                  <div className="mt-2.5 pt-2 border-t border-ash/60 space-y-1.5">
                    <span className="text-[9px] font-mono font-bold uppercase text-muted block">
                      Khung 3 Ngày Dự Kiến:
                    </span>
                    {prop.daysOverview.map((d) => (
                      <div key={d.day} className="text-[10px] text-graphite flex items-start gap-1.5">
                        <Calendar className="w-3 h-3 text-ochre shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-ink">{d.title}: </strong>
                          <span className="text-muted">{d.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Budget & Voting Action Bar */}
                <div className="mt-3 pt-2.5 border-t border-ash/60 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-muted block">Ngân sách dự tính:</span>
                    <span className="font-mono text-xs font-bold text-navy">
                      {prop.totalTripEst || prop.estCost}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {prop.votes && prop.votes.length > 0 ? (
                      <span className="text-[10px] text-moss font-semibold hidden sm:inline">
                        ✓ {prop.votes.join(', ')} ({prop.votes.length}/3 phiếu)
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted italic hidden sm:inline">
                        Chưa có phiếu
                      </span>
                    )}

                    {/* VOTE BUTTON - Democratic Voting */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onVoteProposal(prop.key);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                        hasUserVoted
                          ? 'bg-moss text-pureWhite hover:bg-moss/90'
                          : 'bg-pureWhite border border-navy text-navy hover:bg-navy/5'
                      }`}
                    >
                      {hasUserVoted ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Đã Bỏ Phiếu</span>
                        </>
                      ) : (
                        <span>🗳 Bỏ Phiếu Cho {prop.key}</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* BOTTOM ACTION BAR: HOST MACRO LOCK (Chỉ kích hoạt khi đạt Quorum >= 67%) */}
        <div className={`p-3 border-t flex items-center justify-between transition-colors ${
          isQuorumReached ? 'bg-emerald-50/80 border-emerald-200' : 'bg-surface border-ash'
        }`}>
          <div>
            <div className="text-xs font-bold text-ink flex items-center gap-1.5">
              <ShieldCheck className={`w-4 h-4 ${isQuorumReached ? 'text-moss' : 'text-muted'}`} />
              <span>Chốt Chặn 1: Khóa Lộ Trình Vĩ Mô (Macro Lock)</span>
            </div>
            <p className="text-[10px] text-graphite">
              {isQuorumReached
                ? `Đạt ${leadingVotes}/3 phiếu đồng thuận (${leadingPercent}%). Host (Minh Đức) có thể bấm khóa!`
                : `Cần tối thiểu 67% đồng thuận để khóa. Hiện tại đang có ${disagreePercent}% bất đồng thuận.`}
            </p>
          </div>

          <button
            type="button"
            disabled={!isQuorumReached}
            onClick={() => onConfirmProposal(leadingProp)}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all ${
              isQuorumReached
                ? 'bg-navy text-pureWhite hover:bg-navy/90 hover:shadow-md cursor-pointer'
                : 'bg-ash text-muted border border-ash/80 cursor-not-allowed opacity-60'
            }`}
          >
            <span>Khóa Lộ Trình Vĩ Mô ({leadingProp.key})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // VIEW 3: LỊCH TRÌNH ĐÃ KHÓA VĨ MÔ — CÓ TỔNG QUAN 3N2Đ TRƯỚC RỒI MỚI ĐẾN TỪNG TRẠM DỪNG
  return (
    <div className="lg:col-span-5 bg-pureWhite rounded-xl border border-ash shadow-sm flex flex-col overflow-hidden">
      {/* Day Selector Tabs with OVERVIEW TAB FIRST */}
      <div className="p-3 border-b border-ash bg-surface/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {/* Tab 0: Tổng Quan (MẶC ĐỊNH MỞ ĐẦU TIÊN) */}
            <button
              onClick={() => setActiveDayTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeDayTab === 'overview'
                  ? 'bg-navy text-pureWhite shadow-sm'
                  : 'text-graphite hover:text-navy hover:bg-pureWhite/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Tổng Quan 3N2Đ</span>
            </button>

            {/* Tab 1: Ngày 1 */}
            <button
              onClick={() => setActiveDayTab('day1')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeDayTab === 'day1'
                  ? 'bg-navy text-pureWhite shadow-sm'
                  : 'text-graphite hover:text-navy hover:bg-pureWhite/60'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Ngày 1 ({day1Count}/8 Trạm)</span>
            </button>

            {/* Tab 2: Ngày 2 */}
            <button
              onClick={() => setActiveDayTab('day2')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeDayTab === 'day2'
                  ? 'bg-navy text-pureWhite shadow-sm font-bold'
                  : 'text-graphite hover:text-navy hover:bg-pureWhite/60'
              }`}
            >
              <span>Ngày 2 ({day2Count}/6 Trạm)</span>
            </button>

            {/* Tab 3: Ngày 3 */}
            <button
              onClick={() => setActiveDayTab('day3')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeDayTab === 'day3'
                  ? 'bg-navy text-pureWhite shadow-sm font-bold'
                  : 'text-graphite hover:text-navy hover:bg-pureWhite/60'
              }`}
            >
              <span>Ngày 3 ({day3Count}/4 Trạm)</span>
            </button>
          </div>
        </div>

        {/* Group Consensus Quorum Indicator */}
        <div className="mt-2 pt-2 border-t border-ash/60 flex items-center justify-between text-[11px]">
          <span className="font-semibold text-graphite">Tiến Độ Đồng Thuận Nhóm (Quorum)</span>
          <span className="font-mono font-bold text-moss">3/3 Thành Viên Trực Tuyến</span>
        </div>
        <div className="w-full h-1.5 bg-ash rounded-full overflow-hidden mt-1">
          <div className="h-full bg-moss rounded-full w-full transition-all duration-500"></div>
        </div>
      </div>

      {/* CONTENT AREA: TOGGLED BETWEEN OVERVIEW DASHBOARD AND DETAILED STOPS */}
      {activeDayTab === 'overview' ? (
        /* TAB 0: TỔNG QUAN LỘ TRÌNH 3N2Đ (Hiển thị đầu tiên sau khi khóa vĩ mô) */
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-canvas/20">
          {/* Banner: Macro Locked Notification */}
          <div className="p-3.5 rounded-xl bg-pureWhite border border-ash/80 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-moss/10 text-moss border border-moss/20 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-moss" />
                <span>Đã Khóa Lộ Trình Vĩ Mô (Chốt Chặn 1)</span>
              </span>
              <span className="text-[10px] font-mono text-muted">3N2Đ • 3 Thành Viên</span>
            </div>
            <h3 className="text-sm font-bold text-ink mt-1">
              Phương Án A: Phố Cổ & Di Sản Ẩm Thực (Đà Nẵng — Hội An)
            </h3>
            <p className="text-xs text-graphite mt-1 leading-relaxed">
              Lộ trình được Agent tối ưu hoá cự ly di chuyển (Haversine ≤ 2.5km), xen kẽ nghỉ ngơi phòng lạnh và thỏa mãn 100% nguyện vọng của cả 3 thành viên.
            </p>
          </div>

          {/* Primary CTA: Jump into Day 1 detailed stops */}
          <div className="p-3 rounded-xl bg-navy text-pureWhite flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-ochre font-bold block">Bước Tiếp Theo:</span>
              <h4 className="text-xs font-bold text-pureWhite mt-0.5">Khám Phá & Biểu Quyết 8 Trạm Dừng Ngày 1</h4>
            </div>
            <button
              onClick={() => setActiveDayTab('day1')}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-ochre text-pureWhite hover:bg-ochre/90 transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>Xem Chi Tiết Ngày 1</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 3-Day Journey Summary Cards */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-ink uppercase tracking-wider">
              Khung Chương Trình Toàn Tuyến 3 Ngày:
            </h4>

            {/* Day 1 Card */}
            <div 
              onClick={() => setActiveDayTab('day1')}
              className="p-3.5 rounded-xl bg-pureWhite border border-navy/20 hover:border-navy shadow-xs cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-navy text-pureWhite font-mono text-xs font-bold flex items-center justify-center">
                    01
                  </span>
                  <div>
                    <h5 className="text-xs font-bold text-ink group-hover:text-terracotta transition-colors">
                      Ngày 1: Đón Sân Bay DAD & Phố Cổ Di Sản
                    </h5>
                    <span className="text-[10px] text-muted font-mono">07:30 — 21:00 • {day1Count}/8 Trạm (Mở dần theo biểu quyết)</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-moss bg-moss/10 px-2 py-0.5 rounded">
                  Hôm Nay
                </span>
              </div>
              <p className="text-[11px] text-graphite leading-relaxed pl-8">
                Đón ga quốc nội DAD → Check-in Anio Hotel → Bánh mì Phượng → Faifo Rooftop → Bếp Cuốn di sản → Nghỉ trưa phòng lạnh → Biển An Bàng → Thả hoa đăng sông Hoài.
              </p>
              <div className="mt-2 pt-2 border-t border-ash/60 pl-8 flex items-center justify-between text-[10px]">
                <span className="text-muted">Cự ly: Haversine ≤ 2.5km • Ăn uống: ~480k</span>
                <span className="text-navy font-bold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                  <span>Bấm vào để biểu quyết ({day1Count}/8 trạm)</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Day 2 Card */}
            <div 
              onClick={() => setActiveDayTab('day2')}
              className="p-3.5 rounded-xl bg-pureWhite border border-ash hover:border-navy shadow-xs cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-surface text-ink font-mono text-xs font-bold flex items-center justify-center border border-ash">
                    02
                  </span>
                  <div>
                    <h5 className="text-xs font-bold text-ink group-hover:text-terracotta transition-colors">
                      Ngày 2: Rừng Dừa Bảy Mẫu & Làng Quê Cẩm Thanh
                    </h5>
                    <span className="text-[10px] text-muted font-mono">08:00 — 21:30 • {day2Count}/6 Trạm (Mở dần theo biểu quyết)</span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-graphite bg-surface px-2 py-0.5 rounded">
                  Ngày Mai
                </span>
              </div>
              <p className="text-[11px] text-graphite leading-relaxed pl-8">
                Cao Lầu & Mì Quảng Bá Lễ → Thuyền thúng len lỏi rặng dừa nước Cẩm Thanh → Bữa trưa sinh thái The Field → Nghỉ trưa Anio Hotel → Chiều biển Cửa Đại → Chợ đêm Hội An.
              </p>
              <div className="mt-2 pt-2 border-t border-ash/60 pl-8 flex items-center justify-between text-[10px]">
                <span className="text-muted">Sinh thái sông nước • Ăn uống: ~550k</span>
                <span className="text-navy font-bold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                  <span>Bấm vào để biểu quyết ({day2Count}/6 trạm)</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Day 3 Card */}
            <div 
              onClick={() => setActiveDayTab('day3')}
              className="p-3.5 rounded-xl bg-pureWhite border border-ash hover:border-navy shadow-xs cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-surface text-ink font-mono text-xs font-bold flex items-center justify-center border border-ash">
                    03
                  </span>
                  <div>
                    <h5 className="text-xs font-bold text-ink group-hover:text-terracotta transition-colors">
                      Ngày 3: Làng Gốm Thanh Hà & Tiễn Bay DAD
                    </h5>
                    <span className="text-[10px] text-muted font-mono">08:00 — 15:30 • {day3Count}/4 Trạm (Mở dần theo biểu quyết)</span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-graphite bg-surface px-2 py-0.5 rounded">
                  Ngày Về
                </span>
              </div>
              <p className="text-[11px] text-graphite leading-relaxed pl-8">
                Bánh Xèo Quán Giếng Bá Lễ → Trải nghiệm nặn gốm đất nung Thanh Hà → Mua quà di sản bánh đậu xanh & Trả phòng → Cơm gà Bà Buội & Xe tiễn sân bay Đà Nẵng.
              </p>
              <div className="mt-2 pt-2 border-t border-ash/60 pl-8 flex items-center justify-between text-[10px]">
                <span className="text-muted">Mua sắm quà di sản • Tiễn ga T1 DAD</span>
                <span className="text-navy font-bold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                  <span>Bấm vào để biểu quyết ({day3Count}/4 trạm)</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>

          {/* Member Desires Satisfaction Summary */}
          <div className="p-3.5 rounded-xl bg-pureWhite border border-ash/80 text-left space-y-2">
            <h4 className="text-xs font-bold text-ink flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-moss" />
              <span>Độ Thỏa Mãn Nguyện Vọng Của Cả Nhóm:</span>
            </h4>

            <div className="space-y-1.5 text-[11px]">
              <div className="p-2 rounded-lg bg-surface/60 border border-ash/40 flex items-center justify-between">
                <span><strong>Lan Vy:</strong> Cafe rooftop ngắm ngói cổ + Hoàng hôn biển + Hoa đăng</span>
                <span className="text-moss font-bold font-mono">100% Khớp</span>
              </div>
              <div className="p-2 rounded-lg bg-surface/60 border border-ash/40 flex items-center justify-between">
                <span><strong>Hoàng Anh:</strong> Quán ẩm thực có món chay chuẩn vị + Nghỉ trưa phòng lạnh</span>
                <span className="text-moss font-bold font-mono">100% Khớp</span>
              </div>
              <div className="p-2 rounded-lg bg-surface/60 border border-ash/40 flex items-center justify-between">
                <span><strong>Minh Đức:</strong> Xe đón sân bay DAD + Khách sạn boutique + Ngân sách 3.45tr</span>
                <span className="text-moss font-bold font-mono">100% Khớp</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* TABS 1, 2, 3: DANH SÁCH CÁC TRẠM DỪNG CHI TIẾT TỪNG NGÀY (CÓ BỎ PHIẾU TỪNG TRẠM & MỞ KHÓA TUẦN TỰ) */
        <div className="flex-1 overflow-y-auto p-3 space-y-3.5">
          {/* Quick Back to Overview Link & Day Header */}
          <div className="flex items-center justify-between px-1 text-[11px]">
            <button
              onClick={() => setActiveDayTab('overview')}
              className="text-navy font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>← Quay lại Tổng Quan 3N2Đ</span>
            </button>
            <span className="text-muted font-mono">
              {activeDayTab === 'day1' && `${stops.length}/8 Trạm Đã Mở Khóa • Ngày 1: Đón Bay & Phố Cổ`}
              {activeDayTab === 'day2' && `${stops.length}/6 Trạm Đã Mở Khóa • Ngày 2: Rừng Dừa Cẩm Thanh`}
              {activeDayTab === 'day3' && `${stops.length}/4 Trạm Đã Mở Khóa • Ngày 3: Làng Gốm & Tiễn Bay`}
            </span>
          </div>

          {stops.map((stop, index) => {
            const isActive = stop.id === activeStopId;
            const isProposalActive = stop.votesDown >= 2 && !stop.isSwapped;

            return (
              <div key={stop.id} className="relative">
                {/* Transit Connector */}
                {stop.transitFromPrev && (
                  <div className="my-2 ml-6 pl-4 border-l-2 border-dashed border-ash py-1 flex items-center gap-2 text-[11px] text-muted">
                    <Navigation className="w-3.5 h-3.5 text-ochre rotate-90 shrink-0" />
                    <span className="truncate">{stop.transitFromPrev.mode}</span>
                    <span className="font-mono font-semibold text-ink shrink-0">
                      ({stop.transitFromPrev.distance} • {stop.transitFromPrev.duration})
                    </span>
                    {stop.transitFromPrev.haversineOk && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-moss/10 text-moss shrink-0 hidden sm:inline">
                        ≤ 2.5km Haversine
                      </span>
                    )}
                  </div>
                )}

                {/* Stop Card */}
                <div
                  onClick={() => setActiveStopId(stop.id)}
                  className={`torn-paper-box p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isActive
                      ? 'border-ochre shadow-md ring-1 ring-ochre/40 bg-pureWhite'
                      : 'border-ash hover:border-ash/80 bg-pureWhite/95'
                  }`}
                >
                  {/* Top Metadata Line */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-5 h-5 rounded-full bg-navy text-pureWhite font-mono text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="font-mono text-xs font-bold text-ink">{stop.time}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${stop.categoryColor}`}>
                        {stop.categoryTag}
                      </span>
                      {stop.suggestedBy && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-navy/10 text-navy border border-navy/20">
                          {stop.suggestedBy}
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-xs text-muted font-medium">{stop.cost}</span>
                  </div>

                  {/* Title & Description */}
                  <h4 className="text-sm font-bold text-ink group-hover:text-ochre">
                    {stop.name}
                  </h4>
                  <p className="mt-1 text-xs text-graphite leading-relaxed">
                    {stop.desc}
                  </p>

                  {/* Match Member Desire Badge */}
                  {stop.matchedDesire && (
                    <div className="mt-2 px-2.5 py-1.5 rounded-lg bg-ochre/10 border border-ochre/30 flex items-center gap-1.5 text-[10px] text-ochre">
                      <Heart className="w-3.5 h-3.5 text-terracotta fill-terracotta shrink-0" />
                      <span className="leading-tight">
                        <strong>Khớp nguyện vọng của {stop.matchedDesire.member}:</strong> {stop.matchedDesire.desire}
                      </span>
                    </div>
                  )}

                  {/* Hero Image if available */}
                  {stop.isHero && stop.image && (
                    <div className="mt-2.5 relative h-36 w-full rounded-lg overflow-hidden bg-surface">
                      <img src={stop.image} alt={stop.name} className="w-full h-full object-cover" />
                      {stop.isSwapped && (
                        <div className="absolute top-2 left-2 px-2 py-1 rounded bg-moss text-pureWhite text-[10px] font-bold flex items-center gap-1 shadow">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Đã Hoán Đổi Theo Đồng Thuận Nhóm</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Backup Stop warning & Auto-swap consensus notice */}
                  {isProposalActive && (
                    <div className="mt-2.5 p-2 rounded-lg bg-ochre/10 border border-ochre/30 text-[11px] text-ochre flex items-start gap-1.5 animate-pulse">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <strong>Đang có {stop.votesDown}/3 thành viên đề xuất đổi điểm:</strong>
                        <p className="text-[10px] text-graphite mt-0.5">
                          Thêm 1 phiếu Không Thích nữa, hệ thống sẽ tự động chuyển sang: <strong className="text-ink">{stop.backupOption?.name || 'Phương án thay thế trong nhà'}</strong>.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Stop Candidates Voting Section (Mỗi trạm thành viên đều được vote chọn quán!) */}
                  {stop.candidates && stop.candidates.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-ash/70">
                      {stop.isSlotConfirmed ? (
                        /* ĐÃ CHỐT: Hiển thị gọn gàng trạm đã chốt đồng thuận */
                        <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-moss shrink-0" />
                            <div>
                              <span className="font-bold text-moss">Đã Chốt Đồng Thuận: </span>
                              <strong className="text-ink">{stop.name.split('—')[0]}</strong>
                              <span className="text-graphite font-mono text-[10px] ml-1.5">({stop.votesUp}/3 phiếu)</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-moss bg-moss/10 px-2 py-0.5 rounded border border-moss/20">
                            ✓ Đã Khóa Điểm
                          </span>
                        </div>
                      ) : (
                        /* ĐANG MỞ BIỂU QUYẾT: Hiện danh sách ứng viên */
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-ochre flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-ochre animate-ping" />
                              <span>Đang Mở Biểu Quyết ({stop.candidates.length} Quán Ứng Viên):</span>
                            </span>
                            <span className="text-[10px] text-muted italic">Chốt xong mới mở trạm sau</span>
                          </div>

                          <div className="space-y-1.5">
                            {stop.candidates.map((cand) => {
                              const isWinning = cand.name.includes(stop.name) || stop.name.includes(cand.name);
                              const hasVoted = cand.votes?.includes('Minh Đức (Bạn)');

                              return (
                                <div
                                  key={cand.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onVoteCandidate?.(stop.id, cand.id);
                                  }}
                                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                                    isWinning
                                      ? 'bg-amber-50/60 border-ochre ring-1 ring-ochre/30 shadow-xs'
                                      : 'bg-surface/50 border-ash hover:border-ash/80'
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-1.5">
                                      <span className={`w-4 h-4 rounded-full text-[9px] font-mono font-bold flex items-center justify-center ${
                                        isWinning ? 'bg-ochre text-pureWhite' : 'bg-ash text-graphite'
                                      }`}>
                                        {isWinning ? '✓' : '•'}
                                      </span>
                                      <span className="text-xs font-bold text-ink">{cand.name}</span>
                                      {isWinning && (
                                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-moss/10 text-moss border border-moss/20">
                                          Đang Chọn ({cand.votes?.length || 0}/3)
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] font-mono text-muted">{cand.cost}</span>
                                  </div>

                                  <p className="text-[10px] text-graphite leading-relaxed pl-5">
                                    {cand.desc}
                                  </p>

                                  <div className="mt-1.5 pt-1.5 border-t border-ash/50 pl-5 flex items-center justify-between text-[10px]">
                                    <span className="text-muted">
                                      {cand.votes && cand.votes.length > 0 ? (
                                        <strong className="text-moss">✓ {cand.votes.join(', ')} ({cand.votes.length} phiếu)</strong>
                                      ) : (
                                        'Chưa có phiếu'
                                      )}
                                    </span>

                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onVoteCandidate?.(stop.id, cand.id);
                                      }}
                                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                        hasVoted
                                          ? 'bg-moss text-pureWhite'
                                          : 'bg-pureWhite border border-navy/40 text-navy hover:bg-navy/5'
                                      }`}
                                    >
                                      {hasVoted ? '✓ Đã Chọn' : '🗳 Bỏ Phiếu'}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Quick Confirm & Unlock Next Stop Button */}
                          {onConfirmStop && (
                            <div className="pt-1.5 flex justify-end">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onConfirmStop(stop.id);
                                }}
                                className="px-3 py-1 rounded-lg text-[11px] font-bold bg-navy text-pureWhite hover:bg-navy/90 flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Xác Nhận Chốt Trạm Này & Mở Trạm Tiếp Theo →</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Stop Action Bar: Hearts, Group Votes, Dishes */}
                  <div className="mt-3 pt-2.5 border-t border-ash/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); onVote(stop.id, 'heart'); }}
                        className="px-2 py-1 rounded-md text-xs font-medium text-terracotta bg-terracotta/10 hover:bg-terracotta/20 flex items-center gap-1 transition-colors"
                        title="Thả tim điểm dừng"
                      >
                        <Heart className="w-3.5 h-3.5 fill-terracotta" />
                        <span className="font-mono font-bold">{stop.hearts}</span>
                      </button>

                      <button
                        onClick={(e) => { e.stopPropagation(); onVote(stop.id, 'up'); }}
                        className="px-2 py-1 rounded-md text-xs font-medium text-moss bg-moss/10 hover:bg-moss/20 flex items-center gap-1 transition-colors"
                        title="Đồng ý điểm này"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span className="font-mono font-bold">{stop.votesUp} Đồng ý</span>
                      </button>

                      <button
                        onClick={(e) => { e.stopPropagation(); onVote(stop.id, 'down'); }}
                        className="px-2 py-1 rounded-md text-xs font-medium text-terracotta bg-terracotta/10 hover:bg-terracotta/20 flex items-center gap-1 transition-colors"
                        title="Đề xuất đổi điểm khác"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                        <span className="font-mono font-bold">{stop.votesDown} Đổi</span>
                      </button>
                    </div>

                    {stop.dishes && stop.dishes.length > 0 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onOpenFoodModal(stop); }}
                        className="px-2 py-1 rounded-md text-xs font-semibold text-ochre bg-ochre/15 hover:bg-ochre/25 flex items-center gap-1 transition-colors border border-ochre/30"
                      >
                        <Utensils className="w-3.5 h-3.5" />
                        <span>Món Khuyên Thử</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Progressive Unlock Notice Card */}
          {((activeDayTab === 'day1' && stops.length < 8) ||
            (activeDayTab === 'day2' && stops.length < 6) ||
            (activeDayTab === 'day3' && stops.length < 4)) && (
            <div className="p-4 rounded-xl border border-dashed border-ochre/40 bg-ochre/5 text-center space-y-1.5 animate-pulse mt-2">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-ink">
                <Lock className="w-4 h-4 text-ochre" />
                <span>
                  {activeDayTab === 'day1' && (
                    stops.length === 2 ? 'Trạm 3 (Điểm Tâm Sáng) sẽ mở sau khi chốt khách sạn' :
                    stops.length === 3 ? 'Trạm 4 (Quán Cafe Sáng) sẽ mở sau khi chốt bánh mì' :
                    stops.length === 4 ? 'Trạm 5 & 6 (Ăn Trưa & Nghỉ Trưa) sẽ mở sau khi chốt quán cafe' :
                    'Trạm 7 & 8 (Chiều Đi Biển & Tối Thả Hoa Đăng) sẽ mở sau khi chốt quán ăn trưa'
                  )}
                  {activeDayTab === 'day2' && (
                    stops.length === 1 ? 'Trạm 2 (Thuyền Thúng Rừng Dừa) sẽ mở sau khi chốt điểm tâm sáng' :
                    stops.length === 2 ? 'Trạm 3 (Bữa Trưa Sinh Thái Cánh Đồng) sẽ mở sau khi chốt thuyền thúng' :
                    stops.length === 3 ? 'Trạm 4 & 5 (Nghỉ Trưa Khách Sạn & Biển Cửa Đại) sẽ mở sau khi chốt ăn trưa' :
                    'Trạm 6 (Chợ Đêm Nguyễn Hoàng & Ẩm Thực Tối) sẽ mở sau khi chốt biển Cửa Đại'
                  )}
                  {activeDayTab === 'day3' && (
                    stops.length === 1 ? 'Trạm 2 (Làng Gốm Thanh Hà & Công Viên Đất Nung) sẽ mở sau khi chốt điểm tâm sáng' :
                    stops.length === 2 ? 'Trạm 3 (Mua Quà Di Sản & Trả Phòng Anio) sẽ mở sau khi chốt làng gốm' :
                    'Trạm 4 (Cơm Gà Bà Buội & Xe Tiễn Ga T1 Sân Bay DAD) sẽ mở sau khi chốt mua quà di sản'
                  )}
                </span>
              </div>
              <p className="text-[11px] text-graphite leading-relaxed">
                Mở khóa tuần tự theo biểu quyết nhóm: Sau khi nhóm bỏ phiếu đồng thuận chốt trạm đang mở, AI Agent sẽ tự động đối soát và mở khóa các trạm kế tiếp!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
