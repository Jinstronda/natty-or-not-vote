import React, { useState, useCallback, useMemo, memo } from 'react';
import { Button } from '@/components/ui/button';
import { useNestedReplies } from '@/hooks/useNestedReplies';
import { useReviewReplies } from '@/hooks/useReviewReplies';
import { ReplyListProps, ReplySortOption, ReviewReply } from '@/types/reply';
import { 
  ChevronDown, 
  ChevronUp, 
  MessageSquare, 
  Loader2,
  SortAsc,
  SortDesc,
  Heart
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import ReplyItem from '@/components/ReplyItem';
import ReplyForm from '@/components/ReplyForm';
import { useAuth } from '@/contexts/AuthContext';

const ReplyList: React.FC<ReplyListProps> = memo(({
  reviewId,
  replies,
  maxDepth = 3,
  currentDepth = 0,
  sortBy = 'recent',
  showLoadMore = true,
  onLoadMore,
  isLoading = false,
  className = ''
}) => {
  const { user } = useAuth();
  const { createReply } = useReviewReplies();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [currentSort, setCurrentSort] = useState<ReplySortOption>(sortBy);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get direct replies (no parent) for this review
  const directReplies = useMemo(() => {
    return replies.filter(reply => reply.parent_reply_id === null);
  }, [replies]);

  // Sort replies based on current sort option
  const sortedReplies = useMemo(() => {
    const sorted = [...directReplies];
    
    switch (currentSort) {
      case 'recent':
        return sorted.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case 'oldest':
        return sorted.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      case 'likes':
        return sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      default:
        return sorted;
    }
  }, [directReplies, currentSort]);

  // Build nested reply structure
  const replyTree = useMemo(() => {
    const buildTree = (parentId: string | null = null, depth = 0): ReviewReply[] => {
      const children = replies
        .filter(reply => reply.parent_reply_id === parentId)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      return children.map(reply => ({
        ...reply,
        replies: depth < maxDepth ? buildTree(reply.id, depth + 1) : []
      }));
    };

    return buildTree();
  }, [replies, maxDepth]);

  const totalReplies = replies.length;
  const hasReplies = totalReplies > 0;

  // Handle reply submission
  const handleReplySubmit = useCallback(async (parentReplyId: string | null, content: string) => {
    if (!user) return;

    try {
      setIsSubmitting(true);
      await createReply({
        review_id: reviewId,
        parent_reply_id: parentReplyId,
        user_id: user.id,
        content
      });
      
      if (!parentReplyId) {
        setIsReplying(false);
      }
    } catch (error) {
      console.error('[ReplyList] Error submitting reply:', error);
      throw error; // Let the form handle the error
    } finally {
      setIsSubmitting(false);
    }
  }, [user, reviewId, createReply]);

  // Toggle expansion
  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  // Sort option labels
  const getSortLabel = (sort: ReplySortOption): string => {
    switch (sort) {
      case 'recent': return 'Most Recent';
      case 'oldest': return 'Oldest First';
      case 'likes': return 'Most Liked';
      default: return 'Recent';
    }
  };

  if (!hasReplies && !isReplying) {
    return (
      <div className={`mt-4 ${className}`}>
        {/* Empty state with reply option */}
        <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-dashed border-muted-foreground/20">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            <span>No replies yet</span>
          </div>
          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsReplying(true)}
              className="text-xs"
            >
              Be the first to reply
            </Button>
          )}
        </div>

        {/* Reply form */}
        {isReplying && (
          <div className="mt-3">
            <ReplyForm
              reviewId={reviewId}
              parentReplyId={null}
              onSubmit={(content) => handleReplySubmit(null, content)}
              onCancel={() => setIsReplying(false)}
              isVisible={isReplying}
              isSubmitting={isSubmitting}
              placeholder="Write a reply to this review..."
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`mt-4 space-y-3 ${className}`}>
      {/* Header with reply count and controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Expand/collapse button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleExpanded}
            className="flex items-center gap-2 text-sm"
            data-testid="expand-replies-button"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            <MessageSquare className="h-4 w-4" />
            <span>
              {totalReplies} {totalReplies === 1 ? 'reply' : 'replies'}
            </span>
          </Button>

          {/* Sort dropdown */}
          {hasReplies && isExpanded && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs">
                  <SortAsc className="h-3 w-3 mr-1" />
                  {getSortLabel(currentSort)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem 
                  onClick={() => setCurrentSort('recent')}
                  className={currentSort === 'recent' ? 'bg-accent' : ''}
                >
                  <SortDesc className="h-3 w-3 mr-2" />
                  Most Recent
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setCurrentSort('oldest')}
                  className={currentSort === 'oldest' ? 'bg-accent' : ''}
                >
                  <SortAsc className="h-3 w-3 mr-2" />
                  Oldest First
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setCurrentSort('likes')}
                  className={currentSort === 'likes' ? 'bg-accent' : ''}
                >
                  <Heart className="h-3 w-3 mr-2" />
                  Most Liked
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Reply button */}
        {user && isExpanded && !isReplying && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsReplying(true)}
            className="text-xs"
            disabled={isSubmitting}
          >
            Reply to review
          </Button>
        )}
      </div>

      {/* Reply form for direct replies */}
      {isReplying && isExpanded && (
        <ReplyForm
          reviewId={reviewId}
          parentReplyId={null}
          onSubmit={(content) => handleReplySubmit(null, content)}
          onCancel={() => setIsReplying(false)}
          isVisible={isReplying}
          isSubmitting={isSubmitting}
          placeholder="Write a reply to this review..."
        />
      )}

      {/* Expanded reply list */}
      {isExpanded && (
        <div className="space-y-1">
          {isLoading && sortedReplies.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">Loading replies...</span>
            </div>
          ) : (
            <>
              {/* Render nested reply tree */}
              {replyTree.map((reply, index) => (
                <div key={reply.id}>
                  {index > 0 && <Separator className="my-3" />}
                  <ReplyItem
                    reply={reply}
                    reviewId={reviewId}
                    maxDepth={maxDepth}
                    currentDepth={0}
                    onReplySubmit={(parentReplyId, content) => 
                      handleReplySubmit(parentReplyId, content)
                    }
                  />
                </div>
              ))}

              {/* Load more button */}
              {showLoadMore && onLoadMore && (
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onLoadMore}
                    disabled={isLoading}
                    className="text-xs"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load more replies'
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Collapsed state hint */}
      {!isExpanded && hasReplies && (
        <div className="text-xs text-muted-foreground pl-4 border-l-2 border-muted">
          Click to view {totalReplies} {totalReplies === 1 ? 'reply' : 'replies'}
        </div>
      )}
    </div>
  );
});

ReplyList.displayName = 'ReplyList';

export default ReplyList;