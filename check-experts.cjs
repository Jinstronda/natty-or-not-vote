const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Checking experts directory...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:8080/experts');
    await page.waitForLoadState('networkidle');
    
    // Check page title
    const title = await page.title();
    console.log('Page title:', title);
    
    // Check for experts content
    const expertLinks = await page.locator('a[href*="/experts/"]').count();
    console.log('Expert links found:', expertLinks);
    
    // Check for any text mentioning experts
    const bodyText = await page.locator('body').textContent();
    console.log('Page contains "expert":', bodyText.toLowerCase().includes('expert'));
    console.log('Page contains "loading":', bodyText.toLowerCase().includes('loading'));
    
    // Wait for visual inspection
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();