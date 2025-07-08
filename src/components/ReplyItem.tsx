import React, { useState, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useReviewReplies } from '@/hooks/useReviewReplies';
import { toast } from '@/hooks/use-toast';
import { ReplyItemProps } from '@/types/reply';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Reply as ReplyIcon, 
  Edit3, 
  Trash2, 
  MoreHorizontal,
  Clock 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import UserProfile from '@/components/UserProfile';
import ReplyForm from '@/components/ReplyForm';

const ReplyItem: React.FC<ReplyItemProps> = memo(({
  reply,
  reviewId,
  maxDepth = 3,
  currentDepth = 0,
  onReplySubmit,
  onEdit,
  onDelete,
  onReaction
}) => {
  const { user } = useAuth();
  const { toggleReaction, getUserReaction, updateReply, deleteReply } = useReviewReplies();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(reply.content);
  const [isReplying, setIsReplying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOwnReply = user && reply.user_id === user.id;
  const canNestFurther = currentDepth < maxDepth;
  const userReaction = getUserReaction(reply.id);

  // Calculate indentation based on depth
  const getIndentClass = (depth: number) => {
    const indent = Math.min(depth * 4, 12); // Max 12 (pl-12)
    return `pl-${indent}`;
  };

  // Format relative time
  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  // Handle reaction toggle
  const handleReaction = async (type: 'like' | 'dislike') => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to react to replies.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (onReaction) {
        await onReaction(reply.id, type);
      } else {
        await toggleReaction(reply.id, type);
      }
    } catch (error) {
      console.error('[ReplyItem] Error toggling reaction:', error);
      toast({
        title: "Error",
        description: "Failed to update reaction.",
        variant: "destructive",
      });
    }
  };

  // Handle edit submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editContent.trim()) return;

    try {
      setIsSubmitting(true);
      if (onEdit) {
        await onEdit(reply.id, editContent.trim());
      } else {
        await updateReply(reply.id, { content: editContent.trim() });
      }
      setIsEditing(false);
      toast({
        title: "Reply updated",
        description: "Your reply has been updated successfully.",
      });
    } catch (error) {
      console.error('[ReplyItem] Error updating reply:', error);
      toast({
        title: "Error",
        description: "Failed to update reply.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this reply?')) return;

    try {
      if (onDelete) {
        await onDelete(reply.id);
      } else {
        await deleteReply(reply.id);
      }
      toast({
        title: "Reply deleted",
        description: "Your reply has been deleted successfully.",
      });
    } catch (error) {
      console.error('[ReplyItem] Error deleting reply:', error);
      toast({
        title: "Error",
        description: "Failed to delete reply.",
        variant: "destructive",
      });
    }
  };

  // Handle reply submit
  const handleReplySubmit = async (content: string) => {
    try {
      setIsSubmitting(true);
      if (onReplySubmit) {
        await onReplySubmit(reply.id, content);
      }
      setIsReplying(false);
    } catch (error) {
      console.error('[ReplyItem] Error submitting reply:', error);
      throw error; // Let ReplyForm handle the error toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${getIndentClass(currentDepth)} ${currentDepth > 0 ? 'border-l border-border/30 ml-6' : ''}`}>
      <div className="py-3 space-y-3">
        {/* Reply header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {reply.user ? (
              <UserProfile
                username={reply.user.username}
                userId={reply.user_id}
                profilePicture={reply.user.profile_picture_url}
                size="sm"
              />
            ) : (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">?</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">Unknown User</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{formatRelativeTime(reply.created_at)}</span>
              {reply.updated_at !== reply.created_at && (
                <span className="text-xs">(edited)</span>
              )}
            </div>
          </div>

          {/* Action menu */}
          {(isOwnReply || user?.role === 'admin') && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isOwnReply && (
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit3 className="h-3 w-3 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash2 className="h-3 w-3 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Reply content */}
        {isEditing ? (
          <form onSubmit={handleEditSubmit} className="space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[60px] text-sm"
              disabled={isSubmitting}
              autoFocus
            />
            <div className="flex gap-2">
              <Button 
                type="submit" 
                size="sm" 
                disabled={isSubmitting || !editContent.trim()}
              >
                Save
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(reply.content);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-sm text-foreground leading-relaxed pl-8">
            {reply.content}
          </div>
        )}

        {/* Reply actions */}
        {!isEditing && (
          <div className="flex items-center gap-4 pl-8">
            {/* Reaction buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReaction('like')}
                className={`h-6 px-2 text-xs ${
                  userReaction?.reaction_type === 'like'
                    ? 'text-green-600 bg-green-50 hover:bg-green-100'
                    : 'text-muted-foreground hover:text-green-600'
                }`}
              >
                <ThumbsUp className="h-3 w-3 mr-1" />
                {reply.likes > 0 && reply.likes}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReaction('dislike')}
                className={`h-6 px-2 text-xs ${
                  userReaction?.reaction_type === 'dislike'
                    ? 'text-red-600 bg-red-50 hover:bg-red-100'
                    : 'text-muted-foreground hover:text-red-600'
                }`}
              >
                <ThumbsDown className="h-3 w-3 mr-1" />
                {reply.dislikes > 0 && reply.dislikes}
              </Button>
            </div>

            {/* Reply button */}
            {canNestFurther && user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsReplying(!isReplying)}
                className={`h-6 px-2 text-xs ${
                  isReplying ? 'text-primary bg-primary/10' : 'text-muted-foreground'
                }`}
                disabled={isSubmitting}
              >
                <ReplyIcon className="h-3 w-3 mr-1" />
                Reply
              </Button>
            )}
          </div>
        )}

        {/* Nested reply form */}
        {isReplying && canNestFurther && (
          <div className="pl-8">
            <ReplyForm
              reviewId={reviewId}
              parentReplyId={reply.id}
              onSubmit={handleReplySubmit}
              onCancel={() => setIsReplying(false)}
              isVisible={isReplying}
              isSubmitting={isSubmitting}
              placeholder={`Reply to ${reply.user?.username || 'user'}...`}
            />
          </div>
        )}

        {/* Render nested replies */}
        {reply.replies && reply.replies.length > 0 && (
          <div className="space-y-0">
            {reply.replies.map((nestedReply) => (
              <ReplyItem
                key={nestedReply.id}
                reply={nestedReply}
                reviewId={reviewId}
                maxDepth={maxDepth}
                currentDepth={currentDepth + 1}
                onReplySubmit={onReplySubmit}
                onEdit={onEdit}
                onDelete={onDelete}
                onReaction={onReaction}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

ReplyItem.displayName = 'ReplyItem';

export default ReplyItem;