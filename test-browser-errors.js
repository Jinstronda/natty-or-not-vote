import { chromium } from 'playwright';

(async () => {
  console.log('🔍 TESTING: Browser console errors...');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Capture console errors
  const errors = [];
  page.on('pageerror', error => {
    errors.push({
      message: error.message,
      stack: error.stack
    });
  });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push({
        message: msg.text(),
        location: msg.location()
      });
    }
  });
  
  try {
    console.log('📄 Loading homepage...');
    await page.goto('http://localhost:4175', { waitUntil: 'networkidle' });
    
    // Wait a bit for any delayed errors
    await page.waitForTimeout(5000);
    
    if (errors.length === 0) {
      console.log('✅ No JavaScript errors detected');
    } else {
      console.log('❌ JavaScript errors found:');
      errors.forEach((error, i) => {
        console.log(`\n--- Error ${i + 1} ---`);
        console.log(`Message: ${error.message}`);
        if (error.stack) {
          console.log(`Stack: ${error.stack}`);
        }
        if (error.location) {
          console.log(`Location: ${JSON.stringify(error.location)}`);
        }
      });
    }
    
  } catch (error) {
    console.log('❌ Test failed');
    console.log(`Error: ${error.message}`);
  }
  
  await browser.close();
})();