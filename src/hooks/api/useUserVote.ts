
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useUserVote = (influencerId: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-vote', influencerId, user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('votes')
        .select('*')
        .eq('user_id', user.id)
        .eq('influencer_id', influencerId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && !!influencerId,
    staleTime: 60 * 1000, // 1 minute for user votes
  });
};
