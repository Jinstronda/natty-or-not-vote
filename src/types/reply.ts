import { Review } from './vote';

// Core reply interface matching database schema
export interface ReviewReply {
  id: string;
  review_id: string;
  parent_reply_id: string | null;
  user_id: string;
  content: string;
  likes: number;
  dislikes: number;
  created_at: string;
  updated_at: string;
  // Joined user data from profiles table
  user?: {
    username: string;
    profile_picture_url: string | null;
  };
  // For nested reply structure
  replies?: ReviewReply[];
  // UI state properties
  isExpanded?: boolean;
  replyCount?: number;
  depth?: number;
}

// Reply reaction interface
export interface ReplyReaction {
  id: string;
  reply_id: string;
  user_id: string;
  reaction_type: 'like' | 'dislike';
  created_at: string;
}

// Extended review interface with reply functionality
export interface ReviewWithReplies extends Review {
  replies?: ReviewReply[];
  replyCount: number;
  isRepliesExpanded: boolean;
  hasReplies: boolean;
}

// Reply form data interface
export interface ReplyFormData {
  reviewId: string;
  parentReplyId?: string | null;
  content: string;
}

// Reply submission payload
export interface CreateReplyPayload {
  review_id: string;
  parent_reply_id?: string | null;
  user_id: string;
  content: string;
}

// Reply update payload
export interface UpdateReplyPayload {
  content: string;
}

// Reply rate limit status
export interface ReplyRateLimit {
  canReply: boolean;
  timeUntilNext: number; // milliseconds until next reply allowed
  lastReplyTime?: string;
}

// Nested replies query options
export interface NestedRepliesOptions {
  reviewId: string;
  maxDepth?: number;
  pageSize?: number;
  cursor?: string;
  enabled?: boolean;
}

// Reply thread expansion state
export interface ReplyExpansionState {
  [reviewId: string]: {
    isExpanded: boolean;
    isLoading: boolean;
    error?: string;
  };
}

// Paginated reply response
export interface PaginatedRepliesResponse {
  replies: ReviewReply[];
  hasMore: boolean;
  totalCount: number;
  nextCursor?: string;
}

// Reply statistics
export interface ReplyStats {
  totalReplies: number;
  directReplies: number;
  nestedReplies: number;
  avgDepth: number;
}

// Reply sort options
export type ReplySortOption = 'recent' | 'oldest' | 'likes';

// Reply validation error
export interface ReplyValidationError {
  field: 'content' | 'rate_limit' | 'auth';
  message: string;
}

// Reply action types for optimistic updates
export type ReplyActionType = 
  | 'CREATE_REPLY'
  | 'UPDATE_REPLY'
  | 'DELETE_REPLY'
  | 'TOGGLE_REACTION'
  | 'EXPAND_REPLIES'
  | 'COLLAPSE_REPLIES';

// Reply action payload for optimistic updates
export interface ReplyAction {
  type: ReplyActionType;
  payload: {
    reviewId: string;
    replyId?: string;
    parentReplyId?: string | null;
    content?: string;
    reactionType?: 'like' | 'dislike';
    replies?: ReviewReply[];
  };
}

// Reply notification for real-time updates
export interface ReplyNotification {
  type: 'new_reply' | 'reply_updated' | 'reply_deleted' | 'reply_reaction';
  reviewId: string;
  replyId: string;
  userId: string;
  username: string;
  content?: string;
  timestamp: string;
}

// Component props interfaces
export interface ReplyFormProps {
  reviewId: string;
  parentReplyId?: string | null;
  onSubmit: (content: string) => Promise<void>;
  onCancel: () => void;
  isVisible: boolean;
  isSubmitting?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export interface ReplyItemProps {
  reply: ReviewReply;
  reviewId: string;
  maxDepth?: number;
  currentDepth?: number;
  onReplySubmit?: (parentReplyId: string, content: string) => Promise<void>;
  onEdit?: (replyId: string, content: string) => Promise<void>;
  onDelete?: (replyId: string) => Promise<void>;
  onReaction?: (replyId: string, type: 'like' | 'dislike') => Promise<void>;
}

export interface ReplyListProps {
  reviewId: string;
  replies: ReviewReply[];
  maxDepth?: number;
  currentDepth?: number;
  sortBy?: ReplySortOption;
  showLoadMore?: boolean;
  onLoadMore?: () => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

export interface ReplyButtonProps {
  reviewId: string;
  onReplyClick: () => void;
  isReplying: boolean;
  replyCount?: number;
  className?: string;
  disabled?: boolean;
}