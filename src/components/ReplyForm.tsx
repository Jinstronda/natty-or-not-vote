import React, { useState, useEffect, useRef, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useReviewReplies } from '@/hooks/useReviewReplies';
import { toast } from '@/hooks/use-toast';
import { ReplyFormProps } from '@/types/reply';
import { Loader2, Clock, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ReplyForm: React.FC<ReplyFormProps> = memo(({
  reviewId,
  parentReplyId = null,
  onSubmit,
  onCancel,
  isVisible,
  isSubmitting = false,
  placeholder = "Write a reply...",
  maxLength = 2000
}) => {
  const { user } = useAuth();
  const { checkRateLimit } = useReviewReplies();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimit, setRateLimit] = useState<{ canReply: boolean; timeUntilNext: number } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Check rate limit when component mounts
  useEffect(() => {
    if (isVisible && user) {
      checkRateLimit().then(setRateLimit);
    }
  }, [isVisible, user, checkRateLimit]);

  // Auto-focus textarea when visible
  useEffect(() => {
    if (isVisible && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isVisible]);

  // Format time remaining for rate limit
  const formatTimeRemaining = (ms: number): string => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to post a reply.",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please enter some content for your reply.",
        variant: "destructive",
      });
      return;
    }

    if (content.length > maxLength) {
      toast({
        title: "Reply too long",
        description: `Please keep your reply under ${maxLength} characters.`,
        variant: "destructive",
      });
      return;
    }

    // Check rate limit before submitting
    const currentRateLimit = await checkRateLimit();
    if (!currentRateLimit.canReply) {
      const timeRemaining = formatTimeRemaining(currentRateLimit.timeUntilNext);
      toast({
        title: "Rate limit exceeded",
        description: `Please wait ${timeRemaining} before posting another reply.`,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await onSubmit(content.trim());
      setContent('');
      toast({
        title: "Reply posted",
        description: "Your reply has been posted successfully.",
      });
    } catch (error) {
      console.error('[ReplyForm] Error submitting reply:', error);
      
      let errorMessage = "Failed to post reply. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes('Rate limit')) {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit with Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e as React.FormEvent);
    }
    
    // Cancel with Escape
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  const characterCount = content.length;
  const isOverLimit = characterCount > maxLength;
  const isNearLimit = characterCount > maxLength * 0.8;

  if (!isVisible) {
    return null;
  }

  if (!user) {
    return (
      <Alert className="mt-3">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please login to reply to this review.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="mt-3 p-4 border border-border rounded-lg bg-card/50">
      {/* Rate limit warning */}
      {rateLimit && !rateLimit.canReply && (
        <Alert className="mb-4" variant="destructive">
          <Clock className="h-4 w-4" />
          <AlertDescription>
            You can post another reply in {formatTimeRemaining(rateLimit.timeUntilNext)}. 
            This helps prevent spam and maintains discussion quality.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-2">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`min-h-[80px] resize-none focus:ring-2 focus:ring-primary/20 ${
              isOverLimit ? 'border-destructive focus:ring-destructive/20' : ''
            }`}
            disabled={isLoading || isSubmitting || (rateLimit && !rateLimit.canReply)}
          />
          
          {/* Character count */}
          <div className="flex justify-between items-center text-sm">
            <div className="text-muted-foreground">
              {parentReplyId ? 'Replying to comment' : 'Replying to review'}
            </div>
            <div className={`${
              isOverLimit ? 'text-destructive' : 
              isNearLimit ? 'text-orange-500' : 
              'text-muted-foreground'
            }`}>
              {characterCount}/{maxLength}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+Enter</kbd> to submit, 
            <kbd className="px-2 py-1 bg-muted rounded text-xs ml-1">Esc</kbd> to cancel
          </div>
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={isLoading || isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={
                isLoading || 
                isSubmitting || 
                !content.trim() || 
                isOverLimit ||
                (rateLimit && !rateLimit.canReply)
              }
              className="min-w-[80px]"
            >
              {(isLoading || isSubmitting) ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Posting...
                </>
              ) : (
                'Reply'
              )}
            </Button>
          </div>
        </div>

        {/* Guidelines */}
        <div className="text-xs text-muted-foreground pt-2 border-t border-border/50">
          Be respectful and constructive. Replies are subject to community guidelines.
        </div>
      </form>
    </div>
  );
});

ReplyForm.displayName = 'ReplyForm';

export default ReplyForm;