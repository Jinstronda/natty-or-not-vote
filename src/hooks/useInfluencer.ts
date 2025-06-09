
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useInfluencer = (id: string) => {
  return useQuery({
    queryKey: ['influencer', id],
    queryFn: async () => {
      if (!id) throw new Error('Influencer ID is required');
      
      const { data, error } = await supabase
        .from('influencers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
    staleTime: 300000, // 5 minutes
    retry: 1,
  });
};
