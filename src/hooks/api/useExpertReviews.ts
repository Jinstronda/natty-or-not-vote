import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ExpertReview {
  id: string;
  influencer_id: string;
  author: string;
  content: string;
  rating: number;
  link_url?: string;
  likes: number;
  created_at: string;
  updated_at: string;
  expert_id?: string;
  natty_or_not?: string;
}

/**
 * Optimized expert reviews hook using React Query for consistent caching
 * This replaces the useState-based hook to eliminate race conditions
 */
export const useExpertReviews = (influencerId?: string) => {
  return useQuery({
    queryKey: ['expert-reviews', influencerId],
    queryFn: async (): Promise<ExpertReview[]> => {
      if (!influencerId) return [];
      
      const { data, error } = await supabase
        .from('expert_reviews')
        .select('*')
        .eq('influencer_id', influencerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!influencerId,
    staleTime: 5 * 60 * 1000, // 5 minutes - match vote stats for consistent behavior
    gcTime: 30 * 60 * 1000, // 30 minutes cache time
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch on mount to reduce API calls
    // Performance optimization: don't retry on network errors during search
    retry: (failureCount, error) => {
      if (error?.message?.includes('timed out')) return false;
      return failureCount < 1;
    },
    // Add performance logging in development
    onSuccess: (data) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[ExpertReviews] Loaded ${data.length} reviews for ${influencerId}`);
      }
    },
    onError: (error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error(`[ExpertReviews] Error loading reviews for ${influencerId}:`, error);
      }
    }
  });
};

/**
 * Hook for loading ALL expert reviews (for admin/global use)
 * Separate from individual influencer reviews for better caching
 */
export const useAllExpertReviews = () => {
  return useQuery({
    queryKey: ['expert-reviews', 'all'],
    queryFn: async (): Promise<ExpertReview[]> => {
      const { data, error } = await supabase
        .from('expert_reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - longer for all reviews
    gcTime: 60 * 60 * 1000, // 1 hour cache time
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

/**
 * Utility function to filter expert reviews by influencer from cached data
 * This can be used when all reviews are already loaded
 */
export const getInfluencerExpertReviews = (
  allReviews: ExpertReview[], 
  influencerId: string
): ExpertReview[] => {
  return allReviews.filter(review => review.influencer_id === influencerId);
};