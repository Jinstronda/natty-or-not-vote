import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useSupabaseReactions } from '@/hooks/useSupabaseReactions';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/hooks/use-toast";

interface ReviewReactionsProps {
  reviewId: string;
  likes: number;
  dislikes: number;
  onReacted?: () => void;
}

const ReviewReactions = ({ reviewId, likes, dislikes, onReacted }: ReviewReactionsProps) => {
  const { user } = useAuth();
  const { toggleReaction, getUserReaction } = useSupabaseReactions();
  
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
      await toggleReaction(reviewId, type);
      if (onReacted) onReacted();
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
          userReaction?.reaction_type === 'like' 
            ? 'text-green-600 bg-green-50' 
            : 'text-muted-foreground'
        }`}
      >
        <ThumbsUp className="h-4 w-4" />
        <span>{likes}</span>
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleReaction('dislike')}
        className={`flex items-center gap-2 ${
          userReaction?.reaction_type === 'dislike' 
            ? 'text-red-600 bg-red-50' 
            : 'text-muted-foreground'
        }`}
      >
        <ThumbsDown className="h-4 w-4" />
        <span>{dislikes}</span>
      </Button>
    </div>
  );
};

export default ReviewReactions;
