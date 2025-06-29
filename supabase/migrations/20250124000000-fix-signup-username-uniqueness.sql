-- Fix signup username uniqueness issue
-- This migration updates the handle_new_user function to ensure unique usernames

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 0;
BEGIN
  -- Generate base username from metadata or email
  base_username := COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1));
  
  -- Clean username (remove spaces, special chars, make lowercase)
  base_username := REGEXP_REPLACE(LOWER(base_username), '[^a-z0-9]', '', 'g');
  
  -- Ensure minimum length
  IF LENGTH(base_username) < 3 THEN
    base_username := 'user' || base_username;
  END IF;
  
  -- Check for uniqueness and add suffix if needed
  final_username := base_username;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := base_username || counter::TEXT;
  END LOOP;

  INSERT INTO public.profiles (id, username, email, role)
  VALUES (
    NEW.id, 
    final_username,
    NEW.email,
    CASE 
      WHEN NEW.email = 'jistronda100@gmail.com' THEN 'admin'
      WHEN NEW.email = 'joaop@example.com' THEN 'admin'
      WHEN NEW.email = 'ivalbinio@example.com' THEN 'admin'
      ELSE 'user'
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    username = COALESCE(EXCLUDED.username, profiles.username);
  RETURN NEW;
END;
$$ language plpgsql security definer; 