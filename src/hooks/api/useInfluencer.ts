import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Influencer, InfluencerPhoto } from '@/types/vote';

export const useInfluencer = (id: string) => {
  return useQuery({
    queryKey: ['influencer', id],
    queryFn: async () => {
      // Fetch influencer
      const { data: influencer, error } = await supabase
        .from('influencers')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      if (!influencer) return null;

      // Fetch photos
      const { data: photos, error: photoError } = await supabase
        .from('influencer_photos')
        .select('*')
        .eq('influencer_id', id)
        .order('order', { ascending: true });
      if (photoError) throw photoError;

      // Fallback: if no photos, use old image field
      let photosFinal: InfluencerPhoto[] = [];
      if (photos && photos.length > 0) {
        photosFinal = photos;
      } else if (influencer.image) {
        photosFinal = [{
          id: 'legacy',
          influencer_id: influencer.id,
          image_url: influencer.image,
          description: '',
          order: 0,
          created_at: influencer.created_at || ''
        }];
      }

      return {
        ...influencer,
        photos: photosFinal
      };
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes for profile data
  });
};
