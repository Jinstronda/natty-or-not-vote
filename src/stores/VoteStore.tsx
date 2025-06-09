
import { createContext, useContext, ReactNode } from 'react';
import { Vote, Review, Influencer, InfluencerSuggestion } from '@/types/vote';
import { useSupabaseVotes } from '@/hooks/useSupabaseVotes';
import { useSupabaseReviews } from '@/hooks/useSupabaseReviews';
import { useSupabaseInfluencers } from '@/hooks/useSupabaseInfluencers';
import { useSupabaseSuggestions } from '@/hooks/useSupabaseSuggestions';

interface VoteStoreContextType {
  votes: Vote[];
  reviews: Review[];
  influencers: Influencer[];
  suggestions: InfluencerSuggestion[];
  loading: boolean;
  castVote: (userId: string, influencerId: string, vote: 'natty' | 'juicy') => void;
  submitVote: (userId: string, influencerId: string, vote: 'natty' | 'juicy') => void;
  getUserVote: (userId: string, influencerId: string) => Vote | null;
  getVotePercentages: (influencerId: string) => { natty: number; juicy: number; total: number };
  getInfluencerVotes: (influencerId: string) => { natty: number; juicy: number };
  getUserHistory: (userId: string) => { votes: Vote[]; reviews: Review[] };
  submitReview: (userId: string, username: string, influencerId: string, vote: 'natty' | 'juicy', content: string) => void;
  getInfluencerReviews: (influencerId: string) => Review[];
  getUserReviews: (userId: string) => Review[];
  addInfluencer: (influencer: Omit<Influencer, 'id'>) => Promise<string>;
  updateInfluencer: (id: string, influencer: Partial<Influencer>) => void;
  deleteInfluencer: (id: string) => void;
  deleteReview: (reviewId: string) => void;
  submitInfluencerSuggestion: (submittedBy: string, submitterUsername: string, influencerName: string, socialLinks: any) => void;
  updateSuggestionStatus: (suggestionId: string, status: 'approved' | 'rejected') => void;
}

const VoteStoreContext = createContext<VoteStoreContextType | undefined>(undefined);

export const VoteStoreProvider = ({ children }: { children: ReactNode }) => {
  const voteHooks = useSupabaseVotes();
  const reviewHooks = useSupabaseReviews();
  const influencerHooks = useSupabaseInfluencers();
  const suggestionHooks = useSupabaseSuggestions();

  const loading = voteHooks.loading || reviewHooks.loading || influencerHooks.loading || suggestionHooks.loading;

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
  const deleteInfluencer = async (id: string) => {
    await influencerHooks.deleteInfluencer(id);
    // The database cascade deletes will handle related votes and reviews
  };

  return (
    <VoteStoreContext.Provider value={{
      ...voteHooks,
      ...reviewHooks,
      ...influencerHooks,
      ...suggestionHooks,
      loading,
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
