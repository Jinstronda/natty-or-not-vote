
import { useState } from 'react';
import { Review } from '@/types/vote';

export const useReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);

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

  const deleteReview = (reviewId: string) => {
    setReviews(reviews.filter(r => r.id !== reviewId));
  };

  return {
    reviews,
    submitReview,
    getInfluencerReviews,
    getUserReviews,
    deleteReview
  };
};
