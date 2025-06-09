
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useVoting = (influencerId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vote: 'natty' | 'juicy') => {
      if (!user?.id) throw new Error('Authentication required');

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
    onSuccess: () => {
      // Invalidate and refetch related queries
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
};
