import { chromium } from 'playwright';

(async () => {
  console.log('🔍 Testing sitemap accessibility...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const sitemapUrls = [
    'http://localhost:4173/sitemap-index.xml',
    'http://localhost:4173/sitemap.xml',
    'http://localhost:4173/sitemaps/influencers.xml',
    'http://localhost:4173/sitemaps/experts.xml'
  ];
  
  for (const url of sitemapUrls) {
    try {
      console.log(`\n📄 Testing: ${url}`);
      const response = await page.goto(url, { waitUntil: 'networkidle' });
      
      if (response.status() === 200) {
        const content = await response.text();
        if (content.includes('<?xml') && (content.includes('sitemap') || content.includes('urlset'))) {
          console.log(`✅ SUCCESS: ${url} - Valid XML sitemap`);
          console.log(`   Content preview: ${content.substring(0, 100)}...`);
        } else {
          console.log(`❌ FAIL: ${url} - Not valid XML sitemap`);
          console.log(`   Content preview: ${content.substring(0, 200)}...`);
        }
      } else {
        console.log(`❌ FAIL: ${url} - Status: ${response.status()}`);
      }
    } catch (error) {
      console.log(`❌ ERROR: ${url} - ${error.message}`);
    }
  }
  
  await browser.close();
})();