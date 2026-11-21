import React, { useState } from 'react';
import { X, Lock, Mail, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 bg-navy/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-pureWhite w-full max-w-md rounded-2xl border border-ash shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted hover:text-ink hover:bg-surface transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-navy text-ochre flex items-center justify-center mx-auto mb-3 shadow-sm">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-ink tracking-tight">
            {isSignUp ? 'Tạo Tài Khoản TripMate' : 'Đăng Nhập Vào Chuyến Đi'}
          </h3>
          <p className="text-xs text-graphite mt-1">
            Đồng bộ phòng làm việc, lưu trữ lịch trình và bình chọn cùng bạn bè.
          </p>
        </div>

        {/* Google OAuth Quick Button */}
        <button
          type="button"
          onClick={onSuccess}
          className="w-full py-2.5 px-4 rounded-xl border border-ash hover:border-graphite text-xs font-semibold text-ink bg-surface/50 hover:bg-surface flex items-center justify-center gap-2.5 transition-all mb-4"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Tiếp tục với Google</span>
        </button>

        <div className="relative my-4 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-ash/80"></div></div>
          <span className="relative px-3 bg-pureWhite text-[11px] text-muted font-medium uppercase tracking-wider">hoặc</span>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-graphite block mb-1">Email</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface/50 border border-ash text-xs text-ink focus:outline-none focus:border-navy"
              />
              <Mail className="w-4 h-4 text-muted absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-graphite block mb-1">Mật khẩu</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface/50 border border-ash text-xs text-ink focus:outline-none focus:border-navy"
              />
              <Lock className="w-4 h-4 text-muted absolute left-2.5 top-2.5" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-2.5 rounded-xl bg-navy text-pureWhite font-bold text-xs uppercase tracking-wider hover:bg-navy/90 shadow transition-all flex items-center justify-center gap-2 group"
          >
            <span>{isSignUp ? 'Đăng Ký & Tham Gia' : 'Đăng Nhập Vào Phòng'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-ochre group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-graphite">
          <span>{isSignUp ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}</span>{' '}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-bold text-terracotta hover:underline ml-1"
          >
            {isSignUp ? 'Đăng nhập ngay' : 'Đăng ký miễn phí'}
          </button>
        </div>
      </div>
    </div>
  );
};
