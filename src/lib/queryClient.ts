
import { QueryClient } from '@tanstack/react-query';

// Circuit breaker for failed queries
const circuitBreaker = {
  failures: new Map<string, { count: number; lastFailure: number }>(),
  threshold: 3,
  timeout: 30000, // 30 seconds

  shouldBlock(queryKey: string): boolean {
    const failure = this.failures.get(queryKey);
    if (!failure) return false;
    
    if (Date.now() - failure.lastFailure > this.timeout) {
      this.failures.delete(queryKey);
      return false;
    }
    
    return failure.count >= this.threshold;
  },

  recordFailure(queryKey: string): void {
    const existing = this.failures.get(queryKey) || { count: 0, lastFailure: 0 };
    this.failures.set(queryKey, {
      count: existing.count + 1,
      lastFailure: Date.now()
    });
  },

  recordSuccess(queryKey: string): void {
    this.failures.delete(queryKey);
  }
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
      refetchOnMount: false, // Don't automatically refetch on mount to reduce load
      retry: (failureCount: number, error: Error) => {
        // Don't retry on specific errors
        if ((error as any)?.code === 'PGRST116') return false; // No data found
        if ((error as any)?.code === 'PGRST301') return false; // JWT expired/invalid
        if (error?.message?.includes('JWT')) return false; // JWT-related errors
        if ((error as any)?.status === 401) return false; // Unauthorized
        if (error?.message?.includes('timed out')) return false; // Timeout errors
        
        // Reduce retries to prevent infinite loading loops
        return failureCount < 1;
      },
      retryDelay: 1000, // Fixed 1 second delay
      networkMode: 'online', // Only run queries when online
    },
    mutations: {
      retry: (failureCount: number, error: Error) => {
        // Don't retry auth errors
        if ((error as any)?.status === 401 || error?.message?.includes('JWT')) return false;
        return failureCount < 1;
      },
      networkMode: 'online',
    },
  },
});

// Export circuit breaker for testing
export { circuitBreaker };
