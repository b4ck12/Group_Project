import React from 'react';
import { Compass, ArrowRight, ArrowLeft, User, LogOut } from 'lucide-react';

interface NavbarProps {
  currentTab: 'landing' | 'room' | 'checklist' | 'admin';
  setCurrentTab: (tab: 'landing' | 'room' | 'checklist' | 'admin') => void;
  isLoggedIn: boolean;
  onOpenAuth: () => void;
  onLogout: () => void;
  onStartPlanning: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  isLoggedIn,
  onOpenAuth,
  onLogout,
  onStartPlanning
}) => {
  const isLanding = currentTab === 'landing';

  return (
    <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur-md border-b border-ash px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => setCurrentTab('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-lg bg-navy flex items-center justify-center text-ochre shadow-sm group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5 text-ochre" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-ink">TripMate</span>
            <p className="text-[11px] text-graphite hidden sm:block">Lập Kế Hoạch Du Lịch Đồng Thuận Thông Minh</p>
          </div>
        </div>

        {/* Public Navigation (When on Landing Page) */}
        {isLanding ? (
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-graphite">
            <a href="#scrapbook" className="hover:text-ink transition-colors">
              Khám Phá Di Sản
            </a>
            <a href="#features" className="hover:text-ink transition-colors">
              Tính Năng
            </a>
            <button 
              onClick={onStartPlanning}
              className="hover:text-ink transition-colors"
            >
              Demo Phòng Nhóm
            </button>
          </nav>
        ) : (
          /* Internal Product Workspace Navigation (When in Room / Workspace) */
          <nav className="flex items-center gap-1.5 bg-surface/80 p-1 rounded-xl border border-ash/80">
            <button
              onClick={() => setCurrentTab('room')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                currentTab === 'room'
                  ? 'bg-pureWhite text-navy shadow-sm font-bold border border-ash'
                  : 'text-graphite hover:text-navy hover:bg-pureWhite/50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-moss"></span>
              Lịch Trình Hội An
            </button>
            <button
              onClick={() => setCurrentTab('checklist')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                currentTab === 'checklist'
                  ? 'bg-pureWhite text-navy shadow-sm font-bold border border-ash'
                  : 'text-graphite hover:text-navy hover:bg-pureWhite/50'
              }`}
            >
              Hành Lý
            </button>
            <button
              onClick={() => setCurrentTab('admin')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                currentTab === 'admin'
                  ? 'bg-pureWhite text-navy shadow-sm font-bold border border-ash'
                  : 'text-graphite hover:text-navy hover:bg-pureWhite/50'
              }`}
            >
              Quản Trị
            </button>
          </nav>
        )}

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {isLanding ? (
            <>
              {isLoggedIn ? (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-ochre/20 text-ochre font-bold text-xs flex items-center justify-center border border-ochre/30">
                    MĐ
                  </div>
                  <button
                    onClick={() => setCurrentTab('room')}
                    className="px-4 py-2 text-xs font-bold text-white bg-navy hover:bg-navy/90 rounded-lg shadow transition-all flex items-center gap-1.5"
                  >
                    <span>Vào Phòng Nhóm</span>
                    <ArrowRight className="w-3.5 h-3.5 text-ochre" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={onOpenAuth}
                    className="px-3.5 py-2 text-xs font-semibold text-ink hover:text-navy hover:bg-surface rounded-lg transition-all"
                  >
                    Đăng Nhập
                  </button>
                  <button
                    onClick={onStartPlanning}
                    className="px-4 py-2 text-xs font-bold text-white bg-navy hover:bg-navy/90 rounded-lg shadow-sm transition-all flex items-center gap-1.5 group"
                  >
                    <span>Lên Lịch Ngay</span>
                    <ArrowRight className="w-3.5 h-3.5 text-ochre group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentTab('landing')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-graphite hover:text-ink hover:bg-surface border border-ash flex items-center gap-1 transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Trang Chủ</span>
              </button>
              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg text-muted hover:text-terracotta hover:bg-surface transition-all"
                title="Đăng xuất"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
