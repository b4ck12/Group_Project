import React from 'react';
import { Utensils, X } from 'lucide-react';
import { Stop } from '../types';

interface FoodModalProps {
  stop: Stop;
  onClose: () => void;
}

export const FoodModal: React.FC<FoodModalProps> = ({ stop, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-navy/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-pureWhite w-full max-w-lg rounded-2xl border border-ash shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted hover:text-ink hover:bg-surface"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Utensils className="w-4 h-4 text-ochre" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-ochre font-mono">
            Đặc Sản Khuyên Thử
          </span>
        </div>
        <h3 className="font-serif text-xl font-bold text-ink">{stop.name}</h3>
        <p className="text-xs text-graphite mt-1">{stop.address}</p>

        {/* List of dishes */}
        <div className="my-5 space-y-3">
          {stop.dishes && stop.dishes.map((dish, i) => (
            <div key={i} className="p-3 rounded-xl bg-surface/50 border border-ash/70 flex items-start justify-between">
              <div>
                <h5 className="font-serif font-bold text-sm text-ink">{dish.name}</h5>
                <p className="text-xs text-graphite mt-0.5">{dish.note}</p>
              </div>
              <span className="font-mono font-bold text-xs text-navy ml-3 shrink-0">{dish.price}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-navy text-pureWhite font-bold text-xs hover:bg-navy/90 transition-all"
        >
          Đã Ghi Nhận Cho Cả Nhóm
        </button>
      </div>
    </div>
  );
};
