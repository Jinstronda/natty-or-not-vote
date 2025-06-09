
-- Add indexes for performance optimization on frequently queried tables
-- These indexes will significantly improve query performance for voting and user interactions

-- Indexes for votes table (most critical for voting performance)
CREATE INDEX IF NOT EXISTS idx_votes_influencer_id ON public.votes(influencer_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON public.votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_influencer ON public.votes(user_id, influencer_id);
CREATE INDEX IF NOT EXISTS idx_votes_timestamp ON public.votes(timestamp DESC);

-- Indexes for reviews table (critical for review performance)
CREATE INDEX IF NOT EXISTS idx_reviews_influencer_id ON public.reviews(influencer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_timestamp ON public.reviews(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_likes ON public.reviews(likes DESC);

-- Indexes for influencers table
CREATE INDEX IF NOT EXISTS idx_influencers_name ON public.influencers(name);
CREATE INDEX IF NOT EXISTS idx_influencers_created_at ON public.influencers(created_at DESC);

-- Indexes for profiles table
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Indexes for review_reactions table (for like/dislike performance)
CREATE INDEX IF NOT EXISTS idx_review_reactions_review_id ON public.review_reactions(review_id);
CREATE INDEX IF NOT EXISTS idx_review_reactions_user_id ON public.review_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_review_reactions_user_review ON public.review_reactions(user_id, review_id);

-- Indexes for influencer_suggestions table
CREATE INDEX IF NOT EXISTS idx_suggestions_status ON public.influencer_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_suggestions_submitted_by ON public.influencer_suggestions(submitted_by);
CREATE INDEX IF NOT EXISTS idx_suggestions_timestamp ON public.influencer_suggestions(timestamp DESC);

-- Indexes for expert_reviews table
CREATE INDEX IF NOT EXISTS idx_expert_reviews_influencer_id ON public.expert_reviews(influencer_id);
CREATE INDEX IF NOT EXISTS idx_expert_reviews_rating ON public.expert_reviews(rating DESC);
CREATE INDEX IF NOT EXISTS idx_expert_reviews_likes ON public.expert_reviews(likes DESC);

-- Add proper RLS policies for data integrity and security

-- Enhanced RLS policies for votes table with better security
DROP POLICY IF EXISTS "Users can view all votes" ON public.votes;
DROP POLICY IF EXISTS "Users can insert their own votes" ON public.votes;
DROP POLICY IF EXISTS "Users can update their own votes" ON public.votes;
DROP POLICY IF EXISTS "Users can delete their own votes" ON public.votes;

CREATE POLICY "Authenticated users can view all votes" ON public.votes 
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert their own votes" ON public.votes 
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can update their own votes" ON public.votes 
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can delete their own votes" ON public.votes 
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Enhanced RLS policies for reviews table
DROP POLICY IF EXISTS "Users can view all reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can insert their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.reviews;

CREATE POLICY "Authenticated users can view all reviews" ON public.reviews 
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert their own reviews" ON public.reviews 
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can update their own reviews" ON public.reviews 
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can delete their own reviews" ON public.reviews 
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Enhanced RLS policies for review_reactions table
DROP POLICY IF EXISTS "Users can view all review reactions" ON public.review_reactions;
DROP POLICY IF EXISTS "Users can create their own review reactions" ON public.review_reactions;
DROP POLICY IF EXISTS "Users can update their own review reactions" ON public.review_reactions;
DROP POLICY IF EXISTS "Users can delete their own review reactions" ON public.review_reactions;

CREATE POLICY "Authenticated users can view all review reactions" ON public.review_reactions 
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create their own review reactions" ON public.review_reactions 
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can update their own review reactions" ON public.review_reactions 
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can delete their own review reactions" ON public.review_reactions 
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Enhanced RLS policies for influencer_suggestions table
DROP POLICY IF EXISTS "Users can view all suggestions" ON public.influencer_suggestions;
DROP POLICY IF EXISTS "Users can insert their own suggestions" ON public.influencer_suggestions;
DROP POLICY IF EXISTS "Only admins can update suggestions" ON public.influencer_suggestions;

CREATE POLICY "Authenticated users can view all suggestions" ON public.influencer_suggestions 
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert their own suggestions" ON public.influencer_suggestions 
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = submitted_by);

-- Create security definer function to check admin role (prevents infinite recursion)
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'admin'
  );
$$;

CREATE POLICY "Only admins can update suggestions" ON public.influencer_suggestions 
  FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));

-- Enhanced RLS policies for profiles table
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Authenticated users can view all profiles" ON public.profiles 
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles 
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles 
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Enhanced RLS policies for influencers table
DROP POLICY IF EXISTS "Anyone can view influencers" ON public.influencers;
DROP POLICY IF EXISTS "Only admins can insert influencers" ON public.influencers;
DROP POLICY IF EXISTS "Only admins can update influencers" ON public.influencers;
DROP POLICY IF EXISTS "Only admins can delete influencers" ON public.influencers;

CREATE POLICY "Anyone can view influencers" ON public.influencers 
  FOR SELECT USING (true);
CREATE POLICY "Only admins can insert influencers" ON public.influencers 
  FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Only admins can update influencers" ON public.influencers 
  FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Only admins can delete influencers" ON public.influencers 
  FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

-- Enhanced RLS policies for expert_reviews table
DROP POLICY IF EXISTS "Anyone can view expert reviews" ON public.expert_reviews;
DROP POLICY IF EXISTS "Only admins can manage expert reviews" ON public.expert_reviews;

CREATE POLICY "Anyone can view expert reviews" ON public.expert_reviews 
  FOR SELECT USING (true);
CREATE POLICY "Only admins can manage expert reviews" ON public.expert_reviews 
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Add rate limiting function for voting (prevents spam)
CREATE OR REPLACE FUNCTION public.check_vote_rate_limit(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COUNT(*) < 100 
  FROM public.votes 
  WHERE votes.user_id = check_vote_rate_limit.user_id 
    AND timestamp > NOW() - INTERVAL '1 hour';
$$;

-- Create materialized view for vote counts (performance optimization)
CREATE MATERIALIZED VIEW IF NOT EXISTS public.influencer_vote_counts AS
SELECT 
  influencer_id,
  COUNT(*) as total_votes,
  COUNT(*) FILTER (WHERE vote = 'natty') as natty_votes,
  COUNT(*) FILTER (WHERE vote = 'juicy') as juicy_votes,
  ROUND(
    (COUNT(*) FILTER (WHERE vote = 'natty')::decimal / COUNT(*)) * 100, 1
  ) as natty_percentage,
  ROUND(
    (COUNT(*) FILTER (WHERE vote = 'juicy')::decimal / COUNT(*)) * 100, 1
  ) as juicy_percentage
FROM public.votes
GROUP BY influencer_id;

-- Create unique index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_influencer_vote_counts_id 
ON public.influencer_vote_counts(influencer_id);

-- Function to refresh vote counts materialized view
CREATE OR REPLACE FUNCTION public.refresh_vote_counts()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.influencer_vote_counts;
$$;

-- Add constraint to prevent duplicate votes
ALTER TABLE public.votes 
DROP CONSTRAINT IF EXISTS unique_user_influencer_vote;
ALTER TABLE public.votes 
ADD CONSTRAINT unique_user_influencer_vote 
UNIQUE (user_id, influencer_id);
