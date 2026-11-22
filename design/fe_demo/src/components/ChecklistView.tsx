import React, { useState } from 'react';
import { CheckSquare } from 'lucide-react';
import { ChecklistItem } from '../types';
import { INITIAL_CHECKLIST } from '../data/mockData';

interface ChecklistViewProps {
  onGoToRoom: () => void;
}

export const ChecklistView: React.FC<ChecklistViewProps> = ({ onGoToRoom }) => {
  const [items, setItems] = useState<ChecklistItem[]>(INITIAL_CHECKLIST);

  const toggleItem = (id: number) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, done: !item.done } : item));
  };

  const completedCount = items.filter(i => i.done).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-pureWhite p-6 rounded-2xl border border-ash shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-ash">
          <div>
            <span className="text-xs font-bold text-ochre uppercase tracking-wider font-mono">TASK-317</span>
            <h2 className="font-serif text-2xl font-bold text-ink">Hành Lý Thông Minh — Hội An 3N2Đ</h2>
            <p className="text-xs text-graphite mt-1">Danh sách chuẩn bị được tự động phân loại theo thời tiết và lịch trình.</p>
          </div>
          <button
            onClick={onGoToRoom}
            className="px-4 py-2 rounded-xl bg-navy text-pureWhite font-bold text-xs hover:bg-navy/90 transition-all"
          >
            ← Quay lại Phòng Nhóm
          </button>
        </div>

        {/* Progress Bar */}
        <div className="my-6 p-4 rounded-xl bg-surface/60 border border-ash/60">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-ink">Tiến Độ Chuẩn Bị</span>
            <span className="font-mono font-bold text-moss">{completedCount}/{items.length} Hoàn Thành ({Math.round(completedCount/items.length*100)}%)</span>
          </div>
          <div className="w-full h-2 bg-ash rounded-full overflow-hidden">
            <div 
              className="h-full bg-moss rounded-full transition-all duration-500" 
              style={{ width: `${(completedCount/items.length)*100}%` }}
            ></div>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-2.5">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                item.done
                  ? 'bg-surface/40 border-ash/60 line-through text-muted'
                  : 'bg-pureWhite border-ash hover:border-ochre shadow-sm text-ink'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                  item.done ? 'bg-moss border-moss text-pureWhite' : 'border-ash'
                }`}>
                  {item.done && <CheckSquare className="w-3.5 h-3.5 text-white" />}
                </div>
                <span className="text-xs font-medium">{item.text}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface border border-ash text-graphite">
                  {item.category}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-navy/10 text-navy">
                  {item.assignedTo}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
