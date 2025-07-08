-- Fix reply rate limit to match frontend expectations
-- Change from 3 hours to 1 minute cooldown

-- Updated rate limiting function for replies (1 minute cooldown)
CREATE OR REPLACE FUNCTION public.check_reply_rate_limit(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COUNT(*) < 1 
  FROM public.review_replies 
  WHERE review_replies.user_id = check_reply_rate_limit.user_id 
    AND created_at > NOW() - INTERVAL '1 minute';
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.check_reply_rate_limit(uuid) TO authenticated;