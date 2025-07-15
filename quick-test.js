import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('ERROR:', msg.text());
    }
  });
  
  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });
  
  try {
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
    console.log('✅ Page loaded successfully');
    
    // Wait and check for errors
    await new Promise(resolve => setTimeout(resolve, 1000));
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
})();