
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRealTimeVotes = (influencerId?: string, channelSuffix?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!influencerId) return;

    // Create unique channel name to avoid conflicts
    const channelName = `vote-updates-${channelSuffix || 'default'}-${influencerId}`;
    console.log('Setting up real-time vote updates for influencer:', influencerId, 'with channel:', channelName);

    const channel = supabase
      .channel(channelName)
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
      console.log('Cleaning up real-time vote subscription for channel:', channelName);
      supabase.removeChannel(channel);
    };
  }, [influencerId, channelSuffix, queryClient]);
};
