import { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Trash2 } from "lucide-react";
import UserProfile from "@/components/UserProfile";
import ReviewReactions from "@/components/ReviewReactions";
import { ReviewSortingControls, type ReviewSortOption } from "@/components/ReviewSortingControls";
import { ReviewPagination, EmptyReviewsState } from "@/components/ReviewPagination";
import { usePaginatedReviews } from "@/hooks/api/usePaginatedReviews";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { withDatabaseTimeout } from "@/utils/loadingTimeout";
import { useSupabaseReviews } from "@/hooks/useSupabaseReviews";
import { useReviewReplies } from "@/hooks/useReviewReplies";
import ReplyList from "@/components/ReplyList";
// Temporarily commented out to fix infinite API calls
// import { usePageVisibility, useVisibilityRecovery } from "@/utils/pageVisibility";
// import { useLoadingWatchdog } from "@/utils/loadingWatchdog";
// import { useRealTimeReviews } from '@/hooks/useRealTime';

interface EnhancedUserReviewsProps {
  influencerId: string;
  pageSize?: number; // Allow customizable page size
  defaultSort?: ReviewSortOption; // Allow default sorting
}

export interface EnhancedUserReviewsRef {
  refresh: () => Promise<void>;
  changeSorting: (sort: ReviewSortOption) => Promise<void>;
}

// Enhanced UserReviews with safe pagination and sorting
const EnhancedUserReviews = forwardRef<EnhancedUserReviewsRef, EnhancedUserReviewsProps>(({ 
  influencerId, 
  pageSize = 10,
  defaultSort = 'recent' 
}, ref) => {
  const { user } = useAuth();
  const { submitReview } = useSupabaseReviews();
  const { getReviewReplies, getReplyCount } = useReviewReplies();
  
  // State for editing reviews (keeping existing functionality)
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>("");

  // Use the new paginated reviews hook
  const {
    reviews,
    loading,
    error,
    hasMore,
    sortBy,
    stats,
    loadMore,
    changeSorting,
    refresh,
    initialLoad
  } = usePaginatedReviews({
    influencerId,
    pageSize,
    sortBy: defaultSort
  });

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    refresh,
    changeSorting
  }), [refresh, changeSorting]);

  // Temporarily disabled hooks that may cause infinite API calls
  // TODO: Re-enable after fixing hook dependencies
  // usePageVisibility, useVisibilityRecovery, useLoadingWatchdog, useRealTimeReviews

  // Initial load
  useEffect(() => {
    console.log('[EnhancedUserReviews] Initial load for influencer:', influencerId);
    initialLoad();
  }, [influencerId]); // Removed initialLoad dependency to prevent infinite loop

  // Delete review handler (keeping existing functionality)
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

      await refresh();
    } catch (error) {
      console.error('[EnhancedUserReviews] Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete review. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Edit review handler (keeping existing functionality)
  const handleEditSubmit = async (e: React.FormEvent, reviewId: string, vote: 'natty' | 'juicy') => {
    e.preventDefault();
    if (!user) return;
    
    try {
      await submitReview(user.id, user.username, influencerId, vote, editContent.trim());
      setEditingReviewId(null);
      setEditContent("");
      await refresh();
      
      toast({
        title: "Review updated",
        description: "Your review has been successfully updated.",
      });
    } catch (error) {
      console.error('[EnhancedUserReviews] Edit error:', error);
      toast({
        title: "Error",
        description: "Failed to update review. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Loading state
  if (loading && reviews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Community Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Loading skeleton for sorting controls */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                <div className="h-8 w-32 bg-muted animate-pulse rounded" />
              </div>
            </div>
            
            {/* Loading skeleton for reviews */}
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
                    <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                    <div className="h-5 w-12 bg-muted animate-pulse rounded" />
                  </div>
                  <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-muted animate-pulse rounded" />
                  <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                  <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
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
      <CardContent className="space-y-6">
        {/* Error state */}
        {error && (
          <div className="text-center py-4 text-red-500 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
            <p className="font-medium">Error loading reviews</p>
            <p className="text-sm mt-1">{error}</p>
            <Button 
              onClick={refresh} 
              variant="outline" 
              size="sm" 
              className="mt-3"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Sorting controls (only show if we have reviews or are loading) */}
        {(stats.totalCount > 0 || loading) && (
          <ReviewSortingControls
            currentSort={sortBy}
            onSortChange={changeSorting}
            totalCount={stats.totalCount}
            loadedCount={stats.loadedCount}
            isLoading={loading}
          />
        )}

        {/* Empty state */}
        {stats.totalCount === 0 && !loading && !error && (
          <EmptyReviewsState 
            sortBy={sortBy} 
            onSortChange={changeSorting}
          />
        )}

        {/* Reviews list */}
        {reviews.length > 0 && (
          <div className="space-y-4">
            {reviews.map((review, index) => {
              const isOwnReview = user && review.userId === user.id;
              
              return (
                <div key={review.id} className="border border-border rounded-lg p-4 relative">

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
                      onSubmit={(e) => handleEditSubmit(e, review.id, review.vote)}
                      className="space-y-2"
                    >
                      <textarea
                        className="w-full border rounded p-2 mb-2 bg-background text-foreground"
                        rows={3}
                        value={editContent}
                        onChange={e => setEditContent(e.target.value)}
                        autoFocus
                        placeholder="Share your thoughts..."
                      />
                      <div className="flex gap-2">
                        <Button type="submit" size="sm" className="bg-primary text-white">
                          Save
                        </Button>
                        <Button 
                          type="button" 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setEditingReviewId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <p className="text-muted-foreground mb-3 pl-1">{review.content}</p>
                      <ReviewReactions 
                        reviewId={review.id}
                        likes={review.likes}
                        dislikes={review.dislikes || 0}
                        onReacted={refresh}
                      />
                      
                      {/* Reply system integration */}
                      <ReplyList
                        reviewId={review.id}
                        replies={getReviewReplies(review.id)}
                        maxDepth={3}
                        currentDepth={0}
                        sortBy="recent"
                        className="mt-4"
                      />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination controls */}
        {stats.totalCount > 0 && (
          <ReviewPagination
            hasMore={hasMore}
            isLoading={loading}
            onLoadMore={loadMore}
            loadedCount={stats.loadedCount}
            totalCount={stats.totalCount}
            className="pt-2"
          />
        )}
      </CardContent>
    </Card>
  );
});

EnhancedUserReviews.displayName = 'EnhancedUserReviews';

export default EnhancedUserReviews;