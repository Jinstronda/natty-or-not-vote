
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

-- Update storage bucket configuration for enhanced security
UPDATE storage.buckets 
SET 
  file_size_limit = 5242880, -- 5MB limit
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
WHERE id = 'influencer-images';

-- Drop all existing storage policies first
DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view influencer images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload influencer images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their uploaded images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their uploaded images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own uploads" ON storage.objects;

-- Create secure storage policies with new names to avoid conflicts
CREATE POLICY "Public can view influencer images" ON storage.objects 
  FOR SELECT USING (bucket_id = 'influencer-images');

CREATE POLICY "Auth users can upload to influencer bucket" ON storage.objects 
  FOR INSERT TO authenticated 
  WITH CHECK (
    bucket_id = 'influencer-images' AND 
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = 'uploads'
  );

CREATE POLICY "Users can update own influencer images" ON storage.objects 
  FOR UPDATE TO authenticated 
  USING (bucket_id = 'influencer-images' AND auth.uid() = owner);

CREATE POLICY "Users can delete own influencer images" ON storage.objects 
  FOR DELETE TO authenticated 
  USING (bucket_id = 'influencer-images' AND auth.uid() = owner);

-- Add rate limiting function for file uploads
CREATE OR REPLACE FUNCTION public.check_upload_rate_limit(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
  SELECT COUNT(*) < 10 
  FROM storage.objects 
  WHERE owner = user_id 
    AND created_at > NOW() - INTERVAL '1 hour';
$$;

-- Add audit logging table for security events
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  event_type TEXT NOT NULL,
  event_details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs" ON public.security_audit_log 
  FOR SELECT TO authenticated 
  USING (public.is_admin(auth.uid()));

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" ON public.security_audit_log 
  FOR INSERT TO authenticated 
  WITH CHECK (true);
