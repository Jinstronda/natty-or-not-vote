
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useUserVote = (influencerId: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-vote', influencerId, user?.id],
    queryFn: async () => {
      if (!user?.id || !influencerId) return null;
      
      console.log('[useUserVote] Checking vote for user:', user.id, 'influencer:', influencerId);
      
      const { data, error } = await supabase
        .from('votes')
        .select('*')
        .eq('user_id', user.id)
        .eq('influencer_id', influencerId)
        .maybeSingle();

      if (error) {
        console.error('[useUserVote] Error fetching user vote:', error);
        throw error;
      }

      const vote = data ? data.vote as 'natty' | 'juicy' : null;
      console.log('[useUserVote] User vote found:', vote);
      
      return vote;
    },
    enabled: !!user?.id && !!influencerId,
  });
};
