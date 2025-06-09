/**
 * Global Loading Watchdog
 * Monitors for infinite loading states across the application
 */

interface LoadingState {
  component: string;
  startTime: number;
  timeout: number;
  onTimeout: () => void;
}

class LoadingWatchdog {
  private loadingStates = new Map<string, LoadingState>();
  private globalTimeout = 30000; // 30 seconds global timeout
  private checkInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startWatchdog();
    
    // Listen for page visibility changes
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    
    // Listen for browser events that might indicate stuck states
    window.addEventListener('beforeunload', this.cleanup.bind(this));
  }

  /**
   * Register a loading state to monitor
   */
  register(id: string, config: {
    component: string;
    timeout?: number;
    onTimeout: () => void;
  }): void {
    const timeout = config.timeout || this.globalTimeout;
    
    this.loadingStates.set(id, {
      component: config.component,
      startTime: Date.now(),
      timeout,
      onTimeout: config.onTimeout
    });

    console.log(`[LoadingWatchdog] Registered: ${config.component} (${id}) - timeout: ${timeout}ms`);
  }

  /**
   * Unregister a loading state
   */
  unregister(id: string): void {
    const state = this.loadingStates.get(id);
    if (state) {
      const duration = Date.now() - state.startTime;
      console.log(`[LoadingWatchdog] Unregistered: ${state.component} (${id}) - duration: ${duration}ms`);
      this.loadingStates.delete(id);
    }
  }

  /**
   * Check all registered loading states for timeouts
   */
  private checkTimeouts(): void {
    const now = Date.now();
    
    for (const [id, state] of this.loadingStates.entries()) {
      const duration = now - state.startTime;
      
      if (duration > state.timeout) {
        console.error(`[LoadingWatchdog] TIMEOUT: ${state.component} (${id}) exceeded ${state.timeout}ms`);
        
        // Call timeout handler
        try {
          state.onTimeout();
        } catch (error) {
          console.error(`[LoadingWatchdog] Error in timeout handler for ${state.component}:`, error);
        }
        
        // Remove from tracking
        this.loadingStates.delete(id);
      } else if (duration > state.timeout * 0.7) {
        // Warn at 70% of timeout
        console.warn(`[LoadingWatchdog] WARNING: ${state.component} (${id}) approaching timeout - ${duration}ms / ${state.timeout}ms`);
      }
    }
  }

  /**
   * Start the watchdog monitoring
   */
  private startWatchdog(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    
    this.checkInterval = setInterval(() => {
      this.checkTimeouts();
    }, 2000); // Check every 2 seconds
  }

  /**
   * Handle page visibility changes
   */
  private handleVisibilityChange(): void {
    if (document.visibilityState === 'visible') {
      console.log('[LoadingWatchdog] Page became visible - checking for stuck loading states');
      
      // Force timeout any loading states that have been running too long
      const now = Date.now();
      for (const [id, state] of this.loadingStates.entries()) {
        const duration = now - state.startTime;
        if (duration > this.globalTimeout) {
          console.warn(`[LoadingWatchdog] Force timeout on page visibility: ${state.component} (${id})`);
          try {
            state.onTimeout();
          } catch (error) {
            console.error(`[LoadingWatchdog] Error in force timeout handler:`, error);
          }
          this.loadingStates.delete(id);
        }
      }
    }
  }

  /**
   * Get current loading states (for debugging)
   */
  getLoadingStates(): Array<{ id: string; component: string; duration: number; timeout: number }> {
    const now = Date.now();
    return Array.from(this.loadingStates.entries()).map(([id, state]) => ({
      id,
      component: state.component,
      duration: now - state.startTime,
      timeout: state.timeout
    }));
  }

  /**
   * Cleanup watchdog
   */
  cleanup(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    
    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    window.removeEventListener('beforeunload', this.cleanup.bind(this));
    
    this.loadingStates.clear();
  }

  /**
   * Emergency reset - clear all loading states
   */
  emergencyReset(): void {
    console.warn('[LoadingWatchdog] EMERGENCY RESET - clearing all loading states');
    
    for (const [id, state] of this.loadingStates.entries()) {
      try {
        state.onTimeout();
      } catch (error) {
        console.error(`[LoadingWatchdog] Error in emergency reset handler for ${state.component}:`, error);
      }
    }
    
    this.loadingStates.clear();
  }
}

// Global singleton instance
export const loadingWatchdog = new LoadingWatchdog();

/**
 * Hook for easy integration with React components
 */
import { useEffect, useRef } from 'react';

export const useLoadingWatchdog = (config: {
  component: string;
  isLoading: boolean;
  timeout?: number;
  onTimeout: () => void;
}) => {
  const idRef = useRef<string | null>(null);

  useEffect(() => {
    if (config.isLoading) {
      // Generate unique ID for this loading state
      const id = `${config.component}-${Date.now()}-${Math.random()}`;
      idRef.current = id;
      
      loadingWatchdog.register(id, {
        component: config.component,
        timeout: config.timeout,
        onTimeout: config.onTimeout
      });
      
      return () => {
        if (idRef.current) {
          loadingWatchdog.unregister(idRef.current);
          idRef.current = null;
        }
      };
    } else {
      // Not loading - unregister if we have an ID
      if (idRef.current) {
        loadingWatchdog.unregister(idRef.current);
        idRef.current = null;
      }
    }
  }, [config.isLoading, config.component, config.timeout, config.onTimeout]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (idRef.current) {
        loadingWatchdog.unregister(idRef.current);
      }
    };
  }, []);
};

// Debug function for development
if (typeof window !== 'undefined') {
  (window as any).debugLoadingWatchdog = () => {
    console.log('Current loading states:', loadingWatchdog.getLoadingStates());
  };
  
  (window as any).emergencyResetLoading = () => {
    loadingWatchdog.emergencyReset();
  };
}