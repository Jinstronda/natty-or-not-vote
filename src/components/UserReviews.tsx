
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";
import UserProfile from "@/components/UserProfile";
import ReviewForm from "@/components/ReviewForm";
import ReviewReactions from "@/components/ReviewReactions";
import { useVoteStore, Review } from "@/stores/VoteStore";

interface UserReviewsProps {
  influencerId: string;
}

const UserReviews = ({ influencerId }: UserReviewsProps) => {
  const { getInfluencerReviews } = useVoteStore();
  const userReviews = getInfluencerReviews(influencerId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Community Reviews
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ReviewForm influencerId={influencerId} />
        
        {userReviews.map((review) => (
          <div key={review.id} className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <UserProfile username={review.username} userId={review.userId} />
                <Badge className={review.vote === 'natty' ? 'bg-natty text-xs' : 'bg-juicy text-xs'}>
                  {review.vote === 'natty' ? '🏆' : '💉'}
                </Badge>
              </div>
              <span className="text-sm text-muted-foreground">{review.timestamp}</span>
            </div>
            <p className="text-muted-foreground mb-3">{review.content}</p>
            <ReviewReactions 
              reviewId={review.id}
              likes={review.likes}
              dislikes={review.dislikes || 0}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default UserReviews;
