
-- Add likes and dislikes columns to reviews table
ALTER TABLE public.reviews 
ADD COLUMN dislikes INTEGER NOT NULL DEFAULT 0;

-- Create a table for review likes/dislikes tracking
CREATE TABLE public.review_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, review_id)
);

-- Enable RLS on review_reactions
ALTER TABLE public.review_reactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for review_reactions
CREATE POLICY "Users can view all review reactions" ON public.review_reactions FOR SELECT USING (true);
CREATE POLICY "Users can create their own review reactions" ON public.review_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own review reactions" ON public.review_reactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own review reactions" ON public.review_reactions FOR DELETE USING (auth.uid() = user_id);

-- Create expert reviews table
CREATE TABLE public.expert_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  influencer_id UUID NOT NULL REFERENCES public.influencers(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  link_url TEXT,
  likes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on expert_reviews (only admins can manage)
ALTER TABLE public.expert_reviews ENABLE ROW LEVEL SECURITY;

-- RLS policies for expert_reviews
CREATE POLICY "Anyone can view expert reviews" ON public.expert_reviews FOR SELECT USING (true);
CREATE POLICY "Only admins can manage expert reviews" ON public.expert_reviews FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Function to update review likes/dislikes count
CREATE OR REPLACE FUNCTION update_review_reaction_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.reaction_type = 'like' THEN
      UPDATE public.reviews SET likes = likes + 1 WHERE id = NEW.review_id;
    ELSE
      UPDATE public.reviews SET dislikes = dislikes + 1 WHERE id = NEW.review_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Remove old reaction count
    IF OLD.reaction_type = 'like' THEN
      UPDATE public.reviews SET likes = likes - 1 WHERE id = OLD.review_id;
    ELSE
      UPDATE public.reviews SET dislikes = dislikes - 1 WHERE id = OLD.review_id;
    END IF;
    -- Add new reaction count
    IF NEW.reaction_type = 'like' THEN
      UPDATE public.reviews SET likes = likes + 1 WHERE id = NEW.review_id;
    ELSE
      UPDATE public.reviews SET dislikes = dislikes + 1 WHERE id = NEW.review_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.reaction_type = 'like' THEN
      UPDATE public.reviews SET likes = likes - 1 WHERE id = OLD.review_id;
    ELSE
      UPDATE public.reviews SET dislikes = dislikes - 1 WHERE id = OLD.review_id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating reaction counts
CREATE TRIGGER review_reaction_counts_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.review_reactions
  FOR EACH ROW
  EXECUTE FUNCTION update_review_reaction_counts();
