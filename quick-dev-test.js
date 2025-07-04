import { chromium } from 'playwright';

async function quickDevTest() {
  console.log('🔄 Quick dev server test...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('📍 Testing connection to localhost:8080...');
    
    // Try to navigate to local dev server
    await page.goto('http://localhost:8080', { 
      waitUntil: 'networkidle',
      timeout: 10000 
    });
    
    console.log('✅ Successfully connected to dev server!');
    
    // Take screenshot to confirm
    await page.screenshot({ path: 'dev-server-working.png', fullPage: true });
    
    // Check page title
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);
    
    // Look for any basic content
    const bodyText = await page.textContent('body');
    console.log(`📝 Page has content: ${bodyText ? 'YES' : 'NO'}`);
    console.log(`📏 Content length: ${bodyText?.length || 0} characters`);
    
    // Look for React app signs
    const reactRoot = await page.locator('#root').count();
    console.log(`⚛️ React root found: ${reactRoot > 0 ? 'YES' : 'NO'}`);
    
    console.log('✅ Dev server test completed successfully!');
    
  } catch (error) {
    console.error('❌ Dev server test failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED') || error.message.includes('net::ERR_CONNECTION_REFUSED')) {
      console.log('💡 Dev server is not running. Please start it with: npm run dev');
    }
    
    await page.screenshot({ path: 'dev-test-error.png' });
    
  } finally {
    await browser.close();
  }
}

quickDevTest().catch(console.error); 