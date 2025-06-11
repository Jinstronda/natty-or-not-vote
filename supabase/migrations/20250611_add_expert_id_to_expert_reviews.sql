-- Add expert_id column to expert_reviews
ALTER TABLE public.expert_reviews
  ADD COLUMN expert_id UUID REFERENCES public.experts(id);

-- Backfill expert_id for existing reviews where author matches expert name
UPDATE public.expert_reviews er
SET expert_id = e.id
FROM public.experts e
WHERE er.author = e.name; 