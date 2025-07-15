import { useQuery } from '@tanstack/react-query';
import { useState, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BatchInfluencerData {
  id: string;
  name: string;
  image: string;
  claimed_status: string;
  controversial?: boolean;
  photos?: { image_url: string }[];
  vote_stats: {
    total_votes: number;
    natty_count: number;
    juicy_count: number;
    natty_percentage: number;
    juicy_percentage: number;
  };
  expert_reviews: Array<{
    id: string;
    rating?: number;
  }>;
}

// Optimized single query that gets everything needed for influencer cards
export const useBatchInfluencerData = (influencerIds: string[]) => {
  return useQuery({
    queryKey: ['batch-influencer-data', influencerIds.sort().join(',')],
    queryFn: async (): Promise<BatchInfluencerData[]> => {
      if (influencerIds.length === 0) return [];

      // Single query with all joins and aggregations
      const { data: influencers, error: influencersError } = await supabase
        .from('influencers')
        .select(`
          id,
          name,
          image,
          claimed_status,
          controversial,
          photos:influencer_photos(image_url)
        `)
        .in('id', influencerIds);

      if (influencersError) throw influencersError;

      // Batch fetch all vote stats in one query
      const { data: votes, error: votesError } = await supabase
        .from('votes')
        .select('influencer_id, vote')
        .in('influencer_id', influencerIds);

      if (votesError) throw votesError;

      // Batch fetch all expert reviews in one query
      const { data: expertReviews, error: expertError } = await supabase
        .from('expert_reviews')
        .select('influencer_id, rating, id')
        .in('influencer_id', influencerIds);

      if (expertError) throw expertError;

      // Process vote statistics for all influencers
      const votesByInfluencer = votes?.reduce((acc, vote) => {
        if (!acc[vote.influencer_id]) {
          acc[vote.influencer_id] = { natty: 0, juicy: 0 };
        }
        if (vote.vote === 'natty') {
          acc[vote.influencer_id].natty++;
        } else {
          acc[vote.influencer_id].juicy++;
        }
        return acc;
      }, {} as Record<string, { natty: number; juicy: number }>) || {};

      // Process expert reviews for all influencers
      const expertsByInfluencer = expertReviews?.reduce((acc, review) => {
        if (!acc[review.influencer_id]) {
          acc[review.influencer_id] = [];
        }
        acc[review.influencer_id].push(review);
        return acc;
      }, {} as Record<string, typeof expertReviews>) || {};

      // Combine all data
      return influencers?.map(influencer => {
        const userVotes = votesByInfluencer[influencer.id] || { natty: 0, juicy: 0 };
        const userTotalVotes = userVotes.natty + userVotes.juicy;
        
        const expertReviewsForInfluencer = expertsByInfluencer[influencer.id] || [];
        const expertNattyCount = expertReviewsForInfluencer.filter(review => 
          (review.rating ?? 0) >= 4
        ).length;
        const expertJuicyCount = expertReviewsForInfluencer.length - expertNattyCount;
        
        const totalVotes = userTotalVotes + expertReviewsForInfluencer.length;
        const totalNatty = userVotes.natty + expertNattyCount;
        const totalJuicy = userVotes.juicy + expertJuicyCount;
        
        const nattyPercentage = totalVotes > 0 ? Math.round((totalNatty / totalVotes) * 100) : 0;
        const juicyPercentage = totalVotes > 0 ? (100 - nattyPercentage) : 0;

        return {
          ...influencer,
          vote_stats: {
            total_votes: totalVotes,
            natty_count: totalNatty,
            juicy_count: totalJuicy,
            natty_percentage: nattyPercentage,
            juicy_percentage: juicyPercentage,
          },
          expert_reviews: expertReviewsForInfluencer.map(review => ({
            id: review.id,
            rating: review.rating
          })),
        };
      }) || [];
    },
    enabled: influencerIds.length > 0,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook for getting visible influencer IDs for batch loading
export const useVisibleInfluencerIds = (allInfluencers: any[], visibleRange: [number, number]) => {
  const [start, end] = visibleRange;
  return allInfluencers.slice(start, end).map(inf => inf.id);
};

// Progressive data loading hook that loads in batches
export const useProgressiveInfluencerData = (allInfluencers: any[], batchSize = 12) => {
  const [loadedBatches, setLoadedBatches] = useState(1);
  
  const currentInfluencerIds = useMemo(() => {
    const endIndex = Math.min(loadedBatches * batchSize, allInfluencers.length);
    return allInfluencers.slice(0, endIndex).map(inf => inf.id);
  }, [allInfluencers, loadedBatches, batchSize]);
  
  const batchQuery = useBatchInfluencerData(currentInfluencerIds);
  
  const loadMoreBatch = useCallback(() => {
    if (loadedBatches * batchSize < allInfluencers.length) {
      setLoadedBatches(prev => prev + 1);
    }
  }, [loadedBatches, batchSize, allInfluencers.length]);
  
  return {
    ...batchQuery,
    loadMoreBatch,
    hasMoreBatches: loadedBatches * batchSize < allInfluencers.length,
    loadedCount: Math.min(loadedBatches * batchSize, allInfluencers.length),
    totalCount: allInfluencers.length,
  };
};