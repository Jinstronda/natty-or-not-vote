// 🏗️ BULLETPROOF REACT QUERY ARCHITECTURE
// Handles all edge cases, race conditions, and error scenarios

import { QueryClient, QueryKey, UseInfiniteQueryOptions } from '@tanstack/react-query';

export interface QueryState {
  status: 'idle' | 'pending' | 'success' | 'error';
  fetchStatus: 'idle' | 'fetching' | 'paused';
  dataAvailable: boolean;
  lastSuccessTime: number | null;
  errorCount: number;
  authRequired: boolean;
  authReady: boolean;
}

export interface QueryManagerConfig {
  maxRetries: number;
  retryDelay: (attempt: number) => number;
  staleTime: number;
  gcTime: number;
  timeoutMs: number;
}

export class QueryManager {
  private queryClient: QueryClient;
  private config: QueryManagerConfig;
  private queryStates: Map<string, QueryState> = new Map();
  private timeouts: Map<string, NodeJS.Timeout> = new Map();

  constructor(queryClient: QueryClient, config?: Partial<QueryManagerConfig>) {
    this.queryClient = queryClient;
    this.config = {
      maxRetries: 3,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes  
      timeoutMs: 30000, // 30 seconds
      ...config
    };
  }

  // 🔧 BULLETPROOF INFINITE QUERY CONFIGURATION
  createInfiniteQueryOptions<TData, TError>(
    queryKey: QueryKey,
    queryFn: any,
    options?: {
      enabled?: boolean;
      authRequired?: boolean;
      authReady?: boolean;
      select?: (data: any) => any;
      onSuccess?: (data: any) => void;
      onError?: (error: TError) => void;
    }
  ): UseInfiniteQueryOptions<TData, TError> {
    const keyString = JSON.stringify(queryKey);
    const authRequired = options?.authRequired ?? true;
    const authReady = options?.authReady ?? true;
    const enabled = options?.enabled ?? true;

    // Initialize query state
    this.initializeQueryState(keyString, authRequired, authReady);

    return {
      queryKey,
      queryFn: this.wrapQueryFunction(keyString, queryFn),
      enabled: this.shouldEnableQuery(keyString, enabled),
      
      // 🔧 RESILIENT CONFIGURATION
      retry: (failureCount, error: any) => this.shouldRetry(keyString, failureCount, error),
      retryDelay: this.config.retryDelay,
      staleTime: this.config.staleTime,
      gcTime: this.config.gcTime,
      
      // 🔧 NETWORK RESILIENCE
      networkMode: 'offlineFirst',
      refetchOnMount: 'always',
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
      
      // 🔧 STATE MANAGEMENT
      select: options?.select || ((data: any) => {
        this.updateQueryState(keyString, { dataAvailable: !!data });
        return data;
      }),
      
      // 🔧 PLACEHOLDERS AND FALLBACKS
      placeholderData: (previousData) => {
        console.log(`[QueryManager] Placeholder requested for ${keyString}`, {
          hasPreviousData: !!previousData,
          queryState: this.getQueryState(keyString)
        });
        return previousData;
      },

      // 🔧 SUCCESS/ERROR HANDLING
      onSuccess: (data: any) => {
        this.updateQueryState(keyString, {
          status: 'success',
          fetchStatus: 'idle',
          dataAvailable: !!data,
          lastSuccessTime: Date.now(),
          errorCount: 0
        });
        options?.onSuccess?.(data);
        this.clearQueryTimeout(keyString);
      },

      onError: (error: TError) => {
        const queryState = this.getQueryState(keyString);
        this.updateQueryState(keyString, {
          status: 'error',
          fetchStatus: 'idle',
          errorCount: queryState.errorCount + 1
        });
        options?.onError?.(error);
        this.clearQueryTimeout(keyString);
      },

      // 🔧 PAGINATION
      getNextPageParam: (lastPage: any) => {
        console.log(`[QueryManager] Getting next page for ${keyString}`, lastPage);
        return lastPage?.nextPage;
      },
      initialPageParam: 0,
    };
  }

  private initializeQueryState(keyString: string, authRequired: boolean, authReady: boolean): void {
    if (!this.queryStates.has(keyString)) {
      this.queryStates.set(keyString, {
        status: 'idle',
        fetchStatus: 'idle',
        dataAvailable: false,
        lastSuccessTime: null,
        errorCount: 0,
        authRequired,
        authReady
      });
    }
  }

  private shouldEnableQuery(keyString: string, baseEnabled: boolean): boolean {
    const state = this.getQueryState(keyString);
    
    // If auth is required, wait for auth to be ready
    if (state.authRequired && !state.authReady) {
      console.log(`[QueryManager] Query ${keyString} disabled - waiting for auth`);
      return false;
    }

    // Check if we're in a retry backoff period
    if (state.errorCount >= this.config.maxRetries) {
      console.log(`[QueryManager] Query ${keyString} disabled - max retries exceeded`);
      return false;
    }

    console.log(`[QueryManager] Query ${keyString} enabled:`, {
      baseEnabled,
      authRequired: state.authRequired,
      authReady: state.authReady,
      errorCount: state.errorCount
    });

    return baseEnabled;
  }

  private wrapQueryFunction(keyString: string, originalFn: any) {
    return async (context: any) => {
      console.log(`[QueryManager] Starting query ${keyString}`, context);
      
      // Set timeout for the query
      this.setQueryTimeout(keyString);
      
      // Update state to fetching
      this.updateQueryState(keyString, {
        status: 'pending',
        fetchStatus: 'fetching'
      });

      try {
        const result = await Promise.race([
          originalFn(context),
          this.createTimeoutPromise(keyString)
        ]);

        console.log(`[QueryManager] Query ${keyString} completed successfully`);
        return result;

      } catch (error) {
        console.error(`[QueryManager] Query ${keyString} failed:`, error);
        
        // Update error state
        const state = this.getQueryState(keyString);
        this.updateQueryState(keyString, {
          status: 'error',
          fetchStatus: 'idle',
          errorCount: state.errorCount + 1
        });

        throw error;
      }
    };
  }

  private shouldRetry(keyString: string, failureCount: number, error: any): boolean {
    const state = this.getQueryState(keyString);
    
    // Don't retry if we've exceeded max retries
    if (failureCount >= this.config.maxRetries) {
      console.log(`[QueryManager] Max retries exceeded for ${keyString}`);
      return false;
    }

    // Don't retry auth errors (4xx)
    if (error?.status >= 400 && error?.status < 500) {
      console.log(`[QueryManager] Not retrying auth error for ${keyString}:`, error?.status);
      return false;
    }

    // Retry network errors and 5xx errors
    const shouldRetry = failureCount < this.config.maxRetries;
    console.log(`[QueryManager] Retry decision for ${keyString}:`, {
      failureCount,
      shouldRetry,
      errorType: error?.constructor?.name,
      errorMessage: error?.message
    });

    return shouldRetry;
  }

  private createTimeoutPromise(keyString: string): Promise<never> {
    return new Promise((_, reject) => {
      const timeoutId = setTimeout(() => {
        console.error(`[QueryManager] Query ${keyString} timed out after ${this.config.timeoutMs}ms`);
        reject(new Error(`Query timeout: ${keyString}`));
      }, this.config.timeoutMs);

      this.timeouts.set(`${keyString}_timeout`, timeoutId);
    });
  }

  private setQueryTimeout(keyString: string): void {
    this.clearQueryTimeout(keyString);
    
    const timeoutId = setTimeout(() => {
      console.warn(`[QueryManager] Query ${keyString} exceeded expected duration`);
      this.updateQueryState(keyString, {
        status: 'error',
        fetchStatus: 'idle'
      });
    }, this.config.timeoutMs);

    this.timeouts.set(keyString, timeoutId);
  }

  private clearQueryTimeout(keyString: string): void {
    const timeoutId = this.timeouts.get(keyString);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.timeouts.delete(keyString);
    }

    const queryTimeoutId = this.timeouts.get(`${keyString}_timeout`);
    if (queryTimeoutId) {
      clearTimeout(queryTimeoutId);
      this.timeouts.delete(`${keyString}_timeout`);
    }
  }

  private getQueryState(keyString: string): QueryState {
    return this.queryStates.get(keyString) || {
      status: 'idle',
      fetchStatus: 'idle', 
      dataAvailable: false,
      lastSuccessTime: null,
      errorCount: 0,
      authRequired: false,
      authReady: true
    };
  }

  private updateQueryState(keyString: string, updates: Partial<QueryState>): void {
    const current = this.getQueryState(keyString);
    const updated = { ...current, ...updates };
    this.queryStates.set(keyString, updated);
    
    console.log(`[QueryManager] State updated for ${keyString}:`, updated);
  }

  // 🔧 UTILITY METHODS
  updateAuthStatus(authReady: boolean): void {
    console.log(`[QueryManager] Auth status updated: ${authReady}`);
    
    for (const [keyString, state] of this.queryStates.entries()) {
      if (state.authRequired) {
        this.updateQueryState(keyString, { authReady });
        
        // Trigger refetch if auth became ready and we have errors
        if (authReady && state.errorCount > 0) {
          console.log(`[QueryManager] Triggering refetch for ${keyString} after auth ready`);
          this.queryClient.refetchQueries({ queryKey: JSON.parse(keyString) });
        }
      }
    }
  }

  invalidateQuery(queryKey: QueryKey): void {
    const keyString = JSON.stringify(queryKey);
    console.log(`[QueryManager] Invalidating query ${keyString}`);
    
    this.clearQueryTimeout(keyString);
    this.updateQueryState(keyString, {
      status: 'idle',
      fetchStatus: 'idle',
      errorCount: 0
    });
    
    this.queryClient.invalidateQueries({ queryKey });
  }

  getDebugInfo(): any {
    return {
      config: this.config,
      queryStates: Array.from(this.queryStates.entries()),
      activeTimeouts: Array.from(this.timeouts.keys())
    };
  }

  cleanup(): void {
    // Clear all timeouts
    for (const timeoutId of this.timeouts.values()) {
      clearTimeout(timeoutId);
    }
    this.timeouts.clear();
    this.queryStates.clear();
  }
}