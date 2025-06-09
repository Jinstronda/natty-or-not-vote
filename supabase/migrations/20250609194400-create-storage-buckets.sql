-- Create storage buckets for profile pictures and influencer photos
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('profile-pictures', 'profile-pictures', true),
  ('influencer-photos', 'influencer-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for profile pictures
CREATE POLICY "Users can upload their own profile pictures" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Profile pictures are publicly readable" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-pictures');

CREATE POLICY "Users can update their own profile pictures" ON storage.objects
  FOR UPDATE USING (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own profile pictures" ON storage.objects
  FOR DELETE USING (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Set up storage policies for influencer photos (admin only)
CREATE POLICY "Admins can upload influencer photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'influencer-photos' AND is_admin(auth.uid()));

CREATE POLICY "Influencer photos are publicly readable" ON storage.objects
  FOR SELECT USING (bucket_id = 'influencer-photos');

CREATE POLICY "Admins can update influencer photos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'influencer-photos' AND is_admin(auth.uid()));

CREATE POLICY "Admins can delete influencer photos" ON storage.objects
  FOR DELETE USING (bucket_id = 'influencer-photos' AND is_admin(auth.uid()));