/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MathMode } from './types/math';
import { Navbar } from './components/Navbar';
import { PlaceValueTable } from './components/PlaceValueTable';
import { ReadingWritingStudio } from './components/ReadingWritingStudio';
import { GameArena } from './components/GameArena';
import { PlaceValueMatchGame } from './components/PlaceValueMatchGame';
import { ReferenceModal } from './components/ReferenceModal';
import { sounds } from './utils/audio';
import { Layers, Edit3, Gamepad2, Sparkles, CheckCircle2, Heart, RotateCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { OrientationProvider, useOrientation } from './context/OrientationContext';

function AppContent() {
  const [currentMode, setCurrentMode] = useState<MathMode>('place-value');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isReferenceOpen, setIsReferenceOpen] = useState<boolean>(false);
  const [totalStars, setTotalStars] = useState<number>(0);
  const { isForcedLandscape, isLandscape, toggleForcedLandscape } = useOrientation();

  // Sync sound controller
  useEffect(() => {
    sounds.enabled = soundEnabled;
  }, [soundEnabled]);

  const handleEarnStar = (count: number = 1) => {
    sounds.playStar();
    setTotalStars(prev => prev + count);
  };

  const handleToggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    sounds.enabled = nextState;
    if (nextState) {
      sounds.playClick();
    }
  };

  return (
    <div
      className={`min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased transition-all ${
        isForcedLandscape
          ? 'fixed inset-0 w-[100vh] h-[100vw] left-[100%] origin-top-left rotate-90 overflow-y-auto overflow-x-hidden z-50'
          : ''
      }`}
    >
      {/* Floating Exit Forced Landscape Button */}
      {isForcedLandscape && (
        <button
          onClick={toggleForcedLandscape}
          className="fixed top-2.5 right-3 z-50 bg-slate-900/95 hover:bg-slate-900 text-white text-xs font-black px-3.5 py-2 rounded-xl shadow-2xl flex items-center gap-1.5 backdrop-blur-md active:scale-95 cursor-pointer border border-white/20 transition-all"
        >
          <RotateCw className="w-3.5 h-3.5 text-amber-400" />
          <span>Xoay dọc lại</span>
        </button>
      )}

      {/* Top Navigation */}
      <Navbar
        currentMode={currentMode}
        onSelectMode={(mode) => setCurrentMode(mode)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenReference={() => setIsReferenceOpen(true)}
        totalStars={totalStars}
      />

      {/* Main Educational Workspace */}
      <main className={`flex-1 max-w-7xl w-full mx-auto safe-area-px transition-all ${
        isLandscape
          ? 'px-2 sm:px-4 lg:px-8 py-2 sm:py-3 space-y-3'
          : 'px-3 sm:px-6 lg:px-8 py-3 sm:py-6 space-y-4 sm:space-y-6'
      }`}>
        {/* Active Module Viewport */}
        {currentMode === 'place-value' && (
          <PlaceValueTable onEarnStar={() => handleEarnStar(1)} />
        )}

        {currentMode === 'place-match-game' && (
          <PlaceValueMatchGame
            onEarnStar={(cnt = 1) => handleEarnStar(cnt)}
            totalStars={totalStars}
          />
        )}

        {currentMode === 'read-write' && (
          <ReadingWritingStudio onEarnStar={() => handleEarnStar(1)} />
        )}

        {currentMode === 'game-arena' && (
          <GameArena
            onEarnStar={(cnt = 1) => handleEarnStar(cnt)}
            totalStars={totalStars}
            onNavigateToPlaceMatch={() => setCurrentMode('place-match-game')}
          />
        )}
      </main>

      {/* Sổ Tay Reference Modal */}
      <ReferenceModal
        isOpen={isReferenceOpen}
        onClose={() => setIsReferenceOpen(false)}
      />

      {/* Clean Domain Educational Footer */}
      <footer className={`mt-auto border-t border-slate-200/80 bg-white safe-area-px transition-all ${
        isLandscape ? 'py-2.5 text-[11px]' : 'py-4 sm:py-6 text-xs'
      }`}>
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Toán 5 · Khám Phá Số Thập Phân</span>
            <span aria-hidden="true">·</span>
            <span>Chương trình Giáo Dục Phổ Thông Mới</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                sounds.playClick();
                setIsReferenceOpen(true);
              }}
              className="hover:text-indigo-600 transition-colors cursor-pointer"
            >
              Xem sổ tay quy tắc
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => {
                sounds.playClick();
                setCurrentMode('game-arena');
              }}
              className="hover:text-amber-600 transition-colors font-medium cursor-pointer"
            >
              Chơi thử thách game
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <OrientationProvider>
      <AppContent />
    </OrientationProvider>
  );
}
