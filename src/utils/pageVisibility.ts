/**
 * Page Visibility Manager
 * Handles state recovery when user returns to the tab
 */

import { useEffect, useRef } from 'react';

export interface VisibilityOptions {
  onVisible?: () => void;
  onHidden?: () => void;
  onReturnAfterDelay?: (awayTime: number) => void;
  maxAwayTime?: number; // milliseconds
  enableLogging?: boolean;
}

/**
 * Hook to handle page visibility changes
 */
export const usePageVisibility = (options: VisibilityOptions = {}) => {
  const {
    onVisible,
    onHidden,
    onReturnAfterDelay,
    maxAwayTime = 30000, // 30 seconds
    enableLogging = false
  } = options;

  const hiddenTimeRef = useRef<number | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const now = Date.now();
      
      if (document.hidden) {
        // Page became hidden
        hiddenTimeRef.current = now;
        if (enableLogging) {
          console.log('[PageVisibility] Page hidden at:', new Date(now).toLocaleTimeString());
        }
        onHidden?.();
      } else {
        // Page became visible
        const hiddenTime = hiddenTimeRef.current;
        const awayTime = hiddenTime ? now - hiddenTime : 0;
        
        if (enableLogging) {
          console.log('[PageVisibility] Page visible. Away for:', awayTime, 'ms');
        }
        
        // Skip initial mount
        if (!isInitialMount.current) {
          onVisible?.();
          
          // If away for longer than threshold, trigger recovery
          if (awayTime > maxAwayTime && onReturnAfterDelay) {
            console.log('[PageVisibility] Long absence detected, triggering recovery');
            onReturnAfterDelay(awayTime);
          }
        }
        
        isInitialMount.current = false;
        hiddenTimeRef.current = null;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also listen for focus events as backup
    const handleFocus = () => {
      if (!document.hidden) {
        handleVisibilityChange();
      }
    };
    
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [onVisible, onHidden, onReturnAfterDelay, maxAwayTime, enableLogging]);

  return {
    isVisible: !document.hidden,
    wasAwayLong: hiddenTimeRef.current ? Date.now() - hiddenTimeRef.current > maxAwayTime : false
  };
};

/**
 * Force refresh all loading states when returning to page
 */
export const createVisibilityRecovery = () => {
  const recoveryCallbacks = new Set<() => void>();
  
  const addRecoveryCallback = (callback: () => void) => {
    recoveryCallbacks.add(callback);
    return () => recoveryCallbacks.delete(callback);
  };
  
  const triggerRecovery = (reason: string) => {
    console.log(`[VisibilityRecovery] Triggering recovery: ${reason}`);
    recoveryCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('[VisibilityRecovery] Error in recovery callback:', error);
      }
    });
  };
  
  // Listen for page visibility changes
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      // Check if we've been away for a while
      const lastActivity = localStorage.getItem('lastPageActivity');
      const now = Date.now();
      
      if (lastActivity) {
        const awayTime = now - parseInt(lastActivity);
        if (awayTime > 30000) { // 30 seconds
          triggerRecovery(`returned after ${Math.round(awayTime / 1000)}s`);
        }
      }
      
      localStorage.setItem('lastPageActivity', now.toString());
    }
  });
  
  // Track activity
  localStorage.setItem('lastPageActivity', Date.now().toString());
  
  return {
    addRecoveryCallback,
    triggerRecovery
  };
};

// Global instance
export const visibilityRecovery = createVisibilityRecovery();

/**
 * Hook for components to register for visibility recovery
 */
export const useVisibilityRecovery = (recoveryFn: () => void) => {
  useEffect(() => {
    return visibilityRecovery.addRecoveryCallback(recoveryFn);
  }, [recoveryFn]);
};