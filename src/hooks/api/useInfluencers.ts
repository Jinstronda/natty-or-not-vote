import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const ITEMS_PER_PAGE = 20;

export interface Influencer {
  id: string;
  name: string;
  image: string;
  claimed_status: string;
  total_votes: number;
}

export interface InfluencerPage {
  data: Influencer[];
  nextPage?: number;
}

const fetchInfluencers = async ({ pageParam = 0, searchTerm = '' }: { pageParam?: number, searchTerm?: string }): Promise<InfluencerPage> => {
  let query = supabase
    .from('influencers')
    .select('id, name, image, claimed_status, influencer_vote_counts(total_votes)')
    .order('influencer_vote_counts.total_votes', { ascending: false })
    .not('name', 'is', null)
    .not('name', 'eq', '')
    .not('image', 'is', null)
    .not('image', 'eq', '')
    .range(pageParam * ITEMS_PER_PAGE, (pageParam + 1) * ITEMS_PER_PAGE - 1);

  if (searchTerm.trim()) {
    query = query.ilike('name', `%${searchTerm.trim()}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }

  const influencers = (data || [])
    .filter((row: any) => row.name && row.name.trim() && row.image && row.image.trim())
    .map((row: any) => ({
      id: row.id,
      name: row.name || '',
      image: row.image || '',
      claimed_status: row.claimed_status || '',
      total_votes: row.influencer_vote_counts?.total_votes || 0,
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
