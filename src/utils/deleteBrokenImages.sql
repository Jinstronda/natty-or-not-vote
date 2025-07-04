DELETE FROM influencer_photos
WHERE image_url IS NULL
   OR image_url = ''
   OR image_url LIKE '%.svg%'
   OR image_url LIKE '%placeholder%'
   OR image_url LIKE '%no-image%'
   OR image_url LIKE '%default%'
   OR image_url LIKE '%broken%'
   OR image_url LIKE '%/image/%'
   OR image_url LIKE '%/photo/%'
   OR image_url LIKE '%/missing%';

UPDATE influencers
SET image = NULL
WHERE image IS NULL
   OR image = ''
   OR image LIKE '%.svg%'
   OR image LIKE '%placeholder%'
   OR image LIKE '%no-image%'
   OR image LIKE '%default%'
   OR image LIKE '%broken%'
   OR image LIKE '%/image/%'
   OR image LIKE '%/photo/%'
   OR image LIKE '%/missing%'; 