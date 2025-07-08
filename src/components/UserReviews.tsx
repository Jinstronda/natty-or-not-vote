import { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Trash2 } from "lucide-react";
import UserProfile from "@/components/UserProfile";
import ReviewReactions from "@/components/ReviewReactions";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Review } from "@/types/vote";
import { withDatabaseTimeout } from "@/utils/loadingTimeout";
import { usePageVisibility, useVisibilityRecovery } from "@/utils/pageVisibility";
import { useLoadingWatchdog } from "@/utils/loadingWatchdog";
import { useRealTimeReviews } from '@/hooks/useRealTime';
import { useSupabaseReviews } from "@/hooks/useSupabaseReviews";

interface UserReviewsProps {
  influencerId: string;
}

export interface UserReviewsRef {
  fetchReviews: () => Promise<void>;
}

const UserReviews = forwardRef<UserReviewsRef, UserReviewsProps>(({ influencerId }, ref) => {
  const { user } = useAuth();
  const { submitReview } = useSupabaseReviews();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>("");
  
  // Character limit for reviews
  const MAX_REVIEW_LENGTH = 500;
  const remainingEditChars = MAX_REVIEW_LENGTH - editContent.length;
  const isEditOverLimit = remainingEditChars < 0;
  
  // Character count color for editing
  const getEditCharCountColor = () => {
    if (isEditOverLimit) return 'text-red-500';
    if (remainingEditChars <= 50) return 'text-yellow-600';
    return 'text-gray-500';
  };

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('[UserReviews] Fetching reviews for influencer:', influencerId);
      
      const result = await withDatabaseTimeout(
        async () => {
          const { data, error: fetchError } = await supabase
            .from('reviews')
            .select(`
              *,
              profiles(username, profile_picture_url)
            `)
            .eq('influencer_id', influencerId)
            .order('timestamp', { ascending: false });

          if (fetchError) {
            console.error('[UserReviews] Database error:', fetchError);
            throw fetchError;
          }

          return data;
        },
        { 
          timeout: 10000, 
          retries: 2, 
          operation: `fetchReviews_${influencerId}` 
        }
      );

      const formattedReviews: Review[] = result?.map(review => ({
        id: review.id,
        userId: review.user_id,
        username: review.profiles?.username || 'Unknown User',
        profilePicture: review.profiles?.profile_picture_url || undefined,
        influencerId: review.influencer_id,
        vote: review.vote as 'natty' | 'juicy',
        content: review.content,
        timestamp: review.timestamp,
        likes: review.likes || 0,
        dislikes: review.dislikes || 0,
      })) || [];

      console.log('[UserReviews] Found reviews:', formattedReviews.length);
      setReviews(formattedReviews);
    } catch (error) {
      console.error('[UserReviews] Error fetching reviews:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [influencerId]);

  useImperativeHandle(ref, () => ({
    fetchReviews
  }), [fetchReviews]);

  usePageVisibility({
    onReturnAfterDelay: (awayTime) => {
      console.log(`[UserReviews] User returned after ${Math.round(awayTime / 1000)}s, refreshing reviews`);
      fetchReviews();
    },
    maxAwayTime: 30000,
    enableLogging: true
  });

  useVisibilityRecovery(fetchReviews);

  useLoadingWatchdog({
    component: 'UserReviews',
    isLoading: loading,
    timeout: 15000,
    onTimeout: () => {
      console.warn('[UserReviews] Loading timeout detected, forcing reset');
      setLoading(false);
      setError('Reviews took too long to load. Please refresh the page.');
    }
  });

  useRealTimeReviews(influencerId, fetchReviews);

  useEffect(() => {
    fetchReviews();
  }, [influencerId, fetchReviews]);

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await withDatabaseTimeout(
        async () => {
          const { error } = await supabase
            .from('reviews')
            .delete()
            .eq('id', reviewId);

          if (error) throw error;
        },
        { timeout: 5000, retries: 1, operation: 'deleteReview' }
      );

      toast({
        title: "Review deleted",
        description: "The review has been successfully deleted.",
      });

      // Real-time updates will handle refresh automatically
    } catch (error) {
      console.error('[UserReviews] Delete error:', error);
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
        {error && (
          <div className="text-center py-4 text-red-500">
            Error loading reviews: {error}
          </div>
        )}
        
        {reviews.length === 0 && !error ? (
          <p className="text-muted-foreground text-center py-4">No reviews yet</p>
        ) : (
          reviews.map((review) => {
            const isOwnReview = user && review.userId === user.id;
            return (
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
                    {isOwnReview && editingReviewId !== review.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingReviewId(review.id);
                          setEditContent(review.content);
                        }}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Edit
                      </Button>
                    )}
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
                {editingReviewId === review.id ? (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!user || isEditOverLimit) return;
                      await submitReview(user.id, user.username, influencerId, review.vote, editContent.trim());
                      setEditingReviewId(null);
                      setEditContent("");
                      // Real-time updates will handle refresh automatically
                    }}
                    className="space-y-2"
                  >
                    <div className="space-y-2">
                      <textarea
                        className={`w-full border rounded p-2 bg-background text-foreground ${isEditOverLimit ? 'border-red-500' : 'border-gray-300'}`}
                        rows={3}
                        value={editContent}
                        onChange={e => setEditContent(e.target.value)}
                        autoFocus
                        maxLength={MAX_REVIEW_LENGTH + 100} // Allow slight overflow for user feedback
                      />
                      <div className="flex justify-between items-center text-sm">
                        <span className={getEditCharCountColor()}>
                          {remainingEditChars >= 0 ? `${remainingEditChars} characters remaining` : `${Math.abs(remainingEditChars)} characters over limit`}
                        </span>
                        <span className="text-gray-500">
                          {editContent.length}/{MAX_REVIEW_LENGTH}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" className="bg-primary text-white" disabled={isEditOverLimit}>Save</Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => setEditingReviewId(null)}>Cancel</Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <p className="text-muted-foreground mb-3">{review.content}</p>
                    <ReviewReactions 
                      reviewId={review.id}
                      likes={review.likes}
                      dislikes={review.dislikes || 0}
                    />
                  </>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
});

UserReviews.displayName = 'UserReviews';

export default UserReviews;
