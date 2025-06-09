
import { createContext, useContext, ReactNode } from 'react';
import { Vote, Review, Influencer, InfluencerSuggestion } from '@/types/vote';
import { useVotes } from '@/hooks/useVotes';
import { useReviews } from '@/hooks/useReviews';
import { useInfluencers } from '@/hooks/useInfluencers';
import { useSuggestions } from '@/hooks/useSuggestions';

interface VoteStoreContextType {
  votes: Vote[];
  reviews: Review[];
  influencers: Influencer[];
  suggestions: InfluencerSuggestion[];
  castVote: (userId: string, influencerId: string, vote: 'natty' | 'juicy') => void;
  submitVote: (userId: string, influencerId: string, vote: 'natty' | 'juicy') => void;
  getUserVote: (userId: string, influencerId: string) => Vote | null;
  getVotePercentages: (influencerId: string) => { natty: number; juicy: number; total: number };
  getInfluencerVotes: (influencerId: string) => { natty: number; juicy: number };
  getUserHistory: (userId: string) => { votes: Vote[]; reviews: Review[] };
  submitReview: (userId: string, username: string, influencerId: string, vote: 'natty' | 'juicy', content: string) => void;
  getInfluencerReviews: (influencerId: string) => Review[];
  getUserReviews: (userId: string) => Review[];
  addInfluencer: (influencer: Omit<Influencer, 'id'>) => string;
  updateInfluencer: (id: string, influencer: Partial<Influencer>) => void;
  deleteInfluencer: (id: string) => void;
  deleteReview: (reviewId: string) => void;
  submitInfluencerSuggestion: (submittedBy: string, submitterUsername: string, influencerName: string, socialLinks: any) => void;
  updateSuggestionStatus: (suggestionId: string, status: 'approved' | 'rejected') => void;
}

const VoteStoreContext = createContext<VoteStoreContextType | undefined>(undefined);

export const VoteStoreProvider = ({ children }: { children: ReactNode }) => {
  const voteHooks = useVotes();
  const reviewHooks = useReviews();
  const influencerHooks = useInfluencers();
  const suggestionHooks = useSuggestions();

  // Enhanced getUserHistory that includes both votes and reviews
  const getUserHistory = (userId: string) => {
    const userVoteHistory = voteHooks.getUserHistory(userId);
    const userReviews = reviewHooks.getUserReviews(userId);
    
    return {
      votes: userVoteHistory.votes,
      reviews: userReviews
    };
  };

  // Enhanced deleteInfluencer that cleans up related data
  const deleteInfluencer = (id: string) => {
    influencerHooks.deleteInfluencer(id);
    // Clean up votes and reviews for this influencer
    voteHooks.votes.forEach(vote => {
      if (vote.influencerId === id) {
        // Note: In a real app, we'd need a way to remove votes
        // For now, this is handled in the individual hooks
      }
    });
    reviewHooks.reviews.forEach(review => {
      if (review.influencerId === id) {
        reviewHooks.deleteReview(review.id);
      }
    });
  };

  return (
    <VoteStoreContext.Provider value={{
      ...voteHooks,
      ...reviewHooks,
      ...influencerHooks,
      ...suggestionHooks,
      getUserHistory,
      deleteInfluencer
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

// Re-export types for convenience
export type { Vote, Review, Influencer, InfluencerSuggestion };
