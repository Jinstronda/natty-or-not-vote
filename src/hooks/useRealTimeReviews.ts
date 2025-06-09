
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRealTimeReviews = (influencerId?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!influencerId) return;

    console.log('Setting up real-time review updates for influencer:', influencerId);

    const channel = supabase
      .channel('review-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reviews',
          filter: `influencer_id=eq.${influencerId}`
        },
        (payload) => {
          console.log('Real-time review update:', payload);
          
          // Invalidate reviews query to refresh
          queryClient.invalidateQueries({ 
            queryKey: ['reviews'] 
          });
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
          console.log('Real-time reaction update:', payload);
          
          // Invalidate reactions and reviews to refresh like counts
          queryClient.invalidateQueries({ 
            queryKey: ['reactions'] 
          });
          queryClient.invalidateQueries({ 
            queryKey: ['reviews'] 
          });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time review subscription');
      supabase.removeChannel(channel);
    };
  }, [influencerId, queryClient]);
};
