
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { InfluencerSuggestion } from '@/types/vote';
import { useAuth } from '@/contexts/AuthContext';

export const useSupabaseSuggestions = () => {
  const [suggestions, setSuggestions] = useState<InfluencerSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const { data, error } = await supabase
        .from('influencer_suggestions')
        .select(`
          *,
          profiles!inner(username)
        `);

      if (error) throw error;

      const formattedSuggestions: InfluencerSuggestion[] = data?.map(suggestion => ({
        id: suggestion.id,
        submittedBy: suggestion.submitted_by,
        submitterUsername: suggestion.profiles.username,
        influencerName: suggestion.influencer_name,
        socialLinks: suggestion.social_links || {},
        timestamp: suggestion.timestamp,
        status: suggestion.status as 'pending' | 'approved' | 'rejected'
      })) || [];

      setSuggestions(formattedSuggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitInfluencerSuggestion = async (submittedBy: string, submitterUsername: string, influencerName: string, socialLinks: any) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('influencer_suggestions')
        .insert({
          submitted_by: submittedBy,
          influencer_name: influencerName,
          social_links: socialLinks
        });

      if (error) throw error;

      await fetchSuggestions(); // Refresh suggestions
    } catch (error) {
      console.error('Error submitting suggestion:', error);
      throw error;
    }
  };

  const updateSuggestionStatus = async (suggestionId: string, status: 'approved' | 'rejected') => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('influencer_suggestions')
        .update({ status })
        .eq('id', suggestionId);

      if (error) throw error;

      await fetchSuggestions(); // Refresh suggestions
    } catch (error) {
      console.error('Error updating suggestion status:', error);
      throw error;
    }
  };

  return {
    suggestions,
    loading,
    submitInfluencerSuggestion,
    updateSuggestionStatus,
    refetch: fetchSuggestions
  };
};
