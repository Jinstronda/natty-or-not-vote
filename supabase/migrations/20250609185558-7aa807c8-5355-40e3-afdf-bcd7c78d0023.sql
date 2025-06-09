
-- Create a storage bucket for influencer images
INSERT INTO storage.buckets (id, name, public)
VALUES ('influencer-images', 'influencer-images', true);

-- Create storage policies to allow users to upload images
CREATE POLICY "Anyone can view influencer images" ON storage.objects FOR SELECT USING (bucket_id = 'influencer-images');

CREATE POLICY "Authenticated users can upload influencer images" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'influencer-images' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own uploads" ON storage.objects FOR UPDATE USING (
  bucket_id = 'influencer-images' AND 
  auth.uid() = owner
);

CREATE POLICY "Users can delete their own uploads" ON storage.objects FOR DELETE USING (
  bucket_id = 'influencer-images' AND 
  auth.uid() = owner
);

-- Add an image_url column to the influencer_suggestions table
ALTER TABLE public.influencer_suggestions 
ADD COLUMN image_url TEXT;

-- Add an image_url column to the influencers table if it doesn't exist
ALTER TABLE public.influencers 
ALTER COLUMN image SET DEFAULT NULL;
