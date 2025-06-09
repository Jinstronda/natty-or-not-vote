
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
