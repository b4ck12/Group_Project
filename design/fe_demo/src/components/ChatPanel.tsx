import React, { useRef, useEffect } from 'react';
import { Compass, Send, CheckCircle2, AtSign, Play, Pause, RotateCcw, Filter, ShieldCheck, ArrowRight } from 'lucide-react';
import { ChatMessage, ProposalOption } from '../types';
import { ScriptStep, DEMO_SCENARIO_STEPS } from '../data/mockData';

interface ChatPanelProps {
  messages: ChatMessage[];
  inputMsg: string;
  setInputMsg: (v: string) => void;
  isConciergeTyping: boolean;
  onSendChat: (e: React.FormEvent) => void;
  onSendPrompt: (text: string) => void;
  onApplyOption: (opt: ProposalOption) => void;
  currentStepIndex: number;
  nextStep: ScriptStep | null;
  onExecuteNextStep: () => void;
  onResetDemo: () => void;
  isAutoPlaying: boolean;
  onToggleAutoPlay: () => void;
}

const AGENT_PROMPT_CHIPS = [
  '@agent Chiều nay trời mưa rào, tìm điểm trong nhà ấm cúng thay thế Faifo giúp nhóm với!',
  '@agent Trưa nay tại quán Bếp Cuốn Hội An có món chay nào cho Hoàng Anh không?',
  '@agent Cả nhóm đã đồng thuận 100%, tiến hành chốt lịch trình nhé!'
];

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  inputMsg,
  setInputMsg,
  isConciergeTyping,
  onSendChat,
  onSendPrompt,
  onApplyOption,
  currentStepIndex,
  nextStep,
  onExecuteNextStep,
  onResetDemo,
  isAutoPlaying,
  onToggleAutoPlay
}) => {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isConciergeTyping]);

  // Insert @agent tag into input
  const insertAgentTag = () => {
    if (!inputMsg.includes('@agent')) {
      setInputMsg(`@agent ${inputMsg}`);
    }
  };

  // Format message text to highlight @agent
  const renderMessageContent = (text: string) => {
    if (!text.includes('@agent')) return text;

    const parts = text.split(/(@agent)/g);
    return parts.map((part, i) =>
      part === '@agent' ? (
        <span key={i} className="inline-flex items-center px-1.5 py-0.5 rounded bg-navy text-ochre font-bold text-[10px] mx-0.5">
          @agent
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="lg:col-span-4 bg-pureWhite rounded-xl border border-ash shadow-sm flex flex-col overflow-hidden">
      {/* Group Chat Header */}
      <div className="p-3 border-b border-ash bg-surface/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-navy text-ochre flex items-center justify-center shadow-sm">
            <Compass className="w-4 h-4 text-ochre" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-ink">Kênh Chat Nhóm Hội An</h3>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold bg-moss/10 text-moss">
                Online
              </span>
            </div>
            <p className="text-[10px] text-graphite">
              Chat tự do giữa bạn bè • Gõ <strong className="text-navy">@agent</strong> khi cần hỗ trợ lịch trình
            </p>
          </div>
        </div>

        {/* Member Avatar Stack */}
        <div className="flex -space-x-1.5">
          <div className="w-6 h-6 rounded-full bg-ochre/20 text-ochre border border-pureWhite text-[10px] font-bold flex items-center justify-center" title="Hoàng Anh">HA</div>
          <div className="w-6 h-6 rounded-full bg-terracotta/20 text-terracotta border border-pureWhite text-[10px] font-bold flex items-center justify-center" title="Minh Đức (Bạn)">MĐ</div>
          <div className="w-6 h-6 rounded-full bg-moss/20 text-moss border border-pureWhite text-[10px] font-bold flex items-center justify-center" title="Lan Vy">LV</div>
        </div>
      </div>

      {/* Demo Scenario Flow Tracker & Controls */}
      <div className="px-3 py-2 bg-cream/60 border-b border-ash flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          <span className="font-bold text-[10px] uppercase tracking-wider text-muted font-mono shrink-0 mr-1">
            Kịch Bản:
          </span>
          {DEMO_SCENARIO_STEPS.map((s) => {
            const isCompleted = currentStepIndex > s.stepIndex;
            const isCurrent = currentStepIndex === s.stepIndex;

            return (
              <span
                key={s.stepIndex}
                className={`px-2 py-0.5 rounded text-[9px] font-mono whitespace-nowrap transition-all ${
                  isCompleted
                    ? 'bg-moss/15 text-moss font-bold line-through'
                    : isCurrent
                    ? 'bg-navy text-ochre font-bold ring-1 ring-ochre/40 shadow-xs'
                    : 'bg-surface text-muted'
                }`}
              >
                {s.badge}
              </span>
            );
          })}
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-2">
          <button
            onClick={onToggleAutoPlay}
            className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
              isAutoPlaying
                ? 'bg-terracotta text-pureWhite animate-pulse'
                : 'bg-navy text-pureWhite hover:bg-navy/90'
            }`}
            title="Tự động chạy toàn bộ kịch bản theo thời gian thực"
          >
            {isAutoPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span className="hidden sm:inline">{isAutoPlaying ? 'Tạm Dừng' : 'Tự Động Chạy'}</span>
          </button>
          <button
            onClick={onResetDemo}
            className="p-1 rounded text-graphite hover:text-ink hover:bg-ash/50 transition-colors"
            title="Bắt đầu lại kịch bản từ câu chat đầu tiên"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-canvas/30">
        {messages.map((m) => {
          if (m.isSystemEvent) {
            return (
              <div key={m.id} className="p-2.5 rounded-xl bg-moss/10 border border-moss/30 text-moss text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="font-semibold">{m.text}</span>
              </div>
            );
          }

          const isAgent = m.sender === 'concierge';
          const isUser = m.sender === 'user';

          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1">
                {isAgent && (
                  <span className="px-1 py-0.2 rounded bg-navy text-ochre text-[8px] font-mono font-bold">
                    AGENT
                  </span>
                )}
                <span className="text-[10px] font-bold text-ink">{m.name}</span>
                <span className="text-[9px] text-muted">{m.time}</span>
              </div>

              <div
                className={`max-w-[92%] p-3 rounded-xl text-xs leading-relaxed shadow-sm ${
                  isUser
                    ? 'bg-navy text-pureWhite rounded-tr-none'
                    : isAgent
                    ? 'bg-pureWhite text-ink border border-ochre/40 rounded-tl-none shadow'
                    : 'bg-surface text-ink border border-ash/60'
                }`}
              >
                <p>{renderMessageContent(m.text)}</p>

                {/* Filter Validation Badge & Attributes (note.md Architecture) */}
                {m.filterValidation && (
                  <div className="mt-2.5 p-2 rounded-lg bg-moss/10 border border-moss/30 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-moss font-bold text-[10px] uppercase font-mono">
                      <ShieldCheck className="w-3.5 h-3.5 text-moss" />
                      <span>Bộ Lọc Đầu Vào (Input Filter) — Đã Chuẩn Hóa</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-[10px] text-graphite pt-1">
                      <div className="p-1 rounded bg-pureWhite/80 border border-ash/40">
                        <span className="text-muted block text-[9px]">Địa Điểm (Location):</span>
                        <strong className="text-ink">{m.filterValidation.location}</strong>
                      </div>
                      <div className="p-1 rounded bg-pureWhite/80 border border-ash/40">
                        <span className="text-muted block text-[9px]">Thời Gian (Date):</span>
                        <strong className="text-ink">{m.filterValidation.duration}</strong>
                      </div>
                      <div className="p-1 rounded bg-pureWhite/80 border border-ash/40">
                        <span className="text-muted block text-[9px]">Ngân Sách (Budget):</span>
                        <strong className="text-ink">{m.filterValidation.budget}</strong>
                      </div>
                      <div className="p-1 rounded bg-pureWhite/80 border border-ash/40">
                        <span className="text-muted block text-[9px]">Ràng Buộc Riêng:</span>
                        <strong className="text-ink">{m.filterValidation.constraints[0]}</strong>
                      </div>
                    </div>
                    <div className="text-[9px] text-muted italic pt-0.5">
                      ✓ Đạt yêu cầu kiến trúc: Lọc tin rác & ép buộc thuộc tính cốt lõi trước khi gọi mô hình.
                    </div>
                  </div>
                )}

                {/* Proposal Options inside Agent Message */}
                {m.options && (
                  <div className="mt-2.5 pt-2 border-t border-ash/60 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted font-mono block">
                      Các Tuyến Lộ Trình Gợi Ý:
                    </span>
                    {m.options.map((opt) => (
                      <div 
                        key={opt.key}
                        className="p-2.5 rounded-lg bg-surface/70 border border-ash hover:border-ochre transition-colors text-ink"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-ink">{opt.title}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-ochre/15 text-ochre font-semibold">
                            {opt.tag}
                          </span>
                        </div>
                        <p className="text-[11px] text-graphite mt-1">{opt.vibe}</p>
                        <div className="mt-2 flex items-center justify-between text-[10px]">
                          <span className="font-mono text-muted">{opt.estCost}</span>
                          <button
                            onClick={() => onApplyOption(opt)}
                            className="px-2.5 py-1 rounded bg-navy text-pureWhite font-bold hover:bg-navy/90 transition-all flex items-center gap-1"
                          >
                            <span>Áp Dụng Lịch Này</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isConciergeTyping && (
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-pureWhite border border-ochre/40 w-fit shadow-sm">
            <span className="px-1 py-0.2 rounded bg-navy text-ochre text-[8px] font-mono font-bold">@agent</span>
            <span className="text-[10px] font-mono text-muted">Đang phân tích bộ lọc & tính cự ly...</span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-ochre typing-dot"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-ochre typing-dot"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-ochre typing-dot"></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Guided Next Step Recommendation Box (Real Product Interactivity) */}
      {nextStep ? (
        <div className="p-2 bg-ochre/10 border-t border-ochre/30 flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.2 rounded bg-ochre text-pureWhite font-mono text-[9px] font-bold">
                BƯỚC {nextStep.stepIndex}/4
              </span>
              <span className="text-[10px] font-bold text-ink truncate">
                {nextStep.label}
              </span>
            </div>
            <p className="text-[10px] text-graphite truncate mt-0.5">
              {nextStep.userPrompt}
            </p>
          </div>
          <button
            type="button"
            onClick={onExecuteNextStep}
            className="px-3 py-1.5 rounded-lg bg-navy hover:bg-navy/90 text-ochre text-xs font-bold shrink-0 flex items-center gap-1 shadow-xs transition-all active:scale-95"
          >
            <span>Thực Thi Ngay</span>
            <Send className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div className="p-2 bg-moss/10 border-t border-moss/30 flex items-center justify-between text-xs text-moss">
          <div className="flex items-center gap-1.5 font-bold text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Kịch bản demo đã hoàn tất 100%! Lịch trình đã khóa chính thức.</span>
          </div>
          <button
            onClick={onResetDemo}
            className="text-[10px] font-bold underline hover:text-moss/80"
          >
            Chạy Lại Kịch Bản
          </button>
        </div>
      )}

      {/* Quick @agent chips */}
      <div className="px-2.5 pt-1.5 pb-1 bg-pureWhite border-t border-ash/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={insertAgentTag}
          className="px-2 py-0.5 rounded-full bg-navy text-ochre text-[10px] font-bold flex items-center gap-1 shrink-0 hover:bg-navy/90"
        >
          <AtSign className="w-3 h-3" />
          <span>gọi @agent</span>
        </button>
        {AGENT_PROMPT_CHIPS.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSendPrompt(chip)}
            className="px-2 py-0.5 rounded-full bg-surface hover:bg-ash/70 text-graphite text-[9px] font-medium whitespace-nowrap transition-colors shrink-0 border border-ash/60"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Chat Input */}
      <form onSubmit={onSendChat} className="p-2.5 bg-pureWhite">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder={
              nextStep
                ? `Nhấn Gửi hoặc Enter để chạy: "${nextStep.userPrompt.slice(0, 45)}..."`
                : 'Nhắn tin với nhóm... Gõ @agent để yêu cầu hỗ trợ...'
            }
            className="w-full pl-3 pr-10 py-2 rounded-xl bg-surface/60 border border-ash text-xs text-ink placeholder:text-muted focus:outline-none focus:border-navy"
          />
          <button
            type="submit"
            className="absolute right-1.5 p-1.5 rounded-lg bg-navy text-ochre hover:bg-navy/90 transition-all cursor-pointer"
            title="Gửi câu chat hoặc thực thi bước tiếp theo"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
