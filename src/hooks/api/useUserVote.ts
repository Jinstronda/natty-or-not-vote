
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { withDatabaseTimeout } from '@/utils/loadingTimeout';

export const useUserVote = (influencerId: string) => {
  const { user, loading: authLoading } = useAuth();
  
  return useQuery({
    queryKey: ['user-vote', influencerId, user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('[useUserVote] No user ID available');
        return null;
      }
      
      console.log('[useUserVote] Fetching vote for user:', user.id, 'influencer:', influencerId);
      
      const result = await withDatabaseTimeout(
        () => supabase
          .from('votes')
          .select('*')
          .eq('user_id', user.id)
          .eq('influencer_id', influencerId)
          .maybeSingle(),
        { timeout: 5000, operation: 'getUserVote' }
      );

      if (result.error) {
        console.error('[useUserVote] Error:', result.error);
        throw result.error;
      }
      
      console.log('[useUserVote] Result:', result.data);
      return result.data;
    },
    enabled: !authLoading && !!user?.id && !!influencerId, // Wait for auth to complete
    staleTime: 60 * 1000, // 1 minute for user votes
    retry: (failureCount, error: any) => {
      // Don't retry auth-related errors
      if (error?.code === 'PGRST301' || error?.message?.includes('JWT')) {
        return false;
      }
      return failureCount < 2;
    },
  });
};
