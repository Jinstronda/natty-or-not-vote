
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Review } from '@/types/vote';
import { useAuth } from '@/contexts/AuthContext';

export const useSupabaseReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Memoize fetchReviews to prevent infinite re-renders
  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('[useSupabaseReviews] Fetching reviews...');
      
      const { data, error: fetchError } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles(username, profile_picture_url)
        `)
        .order('timestamp', { ascending: false });

      if (fetchError) {
        console.error('[useSupabaseReviews] Supabase error:', fetchError);
        throw fetchError;
      }

      const formattedReviews: Review[] = data?.map(review => ({
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

      console.log('[useSupabaseReviews] Fetched reviews:', formattedReviews.length);
      setReviews(formattedReviews);
    } catch (error) {
      console.error('[useSupabaseReviews] Error fetching reviews:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch reviews';
      setError(errorMessage);
      setReviews([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies - this hook fetches all reviews

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const submitReview = async (userId: string, username: string, influencerId: string, vote: 'natty' | 'juicy', content: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          user_id: userId,
          influencer_id: influencerId,
          vote: vote,
          content: content
        });

      if (error) throw error;

      await fetchReviews(); // Refresh reviews
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  };

  const getInfluencerReviews = (influencerId: string): Review[] => {
    return reviews.filter(r => r.influencerId === influencerId);
  };

  const getUserReviews = (userId: string): Review[] => {
    return reviews.filter(r => r.userId === userId);
  };

  const deleteReview = async (reviewId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;

      await fetchReviews(); // Refresh reviews
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  };

  return {
    reviews,
    loading,
    error,
    submitReview,
    getInfluencerReviews,
    getUserReviews,
    deleteReview,
    refetch: fetchReviews
  };
};
