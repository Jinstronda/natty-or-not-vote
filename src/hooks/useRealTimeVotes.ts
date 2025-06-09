
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRealTimeVotes = (influencerId?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!influencerId) return;

    console.log('Setting up real-time vote updates for influencer:', influencerId);

    const channel = supabase
      .channel('vote-updates')
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
          
          // Invalidate vote stats to refresh counts
          queryClient.invalidateQueries({ 
            queryKey: ['vote-stats', influencerId] 
          });
          
          // Refresh materialized view for accurate counts
          supabase.rpc('refresh_vote_counts');
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time vote subscription');
      supabase.removeChannel(channel);
    };
  }, [influencerId, queryClient]);
};
