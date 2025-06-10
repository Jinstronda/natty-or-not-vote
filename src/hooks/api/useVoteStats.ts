import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface VoteStats {
  total_votes: number;
  natty_count: number;
  not_natty_count: number;
  natty_percentage: number;
  not_natty_percentage: number;
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
      const notNattyCount = data?.filter(v => v.vote === 'not_natty').length || 0;

      return {
        total_votes: total,
        natty_count: nattyCount,
        not_natty_count: notNattyCount,
        natty_percentage: total > 0 ? Math.round((nattyCount / total) * 100) : 0,
        not_natty_percentage: total > 0 ? Math.round((notNattyCount / total) * 100) : 0,
      };
    },
    enabled: !!influencerId,
    staleTime: 30 * 1000, // 30 seconds for vote stats
  });
};
