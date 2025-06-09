
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useVotes = (influencerId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get vote statistics
  const { data: voteStats, isLoading: statsLoading } = useQuery({
    queryKey: ['vote-stats', influencerId],
    queryFn: async () => {
      if (!influencerId) return null;
      
      console.log('Fetching vote stats for influencer:', influencerId);
      
      const { data: votes, error } = await supabase
        .from('votes')
        .select('vote')
        .eq('influencer_id', influencerId);
          
      if (error) {
        console.error('Error fetching votes:', error);
        throw error;
      }
      
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
  });

  // Get user's vote
  const { data: userVote, isLoading: userVoteLoading } = useQuery({
    queryKey: ['user-vote', influencerId, user?.id],
    queryFn: async () => {
      if (!user || !influencerId) return null;
      
      console.log('Fetching user vote for:', user.id, 'on influencer:', influencerId);
      
      const { data, error } = await supabase
        .from('votes')
        .select('*')
        .eq('user_id', user.id)
        .eq('influencer_id', influencerId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user vote:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!user && !!influencerId,
    staleTime: 300000,
  });

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async ({ vote }: { vote: 'natty' | 'juicy' }) => {
      if (!user || !influencerId) throw new Error('Authentication required');

      console.log('Submitting vote:', vote, 'for user:', user.id, 'on influencer:', influencerId);

      const { data, error } = await supabase
        .from('votes')
        .upsert({
          user_id: user.id,
          influencer_id: influencerId,
          vote: vote
        })
        .select()
        .single();

      if (error) {
        console.error('Error submitting vote:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      console.log('Vote successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['vote-stats', influencerId] });
      queryClient.invalidateQueries({ queryKey: ['user-vote', influencerId, user?.id] });
    },
    onError: (error) => {
      console.error('Vote error:', error);
      toast({
        title: "Error",
        description: "Failed to record vote. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getVotePercentages = () => {
    if (!voteStats || !voteStats.total_votes) {
      return { natty: 0, juicy: 0, total: 0 };
    }

    return {
      natty: voteStats.natty_percentage || 0,
      juicy: voteStats.juicy_percentage || 0,
      total: voteStats.total_votes || 0
    };
  };

  return {
    voteStats,
    userVote,
    isLoading: statsLoading || userVoteLoading,
    castVote: voteMutation.mutate,
    isCasting: voteMutation.isPending,
    getVotePercentages
  };
};
