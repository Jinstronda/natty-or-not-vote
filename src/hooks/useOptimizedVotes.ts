
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useOptimizedVotes = (influencerId?: string) => {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  // Cache vote counts using materialized view for performance
  const { data: voteStats, isLoading: statsLoading } = useQuery({
    queryKey: ['vote-stats', influencerId],
    queryFn: async () => {
      if (!influencerId) return null;
      
      const { data, error } = await supabase
        .from('influencer_vote_counts')
        .select('*')
        .eq('influencer_id', influencerId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!influencerId,
    staleTime: 30000, // Cache for 30 seconds
    refetchInterval: 60000, // Refresh every minute
  });

  // Cache user's vote with optimistic updates
  const { data: userVote, isLoading: userVoteLoading } = useQuery({
    queryKey: ['user-vote', influencerId, user?.id],
    queryFn: async () => {
      if (!user || !influencerId) return null;
      
      const { data, error } = await supabase
        .from('votes')
        .select('*')
        .eq('user_id', user.id)
        .eq('influencer_id', influencerId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!influencerId,
    staleTime: 300000, // Cache for 5 minutes
  });

  // Optimized vote mutation with rate limiting check
  const voteMutation = useMutation({
    mutationFn: async ({ vote }: { vote: 'natty' | 'juicy' }) => {
      if (!user || !influencerId) throw new Error('Authentication required');

      // Check rate limiting
      const { data: canVote } = await supabase.rpc('check_vote_rate_limit', {
        user_id: user.id
      });

      if (!canVote) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      const { data, error } = await supabase
        .from('votes')
        .upsert({
          user_id: user.id,
          influencer_id: influencerId,
          vote: vote
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async ({ vote }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['user-vote', influencerId, user?.id] });
      await queryClient.cancelQueries({ queryKey: ['vote-stats', influencerId] });
      
      // Snapshot previous values
      const previousUserVote = queryClient.getQueryData(['user-vote', influencerId, user?.id]);
      const previousVoteStats = queryClient.getQueryData(['vote-stats', influencerId]);
      
      // Optimistically update user vote
      queryClient.setQueryData(['user-vote', influencerId, user?.id], {
        user_id: user?.id,
        influencer_id: influencerId,
        vote: vote,
        timestamp: new Date().toISOString()
      });

      // Optimistically update vote stats
      if (previousVoteStats) {
        const stats = previousVoteStats as any;
        const wasNatty = previousUserVote && (previousUserVote as any).vote === 'natty';
        const wasJuicy = previousUserVote && (previousUserVote as any).vote === 'juicy';
        
        let nattyCount = stats.natty_count || 0;
        let juicyCount = stats.juicy_count || 0;
        let totalVotes = stats.total_votes || 0;

        // Remove previous vote if it existed
        if (wasNatty) {
          nattyCount = Math.max(0, nattyCount - 1);
          totalVotes = Math.max(0, totalVotes - 1);
        } else if (wasJuicy) {
          juicyCount = Math.max(0, juicyCount - 1);
          totalVotes = Math.max(0, totalVotes - 1);
        }

        // Add new vote
        if (vote === 'natty') {
          nattyCount += 1;
        } else {
          juicyCount += 1;
        }

        // If this is a new vote (not changing existing vote)
        if (!previousUserVote) {
          totalVotes += 1;
        } else {
          totalVotes += 1; // We already subtracted the old vote above
        }

        const newStats = {
          ...stats,
          natty_count: nattyCount,
          juicy_count: juicyCount,
          total_votes: totalVotes,
          natty_percentage: totalVotes > 0 ? Math.round((nattyCount / totalVotes) * 100) : 0,
          juicy_percentage: totalVotes > 0 ? Math.round((juicyCount / totalVotes) * 100) : 0
        };

        queryClient.setQueryData(['vote-stats', influencerId], newStats);
      }

      return { previousUserVote, previousVoteStats };
    },
    onError: (error, variables, context) => {
      // Rollback optimistic updates
      if (context?.previousUserVote !== undefined) {
        queryClient.setQueryData(['user-vote', influencerId, user?.id], context.previousUserVote);
      }
      if (context?.previousVoteStats !== undefined) {
        queryClient.setQueryData(['vote-stats', influencerId], context.previousVoteStats);
      }
      
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: async () => {
      // Invalidate and refetch to get the latest server data
      queryClient.invalidateQueries({ queryKey: ['vote-stats', influencerId] });
      queryClient.invalidateQueries({ queryKey: ['user-vote', influencerId, user?.id] });
      
      // Refresh materialized view less aggressively
      setTimeout(async () => {
        try {
          await supabase.rpc('refresh_vote_counts');
        } catch (error) {
          console.error('Failed to refresh vote counts:', error);
        }
      }, 1000);
      
      toast({
        title: "Vote recorded!",
        description: "Your vote has been successfully recorded.",
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
    isLoading: statsLoading || userVoteLoading || authLoading,
    castVote: voteMutation.mutate,
    isCasting: voteMutation.isPending,
    getVotePercentages
  };
};
