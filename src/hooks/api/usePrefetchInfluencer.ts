import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Safe prefetching hook that won't break anything
export const usePrefetchInfluencer = () => {
  const queryClient = useQueryClient();

  const prefetchInfluencerData = async (influencerId: string) => {
    // Only prefetch if data isn't already cached
    const existingData = queryClient.getQueryData(['influencer', influencerId]);
    if (existingData) return; // Already cached, no need to prefetch

    try {
      // Prefetch influencer basic data
      await queryClient.prefetchQuery({
        queryKey: ['influencer', influencerId],
        queryFn: async () => {
          const { data: influencer, error } = await supabase
            .from('influencers')
            .select('*')
            .eq('id', influencerId)
            .single();
          if (error) throw error;
          if (!influencer) return null;

          // Also prefetch photos in the same call for efficiency
          const { data: photos } = await supabase
            .from('influencer_photos')
            .select('*')
            .eq('influencer_id', influencerId)
            .order('order', { ascending: true });

          return {
            ...influencer,
            photos: photos || []
          };
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
      });

      // Prefetch vote stats (commonly needed)
      await queryClient.prefetchQuery({
        queryKey: ['vote-stats', influencerId],
        queryFn: async () => {
          const { data, error } = await supabase
            .from('votes')
            .select('vote')
            .eq('influencer_id', influencerId);

          if (error) throw error;

          const total = data?.length || 0;
          const nattyCount = data?.filter(v => v.vote === 'natty').length || 0;
          const juicyCount = data?.filter(v => v.vote === 'juicy').length || 0;

          return {
            total_votes: total,
            natty_count: nattyCount,
            not_natty_count: juicyCount,
            natty_percentage: total > 0 ? Math.round((nattyCount / total) * 100) : 0,
            not_natty_percentage: total > 0 ? Math.round((juicyCount / total) * 100) : 0,
          };
        },
        staleTime: 30 * 1000, // 30 seconds
      });

    } catch (error) {
      // Silently fail - prefetching is optional enhancement
      console.log('Prefetch failed (non-critical):', error);
    }
  };

  return { prefetchInfluencerData };
};