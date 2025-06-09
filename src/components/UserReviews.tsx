
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Trash2 } from "lucide-react";
import UserProfile from "@/components/UserProfile";
import ReviewForm from "@/components/ReviewForm";
import ReviewReactions from "@/components/ReviewReactions";
import { useSupabaseReviews } from "@/hooks/useSupabaseReviews";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface UserReviewsProps {
  influencerId: string;
}

const UserReviews = ({ influencerId }: UserReviewsProps) => {
  const { getInfluencerReviews, deleteReview, loading } = useSupabaseReviews();
  const { user } = useAuth();
  const userReviews = getInfluencerReviews(influencerId);

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await deleteReview(reviewId);
      toast({
        title: "Review deleted",
        description: "The review has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete review. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Community Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">Loading reviews...</p>
        </CardContent>
      </Card>
    );
  }

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
        
        {userReviews.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No reviews yet</p>
        ) : (
          userReviews.map((review) => (
            <div key={review.id} className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <UserProfile 
                    username={review.username} 
                    userId={review.userId}
                    profilePicture={review.profilePicture}
                  />
                  <Badge className={review.vote === 'natty' ? 'bg-natty text-xs' : 'bg-juicy text-xs'}>
                    {review.vote === 'natty' ? '🏆' : '💉'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {new Date(review.timestamp).toLocaleDateString()}
                  </span>
                  {user?.role === 'admin' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteReview(review.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-muted-foreground mb-3">{review.content}</p>
              <ReviewReactions 
                reviewId={review.id}
                likes={review.likes}
                dislikes={0}
              />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default UserReviews;
