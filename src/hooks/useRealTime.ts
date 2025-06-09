
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useRealTimeVotes = (influencerId?: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!influencerId) return;

    console.log('Setting up real-time vote updates for influencer:', influencerId);

    const channel = supabase
      .channel(`votes-${influencerId}`)
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
          queryClient.invalidateQueries({ queryKey: ['vote-stats', influencerId] });
          if (user) {
            queryClient.invalidateQueries({ queryKey: ['user-vote', influencerId, user.id] });
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time vote subscription');
      supabase.removeChannel(channel);
    };
  }, [influencerId, user?.id, queryClient]);
};

export const useRealTimeReviews = (influencerId?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!influencerId) return;

    console.log('Setting up real-time review updates for influencer:', influencerId);

    const channel = supabase
      .channel(`reviews-${influencerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reviews',
          filter: `influencer_id=eq.${influencerId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['reviews'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'review_reactions'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['reactions'] });
          queryClient.invalidateQueries({ queryKey: ['reviews'] });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time review subscription');
      supabase.removeChannel(channel);
    };
  }, [influencerId, queryClient]);
};

// Combined hook that sets up both votes and reviews real-time updates
export const useRealTime = (influencerId?: string, context?: string) => {
  useRealTimeVotes(influencerId);
  useRealTimeReviews(influencerId);
  
  useEffect(() => {
    if (context && influencerId) {
      console.log(`Real-time updates enabled for ${context} with influencer:`, influencerId);
    }
  }, [influencerId, context]);
};
