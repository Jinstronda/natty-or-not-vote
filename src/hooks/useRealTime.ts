
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useRealTimeVotes = (influencerId?: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!influencerId) return;

    const setupChannel = async () => {
      // Clean up existing channel first
      if (channelRef.current) {
        console.log('Cleaning up existing vote channel');
        await supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

    console.log('Setting up real-time vote updates for influencer:', influencerId);

    const channel = supabase
      .channel(`votes-${influencerId}-${Date.now()}`) // Add timestamp to ensure unique channels
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes',
          filter: `influencer_id=eq.${influencerId}`
        },
        (payload) => {
          console.log('Real-time vote update:', payload);
          // Use setTimeout to prevent blocking
          setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ['vote-stats', influencerId] });
            if (user?.id) {
              queryClient.invalidateQueries({ queryKey: ['user-vote', influencerId, user.id] });
            }
          }, 0);
        }
      )
      .subscribe();

    channelRef.current = channel;
    };

    setupChannel();

    return () => {
      if (channelRef.current) {
        console.log('Cleaning up real-time vote subscription');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [influencerId, user?.id, queryClient]);
};

export const useRealTimeReviews = (influencerId?: string, onReviewsUpdate?: () => void) => {
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!influencerId) return;

    const setupChannel = async () => {
      // Clean up existing channel first
      if (channelRef.current) {
        console.log('Cleaning up existing review channel');
        await supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

    console.log('Setting up real-time review updates for influencer:', influencerId);

    const channel = supabase
      .channel(`reviews-${influencerId}-${Date.now()}`) // Add timestamp to ensure unique channels
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reviews',
          filter: `influencer_id=eq.${influencerId}`
        },
        (payload) => {
          console.log('Real-time review update received:', payload);
          // Use setTimeout to prevent blocking
          setTimeout(() => {
            // Call the component callback if provided (for direct state updates)
            if (onReviewsUpdate) {
              console.log('Triggering component review refresh via callback');
              onReviewsUpdate();
            }
            // Still invalidate React Query cache for compatibility
            queryClient.invalidateQueries({ queryKey: ['reviews'] });
          }, 0);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'review_reactions'
        },
        (payload) => {
          console.log('Real-time review reaction update received:', payload);
          // Use setTimeout to prevent blocking
          setTimeout(() => {
            // Call the component callback for reactions too
            if (onReviewsUpdate) {
              console.log('Triggering component review refresh via callback (reactions)');
              onReviewsUpdate();
            }
            // Still invalidate React Query cache for compatibility
            queryClient.invalidateQueries({ queryKey: ['reactions'] });
            queryClient.invalidateQueries({ queryKey: ['reviews'] });
          }, 0);
        }
      )
      .subscribe();

    channelRef.current = channel;
    };

    setupChannel();

    return () => {
      if (channelRef.current) {
        console.log('Cleaning up real-time review subscription');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [influencerId, queryClient, onReviewsUpdate]);
};

export const useRealTimeReplies = (influencerId?: string) => {
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!influencerId) return;

    const setupChannel = async () => {
      // Clean up existing channel first
      if (channelRef.current) {
        console.log('Cleaning up existing reply channel');
        await supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

    console.log('Setting up real-time reply updates for influencer:', influencerId);

    const channel = supabase
      .channel(`replies-${influencerId}-${Date.now()}`) // Add timestamp to ensure unique channels
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'review_replies',
          filter: `review_id=in.(SELECT id FROM reviews WHERE influencer_id='${influencerId}')`
        },
        (payload) => {
          console.log('Real-time reply update:', payload);
          // Use setTimeout to prevent blocking
          setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ['replies'] });
            queryClient.invalidateQueries({ queryKey: ['reviews'] });
            queryClient.invalidateQueries({ queryKey: ['nested-replies'] });
          }, 0);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reply_reactions'
        },
        (payload) => {
          console.log('Real-time reply reaction update:', payload);
          // Use setTimeout to prevent blocking
          setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ['reply-reactions'] });
            queryClient.invalidateQueries({ queryKey: ['replies'] });
          }, 0);
        }
      )
      .subscribe();

    channelRef.current = channel;
    };

    setupChannel();

    return () => {
      if (channelRef.current) {
        console.log('Cleaning up real-time reply subscription');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [influencerId, queryClient]);
};

// Combined hook that sets up votes, reviews, and replies real-time updates
export const useRealTime = (influencerId?: string, context?: string, onReviewsUpdate?: () => void) => {
  useRealTimeVotes(influencerId);
  useRealTimeReviews(influencerId, onReviewsUpdate);
  useRealTimeReplies(influencerId);
  
  useEffect(() => {
    if (context && influencerId) {
      console.log(`Real-time updates enabled for ${context} with influencer:`, influencerId);
    }
  }, [influencerId, context]);
};
