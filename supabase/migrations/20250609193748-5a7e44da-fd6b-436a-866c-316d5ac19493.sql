
-- Fix critical RLS policy gaps by adding proper user_id validation in WITH CHECK clauses

-- Drop existing policies that need to be updated
DROP POLICY IF EXISTS "Authenticated users can insert their own votes" ON public.votes;
DROP POLICY IF EXISTS "Authenticated users can insert their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Authenticated users can create their own review reactions" ON public.review_reactions;
DROP POLICY IF EXISTS "Authenticated users can insert their own suggestions" ON public.influencer_suggestions;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Recreate policies with proper WITH CHECK validation for INSERT operations
CREATE POLICY "Authenticated users can insert their own votes" ON public.votes 
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert their own reviews" ON public.reviews 
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create their own review reactions" ON public.review_reactions 
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert their own suggestions" ON public.influencer_suggestions 
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Users can insert their own profile" ON public.profiles 
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = id);

-- Create storage bucket for influencer images if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'influencer-images',
  'influencer-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Create storage policies for the bucket
CREATE POLICY "Anyone can view images" ON storage.objects 
  FOR SELECT USING (bucket_id = 'influencer-images');

CREATE POLICY "Authenticated users can upload images" ON storage.objects 
  FOR INSERT TO authenticated 
  WITH CHECK (bucket_id = 'influencer-images' AND (storage.foldername(name))[1] = 'uploads');

CREATE POLICY "Users can update their uploaded images" ON storage.objects 
  FOR UPDATE TO authenticated 
  USING (bucket_id = 'influencer-images');

CREATE POLICY "Users can delete their uploaded images" ON storage.objects 
  FOR DELETE TO authenticated 
  USING (bucket_id = 'influencer-images');
