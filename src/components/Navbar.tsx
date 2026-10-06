import React from 'react';
import { Volume2, VolumeX, BookOpen, Star, Sparkles, Layers, Edit3, Gamepad2, RotateCw } from 'lucide-react';
import { MathMode } from '../types/math';
import { sounds } from '../utils/audio';
import { useOrientation } from '../context/OrientationContext';

interface NavbarProps {
  currentMode: MathMode;
  onSelectMode: (mode: MathMode) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenReference: () => void;
  totalStars: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onSelectMode,
  soundEnabled,
  onToggleSound,
  onOpenReference,
  totalStars,
}) => {
  const { isLandscape, isMobileLandscape, toggleForcedLandscape } = useOrientation();
  const navTabs: { id: MathMode; label: string; shortLabel: string; icon: React.ReactNode }[] = [
    {
      id: 'place-value',
      label: 'Bảng Các Hàng & Giá Trị',
      shortLabel: 'Bảng Các Hàng',
      icon: <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
    },
    {
      id: 'place-match-game',
      label: 'Trò Chơi Ghép Hàng & Giá Trị',
      shortLabel: 'Ghép Hàng',
      icon: <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
    },
    {
      id: 'read-write',
      label: 'Luyện Đọc & Viết Số',
      shortLabel: 'Đọc & Viết',
      icon: <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
    },
    {
      id: 'game-arena',
      label: 'Đấu Trường Trò Chơi',
      shortLabel: 'Đấu Trường',
      icon: <Gamepad2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
    }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs safe-area-px">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className={`flex items-center justify-between transition-all ${isLandscape ? 'h-11 sm:h-12' : 'h-14 sm:h-16'}`}>
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 shrink-0">
            {/* Logo Badge */}
            <div className="relative shrink-0 group cursor-pointer">
              <div className={`${isLandscape ? 'w-8 h-8' : 'w-9 h-9 sm:w-10 sm:h-10'} rounded-xl sm:rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-600 p-0.5 shadow-sm transition-transform group-hover:scale-105 active:scale-95`}>
                <div className="w-full h-full bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-800 rounded-[10px] sm:rounded-[14px] flex items-center justify-center text-white relative overflow-hidden">
                  <div className="flex items-center font-mono font-black text-xs sm:text-sm tracking-tight select-none">
                    <span className="text-white">0</span>
                    <span className="text-amber-300 text-sm sm:text-base font-black leading-none -mx-0.5 animate-bounce">,</span>
                    <span className="text-emerald-300">5</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="min-w-0">
              <span className={`font-extrabold text-slate-900 tracking-tight block leading-tight truncate ${isLandscape ? 'text-xs sm:text-sm' : 'text-sm sm:text-base md:text-lg'}`}>
                {isLandscape ? 'Số Thập Phân' : 'Khám Phá Số Thập Phân'}
              </span>
              {!isLandscape && (
                <span className="text-[11px] text-slate-500 font-semibold hidden sm:block truncate">
                  Toán Học Lớp 5 · GDPT Mới
                </span>
              )}
            </div>
          </div>

          {/* Navigation Tabs - Shown inline when in Landscape OR on Desktop */}
          <nav className={`${isLandscape ? 'flex' : 'hidden lg:flex'} items-center gap-0.5 sm:gap-1 p-0.5 sm:p-1 bg-slate-100 rounded-lg sm:rounded-xl border border-slate-200/60 overflow-x-auto no-scrollbar`}>
            {navTabs.map((tab) => {
              const isActive = currentMode === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    sounds.playClick();
                    onSelectMode(tab.id);
                  }}
                  className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-indigo-700 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.icon}
                  <span>{isLandscape ? tab.shortLabel : tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons: Stars, Sổ tay, Landscape, Sound */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Star Counter */}
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg sm:rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span className="font-mono">{totalStars}</span>
            </div>

            {/* Sổ tay bí kíp button */}
            <button
              onClick={() => {
                sounds.playClick();
                onOpenReference();
              }}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg sm:rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              title="Mở sổ tay quy tắc sách giáo khoa"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden md:inline">Sổ tay</span>
            </button>

            {/* Screen Orientation / Landscape Toggle */}
            <button
              onClick={toggleForcedLandscape}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg sm:rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                isLandscape
                  ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
              title={isLandscape ? 'Chuyển về màn hình dọc' : 'Xoay ngang màn hình để xem bảng to rõ hơn'}
              aria-label="Xoay ngang màn hình"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLandscape ? 'text-amber-800' : 'text-indigo-600'}`} />
              <span className="hidden md:inline">{isLandscape ? 'Dọc lại' : 'Xoay ngang'}</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl border transition-colors cursor-pointer ${
                soundEnabled
                  ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
              }`}
              title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
              aria-label="Chuyển đổi âm thanh"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar - Only shown in PORTRAIT mobile (< lg) */}
        {!isLandscape && (
          <div className="lg:hidden py-1.5 border-t border-slate-100 overflow-x-auto no-scrollbar touch-scroll flex items-center gap-1 px-0.5">
            {navTabs.map((tab) => {
              const isActive = currentMode === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    sounds.playClick();
                    onSelectMode(tab.id);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 active:bg-slate-200'
                  }`}
                >
                  {tab.icon}
                  <span className="font-bold">{tab.shortLabel}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
