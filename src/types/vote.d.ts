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
  isAdmin?: boolean;
} 