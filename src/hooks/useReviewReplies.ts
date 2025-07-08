import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import {
  ReviewReply,
  ReplyReaction,
  CreateReplyPayload,
  UpdateReplyPayload,
  ReplyRateLimit
} from '@/types/reply';

export const useReviewReplies = (onRepliesUpdate?: () => void) => {
  const [replies, setReplies] = useState<ReviewReply[]>([]);
  const [reactions, setReactions] = useState<ReplyReaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all replies with user data
  const fetchReplies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('[useReviewReplies] Fetching replies...');
      
      const { data, error: fetchError } = await supabase
        .from('review_replies')
        .select(`
          *,
          profiles(username, profile_picture_url)
        `)
        .order('created_at', { ascending: true });

      if (fetchError) {
        console.error('[useReviewReplies] Supabase error:', fetchError);
        throw fetchError;
      }

      const formattedReplies: ReviewReply[] = data?.map(reply => ({
        id: reply.id,
        review_id: reply.review_id,
        parent_reply_id: reply.parent_reply_id,
        user_id: reply.user_id,
        content: reply.content,
        likes: reply.likes || 0,
        dislikes: reply.dislikes || 0,
        created_at: reply.created_at,
        updated_at: reply.updated_at,
        user: reply.profiles ? {
          username: reply.profiles.username || 'Unknown User',
          profile_picture_url: reply.profiles.profile_picture_url || null
        } : undefined
      })) || [];

      console.log('[useReviewReplies] Fetched replies:', formattedReplies.length);
      setReplies(formattedReplies);
      
      // Trigger parent refresh if callback provided
      if (onRepliesUpdate) {
        console.log('🔥 Replies updated - triggering parent component refresh');
        onRepliesUpdate();
      }
    } catch (error) {
      console.error('[useReviewReplies] Error fetching replies:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch replies';
      setError(errorMessage);
      setReplies([]);
    } finally {
      setLoading(false);
    }
  }, [onRepliesUpdate]);

  // Fetch reply reactions
  const fetchReactions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('reply_reactions')
        .select('*');

      if (error) throw error;

      const typedReactions: ReplyReaction[] = (data || []).map(item => ({
        id: item.id,
        reply_id: item.reply_id,
        user_id: item.user_id,
        reaction_type: item.reaction_type as 'like' | 'dislike',
        created_at: item.created_at
      }));

      setReactions(typedReactions);
    } catch (error) {
      console.error('[useReviewReplies] Error fetching reactions:', error);
    }
  }, []);

  // Check rate limit for user
  const checkRateLimit = useCallback(async (): Promise<ReplyRateLimit> => {
    if (!user) {
      return { canReply: false, timeUntilNext: 0 };
    }

    try {
      // Check using the database function
      const { data, error } = await supabase
        .rpc('check_reply_rate_limit', { user_id: user.id });

      if (error) throw error;

      // Get last reply time for countdown
      const { data: lastReply } = await supabase
        .from('review_replies')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      let timeUntilNext = 0;
      if (!data && lastReply?.created_at) {
        const lastReplyTime = new Date(lastReply.created_at).getTime();
        const oneMinuteInMs = 1 * 60 * 1000;
        const timePassed = Date.now() - lastReplyTime;
        timeUntilNext = Math.max(0, oneMinuteInMs - timePassed);
      }

      return {
        canReply: data,
        timeUntilNext,
        lastReplyTime: lastReply?.created_at
      };
    } catch (error) {
      console.error('[useReviewReplies] Error checking rate limit:', error);
      return { canReply: false, timeUntilNext: 0 };
    }
  }, [user]);

  // Create a new reply
  const createReply = useCallback(async (payload: CreateReplyPayload): Promise<ReviewReply> => {
    if (!user) {
      throw new Error('Authentication required');
    }

    // Check rate limit first
    const rateLimit = await checkRateLimit();
    if (!rateLimit.canReply) {
      const hoursRemaining = Math.ceil(rateLimit.timeUntilNext / (1000 * 60 * 60));
      throw new Error(`Rate limit exceeded. Please wait ${hoursRemaining} hours before replying again.`);
    }

    try {
      console.log('[useReviewReplies] Creating reply:', payload);

      const { data, error } = await supabase
        .from('review_replies')
        .insert({
          review_id: payload.review_id,
          parent_reply_id: payload.parent_reply_id || null,
          user_id: payload.user_id,
          content: payload.content
        })
        .select(`
          *,
          profiles(username, profile_picture_url)
        `)
        .single();

      if (error) throw error;

      const newReply: ReviewReply = {
        id: data.id,
        review_id: data.review_id,
        parent_reply_id: data.parent_reply_id,
        user_id: data.user_id,
        content: data.content,
        likes: data.likes || 0,
        dislikes: data.dislikes || 0,
        created_at: data.created_at,
        updated_at: data.updated_at,
        user: data.profiles ? {
          username: data.profiles.username || 'Unknown User',
          profile_picture_url: data.profiles.profile_picture_url || null
        } : undefined
      };

      // Optimistic update - add to local state
      setReplies(prev => [...prev, newReply]);

      // Trigger parent refresh for immediate update
      if (onRepliesUpdate) {
        console.log('🔥 New reply created - triggering parent component refresh');
        onRepliesUpdate();
      }

      // Force React Query cache invalidation as backup to WebSocket
      console.log('💫 Reply created - forcing immediate UI refresh via React Query');
      queryClient.invalidateQueries({ queryKey: ['reviews'] });

      console.log('[useReviewReplies] Reply created successfully:', newReply.id);
      return newReply;
    } catch (error) {
      console.error('[useReviewReplies] Error creating reply:', error);
      throw error;
    }
  }, [user, checkRateLimit, onRepliesUpdate, queryClient]);

  // Update an existing reply
  const updateReply = useCallback(async (replyId: string, payload: UpdateReplyPayload): Promise<void> => {
    if (!user) {
      throw new Error('Authentication required');
    }

    try {
      console.log('[useReviewReplies] Updating reply:', replyId, payload);

      const { error } = await supabase
        .from('review_replies')
        .update({
          content: payload.content,
          updated_at: new Date().toISOString()
        })
        .eq('id', replyId)
        .eq('user_id', user.id); // Ensure user can only update their own replies

      if (error) throw error;

      // Optimistic update - update local state
      setReplies(prev => prev.map(reply => 
        reply.id === replyId 
          ? { ...reply, content: payload.content, updated_at: new Date().toISOString() }
          : reply
      ));

      console.log('[useReviewReplies] Reply updated successfully:', replyId);
    } catch (error) {
      console.error('[useReviewReplies] Error updating reply:', error);
      throw error;
    }
  }, [user]);

  // Delete a reply
  const deleteReply = useCallback(async (replyId: string): Promise<void> => {
    if (!user) {
      throw new Error('Authentication required');
    }

    try {
      console.log('[useReviewReplies] Deleting reply:', replyId);

      const { error } = await supabase
        .from('review_replies')
        .delete()
        .eq('id', replyId)
        .eq('user_id', user.id); // Ensure user can only delete their own replies

      if (error) throw error;

      // Optimistic update - remove from local state
      setReplies(prev => prev.filter(reply => reply.id !== replyId));

      console.log('[useReviewReplies] Reply deleted successfully:', replyId);
    } catch (error) {
      console.error('[useReviewReplies] Error deleting reply:', error);
      throw error;
    }
  }, [user]);

  // Toggle reaction on a reply
  const toggleReaction = useCallback(async (replyId: string, reactionType: 'like' | 'dislike'): Promise<void> => {
    if (!user) {
      throw new Error('Authentication required');
    }

    try {
      const existingReaction = reactions.find(
        r => r.reply_id === replyId && r.user_id === user.id
      );

      if (existingReaction) {
        if (existingReaction.reaction_type === reactionType) {
          // Remove reaction if same type
          await supabase
            .from('reply_reactions')
            .delete()
            .eq('id', existingReaction.id);
        } else {
          // Update reaction type
          await supabase
            .from('reply_reactions')
            .update({ reaction_type: reactionType })
            .eq('id', existingReaction.id);
        }
      } else {
        // Create new reaction
        await supabase
          .from('reply_reactions')
          .insert({
            reply_id: replyId,
            user_id: user.id,
            reaction_type: reactionType
          });
      }

      // Refresh reactions to get updated state
      await fetchReactions();
    } catch (error) {
      console.error('[useReviewReplies] Error toggling reaction:', error);
      throw error;
    }
  }, [user, reactions, fetchReactions]);

  // Get user's reaction for a specific reply
  const getUserReaction = useCallback((replyId: string): ReplyReaction | null => {
    if (!user) return null;
    return reactions.find(r => r.reply_id === replyId && r.user_id === user.id) || null;
  }, [user, reactions]);

  // Get replies for a specific review
  const getReviewReplies = useCallback((reviewId: string): ReviewReply[] => {
    return replies.filter(r => r.review_id === reviewId);
  }, [replies]);

  // Get direct replies for a review (no parent)
  const getDirectReplies = useCallback((reviewId: string): ReviewReply[] => {
    return replies.filter(r => r.review_id === reviewId && r.parent_reply_id === null);
  }, [replies]);

  // Get nested replies for a parent reply
  const getNestedReplies = useCallback((parentReplyId: string): ReviewReply[] => {
    return replies.filter(r => r.parent_reply_id === parentReplyId);
  }, [replies]);

  // Get reply count for a review
  const getReplyCount = useCallback((reviewId: string): number => {
    return replies.filter(r => r.review_id === reviewId).length;
  }, [replies]);

  // Subscribe to real-time updates
  useEffect(() => {
    let channel: any = null;

    const setupChannel = async () => {
      console.log('[useReviewReplies] Setting up real-time subscription');

      try {
        channel = supabase
          .channel(`review_replies_changes_${Date.now()}`) // Unique channel name with timestamp
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'review_replies' },
            (payload) => {
              console.log('[useReviewReplies] Real-time update received:', payload);
              // Use setTimeout to prevent blocking the UI
              setTimeout(() => {
                fetchReplies();
              }, 100);
            }
          )
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'reply_reactions' },
            (payload) => {
              console.log('[useReviewReplies] Real-time reaction update received:', payload);
              // Use setTimeout to prevent blocking the UI
              setTimeout(() => {
                fetchReactions();
              }, 100);
            }
          )
          .subscribe((status) => {
            console.log('[useReviewReplies] Subscription status:', status);
          });
      } catch (error) {
        console.error('[useReviewReplies] Error setting up real-time subscription:', error);
      }
    };

    setupChannel();

    return () => {
      if (channel) {
        console.log('[useReviewReplies] Cleaning up real-time subscription');
        supabase.removeChannel(channel);
      }
    };
  }, []); // Empty dependency array to prevent re-subscription

  // Initial data fetch
  useEffect(() => {
    fetchReplies();
    fetchReactions();
  }, [fetchReplies, fetchReactions]);

  return {
    replies,
    reactions,
    loading,
    error,
    createReply,
    updateReply,
    deleteReply,
    toggleReaction,
    getUserReaction,
    getReviewReplies,
    getDirectReplies,
    getNestedReplies,
    getReplyCount,
    checkRateLimit,
    refetch: fetchReplies
  };
};