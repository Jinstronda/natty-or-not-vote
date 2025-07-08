
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ReviewReaction } from '@/types/vote';

export const useSupabaseReactions = () => {
  const [reactions, setReactions] = useState<ReviewReaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchReactions = async () => {
    try {
      const { data, error } = await supabase
        .from('review_reactions')
        .select('*');

      if (error) throw error;

      // Type cast the response to match our interface
      const typedReactions: ReviewReaction[] = (data || []).map(item => ({
        id: item.id,
        user_id: item.user_id,
        review_id: item.review_id,
        reaction_type: item.reaction_type as 'like' | 'dislike',
        created_at: item.created_at
      }));

      setReactions(typedReactions);
    } catch (error) {
      console.error('Error fetching reactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReactions();
  }, []);

  const toggleReaction = async (reviewId: string, reactionType: 'like' | 'dislike') => {
    if (!user) return;

    try {
      const existingReaction = reactions.find(
        r => r.review_id === reviewId && r.user_id === user.id
      );

      if (existingReaction) {
        if (existingReaction.reaction_type === reactionType) {
          // Remove reaction if same type
          await supabase
            .from('review_reactions')
            .delete()
            .eq('id', existingReaction.id);
        } else {
          // Update reaction type
          await supabase
            .from('review_reactions')
            .update({ reaction_type: reactionType })
            .eq('id', existingReaction.id);
        }
      } else {
        // Create new reaction
        await supabase
          .from('review_reactions')
          .insert({
            user_id: user.id,
            review_id: reviewId,
            reaction_type: reactionType
          });
      }

      // Optimistic update - update local reactions state
      if (existingReaction) {
        if (existingReaction.reaction_type === reactionType) {
          // Remove reaction
          setReactions(prev => prev.filter(r => r.id !== existingReaction.id));
        } else {
          // Update reaction type
          setReactions(prev => prev.map(r => 
            r.id === existingReaction.id 
              ? { ...r, reaction_type: reactionType }
              : r
          ));
        }
      } else {
        // Add new reaction
        const newReaction: ReviewReaction = {
          id: `temp_${Date.now()}`, // Temporary ID
          user_id: user.id,
          review_id: reviewId,
          reaction_type: reactionType,
          created_at: new Date().toISOString()
        };
        setReactions(prev => [...prev, newReaction]);
      }
    } catch (error) {
      console.error('Error toggling reaction:', error);
      throw error;
    }
  };

  const getUserReaction = (reviewId: string) => {
    if (!user) return null;
    return reactions.find(r => r.review_id === reviewId && r.user_id === user.id) || null;
  };

  return {
    reactions,
    loading,
    toggleReaction,
    getUserReaction
  };
};
