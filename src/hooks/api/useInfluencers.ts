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
    .order('created_at', { ascending: false })
    .not('name', 'is', null)
    .not('image', 'is', null);

  if (searchTerm.trim()) {
    query = query.ilike('name', `%${searchTerm.trim()}%`);
  }

  // Fetch a large batch to ensure enough valid results after filtering
  const { data, error } = await query.range(0, 99);

  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }

  // TEMP: Log raw data for debugging
  console.log('Raw influencer data from Supabase:', data);

  // Filter out invalid rows, sort by vote count, and paginate on the client
  const validInfluencers = (data || [])
    .filter((row: any) => row.id && row.name && row.name.trim() !== '' && row.image && row.image.trim() !== '')
    .map((row: any) => ({
      id: row.id,
      name: row.name || '',
      image: row.image || '',
      claimed_status: row.claimed_status || '',
      total_votes: row.influencer_vote_counts?.total_votes || 0,
    }))
    .sort((a, b) => b.total_votes - a.total_votes);

  const start = pageParam * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const pageData = validInfluencers.slice(start, end);

  return {
    data: pageData,
    nextPage: end < validInfluencers.length ? pageParam + 1 : undefined,
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
