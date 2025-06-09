import { createContext, useContext, useState, ReactNode } from 'react';

export interface Vote {
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

export interface Influencer {
  id: string;
  name: string;
  image: string;
  height: string;
  weight: string;
  yearsTraining: string;
  claimedStatus: string;
  description: string;
  socialLinks: {
    instagram?: string;
    youtube?: string;
    tiktok?: string;
  };
}

export interface InfluencerSuggestion {
  id: string;
  submittedBy: string;
  submitterUsername: string;
  influencerName: string;
  socialLinks: {
    instagram?: string;
    youtube?: string;
    tiktok?: string;
  };
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface VoteStoreContextType {
  votes: Vote[];
  reviews: Review[];
  influencers: Influencer[];
  suggestions: InfluencerSuggestion[];
  castVote: (userId: string, influencerId: string, vote: 'natty' | 'juicy') => void;
  getUserVote: (userId: string, influencerId: string) => Vote | null;
  getVotePercentages: (influencerId: string) => { natty: number; juicy: number; total: number };
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

// Mock data
const mockInfluencers: Influencer[] = [
  {
    id: '1',
    name: 'Mike Mentzer',
    image: '/placeholder.svg',
    height: '5\'8"',
    weight: '225 lbs',
    yearsTraining: '15+',
    claimedStatus: 'Natural',
    description: 'Professional bodybuilder known for high-intensity training.',
    socialLinks: {
      instagram: 'https://instagram.com/mikementzer',
      youtube: 'https://youtube.com/mikementzer'
    }
  },
  {
    id: '2',
    name: 'David Laid',
    image: '/placeholder.svg',
    height: '6\'2"',
    weight: '190 lbs',
    yearsTraining: '10+',
    claimedStatus: 'Natural',
    description: 'Aesthetic bodybuilder and fitness influencer.',
    socialLinks: {
      instagram: 'https://instagram.com/davidlaid',
      youtube: 'https://youtube.com/davidlaid'
    }
  }
];

export const VoteStoreProvider = ({ children }: { children: ReactNode }) => {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [influencers, setInfluencers] = useState<Influencer[]>(mockInfluencers);
  const [suggestions, setSuggestions] = useState<InfluencerSuggestion[]>([]);

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

  const submitReview = (userId: string, username: string, influencerId: string, vote: 'natty' | 'juicy', content: string) => {
    const newReview: Review = {
      id: Date.now().toString(),
      userId,
      username,
      influencerId,
      vote,
      content,
      timestamp: new Date().toLocaleDateString(),
      likes: 0
    };
    setReviews([...reviews, newReview]);
  };

  const getInfluencerReviews = (influencerId: string): Review[] => {
    return reviews.filter(r => r.influencerId === influencerId);
  };

  const getUserReviews = (userId: string): Review[] => {
    return reviews.filter(r => r.userId === userId);
  };

  const addInfluencer = (influencer: Omit<Influencer, 'id'>): string => {
    const newId = Date.now().toString();
    const newInfluencer: Influencer = {
      ...influencer,
      id: newId
    };
    setInfluencers([...influencers, newInfluencer]);
    return newId;
  };

  const updateInfluencer = (id: string, updates: Partial<Influencer>) => {
    setInfluencers(influencers.map(inf => 
      inf.id === id ? { ...inf, ...updates } : inf
    ));
  };

  const deleteInfluencer = (id: string) => {
    setInfluencers(influencers.filter(inf => inf.id !== id));
    setVotes(votes.filter(v => v.influencerId !== id));
    setReviews(reviews.filter(r => r.influencerId !== id));
  };

  const deleteReview = (reviewId: string) => {
    setReviews(reviews.filter(r => r.id !== reviewId));
  };

  const submitInfluencerSuggestion = (submittedBy: string, submitterUsername: string, influencerName: string, socialLinks: any) => {
    const newSuggestion: InfluencerSuggestion = {
      id: Date.now().toString(),
      submittedBy,
      submitterUsername,
      influencerName,
      socialLinks,
      timestamp: new Date().toLocaleDateString(),
      status: 'pending'
    };
    setSuggestions([...suggestions, newSuggestion]);
  };

  const updateSuggestionStatus = (suggestionId: string, status: 'approved' | 'rejected') => {
    setSuggestions(suggestions.map(s => 
      s.id === suggestionId ? { ...s, status } : s
    ));
  };

  return (
    <VoteStoreContext.Provider value={{
      votes,
      reviews,
      influencers,
      suggestions,
      castVote,
      getUserVote,
      getVotePercentages,
      submitReview,
      getInfluencerReviews,
      getUserReviews,
      addInfluencer,
      updateInfluencer,
      deleteInfluencer,
      deleteReview,
      submitInfluencerSuggestion,
      updateSuggestionStatus
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
