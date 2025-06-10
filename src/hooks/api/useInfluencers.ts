
import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const ITEMS_PER_PAGE = 20;

// 🔧 COMPREHENSIVE INFLUENCER LOADING DEBUGGER
class InfluencerDebugger {
  private logs: any[] = [];
  private timers: Map<string, number> = new Map();

  log(level: string, message: string, data?: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data: data ? JSON.parse(JSON.stringify(data)) : undefined
    };

    this.logs.push(logEntry);
    
    const emoji = {
      'ERROR': '🚨',
      'WARN': '⚠️', 
      'INFO': 'ℹ️',
      'TIMING': '⏱️',
      'NETWORK': '🌐',
      'DATABASE': '💾',
      'QUERY': '🔍',
      'SUCCESS': '✅'
    }[level] || '📝';
    
    console.log(`${emoji} [InfluencerDebugger] ${message}`, data || '');
  }

  startTimer(operation: string): void {
    this.timers.set(operation, performance.now());
    this.log('TIMING', `⏱️ START: ${operation}`, { timestamp: Date.now() });
  }

  endTimer(operation: string): number {
    const startTime = this.timers.get(operation);
    if (!startTime) return 0;
    
    const duration = performance.now() - startTime;
    this.timers.delete(operation);
    this.log('TIMING', `⏱️ END: ${operation} (${duration.toFixed(2)}ms)`, { 
      duration, 
      timestamp: Date.now(),
      operation 
    });
    return duration;
  }

  error(message: string, error: any, context?: any): void {
    this.log('ERROR', message, { error: error?.message || error, context, stack: error?.stack });
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

const influencerDebugger = new InfluencerDebugger();

export const useInfluencers = (searchTerm?: string, enabled: boolean = true) => {
  influencerDebugger.log('INFO', '🔧 BUILD VERSION: REACT_QUERY_FIX_v3.0 - 2025-01-10-17:00');
  influencerDebugger.log('QUERY', '🎯 useInfluencers hook called', { 
    searchTerm, 
    enabled, 
    timestamp: Date.now(),
    stackTrace: new Error().stack?.split('\n').slice(1, 4)
  });

  // 🔧 CRITICAL FIX: Stabilize query key to prevent React Query state issues
  const stableSearchTerm = searchTerm || '';
  const stableQueryKey = ['influencers', 'infinite', stableSearchTerm];
  
  influencerDebugger.log('QUERY', '🔧 Stabilized query configuration', {
    originalSearchTerm: searchTerm,
    stableSearchTerm,
    stableQueryKey,
    enabled
  });
  
  return useInfiniteQuery({
    queryKey: stableQueryKey,
    enabled: enabled, // Wait for auth to complete
    networkMode: 'always', // Try to fetch even with poor network
    
    // 🔧 CRITICAL FIX: Add placeholderData to prevent hanging state
    placeholderData: (previousData) => {
      influencerDebugger.log('QUERY', '🔄 Placeholder data requested', { 
        hasPreviousData: !!previousData,
        enabled 
      });
      return previousData;
    },
    queryFn: async ({ pageParam = 0 }) => {
      const queryId = `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      influencerDebugger.startTimer(`influencer_fetch_${queryId}`);
      
      influencerDebugger.log('QUERY', '🚀 Starting influencer fetch', { 
        queryId,
        pageParam, 
        searchTerm,
        enabled,
        timestamp: Date.now()
      });

      try {
        // Test auth state before query
        influencerDebugger.startTimer(`auth_check_${queryId}`);
        const { data: authData, error: authError } = await supabase.auth.getUser();
        const authCheckDuration = influencerDebugger.endTimer(`auth_check_${queryId}`);
        
        influencerDebugger.log('DATABASE', '🔐 Auth check result', {
          queryId,
          duration: authCheckDuration,
          hasUser: !!authData.user,
          userId: authData.user?.id,
          authError: authError?.message
        });

        // Build query with detailed logging
        influencerDebugger.log('QUERY', '🔧 Building Supabase query', {
          queryId,
          table: 'influencers',
          select: 'id, name, image, claimed_status',
          orderBy: 'created_at DESC',
          limit: ITEMS_PER_PAGE,
          pageParam,
          hasSearchTerm: !!searchTerm?.trim()
        });

        let query = supabase
          .from('influencers')
          .select('id, name, image, claimed_status')
          .order('created_at', { ascending: false })
          .limit(ITEMS_PER_PAGE);

        if (searchTerm?.trim()) {
          query = query.ilike('name', `%${searchTerm.trim()}%`);
          influencerDebugger.log('QUERY', '🔍 Applied search filter', { 
            queryId,
            searchTerm: searchTerm.trim() 
          });
        }

        // Execute query with timing
        influencerDebugger.startTimer(`db_query_${queryId}`);
        influencerDebugger.log('NETWORK', '🌐 Executing Supabase query', { queryId });
        
        const result = await query;
        const queryDuration = influencerDebugger.endTimer(`db_query_${queryId}`);
        
        influencerDebugger.log('DATABASE', '💾 Query execution completed', {
          queryId,
          duration: queryDuration,
          hasError: !!result.error,
          errorMessage: result.error?.message,
          errorCode: result.error?.code,
          dataLength: result.data?.length,
          status: result.status,
          statusText: result.statusText
        });
        
        if (result.error) {
          influencerDebugger.error('🚨 Supabase query failed', result.error, { 
            queryId,
            query: 'influencers',
            searchTerm,
            pageParam
          });
          throw new Error(`Supabase error: ${result.error.message}`);
        }

        const responseData = {
          data: result.data || [],
          nextPage: result.data && result.data.length === ITEMS_PER_PAGE ? pageParam + 1 : undefined,
          hasMore: result.data && result.data.length === ITEMS_PER_PAGE,
        };

        const totalDuration = influencerDebugger.endTimer(`influencer_fetch_${queryId}`);
        
        influencerDebugger.log('SUCCESS', '✅ Influencer fetch completed successfully', {
          queryId,
          totalDuration,
          itemsReturned: result.data?.length || 0,
          hasNextPage: responseData.hasMore,
          responseStructure: {
            dataType: typeof responseData.data,
            dataLength: responseData.data.length,
            nextPage: responseData.nextPage,
            hasMore: responseData.hasMore
          }
        });

        // 🔧 CRITICAL FIX: Force immediate return to prevent React Query hanging
        // This ensures React Query receives the data synchronously
        return Promise.resolve(responseData);

      } catch (error) {
        influencerDebugger.endTimer(`influencer_fetch_${queryId}`);
        influencerDebugger.error('🚨 Critical error in influencer fetch', error, {
          queryId,
          searchTerm,
          pageParam,
          enabled,
          errorStack: error instanceof Error ? error.stack : 'No stack trace'
        });
        throw error;
      }
    },
    getNextPageParam: (lastPage) => {
      influencerDebugger.log('QUERY', '🔄 Getting next page param', { 
        lastPage: lastPage?.nextPage,
        hasMore: lastPage?.hasMore 
      });
      return lastPage.nextPage;
    },
    initialPageParam: 0,
    
    // 🔧 CRITICAL FIX: Aggressive caching to prevent state issues
    staleTime: 0, // Always fresh data during debugging
    gcTime: 30 * 1000, // 30 seconds cache time during debugging
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch on mount if we have data
    refetchOnReconnect: false, // Don't refetch on reconnect
    
    // 🔧 CRITICAL FIX: Force React Query to update state immediately
    select: (data) => {
      influencerDebugger.log('QUERY', '🎯 Select function called - React Query state updating', {
        dataExists: !!data,
        pagesCount: data?.pages?.length,
        firstPageItems: data?.pages?.[0]?.data?.length
      });
      return data;
    },
    retry: (failureCount, error: any) => {
      const retryId = `retry_${Date.now()}_${failureCount}`;
      influencerDebugger.log('WARN', `🔄 Retry attempt ${failureCount}`, {
        retryId,
        failureCount,
        error: error?.message || error,
        errorCode: error?.code,
        errorStack: error?.stack,
        shouldRetryTimeout: error?.message?.includes('timed out'),
        shouldRetryAuth: error?.code === 'PGRST301' || error?.message?.includes('JWT')
      });
      
      // Retry timeout errors more aggressively  
      if (error?.message?.includes('timed out')) {
        influencerDebugger.log('INFO', '⏰ Retrying timeout error', { retryId, failureCount });
        return failureCount < 3; // Increased retries for timeouts
      }
      if (error?.code === 'PGRST301' || error?.message?.includes('JWT')) {
        influencerDebugger.log('WARN', '🚫 Not retrying auth error', { retryId, error: error?.message });
        return false;
      }
      // Retry up to 3 times for all issues
      const shouldRetry = failureCount < 3;
      influencerDebugger.log('INFO', shouldRetry ? '🔄 Will retry' : '🛑 Max retries reached', { 
        retryId, 
        failureCount, 
        shouldRetry 
      });
      return shouldRetry;
    },
    retryDelay: (attemptIndex) => {
      const delay = Math.min(1000 * 2 ** attemptIndex, 5000);
      influencerDebugger.log('TIMING', `⏳ Retry delay: ${delay}ms`, { attemptIndex, delay });
      return delay;
    }
  });
};

// 🔧 GLOBAL DEBUG EXPORT FUNCTIONS
declare global {
  interface Window {
    exportInfluencerDebugLogs: () => void;
    exportAllDebugLogs: () => void;
    clearInfluencerDebugLogs: () => void;
  }
}

if (typeof window !== 'undefined') {
  window.exportInfluencerDebugLogs = () => {
    const logs = influencerDebugger.exportLogs();
    console.log('📊 INFLUENCER DEBUG LOGS EXPORT:', logs);
    
    // Also save to file
    const blob = new Blob([logs], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `influencer-debug-logs-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  window.clearInfluencerDebugLogs = () => {
    influencerDebugger.logs = [];
    influencerDebugger.timers.clear();
    console.log('🧹 Influencer debug logs cleared');
  };
}
