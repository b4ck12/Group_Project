import React, { useState, useRef, useEffect } from 'react';
import { Compass, ArrowRight, ChevronDown, Check } from 'lucide-react';

interface PlanningBarProps {
  onStartPlanning: () => void;
}

const DESTINATIONS = [
  'Hội An — Đà Nẵng',
  'Sa Pa — Mây Ngàn',
  'Hà Nội — Phố Cổ',
  'Ninh Bình — Tràng An',
  'Phú Quốc — Biển Ngọc'
];

const DURATIONS = [
  '3 Ngày 2 Đêm (Lý tưởng)',
  '2 Ngày 1 Đêm (Cuối tuần)',
  '4 Ngày 3 Đêm (Trải nghiệm sâu)'
];

const VIBES = [
  'Ẩm thực và Phố cổ thong thả',
  'Nhiếp ảnh và Check-in nghệ thuật',
  'Sinh thái và Thiên nhiên làng nghề'
];

export const PlanningBar: React.FC<PlanningBarProps> = ({ onStartPlanning }) => {
  const [destination, setDestination] = useState(DESTINATIONS[0]);
  const [duration, setDuration] = useState(DURATIONS[0]);
  const [vibe, setVibe] = useState(VIBES[0]);

  const [openDropdown, setOpenDropdown] = useState<'dest' | 'duration' | 'vibe' | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative z-20 mt-8 max-w-4xl mx-auto">
      <div className="bg-pureWhite/95 backdrop-blur-md p-4 sm:p-6 rounded-2xl border border-ash shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <Compass className="w-4 h-4 text-ochre" />
          <span className="text-xs font-bold uppercase tracking-wider text-ink font-mono">
            Khởi Tạo Lịch Trình Tức Thì
          </span>
        </div>

        {/* 3 Custom Synchronized Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Dropdown 1: Điểm Đến */}
          <div className="relative">
            <div 
              onClick={() => setOpenDropdown(openDropdown === 'dest' ? null : 'dest')}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                openDropdown === 'dest' ? 'border-navy bg-pureWhite shadow-sm' : 'border-ash/80 bg-surface/60 hover:bg-surface'
              }`}
            >
              <label className="text-[11px] font-semibold text-muted block mb-1">Điểm Đến</label>
              <div className="flex items-center justify-between">
                <span className="font-bold text-ink text-sm tracking-tight truncate">{destination}</span>
                <ChevronDown className={`w-4 h-4 text-muted transition-transform duration-200 ${openDropdown === 'dest' ? 'rotate-180 text-navy' : ''}`} />
              </div>
            </div>

            {openDropdown === 'dest' && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-pureWhite border border-ash shadow-2xl rounded-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                {DESTINATIONS.map((d) => (
                  <div
                    key={d}
                    onClick={() => { setDestination(d); setOpenDropdown(null); }}
                    className={`px-3 py-2 text-xs font-medium cursor-pointer flex items-center justify-between transition-colors ${
                      destination === d ? 'bg-ochre/15 text-ochre font-bold' : 'text-ink hover:bg-surface'
                    }`}
                  >
                    <span>{d}</span>
                    {destination === d && <Check className="w-3.5 h-3.5 text-ochre" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dropdown 2: Thời Lượng */}
          <div className="relative">
            <div 
              onClick={() => setOpenDropdown(openDropdown === 'duration' ? null : 'duration')}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                openDropdown === 'duration' ? 'border-navy bg-pureWhite shadow-sm' : 'border-ash/80 bg-surface/60 hover:bg-surface'
              }`}
            >
              <label className="text-[11px] font-semibold text-muted block mb-1">Thời Lượng</label>
              <div className="flex items-center justify-between">
                <span className="font-bold text-ink text-sm tracking-tight truncate">{duration}</span>
                <ChevronDown className={`w-4 h-4 text-muted transition-transform duration-200 ${openDropdown === 'duration' ? 'rotate-180 text-navy' : ''}`} />
              </div>
            </div>

            {openDropdown === 'duration' && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-pureWhite border border-ash shadow-2xl rounded-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                {DURATIONS.map((dur) => (
                  <div
                    key={dur}
                    onClick={() => { setDuration(dur); setOpenDropdown(null); }}
                    className={`px-3 py-2 text-xs font-medium cursor-pointer flex items-center justify-between transition-colors ${
                      duration === dur ? 'bg-ochre/15 text-ochre font-bold' : 'text-ink hover:bg-surface'
                    }`}
                  >
                    <span>{dur}</span>
                    {duration === dur && <Check className="w-3.5 h-3.5 text-ochre" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dropdown 3: Gu Trải Nghiệm */}
          <div className="relative">
            <div 
              onClick={() => setOpenDropdown(openDropdown === 'vibe' ? null : 'vibe')}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                openDropdown === 'vibe' ? 'border-navy bg-pureWhite shadow-sm' : 'border-ash/80 bg-surface/60 hover:bg-surface'
              }`}
            >
              <label className="text-[11px] font-semibold text-muted block mb-1">Gu Trải Nghiệm</label>
              <div className="flex items-center justify-between">
                <span className="font-bold text-ink text-sm tracking-tight truncate">{vibe}</span>
                <ChevronDown className={`w-4 h-4 text-muted transition-transform duration-200 ${openDropdown === 'vibe' ? 'rotate-180 text-navy' : ''}`} />
              </div>
            </div>

            {openDropdown === 'vibe' && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-pureWhite border border-ash shadow-2xl rounded-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                {VIBES.map((v) => (
                  <div
                    key={v}
                    onClick={() => { setVibe(v); setOpenDropdown(null); }}
                    className={`px-3 py-2 text-xs font-medium cursor-pointer flex items-center justify-between transition-colors ${
                      vibe === v ? 'bg-ochre/15 text-ochre font-bold' : 'text-ink hover:bg-surface'
                    }`}
                  >
                    <span>{v}</span>
                    {vibe === v && <Check className="w-3.5 h-3.5 text-ochre" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action CTA */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-ash/60">
          <div className="flex items-center gap-2 text-xs text-graphite">
            <span className="w-2 h-2 rounded-full bg-moss"></span>
            <span>Đã nạp sẵn kịch bản mẫu & điểm dừng Hội An 3N2Đ</span>
          </div>
          <button
            onClick={onStartPlanning}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-navy text-pureWhite font-bold text-xs uppercase tracking-wider hover:bg-navy/90 shadow transition-all flex items-center justify-center gap-2 group"
          >
            <span>Mở Phòng Làm Việc Cùng Nhóm</span>
            <ArrowRight className="w-4 h-4 text-ochre group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
