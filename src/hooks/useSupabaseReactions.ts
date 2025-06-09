
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ReviewReaction {
  id: string;
  user_id: string;
  review_id: string;
  reaction_type: 'like' | 'dislike';
  created_at: string;
}

export const useSupabaseReactions = () => {
  const [reactions, setReactions] = useState<ReviewReaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchReactions();
  }, []);

  const fetchReactions = async () => {
    try {
      const { data, error } = await supabase
        .from('review_reactions')
        .select('*');

      if (error) throw error;
      setReactions(data || []);
    } catch (error) {
      console.error('Error fetching reactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleReaction = async (reviewId: string, reactionType: 'like' | 'dislike') => {
    if (!user) return;

    try {
      // Check if user already reacted to this review
      const existingReaction = reactions.find(
        r => r.review_id === reviewId && r.user_id === user.id
      );

      if (existingReaction) {
        if (existingReaction.reaction_type === reactionType) {
          // Remove reaction if clicking the same type
          const { error } = await supabase
            .from('review_reactions')
            .delete()
            .eq('id', existingReaction.id);

          if (error) throw error;
        } else {
          // Update reaction type
          const { error } = await supabase
            .from('review_reactions')
            .update({ reaction_type: reactionType })
            .eq('id', existingReaction.id);

          if (error) throw error;
        }
      } else {
        // Add new reaction
        const { error } = await supabase
          .from('review_reactions')
          .insert({
            user_id: user.id,
            review_id: reviewId,
            reaction_type: reactionType
          });

        if (error) throw error;
      }

      await fetchReactions();
    } catch (error) {
      console.error('Error toggling reaction:', error);
      throw error;
    }
  };

  const getUserReaction = (reviewId: string): ReviewReaction | null => {
    if (!user) return null;
    return reactions.find(
      r => r.review_id === reviewId && r.user_id === user.id
    ) || null;
  };

  return {
    reactions,
    loading,
    toggleReaction,
    getUserReaction,
    refetch: fetchReactions
  };
};
