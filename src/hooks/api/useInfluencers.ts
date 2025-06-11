import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const ITEMS_PER_PAGE = 20;

export interface Influencer {
  id: string;
  name: string;
  image: string;
  claimed_status: string;
}

export interface InfluencerPage {
  data: Influencer[];
  nextPage?: number;
}

const fetchInfluencers = async ({ pageParam = 0, searchTerm = '' }: { pageParam?: number, searchTerm?: string }): Promise<InfluencerPage> => {
  let query = supabase
    .from('influencer_vote_counts')
    .select('influencer_id, total_votes, influencers(id, name, image, claimed_status)')
    .order('total_votes', { ascending: false })
    .range(pageParam * ITEMS_PER_PAGE, (pageParam + 1) * ITEMS_PER_PAGE - 1);

  if (searchTerm.trim()) {
    query = query.ilike('influencers.name', `%${searchTerm.trim()}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }

  const influencers = (data || []).map((row: any) => ({
    id: row.influencer_id,
    name: row.influencers?.name || '',
    image: row.influencers?.image || '',
    claimed_status: row.influencers?.claimed_status || '',
  }));

  return {
    data: influencers,
    nextPage: data && data.length === ITEMS_PER_PAGE ? pageParam + 1 : undefined,
  };
};

export const useInfluencers = (searchTerm?: string, enabled: boolean = true) => {
  const stableSearchTerm = searchTerm || '';

  return useInfiniteQuery({
    queryKey: ['influencers', 'infinite', stableSearchTerm],
    queryFn: ({ pageParam }: { pageParam: number }) => fetchInfluencers({ pageParam, searchTerm: stableSearchTerm }),
    enabled: enabled,
    initialPageParam: 0,
    getNextPageParam: (lastPage: InfluencerPage) => lastPage.nextPage,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
