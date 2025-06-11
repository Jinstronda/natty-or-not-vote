-- 1. Create the influencer_photos table
CREATE TABLE IF NOT EXISTS public.influencer_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID NOT NULL REFERENCES public.influencers(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  description TEXT DEFAULT '',
  "order" INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Migrate existing images to the new table
INSERT INTO public.influencer_photos (influencer_id, image_url, description, "order")
SELECT id, image, '', 0 FROM public.influencers WHERE image IS NOT NULL AND image <> ''; 