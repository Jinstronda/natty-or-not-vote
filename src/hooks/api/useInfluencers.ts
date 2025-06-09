
import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { withDatabaseTimeout } from '@/utils/loadingTimeout';

const ITEMS_PER_PAGE = 20;

export const useInfluencers = (searchTerm?: string) => {
  return useInfiniteQuery({
    queryKey: ['influencers', 'infinite', searchTerm],
    queryFn: async ({ pageParam = 0 }) => {
      console.log('[useInfluencers] Fetching influencers, page:', pageParam, 'search:', searchTerm);
      
      try {
        const result = await withDatabaseTimeout(
          async () => {
            let query = supabase
              .from('influencers')
              .select('id, name, image, claimed_status')
              .order('created_at', { ascending: false })
              .range(pageParam * ITEMS_PER_PAGE, (pageParam + 1) * ITEMS_PER_PAGE - 1);

            if (searchTerm?.trim()) {
              query = query.ilike('name', `%${searchTerm.trim()}%`);
            }

            return query;
          },
          { 
            timeout: 8000, 
            retries: 2,
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
    staleTime: 2 * 60 * 1000, // 2 minutes for frequently changing data
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
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000), // Max 5 second delay
  });
};
