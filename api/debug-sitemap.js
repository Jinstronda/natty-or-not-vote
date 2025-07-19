// Debug API to check sitemap accessibility
export default function handler(req, res) {
  const fs = require('fs');
  const path = require('path');
  
  console.log('🔍 Debug sitemap access...');
  
  try {
    // Check if files exist
    const publicDir = path.join(process.cwd(), 'public');
    const sitemapIndex = path.join(publicDir, 'sitemap-index.xml');
    const sitemap = path.join(publicDir, 'sitemap.xml');
    const sitemapsDir = path.join(publicDir, 'sitemaps');
    
    const results = {
      timestamp: new Date().toISOString(),
      publicDir: publicDir,
      files: {},
      directories: {},
      errors: []
    };
    
    // Check sitemap-index.xml
    try {
      if (fs.existsSync(sitemapIndex)) {
        const stats = fs.statSync(sitemapIndex);
        const content = fs.readFileSync(sitemapIndex, 'utf8');
        results.files['sitemap-index.xml'] = {
          exists: true,
          size: stats.size,
          modified: stats.mtime,
          contentPreview: content.substring(0, 200)
        };
      } else {
        results.files['sitemap-index.xml'] = { exists: false };
      }
    } catch (error) {
      results.errors.push(`sitemap-index.xml: ${error.message}`);
    }
    
    // Check sitemap.xml
    try {
      if (fs.existsSync(sitemap)) {
        const stats = fs.statSync(sitemap);
        const content = fs.readFileSync(sitemap, 'utf8');
        results.files['sitemap.xml'] = {
          exists: true,
          size: stats.size,
          modified: stats.mtime,
          contentPreview: content.substring(0, 200)
        };
      } else {
        results.files['sitemap.xml'] = { exists: false };
      }
    } catch (error) {
      results.errors.push(`sitemap.xml: ${error.message}`);
    }
    
    // Check sitemaps directory
    try {
      if (fs.existsSync(sitemapsDir)) {
        const files = fs.readdirSync(sitemapsDir);
        results.directories['sitemaps'] = {
          exists: true,
          files: files.map(file => {
            const filePath = path.join(sitemapsDir, file);
            const stats = fs.statSync(filePath);
            return {
              name: file,
              size: stats.size,
              modified: stats.mtime
            };
          })
        };
      } else {
        results.directories['sitemaps'] = { exists: false };
      }
    } catch (error) {
      results.errors.push(`sitemaps directory: ${error.message}`);
    }
    
    console.log('📊 Debug results:', JSON.stringify(results, null, 2));
    
    res.status(200).json(results);
    
  } catch (error) {
    console.error('❌ Debug error:', error);
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
}