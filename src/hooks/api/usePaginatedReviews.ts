import { useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Review } from '@/types/vote';
import { withDatabaseTimeout } from '@/utils/loadingTimeout';

export type ReviewSortOption = 'recent' | 'likes';

interface PaginatedReviewsOptions {
  influencerId: string;
  pageSize?: number;
  sortBy?: ReviewSortOption;
}

interface PaginatedReviewsState {
  reviews: Review[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  totalCount: number;
  sortBy: ReviewSortOption;
}

// Safe hook that adds pagination and sorting without breaking existing functionality
export const usePaginatedReviews = ({ 
  influencerId, 
  pageSize = 10, 
  sortBy = 'recent' 
}: PaginatedReviewsOptions) => {
  const [state, setState] = useState<PaginatedReviewsState>({
    reviews: [],
    loading: false,
    error: null,
    hasMore: true,
    currentPage: 0,
    totalCount: 0,
    sortBy
  });

  // Fetch reviews with pagination and sorting
  const fetchReviews = useCallback(async (
    page: number = 0, 
    sort: ReviewSortOption = 'recent',
    append: boolean = false
  ) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      console.log(`[PaginatedReviews] Fetching page ${page + 1}, sort: ${sort}, append: ${append}`);

      const result = await withDatabaseTimeout(
        async () => {
          // Get total count first (only on first load or sort change)
          let totalCount = 0;
          if (page === 0 && !append) {
            const { count, error: countError } = await supabase
              .from('reviews')
              .select('id', { count: 'exact', head: true })
              .eq('influencer_id', influencerId);

            if (countError) {
              console.warn('[PaginatedReviews] Count error:', countError);
              totalCount = 0;
            } else {
              totalCount = count || 0;
            }
          }

          // Build query with sorting
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
            // Sort by likes descending, then by timestamp for ties
            query = query.order('likes', { ascending: false })
                         .order('timestamp', { ascending: false });
          }

          // Apply pagination
          const from = page * pageSize;
          const to = from + pageSize - 1;
          query = query.range(from, to);

          const { data, error: fetchError } = await query;

          if (fetchError) {
            console.error('[PaginatedReviews] Database error:', fetchError);
            throw fetchError;
          }

          return { data, totalCount };
        },
        { 
          timeout: 10000, 
          retries: 2, 
          operation: `fetchPaginatedReviews_${influencerId}_${page}_${sort}` 
        }
      );

      // Format reviews
      const formattedReviews: Review[] = result.data?.map(review => ({
        id: review.id,
        userId: review.user_id,
        username: review.profiles?.username || 'Unknown User',
        profilePicture: review.profiles?.profile_picture_url || undefined,
        influencerId: review.influencer_id,
        vote: review.vote as 'natty' | 'juicy',
        content: review.content,
        timestamp: review.timestamp,
        likes: review.likes || 0,
        dislikes: review.dislikes || 0,
      })) || [];

      console.log(`[PaginatedReviews] Loaded ${formattedReviews.length} reviews`);

      setState(prev => ({
        ...prev,
        reviews: append ? [...prev.reviews, ...formattedReviews] : formattedReviews,
        loading: false,
        hasMore: formattedReviews.length === pageSize,
        currentPage: page,
        totalCount: page === 0 && !append ? result.totalCount : prev.totalCount,
        sortBy: sort
      }));

    } catch (error) {
      console.error('[PaginatedReviews] Error fetching reviews:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
        reviews: append ? prev.reviews : []
      }));
    }
  }, [influencerId, pageSize]);

  // Load more reviews (pagination)
  const loadMore = useCallback(async () => {
    if (state.loading || !state.hasMore) return;
    await fetchReviews(state.currentPage + 1, state.sortBy, true);
  }, [fetchReviews, state.loading, state.hasMore, state.currentPage, state.sortBy]);

  // Change sorting
  const changeSorting = useCallback(async (newSort: ReviewSortOption) => {
    if (newSort === state.sortBy || state.loading) return;
    await fetchReviews(0, newSort, false);
  }, [fetchReviews, state.sortBy, state.loading]);

  // Refresh reviews (reset to page 1)
  const refresh = useCallback(async () => {
    await fetchReviews(0, state.sortBy, false);
  }, [fetchReviews, state.sortBy]);

  // Computed values
  const stats = useMemo(() => ({
    totalPages: Math.ceil(state.totalCount / pageSize),
    currentPageDisplay: state.currentPage + 1,
    hasNextPage: state.hasMore,
    loadedCount: state.reviews.length,
    totalCount: state.totalCount
  }), [state.totalCount, state.currentPage, state.hasMore, state.reviews.length, pageSize]);

  return {
    ...state,
    stats,
    loadMore,
    changeSorting,
    refresh,
    initialLoad: () => fetchReviews(0, sortBy, false)
  };
};