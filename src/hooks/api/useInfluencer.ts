import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useInfluencer = (id: string) => {
  return useQuery({
    queryKey: ['influencer', id],
    queryFn: async () => {
      const { data: influencer, error } = await supabase
        .from('influencers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!influencer) throw new Error('Influencer not found');

      // Fetch all photos for this influencer
      const { data: photos, error: photosError } = await supabase
        .from('influencer_photos')
        .select('id, image_url, description')
        .eq('influencer_id', id)
        .order('created_at', { ascending: true });

      if (photosError) throw photosError;

      return { ...influencer, photos: photos || [] };
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes for profile data
  });
};
