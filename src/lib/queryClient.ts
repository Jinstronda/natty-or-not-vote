import { QueryClient } from '@tanstack/react-query';

// Enhanced circuit breaker for failed queries with exponential backoff
const circuitBreaker = {
  failures: new Map<string, { count: number; lastFailure: number; backoffMs: number }>(),
  threshold: 3,
  timeout: 30000, // 30 seconds
  maxBackoff: 300000, // 5 minutes max backoff

  shouldBlock(queryKey: string): boolean {
    const failure = this.failures.get(queryKey);
    if (!failure) return false;
    
    // Reset if enough time has passed
    if (Date.now() - failure.lastFailure > this.timeout + failure.backoffMs) {
      this.failures.delete(queryKey);
      return false;
    }
    
    return failure.count >= this.threshold;
  },

  recordFailure(queryKey: string): void {
    const existing = this.failures.get(queryKey) || { 
      count: 0, 
      lastFailure: 0, 
      backoffMs: 1000 
    };
    
    // Exponential backoff
    const newBackoff = Math.min(existing.backoffMs * 2, this.maxBackoff);
    
    this.failures.set(queryKey, {
      count: existing.count + 1,
      lastFailure: Date.now(),
      backoffMs: newBackoff
    });
  },

  recordSuccess(queryKey: string): void {
    this.failures.delete(queryKey);
  }
};

// Performance monitoring for queries
const queryPerformanceLogger = {
  log: (queryKey: string, duration: number, cacheHit: boolean) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Query Performance] ${queryKey}: ${duration}ms (${cacheHit ? 'cache hit' : 'network'})`);
    }
  }
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Optimized cache timing for better performance
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes (increased for better caching)
      
      // Smarter refetch strategies
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
      refetchOnMount: false, // Don't automatically refetch on mount to reduce load
      refetchInterval: false, // Disable automatic polling by default
      
      // Enhanced retry logic with circuit breaker
      retry: (failureCount: number, error: Error) => {
        const queryKey = error.message || 'unknown';
        
        // Don't retry on specific errors
        if ((error as any)?.code === 'PGRST116') return false; // No data found
        if ((error as any)?.code === 'PGRST301') return false; // JWT expired/invalid
        if (error?.message?.includes('JWT')) return false; // JWT-related errors
        if ((error as any)?.status === 401) return false; // Unauthorized
        if (error?.message?.includes('timed out')) return false; // Timeout errors
        
        // Check circuit breaker
        if (circuitBreaker.shouldBlock(queryKey)) {
          return false;
        }
        
        // Limit retries to prevent infinite loading loops
        return failureCount < 2; // Increased from 1 to 2 for better resilience
      },
      
      // Smart retry delay with jitter
      retryDelay: (attemptIndex) => {
        const baseDelay = Math.min(1000 * (2 ** attemptIndex), 30000); // Exponential backoff, max 30s
        const jitter = Math.random() * 1000; // Add jitter to prevent thundering herd
        return baseDelay + jitter;
      },
      
      networkMode: 'online', // Only run queries when online
    },
    mutations: {
      // Enhanced mutation retry strategy
      retry: (failureCount: number, error: Error) => {
        // Don't retry auth errors
        if ((error as any)?.status === 401 || error?.message?.includes('JWT')) return false;
        
        // Don't retry client errors (4xx)
        if ((error as any)?.status >= 400 && (error as any)?.status < 500) return false;
        
        // Retry server errors (5xx) up to 2 times
        return failureCount < 2;
      },
      
      retryDelay: (attemptIndex) => {
        return Math.min(1000 * (2 ** attemptIndex), 10000); // Exponential backoff, max 10s
      },
      
      networkMode: 'online',
    },
  },
});

// Add global error handler for mutations
queryClient.setMutationDefaults(['mutation'], {
  onError: (error: Error) => {
    console.error('Mutation error:', error);
    // You can add global error reporting here (e.g., to Sentry)
  },
});

// Add global cache listeners for performance monitoring
queryClient.getQueryCache().subscribe((event) => {
  if (process.env.NODE_ENV === 'development') {
    const queryKey = JSON.stringify(event.query.queryKey);
    
    if (event.type === 'updated' && event.action.type === 'success') {
      circuitBreaker.recordSuccess(queryKey);
      queryPerformanceLogger.log(queryKey, 0, event.query.state.dataUpdateCount > 0);
    }
    
    if (event.type === 'updated' && event.action.type === 'error') {
      circuitBreaker.recordFailure(queryKey);
    }
  }
});

// Export circuit breaker for testing and monitoring
export { circuitBreaker, queryPerformanceLogger };
