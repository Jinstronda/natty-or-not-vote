
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface VoteStats {
  total_votes: number;
  natty_count: number;
  not_natty_count: number;
  natty_percentage: number;
  not_natty_percentage: number;
}

/**
 * Faster vote-stats hook: performs two lightweight HEAD
 * count queries instead of downloading every row.
 */
export const useVoteStats = (influencerId: string) => {
  return useQuery({
    queryKey: ['vote-stats', influencerId],
    queryFn: async (): Promise<VoteStats> => {
      // Run both counts in parallel – Postgres will optimise.
      const [totalRes, nattyRes] = await Promise.all([
        supabase
          .from('votes')
          .select('id', { count: 'exact', head: true })
          .eq('influencer_id', influencerId),
        supabase
          .from('votes')
          .select('id', { count: 'exact', head: true })
          .eq('influencer_id', influencerId)
          .eq('vote', 'natty'),
      ]);

      if (totalRes.error) throw totalRes.error;
      if (nattyRes.error) throw nattyRes.error;

      const total = totalRes.count || 0;
      const nattyCount = nattyRes.count || 0;
      const juicyCount = total - nattyCount;

      return {
        total_votes: total,
        natty_count: nattyCount,
        not_natty_count: juicyCount,
        natty_percentage: total > 0 ? Math.round((nattyCount / total) * 100) : 0,
        not_natty_percentage: total > 0 ? Math.round((juicyCount / total) * 100) : 0,
      };
    },
    enabled: !!influencerId,
    staleTime: 2 * 60 * 1000, // 2 minutes – stats rarely change per user session
     
   });
 };
