
import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Global map to track active channels to prevent duplicates
const activeChannels = new Map<string, any>();

export const useRealTimeVotes = (influencerId?: string, channelSuffix?: string) => {
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);
  const { user } = useAuth();

  // Debounced invalidation to prevent excessive queries
  const debouncedInvalidate = useCallback(() => {
    const timeoutId = setTimeout(() => {
      if (influencerId) {
        queryClient.invalidateQueries({ 
          queryKey: ['vote-stats', influencerId] 
        });
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [queryClient, influencerId]);

  useEffect(() => {
    // Don't set up real-time if no influencer or user
    if (!influencerId || !user) return;

    // Create unique channel name to avoid conflicts
    const channelName = `vote-updates-${channelSuffix || 'default'}-${influencerId}`;
    
    // Check if this channel is already active
    if (activeChannels.has(channelName)) {
      console.log('Channel already active, skipping:', channelName);
      return;
    }

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
          async (payload) => {
            console.log('Real-time vote update:', payload);
            
            // Use debounced invalidation to prevent excessive queries
            debouncedInvalidate();
            
            // Refresh materialized view less frequently
            if (Math.random() < 0.3) { // Only 30% of the time
              try {
                await supabase.rpc('refresh_vote_counts');
              } catch (error) {
                console.error('Failed to refresh vote counts:', error);
              }
            }
          }
        )
        .subscribe((status) => {
          console.log('Real-time subscription status:', status, 'for channel:', channelName);
        });

      channelRef.current = channel;
      activeChannels.set(channelName, channel);

    } catch (error) {
      console.error('Failed to set up real-time subscription:', error);
    }

    return () => {
      if (channelRef.current) {
        console.log('Cleaning up real-time vote subscription for channel:', channelName);
        supabase.removeChannel(channelRef.current);
        activeChannels.delete(channelName);
        channelRef.current = null;
      }
    };
  }, [influencerId, channelSuffix, user, debouncedInvalidate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        const channelName = `vote-updates-${channelSuffix || 'default'}-${influencerId}`;
        supabase.removeChannel(channelRef.current);
        activeChannels.delete(channelName);
        channelRef.current = null;
      }
    };
  }, []);
};
