
import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { withDatabaseTimeout } from '@/utils/loadingTimeout';

const ITEMS_PER_PAGE = 20;

export const useInfluencers = (searchTerm?: string) => {
  return useInfiniteQuery({
    queryKey: ['influencers', 'infinite', searchTerm],
    enabled: true, // This table is publicly readable, no auth required
    queryFn: async ({ pageParam = 0 }) => {
      console.log('[useInfluencers] Fetching influencers, page:', pageParam, 'search:', searchTerm);
      
      try {
        const result = await withDatabaseTimeout(
          async () => {
            let query = supabase
              .from('influencers')
              .select('id, name, image, claimed_status')
              .order('created_at', { ascending: false })
              .range(pageParam * ITEMS_PER_PAGE, (pageParam + 1) * ITEMS_PER_PAGE - 1)
              .limit(ITEMS_PER_PAGE); // Add explicit limit for better performance

            if (searchTerm?.trim()) {
              query = query.ilike('name', `%${searchTerm.trim()}%`);
            }

            return query;
          },
          { 
            timeout: 5000, // Reduced from 8000ms to 5000ms
            retries: 1, // Reduced from 2 to 1 retry
            operation: `fetchInfluencers_page_${pageParam}` 
          }
        );
        
        if (result.error) {
          console.error('[useInfluencers] Error fetching influencers:', result.error);
          throw result.error;
        }

        console.log('[useInfluencers] Fetched influencers:', result.data?.length);

        return {
          data: result.data || [],
          nextPage: result.data && result.data.length === ITEMS_PER_PAGE ? pageParam + 1 : undefined,
          hasMore: result.data && result.data.length === ITEMS_PER_PAGE,
        };
      } catch (error) {
        console.error('[useInfluencers] Error in useInfluencers:', error);
        throw error;
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000, // 5 minutes - data doesn't change frequently
    gcTime: 10 * 60 * 1000, // 10 minutes cache time
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    retry: (failureCount, error: any) => {
      // Don't retry on timeout or auth errors
      if (error?.message?.includes('timed out')) {
        console.log('[useInfluencers] Not retrying timeout error');
        return false;
      }
      if (error?.code === 'PGRST301' || error?.message?.includes('JWT')) {
        console.log('[useInfluencers] Not retrying auth error');
        return false;
      }
      // Only retry once for network issues
      return failureCount < 1;
    },
    retryDelay: 1000, // Fixed 1 second delay instead of exponential backoff
  });
};
