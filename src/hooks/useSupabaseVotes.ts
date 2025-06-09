
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Vote } from '@/types/vote';
import { useAuth } from '@/contexts/AuthContext';

export const useSupabaseVotes = () => {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchVotes();
    
    // Set up real-time subscription for votes
    const channel = supabase
      .channel('votes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes'
        },
        () => {
          console.log('Real-time vote change detected, refetching...');
          fetchVotes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchVotes = async () => {
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('*');

      if (error) throw error;

      const formattedVotes: Vote[] = data?.map(vote => ({
        userId: vote.user_id,
        influencerId: vote.influencer_id,
        vote: vote.vote as 'natty' | 'juicy',
        timestamp: vote.timestamp
      })) || [];

      setVotes(formattedVotes);
    } catch (error) {
      console.error('Error fetching votes:', error);
    } finally {
      setLoading(false);
    }
  };

  const castVote = async (userId: string, influencerId: string, vote: 'natty' | 'juicy') => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    try {
      const { error } = await supabase
        .from('votes')
        .upsert({
          user_id: userId,
          influencer_id: influencerId,
          vote: vote
        });

      if (error) throw error;

      await fetchVotes(); // Refresh votes
    } catch (error) {
      console.error('Error casting vote:', error);
      throw error;
    }
  };

  const getUserVote = (userId: string, influencerId: string): Vote | null => {
    return votes.find(v => v.userId === userId && v.influencerId === influencerId) || null;
  };

  const getVotePercentages = (influencerId: string) => {
    const influencerVotes = votes.filter(v => v.influencerId === influencerId);
    const total = influencerVotes.length;
    const nattyCount = influencerVotes.filter(v => v.vote === 'natty').length;
    const juicyCount = total - nattyCount;

    return {
      natty: total > 0 ? Math.round((nattyCount / total) * 100) : 0,
      juicy: total > 0 ? Math.round((juicyCount / total) * 100) : 0,
      total
    };
  };

  const getInfluencerVotes = (influencerId: string) => {
    const influencerVotes = votes.filter(v => v.influencerId === influencerId);
    const nattyCount = influencerVotes.filter(v => v.vote === 'natty').length;
    const juicyCount = influencerVotes.filter(v => v.vote === 'juicy').length;

    return {
      natty: nattyCount,
      juicy: juicyCount
    };
  };

  const getUserHistory = (userId: string) => {
    const userVotes = votes.filter(v => v.userId === userId);
    return { votes: userVotes };
  };

  return {
    votes,
    loading,
    castVote,
    submitVote: castVote,
    getUserVote,
    getVotePercentages,
    getInfluencerVotes,
    getUserHistory,
    refetch: fetchVotes
  };
};
