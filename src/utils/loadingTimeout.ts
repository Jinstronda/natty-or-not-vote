/**
 * Comprehensive Loading Timeout System
 * Prevents infinite loading states across the application
 */

export interface LoadingTimeoutConfig {
  timeout: number;
  operation: string;
  onTimeout?: () => void;
  enableLogging?: boolean;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  timedOut: boolean;
  operation: string;
}

/**
 * Creates a loading state manager with automatic timeout
 * Prevents operations from hanging indefinitely
 */
export const createLoadingTimeout = (config: LoadingTimeoutConfig) => {
  let timeoutId: NodeJS.Timeout | null = null;
  let startTime: number = Date.now();
  
  const state: LoadingState = {
    isLoading: true,
    error: null,
    timedOut: false,
    operation: config.operation
  };

  const cleanup = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  const start = (): LoadingState => {
    startTime = Date.now();
    state.isLoading = true;
    state.error = null;
    state.timedOut = false;

    if (config.enableLogging) {
      console.log(`[LoadingTimeout] Starting operation: ${config.operation}`);
    }

    timeoutId = setTimeout(() => {
      const duration = Date.now() - startTime;
      state.isLoading = false;
      state.timedOut = true;
      state.error = `Operation "${config.operation}" timed out after ${duration}ms`;
      
      console.error(`[LoadingTimeout] TIMEOUT: ${config.operation} exceeded ${config.timeout}ms`);
      
      config.onTimeout?.();
    }, config.timeout);

    return state;
  };

  const complete = (error?: string): LoadingState => {
    cleanup();
    const duration = Date.now() - startTime;
    
    state.isLoading = false;
    state.error = error || null;
    
    if (config.enableLogging) {
      console.log(`[LoadingTimeout] Completed: ${config.operation} in ${duration}ms`);
    }

    return state;
  };

  const reset = (): LoadingState => {
    cleanup();
    state.isLoading = false;
    state.error = null;
    state.timedOut = false;
    return state;
  };

  return {
    state,
    start,
    complete,
    reset,
    cleanup
  };
};

/**
 * Hook for managing loading states with automatic timeouts
 */
import { useState, useEffect, useCallback } from 'react';

export const useLoadingTimeout = (config: LoadingTimeoutConfig) => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    error: null,
    timedOut: false,
    operation: config.operation
  });

  const [manager] = useState(() => createLoadingTimeout({
    ...config,
    onTimeout: () => {
      setLoadingState(prev => ({ ...prev, isLoading: false, timedOut: true, error: `${config.operation} timed out` }));
      config.onTimeout?.();
    }
  }));

  useEffect(() => {
    return () => manager.cleanup();
  }, [manager]);

  const startLoading = useCallback(() => {
    const newState = manager.start();
    setLoadingState({ ...newState });
  }, [manager]);

  const completeLoading = useCallback((error?: string) => {
    const newState = manager.complete(error);
    setLoadingState({ ...newState });
  }, [manager]);

  const resetLoading = useCallback(() => {
    const newState = manager.reset();
    setLoadingState({ ...newState });
  }, [manager]);

  return {
    ...loadingState,
    startLoading,
    completeLoading,
    resetLoading
  };
};

/**
 * Promise wrapper that adds timeout functionality
 */
export const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number,
  operation: string
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Operation "${operation}" timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(timeoutId));
  });
};

/**
 * Database operation wrapper with timeout and retry logic
 */
export const withDatabaseTimeout = async <T>(
  operation: () => Promise<T>,
  config: {
    timeout?: number;
    retries?: number;
    operation: string;
  }
): Promise<T> => {
  const { timeout = 10000, retries = 2, operation: operationName } = config;
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`[DatabaseTimeout] Retry ${attempt}/${retries} for: ${operationName}`);
        await new Promise(resolve => setTimeout(resolve, Math.min(1000 * attempt, 3000)));
      }
      
      return await withTimeout(operation(), timeout, operationName);
    } catch (error) {
      lastError = error as Error;
      console.error(`[DatabaseTimeout] Attempt ${attempt + 1} failed for ${operationName}:`, error);
      
      // Don't retry on auth errors or network errors
      if (error instanceof Error && (
        error.message.includes('JWT') ||
        error.message.includes('401') ||
        error.message.includes('403')
      )) {
        break;
      }
    }
  }
  
  throw lastError || new Error(`All ${retries + 1} attempts failed for ${operationName}`);
};