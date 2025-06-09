
import { useState } from 'react';
import { Vote } from '@/types/vote';

export const useVotes = () => {
  const [votes, setVotes] = useState<Vote[]>([]);

  const castVote = (userId: string, influencerId: string, vote: 'natty' | 'juicy') => {
    const existingVoteIndex = votes.findIndex(v => v.userId === userId && v.influencerId === influencerId);
    const newVote: Vote = {
      userId,
      influencerId,
      vote,
      timestamp: new Date().toLocaleDateString()
    };

    if (existingVoteIndex >= 0) {
      const newVotes = [...votes];
      newVotes[existingVoteIndex] = newVote;
      setVotes(newVotes);
    } else {
      setVotes([...votes, newVote]);
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
    castVote,
    submitVote: castVote, // Alias for consistency
    getUserVote,
    getVotePercentages,
    getInfluencerVotes,
    getUserHistory
  };
};
