
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Influencer } from '@/types/vote';

export const useSupabaseInfluencers = () => {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInfluencers();
  }, []);

  const fetchInfluencers = async () => {
    try {
      const { data, error } = await supabase
        .from('influencers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedInfluencers: Influencer[] = data?.map(inf => ({
        id: inf.id,
        name: inf.name,
        image: inf.image || '/placeholder.svg',
        height: inf.height || '',
        weight: inf.weight || '',
        yearsTraining: inf.years_training || '',
        claimedStatus: inf.claimed_status || '',
        description: inf.description || '',
        socialLinks: inf.social_links || {}
      })) || [];

      setInfluencers(formattedInfluencers);
    } catch (error) {
      console.error('Error fetching influencers:', error);
    } finally {
      setLoading(false);
    }
  };

  const addInfluencer = async (influencer: Omit<Influencer, 'id'>): Promise<string> => {
    try {
      const { data, error } = await supabase
        .from('influencers')
        .insert([{
          name: influencer.name,
          image: influencer.image,
          height: influencer.height,
          weight: influencer.weight,
          years_training: influencer.yearsTraining,
          claimed_status: influencer.claimedStatus,
          description: influencer.description,
          social_links: influencer.socialLinks
        }])
        .select()
        .single();

      if (error) throw error;

      await fetchInfluencers(); // Refresh the list
      return data.id;
    } catch (error) {
      console.error('Error adding influencer:', error);
      throw error;
    }
  };

  const updateInfluencer = async (id: string, updates: Partial<Influencer>) => {
    try {
      const { error } = await supabase
        .from('influencers')
        .update({
          name: updates.name,
          image: updates.image,
          height: updates.height,
          weight: updates.weight,
          years_training: updates.yearsTraining,
          claimed_status: updates.claimedStatus,
          description: updates.description,
          social_links: updates.socialLinks
        })
        .eq('id', id);

      if (error) throw error;

      await fetchInfluencers(); // Refresh the list
    } catch (error) {
      console.error('Error updating influencer:', error);
      throw error;
    }
  };

  const deleteInfluencer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('influencers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchInfluencers(); // Refresh the list
    } catch (error) {
      console.error('Error deleting influencer:', error);
      throw error;
    }
  };

  return {
    influencers,
    loading,
    addInfluencer,
    updateInfluencer,
    deleteInfluencer,
    refetch: fetchInfluencers
  };
};
