import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ReplyRateLimit } from '@/types/reply';

export const useReplyRateLimit = () => {
  const { user } = useAuth();
  const [rateLimit, setRateLimit] = useState<ReplyRateLimit>({
    canReply: true,
    timeUntilNext: 0
  });
  const [isChecking, setIsChecking] = useState(false);

  // Check rate limit for current user
  const checkRateLimit = useCallback(async (): Promise<ReplyRateLimit> => {
    if (!user) {
      return { canReply: false, timeUntilNext: 0 };
    }

    try {
      setIsChecking(true);

      // Check using the database function
      const { data: canReply, error } = await supabase
        .rpc('check_reply_rate_limit', { user_id: user.id });

      if (error) {
        console.error('[useReplyRateLimit] Error checking rate limit:', error);
        throw error;
      }

      // Get last reply time for countdown calculation
      const { data: lastReply } = await supabase
        .from('review_replies')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      let timeUntilNext = 0;
      let lastReplyTime: string | undefined;

      if (!canReply && lastReply?.created_at) {
        lastReplyTime = lastReply.created_at;
        const lastReplyTimestamp = new Date(lastReply.created_at).getTime();
        const oneMinuteInMs = 1 * 60 * 1000; // 1 minute in milliseconds
        const timePassed = Date.now() - lastReplyTimestamp;
        timeUntilNext = Math.max(0, oneMinuteInMs - timePassed);
      }

      const result: ReplyRateLimit = {
        canReply: canReply || false,
        timeUntilNext,
        lastReplyTime
      };

      setRateLimit(result);
      return result;
    } catch (error) {
      console.error('[useReplyRateLimit] Error checking rate limit:', error);
      const fallbackResult: ReplyRateLimit = { canReply: false, timeUntilNext: 0 };
      setRateLimit(fallbackResult);
      return fallbackResult;
    } finally {
      setIsChecking(false);
    }
  }, [user]);

  // Format time remaining as human-readable string
  const formatTimeRemaining = useCallback((ms: number): string => {
    if (ms <= 0) return '0m';

    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return `${seconds}s`;
    }
  }, []);

  // Get user-friendly rate limit message
  const getRateLimitMessage = useCallback((rateLimitData?: ReplyRateLimit): string => {
    const data = rateLimitData || rateLimit;
    
    if (data.canReply) {
      return "You can post a reply now.";
    }

    if (data.timeUntilNext > 0) {
      const timeRemaining = formatTimeRemaining(data.timeUntilNext);
      return `You can post another reply in ${timeRemaining}.`;
    }

    return "Rate limit check needed.";
  }, [rateLimit, formatTimeRemaining]);

  // Check if enough time has passed since last reply
  const hasRateLimitExpired = useCallback((lastReplyTime?: string): boolean => {
    if (!lastReplyTime) return true;

    const lastReplyTimestamp = new Date(lastReplyTime).getTime();
    const oneMinuteInMs = 1 * 60 * 1000;
    const timePassed = Date.now() - lastReplyTimestamp;

    return timePassed >= oneMinuteInMs;
  }, []);

  // Auto-refresh rate limit when time expires
  useEffect(() => {
    if (!user || rateLimit.canReply || rateLimit.timeUntilNext <= 0) {
      return;
    }

    const timeoutId = setTimeout(() => {
      checkRateLimit();
    }, rateLimit.timeUntilNext + 1000); // Add 1 second buffer

    return () => clearTimeout(timeoutId);
  }, [user, rateLimit.canReply, rateLimit.timeUntilNext, checkRateLimit]);

  // Initial check when user changes
  useEffect(() => {
    if (user) {
      checkRateLimit();
    } else {
      setRateLimit({ canReply: false, timeUntilNext: 0 });
    }
  }, [user, checkRateLimit]);

  // Listen for new replies to update rate limit
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`rate_limit_${user.id}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'review_replies',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('[useReplyRateLimit] New reply detected, updating rate limit');
          checkRateLimit();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, checkRateLimit]);

  return {
    rateLimit,
    isChecking,
    checkRateLimit,
    formatTimeRemaining,
    getRateLimitMessage,
    hasRateLimitExpired,
    // Convenience getters
    canReply: rateLimit.canReply,
    timeUntilNext: rateLimit.timeUntilNext,
    timeRemaining: formatTimeRemaining(rateLimit.timeUntilNext),
    message: getRateLimitMessage()
  };
};