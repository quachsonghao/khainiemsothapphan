import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { sounds } from '../utils/audio';

interface OrientationContextType {
  isPhysicalLandscape: boolean;
  isForcedLandscape: boolean;
  isLandscape: boolean;
  isMobileLandscape: boolean;
  toggleForcedLandscape: () => void;
  setForcedLandscape: (val: boolean) => void;
}

const OrientationContext = createContext<OrientationContextType | undefined>(undefined);

export const OrientationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isPhysicalLandscape, setIsPhysicalLandscape] = useState<boolean>(false);
  const [isForcedLandscape, setIsForcedLandscape] = useState<boolean>(false);
  const [viewportHeight, setViewportHeight] = useState<number>(() => typeof window !== 'undefined' ? window.innerHeight : 800);

  // Check physical device orientation
  useEffect(() => {
    const checkOrientation = () => {
      if (typeof window === 'undefined') return;
      const isLandscapeView = window.innerWidth > window.innerHeight;
      setIsPhysicalLandscape(isLandscapeView);
      setViewportHeight(window.innerHeight);

      // If user physically turns their phone into landscape, reset forced rotation
      if (isLandscapeView && isForcedLandscape) {
        setIsForcedLandscape(false);
      }
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, [isForcedLandscape]);

  const toggleForcedLandscape = async () => {
    sounds.playClick();

    // If already in physical landscape, no forced CSS transform is needed
    if (isPhysicalLandscape) {
      return;
    }

    const nextState = !isForcedLandscape;
    setIsForcedLandscape(nextState);

    // Try modern Screen Orientation API if available on mobile
    if (typeof screen !== 'undefined' && screen.orientation && 'lock' in screen.orientation) {
      try {
        if (nextState) {
          // Some browsers require fullscreen before orientation lock
          if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
            await document.documentElement.requestFullscreen().catch(() => {});
          }
          await (screen.orientation as any).lock('landscape').catch(() => {});
        } else {
          (screen.orientation as any).unlock?.();
          if (document.fullscreenElement && document.exitFullscreen) {
            await document.exitFullscreen().catch(() => {});
          }
        }
      } catch {
        // Fallback to CSS forced landscape transform
      }
    }
  };

  const isLandscape = isPhysicalLandscape || isForcedLandscape;
  const isMobileLandscape = isForcedLandscape || (isPhysicalLandscape && viewportHeight <= 560);

  return (
    <OrientationContext.Provider
      value={{
        isPhysicalLandscape,
        isForcedLandscape,
        isLandscape,
        isMobileLandscape,
        toggleForcedLandscape,
        setForcedLandscape: setIsForcedLandscape,
      }}
    >
      {children}
    </OrientationContext.Provider>
  );
};

export const useOrientation = (): OrientationContextType => {
  const context = useContext(OrientationContext);
  if (!context) {
    throw new Error('useOrientation must be used within an OrientationProvider');
  }
  return context;
};
