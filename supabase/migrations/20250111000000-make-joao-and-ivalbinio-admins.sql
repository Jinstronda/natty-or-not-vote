-- Make joaopanizzutti@gmail.com and ivalbinio@gmail.com admins
UPDATE profiles 
SET role = 'admin' 
WHERE email IN ('joaopanizzutti@gmail.com', 'ivalbinio@gmail.com');

-- Update the automatic user creation function to include these admin emails
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)), 
    NEW.email,
    CASE 
      WHEN NEW.email IN ('jistronda100@gmail.com', 'joaopanizzutti@gmail.com', 'ivalbinio@gmail.com') THEN 'admin'
      ELSE 'user'
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    username = COALESCE(EXCLUDED.username, profiles.username),
    role = CASE 
      WHEN EXCLUDED.email IN ('jistronda100@gmail.com', 'joaopanizzutti@gmail.com', 'ivalbinio@gmail.com') THEN 'admin'
      ELSE profiles.role
    END;
  RETURN NEW;
END;
$$ language plpgsql security definer;

-- If the profiles don't exist yet, this will be handled by the app when they first sign up
-- Log the admin grant action
INSERT INTO public.security_audit_log (event_type, event_details) 
VALUES ('admin_grant', jsonb_build_object(
  'emails', ARRAY['joaopanizzutti@gmail.com', 'ivalbinio@gmail.com'],
  'granted_by', 'migration',
  'timestamp', NOW()
)); 