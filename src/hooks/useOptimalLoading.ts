import { useState, useCallback, useEffect, useRef } from 'react';

export type LoadingPhase = 'idle' | 'loading' | 'success' | 'error' | 'retrying';

export interface LoadingState<T = any> {
  phase: LoadingPhase;
  data: T | null;
  error: string | null;
  progress?: number;
  retryCount: number;
}

export interface LoadingConfig {
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
  enableProgress?: boolean;
  key?: string;
}

/**
 * Unified loading hook following modern best practices
 * - Performance optimized
 * - Consistent across components  
 * - Mobile-friendly
 * - Error resilient
 */
export const useOptimalLoading = <T = any>(config: LoadingConfig = {}) => {
  const {
    timeout = 10000,
    maxRetries = 2,
    retryDelay = 1000,
    enableProgress = false,
    key = 'default'
  } = config;

  const [state, setState] = useState<LoadingState<T>>({
    phase: 'idle',
    data: null,
    error: null,
    progress: 0,
    retryCount: 0
  });

  const timeoutRef = useRef<NodeJS.Timeout>();
  const progressRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (progressRef.current) clearTimeout(progressRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  // Progress simulation for better UX
  const simulateProgress = useCallback(() => {
    if (!enableProgress) return;
    
    let progress = 0;
    const increment = () => {
      progress += Math.random() * 20 + 10; // 10-30% increments
      if (progress > 85) progress = 85; // Stop at 85% until complete
      
      setState(prev => ({ ...prev, progress }));
      
      if (progress < 85) {
        progressRef.current = setTimeout(increment, 300 + Math.random() * 200);
      }
    };
    
    increment();
  }, [enableProgress]);

  // Execute async operation with proper error handling
  const execute = useCallback(async <R = T>(
    operation: (signal: AbortSignal) => Promise<R>,
    options: { skipRetry?: boolean } = {}
  ): Promise<R | null> => {
    try {
      // Reset state
      setState(prev => ({
        ...prev,
        phase: prev.retryCount > 0 ? 'retrying' : 'loading',
        error: null,
        progress: 0
      }));

      // Start progress simulation
      simulateProgress();

      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();
      
      // Set timeout
      timeoutRef.current = setTimeout(() => {
        abortControllerRef.current?.abort();
      }, timeout);

      console.log(`[OptimalLoading:${key}] Starting operation (attempt ${state.retryCount + 1})`);

      // Execute the operation
      const result = await operation(abortControllerRef.current.signal);

      // Success
      clearTimeout(timeoutRef.current);
      if (progressRef.current) clearTimeout(progressRef.current);
      
      setState(prev => ({
        ...prev,
        phase: 'success',
        data: result as T,
        error: null,
        progress: 100,
        retryCount: 0
      }));

      console.log(`[OptimalLoading:${key}] Operation completed successfully`);
      return result;

    } catch (error: any) {
      clearTimeout(timeoutRef.current);
      if (progressRef.current) clearTimeout(progressRef.current);

      const errorMessage = error?.message || 'An unexpected error occurred';
      const isAborted = error?.name === 'AbortError';
      const isTimeout = errorMessage.includes('timeout') || isAborted;

      console.error(`[OptimalLoading:${key}] Operation failed:`, errorMessage);

      // Determine if we should retry
      const shouldRetry = !options.skipRetry && 
                         state.retryCount < maxRetries && 
                         (isTimeout || !error?.message?.includes('404'));

      if (shouldRetry) {
        console.log(`[OptimalLoading:${key}] Retrying in ${retryDelay}ms...`);
        
        setState(prev => ({
          ...prev,
          phase: 'retrying',
          retryCount: prev.retryCount + 1,
          progress: 0
        }));

        // Retry after delay
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return execute(operation, options);
      } else {
        // Final failure
        setState(prev => ({
          ...prev,
          phase: 'error',
          error: errorMessage,
          progress: 0
        }));
        return null;
      }
    }
  }, [key, timeout, maxRetries, retryDelay, simulateProgress, state.retryCount]);

  // Reset to idle state
  const reset = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (progressRef.current) clearTimeout(progressRef.current);
    if (abortControllerRef.current) abortControllerRef.current.abort();

    setState({
      phase: 'idle',
      data: null,
      error: null,
      progress: 0,
      retryCount: 0
    });
  }, []);

  // Retry the last operation
  const retry = useCallback(() => {
    reset();
  }, [reset]);

  return {
    ...state,
    execute,
    reset,
    retry,
    isLoading: state.phase === 'loading' || state.phase === 'retrying',
    isSuccess: state.phase === 'success',
    isError: state.phase === 'error',
    isEmpty: state.phase === 'success' && !state.data
  };
};

// Specialized hook for review loading
export const useReviewLoading = (influencerId: string) => {
  return useOptimalLoading<any[]>({
    timeout: 8000,
    maxRetries: 2,
    enableProgress: true,
    key: `reviews-${influencerId}`
  });
};