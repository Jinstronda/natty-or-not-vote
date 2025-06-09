
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useVoteStats = (influencerId: string) => {
  return useQuery({
    queryKey: ['vote-stats', influencerId],
    queryFn: async () => {
      if (!influencerId) return null;
      
      const { data: votes, error } = await supabase
        .from('votes')
        .select('vote')
        .eq('influencer_id', influencerId);
          
      if (error) throw error;
      
      const totalVotes = votes?.length || 0;
      const nattyCount = votes?.filter(v => v.vote === 'natty').length || 0;
      const juicyCount = totalVotes - nattyCount;
      
      return {
        influencer_id: influencerId,
        total_votes: totalVotes,
        natty_count: nattyCount,
        juicy_count: juicyCount,
        natty_percentage: totalVotes > 0 ? Math.round((nattyCount / totalVotes) * 100) : 0,
        juicy_percentage: totalVotes > 0 ? Math.round((juicyCount / totalVotes) * 100) : 0
      };
    },
    enabled: !!influencerId,
    staleTime: 30000,
    retry: 1,
  });
};
