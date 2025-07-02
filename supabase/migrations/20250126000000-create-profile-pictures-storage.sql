-- Create profile-pictures storage bucket for user profile picture uploads
-- Migration: 20250126000000-create-profile-pictures-storage.sql

-- Create the profile-pictures storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'profile-pictures', 
  'profile-pictures', 
  true, 
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for profile-pictures bucket
-- These policies support both filename patterns used by the components:
-- 1. ProfilePictureUpload.tsx uses: user.id (just the user ID)
-- 2. EnhancedProfilePictureUpload.tsx uses: ${user.id}_${Date.now()} (user ID + timestamp)

-- Allow authenticated users to upload their own profile pictures
CREATE POLICY "Users can upload their own profile pictures" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'profile-pictures' 
  AND (
    auth.uid()::text = name OR 
    auth.uid()::text = SPLIT_PART(name, '_', 1)
  )
);

-- Allow authenticated users to update their own profile pictures  
CREATE POLICY "Users can update their own profile pictures" ON storage.objects 
FOR UPDATE USING (
  bucket_id = 'profile-pictures' 
  AND (
    auth.uid()::text = name OR 
    auth.uid()::text = SPLIT_PART(name, '_', 1)
  )
) WITH CHECK (
  bucket_id = 'profile-pictures' 
  AND (
    auth.uid()::text = name OR 
    auth.uid()::text = SPLIT_PART(name, '_', 1)
  )
);

-- Allow users to delete their own profile pictures
CREATE POLICY "Users can delete their own profile pictures" ON storage.objects 
FOR DELETE USING (
  bucket_id = 'profile-pictures' 
  AND (
    auth.uid()::text = name OR 
    auth.uid()::text = SPLIT_PART(name, '_', 1)
  )
);

-- Allow public read access to all profile pictures
CREATE POLICY "Anyone can view profile pictures" ON storage.objects 
FOR SELECT USING (bucket_id = 'profile-pictures');

-- Note: The profile_picture_url column in the profiles table was already created
-- in migration 20250609194300-add-profile-picture.sql 