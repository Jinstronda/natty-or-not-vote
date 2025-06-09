
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useVoting = (influencerId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const voteMutation = useMutation({
    mutationFn: async (vote: 'natty' | 'juicy') => {
      if (!user?.id) throw new Error('Authentication required');

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
        console.error('Vote submission error:', error);
        throw error;
      }
      
      console.log('Vote submitted successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Vote mutation successful, invalidating queries');
      
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['vote-stats', influencerId] });
      queryClient.invalidateQueries({ queryKey: ['user-vote', influencerId, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['votes'] });
      
      // Also refetch to ensure immediate update
      queryClient.refetchQueries({ queryKey: ['vote-stats', influencerId] });
      queryClient.refetchQueries({ queryKey: ['user-vote', influencerId, user?.id] });
      
      toast({
        title: "Vote recorded!",
        description: `Your vote for ${data.vote} has been successfully recorded.`,
      });
    },
    onError: (error) => {
      console.error('Vote mutation failed:', error);
      toast({
        title: "Error",
        description: "Failed to record vote. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    castVote: voteMutation.mutate,
    isVoting: voteMutation.isPending,
    voteError: voteMutation.error
  };
};
