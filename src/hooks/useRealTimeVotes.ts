
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRealTimeVotes = (influencerId?: string, channelSuffix?: string) => {
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!influencerId) return;

    // Clean up any existing channel first
    if (channelRef.current) {
      console.log('Cleaning up existing channel');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Create unique channel name to avoid conflicts
    const channelName = `vote-updates-${channelSuffix || 'default'}-${influencerId}`;
    console.log('Setting up real-time vote updates for influencer:', influencerId, 'with channel:', channelName);

    try {
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
            supabase.rpc('refresh_vote_counts').catch(error => 
              console.error('Failed to refresh vote counts:', error)
            );
          }
        )
        .subscribe((status) => {
          console.log('Real-time subscription status:', status);
        });

      channelRef.current = channel;
    } catch (error) {
      console.error('Failed to set up real-time subscription:', error);
    }

    return () => {
      if (channelRef.current) {
        console.log('Cleaning up real-time vote subscription for channel:', channelName);
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [influencerId, channelSuffix, queryClient]);
};
