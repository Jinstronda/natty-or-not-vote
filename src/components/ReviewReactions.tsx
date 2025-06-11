import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useSupabaseReactions } from '@/hooks/useSupabaseReactions';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/hooks/use-toast";
import { useEffect, useState } from 'react';

interface ReviewReactionsProps {
  reviewId: string;
  likes: number;
  dislikes: number;
  onReacted?: () => void;
}

const ReviewReactions = ({ reviewId, likes, dislikes }: ReviewReactionsProps) => {
  const { user } = useAuth();
  const { toggleReaction, getUserReaction } = useSupabaseReactions();
  
  const [localLikes, setLocalLikes] = useState(likes);
  const [localDislikes, setLocalDislikes] = useState(dislikes);
  const [optimisticReaction, setOptimisticReaction] = useState<'like' | 'dislike' | null>(null);

  // Reset local state if reviewId changes (new review rendered)
  useEffect(() => {
    setLocalLikes(likes);
    setLocalDislikes(dislikes);
    setOptimisticReaction(null);
  }, [reviewId, likes, dislikes]);

  const userReaction = getUserReaction(reviewId);

  const handleReaction = async (type: 'like' | 'dislike') => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to react to reviews.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Optimistic update
      if (optimisticReaction === type) {
        // User is removing their reaction
        if (type === 'like') setLocalLikes((l) => Math.max(0, l - 1));
        else setLocalDislikes((d) => Math.max(0, d - 1));
        setOptimisticReaction(null);
      } else {
        // User is adding or switching reaction
        if (type === 'like') {
          setLocalLikes((l) => l + 1);
          if (optimisticReaction === 'dislike') setLocalDislikes((d) => Math.max(0, d - 1));
        } else {
          setLocalDislikes((d) => d + 1);
          if (optimisticReaction === 'like') setLocalLikes((l) => Math.max(0, l - 1));
        }
        setOptimisticReaction(type);
      }
      await toggleReaction(reviewId, type);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update reaction.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleReaction('like')}
        className={`flex items-center gap-2 ${
          (optimisticReaction === 'like' || userReaction?.reaction_type === 'like')
            ? 'text-green-600 bg-green-50'
            : 'text-muted-foreground'
        }`}
      >
        <ThumbsUp className="h-4 w-4" />
        <span>{localLikes}</span>
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleReaction('dislike')}
        className={`flex items-center gap-2 ${
          (optimisticReaction === 'dislike' || userReaction?.reaction_type === 'dislike')
            ? 'text-red-600 bg-red-50'
            : 'text-muted-foreground'
        }`}
      >
        <ThumbsDown className="h-4 w-4" />
        <span>{localDislikes}</span>
      </Button>
    </div>
  );
};

export default ReviewReactions;
