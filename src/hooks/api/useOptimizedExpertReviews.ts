import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ExpertReview } from '@/types/vote';

export interface OptimizedExpertReview extends ExpertReview {
  expert?: {
    id: string;
    name: string;
    profile_picture_url?: string;
  };
  influencer?: {
    id: string;
    name: string;
  };
}

/**
 * SAFE OPTIMIZATION: Batched expert reviews hook
 * Follows the same pattern as useBatchInfluencerData
 * Reduces 4 API calls to 1 batched call
 */
export const useOptimizedExpertReviews = (influencerId?: string) => {
  return useQuery({
    queryKey: ['expert-reviews-optimized', influencerId],
    queryFn: async (): Promise<OptimizedExpertReview[]> => {
      if (!influencerId) return [];
      
      // SAFE: Single batched query like useBatchInfluencerData
      const { data: reviews, error } = await supabase
        .from('expert_reviews')
        .select(`
          *,
          expert:experts!expert_id(id, name, profile_picture_url),
          influencer:influencers!influencer_id(id, name)
        `)
        .eq('influencer_id', influencerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // SAFE: Transform to match existing interface
      return (reviews || []).map(review => ({
        ...review,
        expert: review.expert || undefined,
        influencer: review.influencer || undefined
      }));
    },
    enabled: !!influencerId,
    // SAFE: Use same caching strategy as vote stats
    staleTime: 2 * 60 * 1000, // 2 minutes like vote stats
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    // SAFE: Same retry logic as useExpertReviews
    retry: (failureCount, error) => {
      if (error?.message?.includes('timed out')) return false;
      return failureCount < 1;
    },
    // SAFE: Same logging as useExpertReviews
    onSuccess: (data) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[OptimizedExpertReviews] Loaded ${data.length} reviews for ${influencerId}`);
      }
    },
    onError: (error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error(`[OptimizedExpertReviews] Error loading reviews for ${influencerId}:`, error);
      }
    }
  });
};

/**
 * SAFE OPTIMIZATION: Admin hook for all expert reviews with related data
 * Follows the same pattern as useAllExpertReviews but with batched relations
 */
export const useOptimizedAllExpertReviews = () => {
  return useQuery({
    queryKey: ['expert-reviews-optimized', 'all'],
    queryFn: async (): Promise<OptimizedExpertReview[]> => {
      // SAFE: Single batched query for admin use
      const { data: reviews, error } = await supabase
        .from('expert_reviews')
        .select(`
          *,
          expert:experts!expert_id(id, name, profile_picture_url),
          influencer:influencers!influencer_id(id, name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // SAFE: Transform to match existing interface
      return (reviews || []).map(review => ({
        ...review,
        expert: review.expert || undefined,
        influencer: review.influencer || undefined
      }));
    },
    // SAFE: Same caching strategy as useAllExpertReviews
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};