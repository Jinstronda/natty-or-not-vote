
import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const ITEMS_PER_PAGE = 20;

export const useInfluencers = (searchTerm?: string) => {
  return useInfiniteQuery({
    queryKey: ['influencers', 'infinite', searchTerm],
    enabled: true, // This table is publicly readable, no auth required
    networkMode: 'always', // Try to fetch even with poor network
    queryFn: async ({ pageParam = 0 }) => {
      try {
        console.log('[useInfluencers] Fetching influencers, page:', pageParam, 'search:', searchTerm);
        
        // Simple, direct Supabase query
        let query = supabase
          .from('influencers')
          .select('id, name, image, claimed_status')
          .order('created_at', { ascending: false })
          .limit(ITEMS_PER_PAGE);

        if (searchTerm?.trim()) {
          query = query.ilike('name', `%${searchTerm.trim()}%`);
        }

        console.log('[useInfluencers] About to execute query...');
        const result = await query;
        
        console.log('[useInfluencers] Query completed. Result:', {
          data: result.data,
          error: result.error,
          status: result.status,
          statusText: result.statusText,
          count: result.count
        });
        
        if (result.error) {
          console.error('[useInfluencers] Supabase error:', result.error);
          throw new Error(`Supabase error: ${result.error.message}`);
        }

        const dataLength = result.data?.length || 0;
        console.log('[useInfluencers] Successfully fetched:', dataLength, 'influencers');
        console.log('[useInfluencers] Raw data:', result.data);

        const returnValue = {
          data: result.data || [],
          nextPage: result.data && result.data.length === ITEMS_PER_PAGE ? pageParam + 1 : undefined,
          hasMore: result.data && result.data.length === ITEMS_PER_PAGE,
        };
        
        console.log('[useInfluencers] Returning:', returnValue);
        return returnValue;
        
      } catch (error) {
        console.error('[useInfluencers] Caught error in queryFn:', error);
        throw error;
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000, // 5 minutes - data doesn't change frequently
    gcTime: 10 * 60 * 1000, // 10 minutes cache time
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    retry: (failureCount, error: any) => {
      console.log(`[useInfluencers] Retry attempt ${failureCount}, error:`, error);
      
      // Retry timeout errors more aggressively  
      if (error?.message?.includes('timed out')) {
        console.log('[useInfluencers] Retrying timeout error');
        return failureCount < 3; // Increased retries for timeouts
      }
      if (error?.code === 'PGRST301' || error?.message?.includes('JWT')) {
        console.log('[useInfluencers] Not retrying auth error');
        return false;
      }
      // Retry up to 3 times for all issues
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000), // Exponential backoff
  });
};
