import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Reply as ReplyIcon, MessageSquare } from 'lucide-react';
import { ReplyButtonProps } from '@/types/reply';
import { cn } from '@/lib/utils';

const ReplyButton: React.FC<ReplyButtonProps> = memo(({
  reviewId,
  onReplyClick,
  isReplying,
  replyCount = 0,
  className = '',
  disabled = false
}) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onReplyClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-2 text-sm transition-colors",
        isReplying 
          ? "text-primary bg-primary/10 hover:bg-primary/20" 
          : "text-muted-foreground hover:text-foreground",
        className
      )}
      data-testid={`reply-button-${reviewId}`}
    >
      <ReplyIcon className="h-3 w-3" />
      <span className="hidden sm:inline">
        {isReplying ? 'Cancel reply' : 'Reply'}
      </span>
      {replyCount > 0 && (
        <div className="flex items-center gap-1">
          <MessageSquare className="h-3 w-3" />
          <span className="text-xs">{replyCount}</span>
        </div>
      )}
    </Button>
  );
});

ReplyButton.displayName = 'ReplyButton';

export default ReplyButton;