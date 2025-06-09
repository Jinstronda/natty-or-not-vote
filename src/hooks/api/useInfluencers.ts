
import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const ITEMS_PER_PAGE = 20;

export const useInfluencers = (searchTerm?: string) => {
  return useInfiniteQuery({
    queryKey: ['influencers', 'infinite', searchTerm],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from('influencers')
        .select('id, name, image, claimed_status')
        .order('created_at', { ascending: false })
        .range(pageParam * ITEMS_PER_PAGE, (pageParam + 1) * ITEMS_PER_PAGE - 1);

      if (searchTerm?.trim()) {
        query = query.ilike('name', `%${searchTerm.trim()}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return {
        data: data || [],
        nextPage: data && data.length === ITEMS_PER_PAGE ? pageParam + 1 : undefined,
        hasMore: data && data.length === ITEMS_PER_PAGE,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    staleTime: 2 * 60 * 1000, // 2 minutes for frequently changing data
  });
};
