
-- Fix Function Search Path issues by setting proper search_path
ALTER FUNCTION public.handle_new_user() SET search_path = 'public, auth';
ALTER FUNCTION public.update_review_reaction_counts() SET search_path = 'public';
ALTER FUNCTION public.is_admin(uuid) SET search_path = 'public';
ALTER FUNCTION public.check_vote_rate_limit(uuid) SET search_path = 'public';
ALTER FUNCTION public.refresh_vote_counts() SET search_path = 'public';

-- Remove materialized view from API exposure for security
REVOKE SELECT ON public.influencer_vote_counts FROM anon, authenticated;

-- Grant specific access only to authenticated users for the materialized view
GRANT SELECT ON public.influencer_vote_counts TO authenticated;

-- Set shorter OTP expiry (currently using default which may be too long)
-- Note: This is handled at the project level in Supabase dashboard under Auth > Settings
-- The warning suggests the OTP expiry exceeds recommended threshold
