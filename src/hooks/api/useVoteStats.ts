
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface VoteStats {
  total_votes: number;
  natty_count: number;
  juicy_count: number;
  natty_percentage: number;
  juicy_percentage: number;
}

export const useVoteStats = (influencerId: string) => {
  return useQuery({
    queryKey: ['vote-stats', influencerId],
    queryFn: async (): Promise<VoteStats> => {
      const { data, error } = await supabase
        .from('votes')
        .select('vote')
        .eq('influencer_id', influencerId);

      if (error) throw error;

      const total = data?.length || 0;
      const nattyCount = data?.filter(v => v.vote === 'natty').length || 0;
      const juicyCount = total - nattyCount;

      return {
        total_votes: total,
        natty_count: nattyCount,
        juicy_count: juicyCount,
        natty_percentage: total > 0 ? Math.round((nattyCount / total) * 100) : 0,
        juicy_percentage: total > 0 ? Math.round((juicyCount / total) * 100) : 0,
      };
    },
    enabled: !!influencerId,
    staleTime: 30 * 1000, // 30 seconds for vote stats
  });
};
