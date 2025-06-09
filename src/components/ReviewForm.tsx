
import { useAuth } from "@/contexts/AuthContext";
import { useVotes } from "@/hooks/useVotes";
import { Badge } from "@/components/ui/badge";

interface ReviewFormProps {
  influencerId: string;
}

const ReviewForm = ({ influencerId }: ReviewFormProps) => {
  const { user } = useAuth();
  const { userVote, userReview } = useVotes(influencerId);

  // Don't show the form if user already has a review or hasn't voted
  if (!user || !userVote || userReview) {
    return null;
  }

  return (
    <div className="border border-border rounded-lg p-4 bg-muted/30">
      <div className="mb-3">
        <Badge className={userVote.vote === 'natty' ? 'bg-natty' : 'bg-juicy'}>
          Your vote: {userVote.vote === 'natty' ? '🏆 Natty' : '💉 Juicy'}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        You can submit your review in the voting section above. Each user can only submit one review per influencer.
      </p>
    </div>
  );
};

export default ReviewForm;
