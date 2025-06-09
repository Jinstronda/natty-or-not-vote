
import { createContext, useContext, useState, ReactNode } from 'react';

export interface Vote {
  id: string;
  userId: string;
  influencerId: string;
  vote: 'natty' | 'juicy';
  timestamp: string;
}

export interface Review {
  id: string;
  userId: string;
  username: string;
  influencerId: string;
  vote: 'natty' | 'juicy';
  content: string;
  timestamp: string;
  likes: number;
}

interface VoteStoreType {
  votes: Vote[];
  reviews: Review[];
  submitVote: (userId: string, influencerId: string, vote: 'natty' | 'juicy') => void;
  submitReview: (userId: string, username: string, influencerId: string, vote: 'natty' | 'juicy', content: string) => void;
  getUserVote: (userId: string, influencerId: string) => Vote | undefined;
  getInfluencerVotes: (influencerId: string) => { natty: number; juicy: number };
  getInfluencerReviews: (influencerId: string) => Review[];
  getUserHistory: (userId: string) => { votes: Vote[]; reviews: Review[] };
}

const VoteStoreContext = createContext<VoteStoreType | undefined>(undefined);

// Mock initial data
const initialVotes: Vote[] = [
  { id: '1', userId: '1', influencerId: '1', vote: 'natty', timestamp: '2024-01-15T10:30:00Z' },
  { id: '2', userId: '2', influencerId: '1', vote: 'juicy', timestamp: '2024-01-15T11:00:00Z' },
];

const initialReviews: Review[] = [
  {
    id: '1',
    userId: '1',
    username: 'FitnessEnthusiast23',
    influencerId: '1',
    vote: 'natty',
    content: "Been following his journey for years. Definitely achievable naturally with good genetics.",
    timestamp: '2 hours ago',
    likes: 45
  },
  {
    id: '2',
    userId: '2',
    username: 'SkepticalLifter',
    influencerId: '1',
    vote: 'juicy',
    content: "Too dry and full at the same time. Classic enhanced look.",
    timestamp: '1 day ago',
    likes: 23
  }
];

export const VoteStoreProvider = ({ children }: { children: ReactNode }) => {
  const [votes, setVotes] = useState<Vote[]>(initialVotes);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);

  const submitVote = (userId: string, influencerId: string, vote: 'natty' | 'juicy') => {
    const existingVoteIndex = votes.findIndex(v => v.userId === userId && v.influencerId === influencerId);
    const newVote: Vote = {
      id: String(votes.length + 1),
      userId,
      influencerId,
      vote,
      timestamp: new Date().toISOString()
    };

    if (existingVoteIndex >= 0) {
      const newVotes = [...votes];
      newVotes[existingVoteIndex] = newVote;
      setVotes(newVotes);
    } else {
      setVotes([...votes, newVote]);
    }
  };

  const submitReview = (userId: string, username: string, influencerId: string, vote: 'natty' | 'juicy', content: string) => {
    const newReview: Review = {
      id: String(reviews.length + 1),
      userId,
      username,
      influencerId,
      vote,
      content,
      timestamp: 'just now',
      likes: 0
    };
    setReviews([newReview, ...reviews]);
  };

  const getUserVote = (userId: string, influencerId: string) => {
    return votes.find(v => v.userId === userId && v.influencerId === influencerId);
  };

  const getInfluencerVotes = (influencerId: string) => {
    const influencerVotes = votes.filter(v => v.influencerId === influencerId);
    const natty = influencerVotes.filter(v => v.vote === 'natty').length;
    const juicy = influencerVotes.filter(v => v.vote === 'juicy').length;
    return { natty, juicy };
  };

  const getInfluencerReviews = (influencerId: string) => {
    return reviews.filter(r => r.influencerId === influencerId);
  };

  const getUserHistory = (userId: string) => {
    const userVotes = votes.filter(v => v.userId === userId);
    const userReviews = reviews.filter(r => r.userId === userId);
    return { votes: userVotes, reviews: userReviews };
  };

  return (
    <VoteStoreContext.Provider value={{
      votes,
      reviews,
      submitVote,
      submitReview,
      getUserVote,
      getInfluencerVotes,
      getInfluencerReviews,
      getUserHistory
    }}>
      {children}
    </VoteStoreContext.Provider>
  );
};

export const useVoteStore = () => {
  const context = useContext(VoteStoreContext);
  if (context === undefined) {
    throw new Error('useVoteStore must be used within a VoteStoreProvider');
  }
  return context;
};
