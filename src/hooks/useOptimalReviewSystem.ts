import { useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Review } from '@/types/vote';
import { useOptimalLoading } from './useOptimalLoading';

export type ReviewSortOption = 'recent' | 'likes';

interface OptimalReviewOptions {
  influencerId: string;
  pageSize?: number;
  sortBy?: ReviewSortOption;
}

interface ReviewStats {
  totalCount: number;
  nattyCount: number;
  juicyCount: number;
  nattyPercentage: number;
  juicyPercentage: number;
}

/**
 * Optimized review system with unified loading and batched queries
 * - Single API call for all review data
 * - Integrated statistics calculation
 * - Performance-first approach
 * - Mobile-optimized
 */
export const useOptimalReviewSystem = ({
  influencerId,
  pageSize = 10,
  sortBy = 'recent'
}: OptimalReviewOptions) => {
  
  const loading = useOptimalLoading<{
    reviews: Review[];
    stats: ReviewStats;
    hasMore: boolean;
    currentPage: number;
  }>({
    timeout: 8000,
    maxRetries: 2,
    enableProgress: true,
    key: `review-system-${influencerId}`
  });

  // Optimized single query that gets everything needed
  const fetchReviewData = useCallback(async (
    page: number = 0,
    sort: ReviewSortOption = 'recent',
    signal: AbortSignal
  ) => {
    console.log(`[OptimalReviewSystem] Fetching page ${page + 1} with sort: ${sort}`);

    // Single batched query for all data
    const batchPromises = await Promise.allSettled([
      // 1. Get paginated reviews with user data
      (async () => {
        let query = supabase
          .from('reviews')
          .select(`
            *,
            profiles(username, profile_picture_url)
          `)
          .eq('influencer_id', influencerId);

        // Apply sorting
        if (sort === 'recent') {
          query = query.order('timestamp', { ascending: false });
        } else if (sort === 'likes') {
          query = query.order('likes', { ascending: false })
                       .order('timestamp', { ascending: false });
        }

        // Apply pagination
        const from = page * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);

        return query;
      })(),

      // 2. Get total count and statistics
      (async () => {
        const [countResult, statsResult] = await Promise.all([
          supabase
            .from('reviews')
            .select('id', { count: 'exact', head: true })
            .eq('influencer_id', influencerId),
          
          supabase
            .from('reviews')
            .select('vote')
            .eq('influencer_id', influencerId)
        ]);

        return { countResult, statsResult };
      })()
    ]);

    // Check for abort
    if (signal.aborted) {
      throw new Error('Request was aborted');
    }

    // Process results
    const reviewsResult = batchPromises[0];
    const countsResult = batchPromises[1];

    if (reviewsResult.status === 'rejected') {
      throw new Error(`Failed to fetch reviews: ${reviewsResult.reason?.message || 'Unknown error'}`);
    }

    if (countsResult.status === 'rejected') {
      throw new Error(`Failed to fetch statistics: ${countsResult.reason?.message || 'Unknown error'}`);
    }

    const { data: reviewsData, error: reviewsError } = reviewsResult.value;
    const { countResult, statsResult } = countsResult.value;

    if (reviewsError) throw reviewsError;
    if (countResult.error) throw countResult.error;
    if (statsResult.error) throw statsResult.error;

    // Format reviews
    const reviews: Review[] = reviewsData?.map(review => ({
      id: review.id,
      userId: review.user_id,
      username: review.profiles?.username || 'Unknown User',
      profilePicture: review.profiles?.profile_picture_url || undefined,
      influencerId: review.influencer_id,
      vote: review.vote as 'natty' | 'juicy',
      content: review.content,
      timestamp: review.timestamp,
      likes: review.likes || 0
    })) || [];

    // Calculate statistics
    const totalCount = countResult.count || 0;
    const voteStats = statsResult.data || [];
    const nattyCount = voteStats.filter(v => v.vote === 'natty').length;
    const juicyCount = voteStats.filter(v => v.vote === 'juicy').length;
    
    const stats: ReviewStats = {
      totalCount,
      nattyCount,
      juicyCount,
      nattyPercentage: totalCount > 0 ? Math.round((nattyCount / totalCount) * 100) : 0,
      juicyPercentage: totalCount > 0 ? Math.round((juicyCount / totalCount) * 100) : 0
    };

    // Check if there are more pages
    const hasMore = totalCount > (page + 1) * pageSize;

    console.log(`[OptimalReviewSystem] Loaded ${reviews.length} reviews, ${totalCount} total`);

    return {
      reviews,
      stats,
      hasMore,
      currentPage: page
    };

  }, [influencerId, pageSize]);

  // Load initial data
  const loadReviews = useCallback((
    page: number = 0,
    sort: ReviewSortOption = 'recent'
  ) => {
    return loading.execute((signal) => fetchReviewData(page, sort, signal));
  }, [loading.execute, fetchReviewData]);

  // Load more reviews (pagination)
  const loadMore = useCallback(() => {
    if (loading.data && loading.data.hasMore && !loading.isLoading) {
      return loadReviews(loading.data.currentPage + 1, sortBy);
    }
  }, [loading.data, loading.isLoading, loadReviews, sortBy]);

  // Change sorting
  const changeSorting = useCallback((newSort: ReviewSortOption) => {
    return loadReviews(0, newSort);
  }, [loadReviews]);

  // Refresh current data
  const refresh = useCallback(() => {
    const currentPage = loading.data?.currentPage || 0;
    return loadReviews(currentPage, sortBy);
  }, [loading.data?.currentPage, loadReviews, sortBy]);

  // Memoized derived state
  const derivedState = useMemo(() => ({
    reviews: loading.data?.reviews || [],
    stats: loading.data?.stats || {
      totalCount: 0,
      nattyCount: 0,
      juicyCount: 0,
      nattyPercentage: 0,
      juicyPercentage: 0
    },
    hasMore: loading.data?.hasMore || false,
    currentPage: loading.data?.currentPage || 0,
    loadedCount: loading.data?.reviews?.length || 0
  }), [loading.data]);

  return {
    // Loading states
    ...loading,
    
    // Data
    ...derivedState,
    
    // Actions
    loadReviews,
    loadMore,
    changeSorting,
    refresh,
    
    // Computed properties
    isEmpty: loading.isSuccess && derivedState.reviews.length === 0,
    isFirstLoad: loading.phase === 'loading' && derivedState.reviews.length === 0,
    isLoadingMore: loading.phase === 'loading' && derivedState.reviews.length > 0,
    
    // Current sort
    sortBy
  };
};