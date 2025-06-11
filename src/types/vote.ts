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
  profilePicture?: string;
  influencerId: string;
  vote: 'natty' | 'juicy';
  content: string;
  timestamp: string;
  likes: number;
  dislikes?: number;
}

export interface Influencer {
  id: string;
  name: string;
  image: string;
  height: string;
  weight: string;
  years_training: string;
  claimed_status: string;
  description: string;
  social_links: {
    instagram?: string;
    youtube?: string;
    tiktok?: string;
  };
  photos?: Array<{
    id: string;
    image_url: string;
    description: string | null;
  }>;
}

export interface InfluencerSuggestion {
  id: string;
  submittedBy: string;
  submitterUsername: string;
  influencerName: string;
  imageUrl?: string;
  socialLinks: {
    instagram?: string;
    youtube?: string;
    tiktok?: string;
  };
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
}

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
}

export interface ReviewReaction {
  id: string;
  user_id: string;
  review_id: string;
  reaction_type: 'like' | 'dislike';
  created_at: string;
}
