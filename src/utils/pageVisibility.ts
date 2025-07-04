
import { useEffect, useRef, useCallback } from 'react';

interface PageVisibilityOptions {
  onReturnAfterDelay?: (awayTime: number) => void;
  maxAwayTime?: number;
  enableLogging?: boolean;
}

export const usePageVisibility = ({
  onReturnAfterDelay,
  maxAwayTime = 30000, // 30 seconds default
  enableLogging = false
}: PageVisibilityOptions) => {
  const lastVisibleRef = useRef<number>(Date.now());
  const wasHiddenRef = useRef<boolean>(false);

  const handleVisibilityChange = useCallback(() => {
    const now = Date.now();
    
    if (document.hidden) {
      // Page became hidden
      lastVisibleRef.current = now;
      wasHiddenRef.current = true;
      
      if (enableLogging) {
        console.log('[PageVisibility] Page hidden at:', new Date(now).toISOString());
      }
    } else {
      // Page became visible
      if (wasHiddenRef.current) {
        const awayTime = now - lastVisibleRef.current;
        
        if (enableLogging) {
          console.log('[PageVisibility] Page visible after:', awayTime, 'ms');
        }
        
        if (awayTime > maxAwayTime && onReturnAfterDelay) {
          if (enableLogging) {
            console.log('[PageVisibility] Triggering return callback after long absence');
          }
          onReturnAfterDelay(awayTime);
        }
        
        wasHiddenRef.current = false;
      }
    }
  }, [onReturnAfterDelay, maxAwayTime, enableLogging]);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleVisibilityChange]);
};

export const useVisibilityRecovery = (recoveryCallback: () => void) => {
  const lastRecoveryRef = useRef<number>(0);
  const RECOVERY_COOLDOWN = 10000; // 10 seconds

  usePageVisibility({
    onReturnAfterDelay: () => {
      const now = Date.now();
      if (now - lastRecoveryRef.current > RECOVERY_COOLDOWN) {
        console.log('[VisibilityRecovery] Triggering recovery after page return');
        lastRecoveryRef.current = now;
        recoveryCallback();
      } else {
        console.log('[VisibilityRecovery] Recovery skipped due to cooldown');
      }
    },
    maxAwayTime: 30000,
    enableLogging: true
  });
};
