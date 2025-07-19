import { chromium } from 'playwright';

(async () => {
  console.log('🔍 Testing sitemap accessibility with debug...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // First test the debug API
  try {
    console.log('\n📊 Testing debug API...');
    const debugResponse = await page.goto('http://localhost:4173/api/debug-sitemap', { 
      waitUntil: 'networkidle' 
    });
    
    if (debugResponse.status() === 200) {
      const debugData = await debugResponse.json();
      console.log('✅ Debug API response:', JSON.stringify(debugData, null, 2));
    } else {
      console.log(`❌ Debug API failed: ${debugResponse.status()}`);
    }
  } catch (error) {
    console.log(`❌ Debug API error: ${error.message}`);
  }
  
  // Test sitemap URLs with detailed logging
  const sitemapUrls = [
    'http://localhost:4173/sitemap-index.xml',
    'http://localhost:4173/sitemap.xml',
    'http://localhost:4173/sitemaps/influencers.xml',
    'http://localhost:4173/sitemaps/experts.xml'
  ];
  
  for (const url of sitemapUrls) {
    try {
      console.log(`\n📄 Testing: ${url}`);
      
      // Monitor console logs
      page.on('console', msg => {
        console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`);
      });
      
      // Monitor network requests
      page.on('request', request => {
        console.log(`[REQUEST] ${request.method()} ${request.url()}`);
      });
      
      page.on('response', response => {
        console.log(`[RESPONSE] ${response.status()} ${response.url()}`);
      });
      
      const response = await page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: 10000 
      });
      
      console.log(`Status: ${response.status()}`);
      console.log(`Content-Type: ${response.headers()['content-type']}`);
      
      const content = await response.text();
      console.log(`Content length: ${content.length}`);
      console.log(`Content preview: ${content.substring(0, 200)}...`);
      
      // Check if it's XML
      if (content.includes('<?xml') && (content.includes('sitemap') || content.includes('urlset'))) {
        console.log(`✅ SUCCESS: Valid XML sitemap`);
      } else if (content.includes('<!DOCTYPE html')) {
        console.log(`❌ FAIL: Got HTML instead of XML (React app loaded)`);
      } else {
        console.log(`❌ FAIL: Unknown content type`);
      }
      
    } catch (error) {
      console.log(`❌ ERROR: ${url} - ${error.message}`);
    }
  }
  
  await browser.close();
})();