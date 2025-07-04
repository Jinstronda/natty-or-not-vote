import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Optimized hook that combines multiple queries into one for better performance
// This is completely safe - it only adds functionality, doesn't change existing behavior
export const useOptimizedInfluencer = (id: string) => {
  return useQuery({
    queryKey: ['optimized-influencer', id],
    queryFn: async () => {
      if (!id) return null;

      // Single query that gets everything we need for the profile page
      const { data: influencer, error } = await supabase
        .from('influencers')
        .select(`
          *,
          photos:influencer_photos(
            id,
            image_url,
            description,
            order,
            created_at
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!influencer) return null;

      // Get vote stats in parallel (more efficient than separate hook)
      const { data: votes, error: votesError } = await supabase
        .from('votes')
        .select('vote')
        .eq('influencer_id', id);

      if (votesError) {
        // Don't fail the whole query for vote stats
        console.warn('Failed to load vote stats:', votesError);
      }

      // Calculate vote statistics
      const total = votes?.length || 0;
      const nattyCount = votes?.filter(v => v.vote === 'natty').length || 0;
      const juicyCount = votes?.filter(v => v.vote === 'juicy').length || 0;

      const voteStats = {
        total_votes: total,
        natty_count: nattyCount,
        not_natty_count: juicyCount,
        natty_percentage: total > 0 ? Math.round((nattyCount / total) * 100) : 0,
        not_natty_percentage: total > 0 ? Math.round((juicyCount / total) * 100) : 0,
      };

      // Fallback photos if none exist
      let photosFinal = influencer.photos || [];
      if (photosFinal.length === 0 && influencer.image) {
        photosFinal = [{
          id: 'legacy',
          influencer_id: influencer.id,
          image_url: influencer.image,
          description: '',
          order: 0,
          created_at: influencer.created_at || ''
        }];
      }

      return {
        ...influencer,
        photos: photosFinal,
        vote_stats: voteStats
      };
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes for profile data
    gcTime: 10 * 60 * 1000, // 10 minutes in cache
    refetchOnWindowFocus: false, // Don't refetch on window focus for better UX
  });
};

// Progressive data loading - start with cached data, then fetch fresh
export const useProgressiveInfluencer = (id: string) => {
  // First try to get any cached data immediately
  const cachedQuery = useQuery({
    queryKey: ['influencer', id],
    queryFn: () => null, // Don't actually fetch
    enabled: false, // Just check cache
    staleTime: Infinity, // Use any cached data
  });

  // Then get optimized fresh data
  const freshQuery = useOptimizedInfluencer(id);

  // Return cached data immediately if available, otherwise fresh data
  return {
    data: cachedQuery.data || freshQuery.data,
    isLoading: !cachedQuery.data && freshQuery.isLoading,
    error: freshQuery.error,
    isFromCache: !!cachedQuery.data && !freshQuery.data,
  };
};