-- Add 500 character limit to review content
-- This migration adds a database constraint to enforce the 500 character limit for reviews

-- Add constraint to reviews table
ALTER TABLE public.reviews 
ADD CONSTRAINT reviews_content_length_check 
CHECK (length(content) <= 500);

-- Add constraint to expert_reviews table if it exists
ALTER TABLE public.expert_reviews 
ADD CONSTRAINT expert_reviews_content_length_check 
CHECK (length(content) <= 500);

-- Add helpful comment
COMMENT ON CONSTRAINT reviews_content_length_check ON public.reviews IS 
'Ensures review content does not exceed 500 characters';

COMMENT ON CONSTRAINT expert_reviews_content_length_check ON public.expert_reviews IS 
'Ensures expert review content does not exceed 500 characters';

-- Create a function to validate review content length
CREATE OR REPLACE FUNCTION public.validate_review_content(content_text TEXT)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT length(content_text) <= 500 AND length(content_text) > 0;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.validate_review_content(TEXT) TO authenticated;

-- Add comment to function
COMMENT ON FUNCTION public.validate_review_content(TEXT) IS 
'Validates that review content is between 1 and 500 characters';

-- Create a function to truncate review content if needed (for existing data)
CREATE OR REPLACE FUNCTION public.truncate_review_content(content_text TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT 
    CASE 
      WHEN length(content_text) <= 500 THEN content_text
      ELSE substring(content_text from 1 for 497) || '...'
    END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.truncate_review_content(TEXT) TO authenticated;

-- Add comment to function
COMMENT ON FUNCTION public.truncate_review_content(TEXT) IS 
'Truncates review content to 500 characters with ellipsis if needed';

-- Update any existing reviews that exceed the limit (safety measure)
UPDATE public.reviews 
SET content = truncate_review_content(content)
WHERE length(content) > 500;

-- Update any existing expert reviews that exceed the limit (safety measure)
UPDATE public.expert_reviews 
SET content = truncate_review_content(content)
WHERE length(content) > 500;

-- Create an index for better performance on content length queries
CREATE INDEX IF NOT EXISTS idx_reviews_content_length ON public.reviews (length(content));
CREATE INDEX IF NOT EXISTS idx_expert_reviews_content_length ON public.expert_reviews (length(content));

-- Log the migration
INSERT INTO public.migrations_log (migration_name, applied_at) VALUES 
('add_review_character_limit', NOW()) 
ON CONFLICT (migration_name) DO UPDATE SET applied_at = NOW();