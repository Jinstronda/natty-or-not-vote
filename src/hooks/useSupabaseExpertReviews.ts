import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ExpertReview {
  id: string;
  influencer_id: string;
  author: string;
  content: string;
  rating: number;
  link_url?: string;
  likes: number;
  created_at: string;
  updated_at: string;
  expert_id?: string;
  natty_or_not?: string;
}

export const useSupabaseExpertReviews = () => {
  const [expertReviews, setExpertReviews] = useState<ExpertReview[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchExpertReviews();
  }, []);

  const fetchExpertReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('expert_reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExpertReviews(data || []);
    } catch (error) {
      console.error('Error fetching expert reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const addExpertReview = async (expertReview: Omit<ExpertReview, 'id' | 'likes' | 'created_at' | 'updated_at'>) => {
    if (!user || user.role !== 'admin') return;

    try {
      const { error } = await supabase
        .from('expert_reviews')
        .insert(expertReview);

      if (error) throw error;
      await fetchExpertReviews();
    } catch (error) {
      console.error('Error adding expert review:', error);
      throw error;
    }
  };

  const updateExpertReview = async (id: string, updates: Partial<ExpertReview>) => {
    if (!user || user.role !== 'admin') return;

    try {
      const { error } = await supabase
        .from('expert_reviews')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      await fetchExpertReviews();
    } catch (error) {
      console.error('Error updating expert review:', error);
      throw error;
    }
  };

  const deleteExpertReview = async (id: string) => {
    if (!user || user.role !== 'admin') return;

    try {
      const { error } = await supabase
        .from('expert_reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchExpertReviews();
    } catch (error) {
      console.error('Error deleting expert review:', error);
      throw error;
    }
  };

  const getInfluencerExpertReviews = (influencerId: string): ExpertReview[] => {
    return expertReviews.filter(review => review.influencer_id === influencerId);
  };

  return {
    expertReviews,
    loading,
    addExpertReview,
    updateExpertReview,
    deleteExpertReview,
    getInfluencerExpertReviews,
    refetch: fetchExpertReviews
  };
};
