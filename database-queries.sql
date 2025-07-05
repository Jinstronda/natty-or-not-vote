-- INFLUENCER IMAGE ANALYSIS - DATABASE QUERIES
-- Run these queries in your Supabase SQL editor or any PostgreSQL client

-- ===================================================================
-- 1. OVERVIEW STATISTICS
-- ===================================================================

-- Total influencers count
SELECT COUNT(*) as total_influencers FROM influencers;

-- Image status breakdown
SELECT 
  COUNT(*) as total_influencers,
  SUM(CASE WHEN image IS NOT NULL AND image != '' THEN 1 ELSE 0 END) as with_images,
  SUM(CASE WHEN image IS NULL OR image = '' THEN 1 ELSE 0 END) as without_images,
  SUM(CASE WHEN image ILIKE '%placeholder%' OR image ILIKE '%dummy%' THEN 1 ELSE 0 END) as placeholder_images,
  SUM(CASE WHEN image ILIKE 'http://%' THEN 1 ELSE 0 END) as insecure_http_images
FROM influencers;

-- ===================================================================
-- 2. INFLUENCERS WITH IMAGE ISSUES
-- ===================================================================

-- All influencers without images
SELECT 
  id, 
  name, 
  created_at,
  updated_at
FROM influencers 
WHERE image IS NULL OR image = ''
ORDER BY name;

-- All influencers with placeholder images
SELECT 
  id,
  name,
  image,
  created_at
FROM influencers 
WHERE 
  image ILIKE '%placeholder%' 
  OR image ILIKE '%dummy%' 
  OR image ILIKE '%sample%'
  OR image ILIKE '%temp%'
ORDER BY name;

-- All influencers with suspicious image URLs
SELECT 
  id,
  name,
  image,
  created_at
FROM influencers 
WHERE 
  image ILIKE 'http://%'           -- Non-HTTPS
  OR image ILIKE '%.svg%'          -- SVG files (often placeholders)
  OR image ILIKE 'data:%'          -- Data URLs
  OR image ILIKE '%example.com%'   -- Example domains
  OR image ILIKE '%placeholder.com%'
  OR image ILIKE '%dummyimage.com%'
ORDER BY name;

-- ===================================================================
-- 3. IMAGE HOSTING ANALYSIS
-- ===================================================================

-- Count images by hosting domain
SELECT 
  CASE 
    WHEN image IS NULL OR image = '' THEN 'no_image'
    WHEN image ILIKE '%placeholder%' THEN 'placeholder'
    ELSE 
      CASE 
        WHEN image ILIKE 'https://%' THEN 
          SPLIT_PART(SPLIT_PART(image, '://', 2), '/', 1)
        WHEN image ILIKE 'http://%' THEN 
          SPLIT_PART(SPLIT_PART(image, '://', 2), '/', 1)
        ELSE 'invalid_url'
      END
  END as hosting_domain,
  COUNT(*) as image_count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM influencers), 2) as percentage
FROM influencers
GROUP BY hosting_domain
ORDER BY image_count DESC;

-- ===================================================================
-- 4. RECENTLY UPDATED INFLUENCERS
-- ===================================================================

-- Recently updated influencers (last 30 days)
SELECT 
  id,
  name,
  image,
  updated_at,
  CASE 
    WHEN image IS NULL OR image = '' THEN 'missing'
    WHEN image ILIKE '%placeholder%' THEN 'placeholder'
    ELSE 'has_image'
  END as image_status
FROM influencers 
WHERE updated_at >= NOW() - INTERVAL '30 days'
ORDER BY updated_at DESC;

-- ===================================================================
-- 5. INFLUENCER PHOTOS TABLE ANALYSIS
-- ===================================================================

-- Count of additional photos per influencer
SELECT 
  i.id,
  i.name,
  i.image as main_image,
  COUNT(ip.id) as additional_photos_count
FROM influencers i
LEFT JOIN influencer_photos ip ON i.id = ip.influencer_id
GROUP BY i.id, i.name, i.image
HAVING COUNT(ip.id) > 0
ORDER BY additional_photos_count DESC;

-- All additional photos with influencer info
SELECT 
  i.name as influencer_name,
  ip.image_url,
  ip.description,
  ip.order,
  ip.created_at
FROM influencer_photos ip
JOIN influencers i ON ip.influencer_id = i.id
ORDER BY i.name, ip.order;

-- ===================================================================
-- 6. QUALITY CONTROL QUERIES
-- ===================================================================

-- Influencers with very long image URLs (might be problematic)
SELECT 
  id,
  name,
  LENGTH(image) as url_length,
  image
FROM influencers 
WHERE LENGTH(image) > 200
ORDER BY url_length DESC;

-- Influencers with unusual image file extensions
SELECT 
  id,
  name,
  image,
  CASE 
    WHEN image ILIKE '%.jpg%' OR image ILIKE '%.jpeg%' THEN 'jpeg'
    WHEN image ILIKE '%.png%' THEN 'png'
    WHEN image ILIKE '%.webp%' THEN 'webp'
    WHEN image ILIKE '%.gif%' THEN 'gif'
    WHEN image ILIKE '%.svg%' THEN 'svg'
    ELSE 'unknown_or_no_extension'
  END as file_type
FROM influencers
WHERE image IS NOT NULL AND image != ''
ORDER BY file_type, name;

-- ===================================================================
-- 7. COMPREHENSIVE PROBLEM DETECTION
-- ===================================================================

-- Single query to identify ALL image issues
SELECT 
  id,
  name,
  image,
  created_at,
  updated_at,
  CASE 
    WHEN image IS NULL OR image = '' THEN 'missing_image'
    WHEN image ILIKE '%placeholder%' OR image ILIKE '%dummy%' OR image ILIKE '%sample%' THEN 'placeholder_image'
    WHEN image ILIKE 'http://%' THEN 'insecure_http'
    WHEN image ILIKE '%.svg%' THEN 'svg_file'
    WHEN image ILIKE 'data:%' THEN 'data_url'
    WHEN image ILIKE '%example.com%' OR image ILIKE '%placeholder.com%' THEN 'suspicious_domain'
    WHEN LENGTH(image) > 300 THEN 'very_long_url'
    ELSE 'needs_manual_check'
  END as issue_type,
  CASE 
    WHEN image IS NULL OR image = '' THEN 'Add proper image URL'
    WHEN image ILIKE '%placeholder%' THEN 'Replace placeholder with real image'
    WHEN image ILIKE 'http://%' THEN 'Upgrade to HTTPS'
    WHEN image ILIKE '%.svg%' THEN 'Replace SVG with photo'
    WHEN image ILIKE 'data:%' THEN 'Upload to proper image host'
    WHEN image ILIKE '%example.com%' THEN 'Replace with real image URL'
    WHEN LENGTH(image) > 300 THEN 'Shorten or optimize URL'
    ELSE 'Manual verification needed'
  END as recommended_action
FROM influencers
WHERE 
  image IS NULL 
  OR image = ''
  OR image ILIKE '%placeholder%'
  OR image ILIKE '%dummy%'
  OR image ILIKE '%sample%'
  OR image ILIKE 'http://%'
  OR image ILIKE '%.svg%'
  OR image ILIKE 'data:%'
  OR image ILIKE '%example.com%'
  OR image ILIKE '%placeholder.com%'
  OR LENGTH(image) > 300
ORDER BY 
  CASE issue_type
    WHEN 'missing_image' THEN 1
    WHEN 'placeholder_image' THEN 2
    WHEN 'insecure_http' THEN 3
    WHEN 'suspicious_domain' THEN 4
    ELSE 5
  END,
  name;

-- ===================================================================
-- 8. PERFORMANCE MONITORING
-- ===================================================================

-- Show influencers by voting activity (to prioritize image fixes)
SELECT 
  i.id,
  i.name,
  i.image,
  COALESCE(v.total_votes, 0) as total_votes,
  CASE 
    WHEN i.image IS NULL OR i.image = '' THEN 'missing_image'
    WHEN i.image ILIKE '%placeholder%' THEN 'placeholder'
    ELSE 'has_image'
  END as image_status
FROM influencers i
LEFT JOIN (
  SELECT 
    influencer_id, 
    COUNT(*) as total_votes
  FROM votes 
  GROUP BY influencer_id
) v ON i.id = v.influencer_id
ORDER BY total_votes DESC, i.name;

-- ===================================================================
-- 9. CLEANUP TEMPLATES
-- ===================================================================

-- Template for bulk image updates (modify URLs as needed)
-- UPDATE influencers SET image = 'https://your-cdn.com/images/influencer-name.jpg' WHERE id = 'influencer-id';

-- Template for removing placeholder images
-- UPDATE influencers SET image = NULL WHERE image ILIKE '%placeholder%';

-- Template for converting HTTP to HTTPS (be careful with this!)
-- UPDATE influencers SET image = REPLACE(image, 'http://', 'https://') WHERE image ILIKE 'http://%';

-- ===================================================================
-- 10. VALIDATION QUERIES
-- ===================================================================

-- Verify no duplicate images
SELECT 
  image,
  COUNT(*) as usage_count,
  STRING_AGG(name, ', ') as influencers_using_image
FROM influencers 
WHERE image IS NOT NULL AND image != ''
GROUP BY image
HAVING COUNT(*) > 1
ORDER BY usage_count DESC;

-- Check for potential URL encoding issues
SELECT 
  id,
  name,
  image
FROM influencers 
WHERE 
  image ILIKE '%/%/%'  -- Multiple slashes
  OR image ILIKE '% %'  -- Spaces in URL
  OR image ILIKE '%[%'  -- Brackets
  OR image ILIKE '%]%'
ORDER BY name;