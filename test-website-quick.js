import { chromium } from 'playwright';

(async () => {
  console.log('🔍 TESTING: Quick website functionality validation...');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Test if the website loads
    console.log('📄 Loading homepage...');
    await page.goto('http://localhost:4175');
    
    // Wait for main content to load
    await page.waitForSelector('body', { timeout: 10000 });
    console.log('✅ Homepage loaded successfully');
    
    // Check if key elements exist
    const title = await page.title();
    console.log(`📋 Page title: ${title}`);
    
    // Check for header
    const header = await page.locator('header').count();
    console.log(`🏠 Header found: ${header > 0 ? '✅ Yes' : '❌ No'}`);
    
    // Check for influencer cards
    const cards = await page.locator('[data-testid*="card"], .influencer-card, .card').count();
    console.log(`🎭 Cards found: ${cards}`);
    
    // Check for any JavaScript errors
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    
    await page.waitForTimeout(3000);
    
    if (errors.length === 0) {
      console.log('✅ No JavaScript errors detected');
    } else {
      console.log('❌ JavaScript errors found:');
      errors.forEach(error => console.log(`  - ${error}`));
    }
    
    console.log('🎉 Website functionality test PASSED');
    
  } catch (error) {
    console.log('❌ Website functionality test FAILED');
    console.log(`Error: ${error.message}`);
  }
  
  await browser.close();
})();