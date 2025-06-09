
import { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Trash2 } from "lucide-react";
import UserProfile from "@/components/UserProfile";
import ReviewForm from "@/components/ReviewForm";
import ReviewReactions from "@/components/ReviewReactions";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Review } from "@/types/vote";
import { withDatabaseTimeout } from "@/utils/loadingTimeout";
import { usePageVisibility, useVisibilityRecovery } from "@/utils/pageVisibility";
import { useLoadingWatchdog } from "@/utils/loadingWatchdog";

interface UserReviewsProps {
  influencerId: string;
}

export interface UserReviewsRef {
  fetchReviews: () => Promise<void>;
}

const UserReviews = forwardRef<UserReviewsRef, UserReviewsProps>(({ influencerId }, ref) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching reviews for influencer:', influencerId);
      
      const { data, error: fetchError } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles(username, profile_picture_url)
        `)
        .eq('influencer_id', influencerId)
        .order('timestamp', { ascending: false });

      if (fetchError) {
        console.error('Error fetching reviews:', fetchError);
        throw fetchError;
      }

      const formattedReviews: Review[] = data?.map(review => ({
        id: review.id,
        userId: review.user_id,
        username: review.profiles?.username || 'Unknown User',
        profilePicture: review.profiles?.profile_picture_url || undefined,
        influencerId: review.influencer_id,
        vote: review.vote as 'natty' | 'juicy',
        content: review.content,
        timestamp: review.timestamp,
        likes: review.likes || 0
      })) || [];

      console.log('Found reviews:', formattedReviews.length);
      setReviews(formattedReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [influencerId]);

  useImperativeHandle(ref, () => ({
    fetchReviews
  }), [fetchReviews]);

  useEffect(() => {
    fetchReviews();
  }, [influencerId, fetchReviews]);

  const handleDeleteReview = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;

      toast({
        title: "Review deleted",
        description: "The review has been successfully deleted.",
      });

      // Refresh reviews
      await fetchReviews();
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
        
        {error && (
          <div className="text-center py-4 text-red-500">
            Error loading reviews: {error}
          </div>
        )}
        
        {reviews.length === 0 && !error ? (
          <p className="text-muted-foreground text-center py-4">No reviews yet</p>
        ) : (
          reviews.map((review) => (
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
});

UserReviews.displayName = 'UserReviews';

export default UserReviews;
