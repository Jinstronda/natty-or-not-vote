-- Create storage buckets for profile pictures and influencer photos
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('profile-pictures', 'profile-pictures', true),
  ('influencer-photos', 'influencer-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up simple storage policies for profile pictures
DROP POLICY IF EXISTS "Users can upload their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Profile pictures are publicly readable" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile pictures" ON storage.objects;

CREATE POLICY "Users can manage their own profile pictures" ON storage.objects
  FOR ALL USING (bucket_id = 'profile-pictures' AND auth.uid()::text = name::text)
  WITH CHECK (bucket_id = 'profile-pictures' AND auth.uid()::text = name::text);

CREATE POLICY "Profile pictures are publicly readable" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-pictures');

-- Set up storage policies for influencer photos
DROP POLICY IF EXISTS "Admins can upload influencer photos" ON storage.objects;
DROP POLICY IF EXISTS "Influencer photos are publicly readable" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update influencer photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete influencer photos" ON storage.objects;

CREATE POLICY "Admins can manage influencer photos" ON storage.objects
  FOR ALL USING (bucket_id = 'influencer-photos' AND is_admin(auth.uid()))
  WITH CHECK (bucket_id = 'influencer-photos' AND is_admin(auth.uid()));

CREATE POLICY "Influencer photos are publicly readable" ON storage.objects
  FOR SELECT USING (bucket_id = 'influencer-photos');