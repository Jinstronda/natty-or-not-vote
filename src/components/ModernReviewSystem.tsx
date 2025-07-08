import React, { useEffect, useCallback, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Trash2, RefreshCw } from 'lucide-react';
import { useOptimalReviewSystem } from '@/hooks/useOptimalReviewSystem';
import { useReviewReplies } from '@/hooks/useReviewReplies';
import { 
  ProgressiveReviewSkeleton, 
  ErrorState, 
  EmptyState, 
  UnifiedSkeleton 
} from '@/components/loading/UnifiedSkeleton';
import { ReviewSortingControls } from '@/components/ReviewSortingControls';
import UserProfile from '@/components/UserProfile';
import ReviewReactions from '@/components/ReviewReactions';
import ReplyList from '@/components/ReplyList';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseReviews } from '@/hooks/useSupabaseReviews';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Import our unified loading styles
import '@/styles/unified-loading.css';

interface ModernReviewSystemProps {
  influencerId: string;
  pageSize?: number;
  className?: string;
}

/**
 * Modern, optimized review system following best practices
 * - Performance-first loading
 * - Unified skeleton system
 * - Progressive enhancement
 * - Mobile-optimized
 * - Error resilient
 */
export const ModernReviewSystem: React.FC<ModernReviewSystemProps> = ({
  influencerId,
  pageSize = 10,
  className
}) => {
  const { user } = useAuth();
  const { submitReview } = useSupabaseReviews();
  
  // Add reply system hook to get actual reply data
  const { getReviewReplies, getReplyCount } = useReviewReplies();
  
  // State for editing
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // Use the optimized review system
  const {
    reviews,
    stats,
    hasMore,
    sortBy,
    isLoading,
    isError,
    isEmpty,
    isFirstLoad,
    isLoadingMore,
    error,
    progress,
    loadReviews,
    loadMore,
    changeSorting,
    refresh,
    retry
  } = useOptimalReviewSystem({
    influencerId,
    pageSize
  });

  // Load initial data
  useEffect(() => {
    loadReviews(0, 'recent');
  }, [influencerId]);

  // Handle edit submission
  const handleEditSubmit = useCallback(async (
    e: React.FormEvent,
    reviewId: string,
    vote: 'natty' | 'juicy'
  ) => {
    e.preventDefault();
    if (!user || !editContent.trim()) return;
    
    try {
      await submitReview(user.id, user.username, influencerId, vote, editContent.trim());
      setEditingReviewId(null);
      setEditContent('');
      
      // Refresh to show updated review
      await refresh();
      
      toast({
        title: 'Review updated',
        description: 'Your review has been successfully updated.',
      });
    } catch (error) {
      console.error('[ModernReviewSystem] Edit error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update review. Please try again.',
        variant: 'destructive',
      });
    }
  }, [user, editContent, influencerId, submitReview, refresh]);

  // First load skeleton
  if (isFirstLoad) {
    return (
      <Card className={cn('gpu-accelerated', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Community Reviews
            {progress > 0 && (
              <div className="ml-auto text-xs text-muted-foreground">
                {Math.round(progress)}%
              </div>
            )}
          </CardTitle>
          {progress > 0 && (
            <div className="loading-progress h-1 w-full">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </CardHeader>
        <CardContent>
          <ProgressiveReviewSkeleton count={3} showSorting={true} />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (isError) {
    return (
      <Card className={cn('animate-shake', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Community Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorState
            error={error || 'Failed to load reviews'}
            onRetry={retry}
          />
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (isEmpty) {
    return (
      <Card className={cn('animate-bounce-in', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Community Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="No reviews yet"
            description="Be the first to share your thoughts about this influencer."
            action={
              <Button
                onClick={() => refresh()}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            }
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('animate-bounce-in loading-transition', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Community Reviews
          {isLoadingMore && (
            <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
              <UnifiedSkeleton width={16} height={16} variant="circle" />
              Loading more...
            </div>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Sorting controls */}
        <ReviewSortingControls
          currentSort={sortBy}
          onSortChange={changeSorting}
          totalCount={stats.totalCount}
          loadedCount={reviews.length}
          isLoading={isLoading}
        />

        {/* Reviews list */}
        <div className="space-y-4">
          {reviews.map((review, index) => {
            const isOwnReview = user && review.userId === user.id;
            
            return (
              <div 
                key={review.id} 
                className={cn(
                  'border border-border rounded-lg p-4 relative animate-fade-in gpu-accelerated',
                  `animation-delay-${Math.min(index * 150, 600)}ms`
                )}
              >
                {/* Review header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <UserProfile 
                      username={review.username} 
                      userId={review.userId}
                      profilePicture={review.profilePicture}
                    />
                    <Badge className={
                      review.vote === 'natty' 
                        ? 'bg-natty text-xs' 
                        : 'bg-juicy text-xs'
                    }>
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
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Review content */}
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
                    
                    {/* Review reactions */}
                    <ReviewReactions 
                      reviewId={review.id}
                      likes={review.likes}
                      dislikes={0}
                    />
                    
                    {/* Reply system */}
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

        {/* Load more button */}
        {hasMore && (
          <div className="flex justify-center pt-4">
            <Button
              onClick={loadMore}
              disabled={isLoadingMore}
              variant="outline"
              className="loading-transition"
            >
              {isLoadingMore ? (
                <>
                  <UnifiedSkeleton width={16} height={16} className="mr-2" />
                  Loading more...
                </>
              ) : (
                `Load more reviews (${stats.totalCount - reviews.length} remaining)`
              )}
            </Button>
          </div>
        )}

        {/* Statistics summary */}
        {stats.totalCount > 0 && (
          <div className="pt-4 border-t border-border text-center">
            <div className="text-sm text-muted-foreground">
              Showing {reviews.length} of {stats.totalCount} reviews •{' '}
              <span className="text-natty font-medium">{stats.nattyPercentage}% Natty</span> •{' '}
              <span className="text-juicy font-medium">{stats.juicyPercentage}% Juicy</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};