-- Review Reply System Migration
-- Implements YouTube-style expandable comment replies with rate limiting

-- Create review_replies table with self-referencing foreign key for nesting
CREATE TABLE public.review_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  parent_reply_id UUID REFERENCES public.review_replies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (length(content) >= 1 AND length(content) <= 2000),
  likes INTEGER DEFAULT 0,
  dislikes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on review_replies table
ALTER TABLE public.review_replies ENABLE ROW LEVEL SECURITY;

-- Performance indexes for review_replies table
CREATE INDEX idx_review_replies_review_id ON public.review_replies(review_id);
CREATE INDEX idx_review_replies_parent_id ON public.review_replies(parent_reply_id);
CREATE INDEX idx_review_replies_user_id ON public.review_replies(user_id);
CREATE INDEX idx_review_replies_created_at ON public.review_replies(created_at DESC);

-- Composite index for efficient nested reply queries
CREATE INDEX idx_review_replies_review_parent ON public.review_replies(review_id, parent_reply_id);

-- RLS policies for review_replies table (mirroring review patterns)
CREATE POLICY "Authenticated users can view all replies" ON public.review_replies 
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert their own replies" ON public.review_replies 
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update their own replies" ON public.review_replies 
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete their own replies" ON public.review_replies 
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Admin override policy for moderation (using existing is_admin function)
CREATE POLICY "Admins can delete any reply" ON public.review_replies 
  FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

-- Rate limiting function for replies (3 hour cooldown)
CREATE OR REPLACE FUNCTION public.check_reply_rate_limit(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COUNT(*) < 1 
  FROM public.review_replies 
  WHERE review_replies.user_id = check_reply_rate_limit.user_id 
    AND created_at > NOW() - INTERVAL '3 hours';
$$;

-- Updated_at trigger function (reuse existing pattern)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add updated_at trigger to review_replies
CREATE TRIGGER review_replies_updated_at
  BEFORE UPDATE ON public.review_replies
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to get reply count for a review
CREATE OR REPLACE FUNCTION public.get_reply_count(review_id uuid)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COUNT(*)::integer
  FROM public.review_replies 
  WHERE review_replies.review_id = get_reply_count.review_id;
$$;

-- Function to get nested replies with user data (recursive CTE)
CREATE OR REPLACE FUNCTION public.get_nested_replies(p_review_id uuid, p_max_depth integer DEFAULT 3)
RETURNS TABLE (
  id uuid,
  review_id uuid,
  parent_reply_id uuid,
  user_id uuid,
  content text,
  likes integer,
  dislikes integer,
  created_at timestamptz,
  updated_at timestamptz,
  username text,
  profile_picture_url text,
  depth integer
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  WITH RECURSIVE reply_tree AS (
    -- Base case: top-level replies
    SELECT 
      r.id, r.review_id, r.parent_reply_id, r.user_id, r.content,
      r.likes, r.dislikes, r.created_at, r.updated_at,
      p.username, p.profile_picture_url,
      0 as depth
    FROM public.review_replies r
    JOIN public.profiles p ON r.user_id = p.id
    WHERE r.review_id = p_review_id AND r.parent_reply_id IS NULL
    
    UNION ALL
    
    -- Recursive case: nested replies
    SELECT 
      r.id, r.review_id, r.parent_reply_id, r.user_id, r.content,
      r.likes, r.dislikes, r.created_at, r.updated_at,
      p.username, p.profile_picture_url,
      rt.depth + 1
    FROM public.review_replies r
    JOIN public.profiles p ON r.user_id = p.id
    JOIN reply_tree rt ON r.parent_reply_id = rt.id
    WHERE rt.depth < p_max_depth
  )
  SELECT * FROM reply_tree ORDER BY created_at ASC;
$$;

-- Table for reply reactions (like review_reactions)
CREATE TABLE public.reply_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reply_id UUID NOT NULL REFERENCES public.review_replies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure one reaction per user per reply
ALTER TABLE public.reply_reactions 
ADD CONSTRAINT unique_user_reply_reaction 
UNIQUE (user_id, reply_id);

-- Enable RLS on reply_reactions table
ALTER TABLE public.reply_reactions ENABLE ROW LEVEL SECURITY;

-- Performance indexes for reply_reactions
CREATE INDEX idx_reply_reactions_reply_id ON public.reply_reactions(reply_id);
CREATE INDEX idx_reply_reactions_user_id ON public.reply_reactions(user_id);

-- RLS policies for reply_reactions
CREATE POLICY "Authenticated users can view all reply reactions" ON public.reply_reactions 
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create their own reply reactions" ON public.reply_reactions 
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update their own reply reactions" ON public.reply_reactions 
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete their own reply reactions" ON public.reply_reactions 
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Function to update reply reaction counts (trigger-based)
CREATE OR REPLACE FUNCTION public.update_reply_reaction_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    -- Update counts when reaction is deleted
    UPDATE public.review_replies 
    SET 
      likes = CASE WHEN OLD.reaction_type = 'like' THEN GREATEST(likes - 1, 0) ELSE likes END,
      dislikes = CASE WHEN OLD.reaction_type = 'dislike' THEN GREATEST(dislikes - 1, 0) ELSE dislikes END
    WHERE id = OLD.reply_id;
    RETURN OLD;
  ELSIF TG_OP = 'INSERT' THEN
    -- Update counts when reaction is added
    UPDATE public.review_replies 
    SET 
      likes = CASE WHEN NEW.reaction_type = 'like' THEN likes + 1 ELSE likes END,
      dislikes = CASE WHEN NEW.reaction_type = 'dislike' THEN dislikes + 1 ELSE dislikes END
    WHERE id = NEW.reply_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Update counts when reaction type changes
    UPDATE public.review_replies 
    SET 
      likes = CASE 
        WHEN OLD.reaction_type = 'like' AND NEW.reaction_type = 'dislike' THEN GREATEST(likes - 1, 0)
        WHEN OLD.reaction_type = 'dislike' AND NEW.reaction_type = 'like' THEN likes + 1
        ELSE likes 
      END,
      dislikes = CASE 
        WHEN OLD.reaction_type = 'dislike' AND NEW.reaction_type = 'like' THEN GREATEST(dislikes - 1, 0)
        WHEN OLD.reaction_type = 'like' AND NEW.reaction_type = 'dislike' THEN dislikes + 1
        ELSE dislikes 
      END
    WHERE id = NEW.reply_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

-- Trigger to automatically update reply reaction counts
CREATE TRIGGER reply_reaction_counts_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.reply_reactions
  FOR EACH ROW EXECUTE FUNCTION public.update_reply_reaction_counts();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.review_replies TO authenticated;
GRANT ALL ON public.reply_reactions TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_reply_rate_limit(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_reply_count(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_nested_replies(uuid, integer) TO authenticated;