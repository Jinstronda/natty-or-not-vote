
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useInfluencer = (id: string) => {
  return useQuery({
    queryKey: ['influencer', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('influencers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes for profile data
  });
};
