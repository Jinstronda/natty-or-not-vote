import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  ReviewReply, 
  NestedRepliesOptions, 
  PaginatedRepliesResponse,
  ReplySortOption 
} from '@/types/reply';

interface UseNestedRepliesResult {
  replies: ReviewReply[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  totalCount: number;
  replyTree: ReviewReply[];
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  expandReply: (replyId: string) => void;
  collapseReply: (replyId: string) => void;
  isExpanded: (replyId: string) => boolean;
}

export const useNestedReplies = (options: NestedRepliesOptions): UseNestedRepliesResult => {
  const {
    reviewId,
    maxDepth = 3,
    pageSize = 20,
    enabled = true
  } = options;

  const [replies, setReplies] = useState<ReviewReply[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [cursor, setCursor] = useState<string | null>(null);

  // Fetch nested replies using the database function
  const fetchNestedReplies = useCallback(async (reset = false) => {
    if (!enabled || !reviewId) return;

    try {
      setLoading(true);
      setError(null);

      console.log('[useNestedReplies] Fetching nested replies for review:', reviewId);

      // Use the database function to get nested replies efficiently
      const { data, error: fetchError } = await supabase
        .rpc('get_nested_replies', {
          p_review_id: reviewId,
          p_max_depth: maxDepth
        });

      if (fetchError) {
        console.error('[useNestedReplies] Supabase error:', fetchError);
        throw fetchError;
      }

      const formattedReplies: ReviewReply[] = data?.map((reply: {
        id: string;
        review_id: string;
        parent_reply_id: string | null;
        user_id: string;
        content: string;
        likes: number;
        dislikes: number;
        created_at: string;
        updated_at: string;
        username: string;
        profile_picture_url: string | null;
        depth: number;
      }) => ({
        id: reply.id,
        review_id: reply.review_id,
        parent_reply_id: reply.parent_reply_id,
        user_id: reply.user_id,
        content: reply.content,
        likes: reply.likes || 0,
        dislikes: reply.dislikes || 0,
        created_at: reply.created_at,
        updated_at: reply.updated_at,
        depth: reply.depth || 0,
        user: {
          username: reply.username || 'Unknown User',
          profile_picture_url: reply.profile_picture_url || null
        }
      })) || [];

      if (reset) {
        setReplies(formattedReplies);
      } else {
        setReplies(prev => [...prev, ...formattedReplies]);
      }

      setTotalCount(formattedReplies.length);
      setHasMore(formattedReplies.length >= pageSize);

      console.log('[useNestedReplies] Fetched replies:', formattedReplies.length);
    } catch (error) {
      console.error('[useNestedReplies] Error fetching nested replies:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch replies';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [enabled, reviewId, maxDepth, pageSize]);

  // Load more replies (pagination)
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    await fetchNestedReplies(false);
  }, [loading, hasMore, fetchNestedReplies]);

  // Refresh replies
  const refresh = useCallback(async () => {
    setCursor(null);
    await fetchNestedReplies(true);
  }, [fetchNestedReplies]);

  // Expand a reply to show its children
  const expandReply = useCallback((replyId: string) => {
    setExpandedReplies(prev => new Set([...prev, replyId]));
  }, []);

  // Collapse a reply to hide its children
  const collapseReply = useCallback((replyId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      newSet.delete(replyId);
      return newSet;
    });
  }, []);

  // Check if a reply is expanded
  const isExpanded = useCallback((replyId: string) => {
    return expandedReplies.has(replyId);
  }, [expandedReplies]);

  // Build reply tree structure with nesting
  const replyTree = useMemo(() => {
    const buildTree = (parentId: string | null = null, depth = 0): ReviewReply[] => {
      const children = replies
        .filter(reply => reply.parent_reply_id === parentId)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      return children.map(reply => ({
        ...reply,
        depth,
        replies: depth < maxDepth ? buildTree(reply.id, depth + 1) : [],
        isExpanded: isExpanded(reply.id),
        replyCount: replies.filter(r => r.parent_reply_id === reply.id).length
      }));
    };

    return buildTree();
  }, [replies, maxDepth, isExpanded]);

  // Get replies sorted by option
  const getSortedReplies = useCallback((sortBy: ReplySortOption = 'recent'): ReviewReply[] => {
    const sortedReplies = [...replies];
    
    switch (sortBy) {
      case 'recent':
        return sortedReplies.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case 'oldest':
        return sortedReplies.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      case 'likes':
        return sortedReplies.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      default:
        return sortedReplies;
    }
  }, [replies]);

  // Get direct children of a reply
  const getDirectChildren = useCallback((parentId: string): ReviewReply[] => {
    return replies.filter(reply => reply.parent_reply_id === parentId);
  }, [replies]);

  // Get all descendants of a reply (recursive)
  const getAllDescendants = useCallback((parentId: string): ReviewReply[] => {
    const descendants: ReviewReply[] = [];
    const directChildren = getDirectChildren(parentId);
    
    for (const child of directChildren) {
      descendants.push(child);
      descendants.push(...getAllDescendants(child.id));
    }
    
    return descendants;
  }, [getDirectChildren]);

  // Get reply statistics
  const getReplyStats = useCallback(() => {
    const directReplies = replies.filter(r => r.parent_reply_id === null).length;
    const nestedReplies = replies.filter(r => r.parent_reply_id !== null).length;
    const maxDepthFound = Math.max(...replies.map(r => r.depth || 0));
    
    return {
      totalReplies: replies.length,
      directReplies,
      nestedReplies,
      maxDepth: maxDepthFound,
      avgDepth: replies.length ? replies.reduce((sum, r) => sum + (r.depth || 0), 0) / replies.length : 0
    };
  }, [replies]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!enabled || !reviewId) return;

    let channel: any = null;

    const setupChannel = async () => {
      console.log('[useNestedReplies] Setting up real-time subscription for review:', reviewId);

      try {
        channel = supabase
          .channel(`nested_replies_${reviewId}_${Date.now()}`) // Unique channel name with timestamp
          .on('postgres_changes', 
            { 
              event: '*', 
              schema: 'public', 
              table: 'review_replies',
              filter: `review_id=eq.${reviewId}`
            },
            (payload) => {
              console.log('[useNestedReplies] Real-time update received:', payload);
              // Use setTimeout to prevent blocking the UI
              setTimeout(() => {
                refresh();
              }, 100);
            }
          )
          .subscribe((status) => {
            console.log('[useNestedReplies] Subscription status:', status);
          });
      } catch (error) {
        console.error('[useNestedReplies] Error setting up real-time subscription:', error);
      }
    };

    setupChannel();

    return () => {
      if (channel) {
        console.log('[useNestedReplies] Cleaning up real-time subscription');
        supabase.removeChannel(channel);
      }
    };
  }, [enabled, reviewId, refresh]);

  // Initial fetch
  useEffect(() => {
    if (enabled && reviewId) {
      fetchNestedReplies(true);
    }
  }, [enabled, reviewId, fetchNestedReplies]);

  return {
    replies,
    loading,
    error,
    hasMore,
    totalCount,
    replyTree,
    loadMore,
    refresh,
    expandReply,
    collapseReply,
    isExpanded,
    // Additional utility functions
    getSortedReplies,
    getDirectChildren,
    getAllDescendants,
    getReplyStats
  } as UseNestedRepliesResult & {
    getSortedReplies: (sortBy?: ReplySortOption) => ReviewReply[];
    getDirectChildren: (parentId: string) => ReviewReply[];
    getAllDescendants: (parentId: string) => ReviewReply[];
    getReplyStats: () => {
      totalReplies: number;
      directReplies: number;
      nestedReplies: number;
      maxDepth: number;
      avgDepth: number;
    };
  };
};