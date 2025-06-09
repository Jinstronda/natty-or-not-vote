
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
      
      try {
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
      } catch (error) {
        console.error('Error in vote stats query:', error);
        return {
          influencer_id: influencerId,
          total_votes: 0,
          natty_count: 0,
          juicy_count: 0,
          natty_percentage: 0,
          juicy_percentage: 0
        };
      }
    },
    enabled: !!influencerId,
    staleTime: 30000,
    retry: 1,
  });

  // Get user's vote
  const { data: userVote, isLoading: userVoteLoading } = useQuery({
    queryKey: ['user-vote', influencerId, user?.id],
    queryFn: async () => {
      if (!user || !influencerId) return null;
      
      console.log('Fetching user vote for:', user.id, 'on influencer:', influencerId);
      
      try {
        const { data, error } = await supabase
          .from('votes')
          .select('*')
          .eq('user_id', user.id)
          .eq('influencer_id', influencerId)
          .maybeSingle();

        if (error) {
          console.error('Error fetching user vote:', error);
          return null;
        }
        
        return data;
      } catch (error) {
        console.error('Error in user vote query:', error);
        return null;
      }
    },
    enabled: !!user && !!influencerId,
    staleTime: 300000,
    retry: 1,
  });

  // Get user's review (if any)
  const { data: userReview } = useQuery({
    queryKey: ['user-review', influencerId, user?.id],
    queryFn: async () => {
      if (!user || !influencerId) return null;
      
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('user_id', user.id)
          .eq('influencer_id', influencerId)
          .maybeSingle();

        if (error) {
          console.error('Error fetching user review:', error);
          return null;
        }
        
        return data;
      } catch (error) {
        console.error('Error in user review query:', error);
        return null;
      }
    },
    enabled: !!user && !!influencerId,
    retry: 1,
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
      toast({
        title: "Vote recorded!",
        description: "Your vote has been successfully recorded.",
      });
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

  // Review submission mutation
  const reviewMutation = useMutation({
    mutationFn: async ({ content }: { content: string }) => {
      if (!user || !influencerId || !userVote) {
        throw new Error('Vote required before review');
      }

      const { data, error } = await supabase
        .from('reviews')
        .upsert({
          user_id: user.id,
          influencer_id: influencerId,
          vote: userVote.vote,
          content: content
        })
        .select()
        .single();

      if (error) {
        console.error('Error submitting review:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-review', influencerId, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast({
        title: "Review submitted!",
        description: "Your review has been added.",
      });
    },
    onError: (error) => {
      console.error('Review error:', error);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
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
    userReview,
    isLoading: statsLoading || userVoteLoading,
    castVote: voteMutation.mutate,
    submitReview: reviewMutation.mutate,
    isCasting: voteMutation.isPending,
    isSubmittingReview: reviewMutation.isPending,
    getVotePercentages
  };
};
