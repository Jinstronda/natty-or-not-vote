import { chromium } from 'playwright';
import { spawn } from 'child_process';

(async () => {
  console.log('🔍 Testing client.ts error with Playwright...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Listen for console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ Console Error:', msg.text());
    }
  });
  
  // Listen for page errors
  page.on('pageerror', error => {
    console.log('❌ Page Error:', error.message);
  });
  
  try {
    // Start the preview server first
    const server = spawn('npm', ['run', 'preview'], { stdio: 'inherit' });
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('🌐 Navigating to localhost:4174...');
    await page.goto('http://localhost:4174', { waitUntil: 'networkidle' });
    
    console.log('📄 Page loaded successfully');
    
    // Wait a bit to see if any errors occur
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if there are any visible errors
    const hasErrors = await page.evaluate(() => {
      return document.querySelector('.error') !== null;
    });
    
    if (hasErrors) {
      console.log('❌ Visual errors found on page');
    } else {
      console.log('✅ No visual errors found');
    }
    
    // Kill the server
    server.kill();
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
})();