
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useVoteStore } from "@/stores/VoteStore";
import { toast } from "@/hooks/use-toast";

interface ReviewFormProps {
  influencerId: string;
}

const ReviewForm = ({ influencerId }: ReviewFormProps) => {
  const { user } = useAuth();
  const { submitReview, getUserVote } = useVoteStore();
  const [newReview, setNewReview] = useState("");
  
  const userVote = user ? getUserVote(user.id, influencerId) : null;

  const handleReviewSubmit = () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to submit a review.",
        variant: "destructive",
      });
      return;
    }

    if (!userVote) {
      toast({
        title: "Vote first",
        description: "Please cast your vote before submitting a review.",
        variant: "destructive",
      });
      return;
    }

    if (!newReview.trim()) {
      toast({
        title: "Review required",
        description: "Please write a review before submitting.",
        variant: "destructive",
      });
      return;
    }

    submitReview(user.id, user.username, influencerId, userVote.vote, newReview.trim());
    setNewReview("");
    
    toast({
      title: "Review submitted!",
      description: "Your review has been added.",
    });
  };

  if (!user || !userVote) {
    return null;
  }

  return (
    <div className="border border-border rounded-lg p-4">
      <div className="mb-3">
        <Badge className={userVote.vote === 'natty' ? 'bg-natty' : 'bg-juicy'}>
          Your vote: {userVote.vote === 'natty' ? '🏆 Natty' : '💉 Juicy'}
        </Badge>
      </div>
      <Textarea
        placeholder="Share your thoughts on this influencer's natural status..."
        value={newReview}
        onChange={(e) => setNewReview(e.target.value)}
        className="mb-3"
      />
      <Button onClick={handleReviewSubmit} disabled={!newReview.trim()}>
        Submit Review
      </Button>
    </div>
  );
};

export default ReviewForm;
