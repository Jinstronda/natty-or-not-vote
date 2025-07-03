-- Migration: Set security_invoker=true for influencers_sorted_by_votes view
-- Ensures the view respects RLS and does not bypass security policies

ALTER VIEW public.influencers_sorted_by_votes SET (security_invoker = true); 