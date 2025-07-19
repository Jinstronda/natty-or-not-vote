import { chromium } from 'playwright';

(async () => {
  console.log('🔍 Testing XML access after fix...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Enable detailed logging
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`[BROWSER ERROR] ${msg.text()}`);
    }
  });
  
  page.on('pageerror', error => {
    console.log(`[PAGE ERROR] ${error.message}`);
  });
  
  const sitemapUrls = [
    'http://localhost:4173/sitemap-index.xml',
    'http://localhost:4173/sitemap.xml',
    'http://localhost:4173/sitemaps/influencers.xml',
    'http://localhost:4173/sitemaps/experts.xml'
  ];
  
  for (const url of sitemapUrls) {
    try {
      console.log(`\n📄 Testing: ${url}`);
      
      const response = await page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: 5000 
      });
      
      const status = response.status();
      const contentType = response.headers()['content-type'] || 'unknown';
      const content = await response.text();
      
      console.log(`Status: ${status}`);
      console.log(`Content-Type: ${contentType}`);
      console.log(`Content length: ${content.length}`);
      
      // Check what we actually got
      if (content.includes('<?xml version="1.0"')) {
        if (content.includes('<sitemapindex') || content.includes('<urlset')) {
          console.log(`✅ SUCCESS: Valid XML sitemap served correctly`);
        } else {
          console.log(`⚠️  WARNING: XML but not sitemap format`);
        }
      } else if (content.includes('<!DOCTYPE html')) {
        console.log(`❌ FAIL: HTML page loaded instead of XML`);
        console.log(`First 300 chars: ${content.substring(0, 300)}`);
        
        // Check if WebSocket errors are present
        if (content.includes('WebSocket') || content.includes('supabase')) {
          console.log(`🔍 DIAGNOSIS: React app loaded - WebSocket connection attempted`);
        }
      } else {
        console.log(`❌ UNKNOWN: Content type unclear`);
        console.log(`First 200 chars: ${content.substring(0, 200)}`);
      }
      
    } catch (error) {
      console.log(`❌ ERROR: ${url} - ${error.message}`);
    }
  }
  
  await browser.close();
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. If XML files load correctly: SEO should work');
  console.log('2. If HTML loads: Check vercel.json deployment');
  console.log('3. If errors: Check file existence in public folder');
})();