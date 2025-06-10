import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const ITEMS_PER_PAGE = 20;

const fetchInfluencers = async ({ pageParam = 0, searchTerm = '' }: { pageParam?: number, searchTerm?: string }) => {
  let query = supabase
    .from('influencers')
    .select('id, name, image, claimed_status')
    .order('created_at', { ascending: false })
    .range(pageParam * ITEMS_PER_PAGE, (pageParam + 1) * ITEMS_PER_PAGE - 1);

  if (searchTerm.trim()) {
    query = query.ilike('name', `%${searchTerm.trim()}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }

  return {
    data: data || [],
    nextPage: data && data.length === ITEMS_PER_PAGE ? pageParam + 1 : undefined,
  };
};

export const useInfluencers = (searchTerm?: string, enabled: boolean = true) => {
  const stableSearchTerm = searchTerm || '';

  return useInfiniteQuery({
    queryKey: ['influencers', 'infinite', stableSearchTerm],
    queryFn: ({ pageParam }) => fetchInfluencers({ pageParam, searchTerm: stableSearchTerm }),
    enabled: enabled, // Use the enabled prop passed from the component
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    refetchOnWindowFocus: false, // Optional: to prevent too many refetches
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
