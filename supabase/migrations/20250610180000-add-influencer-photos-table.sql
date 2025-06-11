-- Migration: Add influencer_photos table for multiple images per influencer

CREATE TABLE public.influencer_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID NOT NULL REFERENCES public.influencers(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_influencer_photos_influencer_id ON public.influencer_photos(influencer_id); 