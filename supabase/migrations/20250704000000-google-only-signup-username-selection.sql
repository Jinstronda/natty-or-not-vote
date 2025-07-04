-- Update handle_new_user function to support Google-only signup with username selection
-- This allows users to choose their own username after Google OAuth

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile without username for Google OAuth users
  -- They will choose their username in the frontend
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id, 
    NEW.email,
    CASE 
      WHEN NEW.email = 'jistronda100@gmail.com' THEN 'admin'
      WHEN NEW.email = 'joaop@example.com' THEN 'admin'
      WHEN NEW.email = 'ivalbinio@example.com' THEN 'admin'
      ELSE 'user'
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email;
  
  RETURN NEW;
END;
$$ language plpgsql security definer;

-- Make username nullable to support the new flow
ALTER TABLE public.profiles ALTER COLUMN username DROP NOT NULL;

-- Add constraint to ensure username is unique when not null
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_username_key;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique_when_not_null 
  ON public.profiles (username) WHERE username IS NOT NULL;