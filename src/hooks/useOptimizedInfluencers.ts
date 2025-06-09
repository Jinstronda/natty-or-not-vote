
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const INFLUENCERS_PER_PAGE = 12;

export const useOptimizedInfluencers = (searchTerm?: string) => {
  // Infinite scroll for influencers list
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = useInfiniteQuery({
    queryKey: ['influencers', searchTerm],
    queryFn: async ({ pageParam = 0 }) => {
      console.log('Fetching influencers page:', pageParam, 'search:', searchTerm);
      
      let query = supabase
        .from('influencers')
        .select('*')
        .order('created_at', { ascending: false })
        .range(pageParam * INFLUENCERS_PER_PAGE, (pageParam + 1) * INFLUENCERS_PER_PAGE - 1);

      if (searchTerm && searchTerm.trim()) {
        query = query.ilike('name', `%${searchTerm.trim()}%`);
      }

      const { data: influencers, error } = await query;
      
      if (error) {
        console.error('Error fetching influencers:', error);
        throw error;
      }

      console.log('Fetched influencers:', influencers?.length);
      
      return {
        influencers: influencers || [],
        nextPage: influencers && influencers.length === INFLUENCERS_PER_PAGE ? pageParam + 1 : undefined
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 300000, // Cache for 5 minutes
    initialPageParam: 0,
  });

  // Get single influencer with enhanced caching
  const useInfluencer = (id: string) => {
    return useQuery({
      queryKey: ['influencer', id],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('influencers')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        return data;
      },
      staleTime: 600000, // Cache for 10 minutes
      enabled: !!id,
    });
  };

  const allInfluencers = data?.pages.flatMap(page => page.influencers) || [];

  return {
    influencers: allInfluencers,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    useInfluencer
  };
};
