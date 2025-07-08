import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import {
  ReviewReply,
  ReplyReaction,
  CreateReplyPayload,
  UpdateReplyPayload,
  ReplyRateLimit
} from '@/types/reply';

export const useReviewReplies = () => {
  const [replies, setReplies] = useState<ReviewReply[]>([]);
  const [reactions, setReactions] = useState<ReplyReaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

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
    } catch (error) {
      console.error('[useReviewReplies] Error fetching replies:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch replies';
      setError(errorMessage);
      setReplies([]);
    } finally {
      setLoading(false);
    }
  }, []); // Remove the dependency that was causing infinite loops

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

      // Get last reply time for countdown - use maybeSingle to handle no replies case
      const { data: lastReply } = await supabase
        .from('review_replies')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      let timeUntilNext = 0;
      
      // Only calculate timeUntilNext if user cannot reply AND has a previous reply
      if (!data && lastReply?.created_at) {
        const lastReplyTime = new Date(lastReply.created_at).getTime();
        const oneMinuteInMs = 1 * 60 * 1000; // 1 minute cooldown
        const timePassed = Date.now() - lastReplyTime;
        timeUntilNext = Math.max(0, oneMinuteInMs - timePassed);
        
        console.log('[useReviewReplies] Rate limit calculation:', {
          lastReplyTime: new Date(lastReply.created_at).toISOString(),
          timePassed: Math.round(timePassed / 1000) + 's',
          timeUntilNext: Math.round(timeUntilNext / 1000) + 's',
          canReply: data
        });
      } else if (!data && !lastReply) {
        // User cannot reply but has no previous replies - this might be a database constraint issue
        console.warn('[useReviewReplies] User cannot reply but has no previous replies - potential DB issue');
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
      const secondsRemaining = Math.ceil(rateLimit.timeUntilNext / 1000);
      const minutesRemaining = Math.ceil(rateLimit.timeUntilNext / (1000 * 60));
      
      if (secondsRemaining <= 0) {
        // Time has expired, should be able to reply now
        console.log('[useReviewReplies] Rate limit expired, allowing reply');
      } else if (minutesRemaining > 0) {
        throw new Error(`Rate limit exceeded. Please wait ${minutesRemaining} minute${minutesRemaining > 1 ? 's' : ''} before replying again.`);
      } else {
        throw new Error(`Rate limit exceeded. Please wait ${secondsRemaining} second${secondsRemaining > 1 ? 's' : ''} before replying again.`);
      }
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

      // Optimistic update - add to local state immediately for YouTube-like UX
      setReplies(prev => {
        // Check if reply already exists to avoid duplicates
        const exists = prev.some(r => r.id === newReply.id);
        if (exists) {
          console.log('[useReviewReplies] Reply already exists in state');
          return prev;
        }
        console.log('[useReviewReplies] Adding reply optimistically:', newReply.id);
        return [...prev, newReply];
      });

      console.log('[useReviewReplies] Reply created successfully:', newReply.id);
      return newReply;
    } catch (error) {
      console.error('[useReviewReplies] Error creating reply:', error);
      throw error;
    }
  }, [user, checkRateLimit]);

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
        // Add new reaction (we need to generate a temporary ID)
        const newReaction: ReplyReaction = {
          id: `temp_${Date.now()}`, // Temporary ID
          reply_id: replyId,
          user_id: user.id,
          reaction_type: reactionType,
          created_at: new Date().toISOString()
        };
        setReactions(prev => [...prev, newReaction]);
      }
    } catch (error) {
      console.error('[useReviewReplies] Error toggling reaction:', error);
      throw error;
    }
  }, [user, reactions]);

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

  // Clean real-time updates - include updates from ALL users for proper YouTube-like behavior
  useEffect(() => {
    if (!user) return;
    
    let channel: any = null;

    const setupChannel = async () => {
      console.log('[useReviewReplies] Setting up real-time subscription for all users');

      try {
        channel = supabase
          .channel(`review_replies_${user.id}_${Date.now()}`)
          .on('postgres_changes', 
            { 
              event: '*', 
              schema: 'public', 
              table: 'review_replies'
              // Remove user filter to allow all updates like YouTube
            },
            (payload) => {
              console.log('[useReviewReplies] Real-time update received:', payload);
              
              // Handle different event types
              if (payload.eventType === 'INSERT') {
                const newReply = payload.new;
                const formattedReply: ReviewReply = {
                  id: newReply.id,
                  review_id: newReply.review_id,
                  parent_reply_id: newReply.parent_reply_id,
                  user_id: newReply.user_id,
                  content: newReply.content,
                  likes: newReply.likes || 0,
                  dislikes: newReply.dislikes || 0,
                  created_at: newReply.created_at,
                  updated_at: newReply.updated_at,
                  user: {
                    username: 'Unknown User', // Will be updated when profiles are fetched
                    profile_picture_url: null
                  }
                };
                
                // Add to state if not already present (avoid duplicates from optimistic updates)
                setReplies(prev => {
                  const exists = prev.some(r => r.id === formattedReply.id);
                  if (exists) {
                    console.log('[useReviewReplies] Reply already exists, skipping duplicate');
                    return prev;
                  }
                  console.log('[useReviewReplies] Adding new reply from real-time:', formattedReply.id);
                  return [...prev, formattedReply];
                });
              } else if (payload.eventType === 'UPDATE') {
                const updatedReply = payload.new;
                setReplies(prev => prev.map(reply => 
                  reply.id === updatedReply.id ? {
                    ...reply,
                    content: updatedReply.content,
                    likes: updatedReply.likes || 0,
                    dislikes: updatedReply.dislikes || 0,
                    updated_at: updatedReply.updated_at
                  } : reply
                ));
              } else if (payload.eventType === 'DELETE') {
                const deletedReply = payload.old;
                setReplies(prev => prev.filter(reply => reply.id !== deletedReply.id));
              }
            }
          )
          .on('postgres_changes',
            { 
              event: '*', 
              schema: 'public', 
              table: 'reply_reactions'
              // Include all reaction updates
            },
            (payload) => {
              console.log('[useReviewReplies] Real-time reaction update:', payload);
              // Refresh reactions when any change occurs
              setTimeout(() => {
                fetchReactions();
              }, 100);
            }
          )
          .subscribe((status) => {
            console.log('[useReviewReplies] Real-time subscription status:', status);
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
  }, [user, fetchReactions]); // Remove fetchReplies dependency to avoid loops

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