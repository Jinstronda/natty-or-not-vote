import { chromium } from 'playwright';

(async () => {
  console.log('🔍 COMPREHENSIVE TESTING: Full website analysis...');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Capture ALL errors and logs
  const errors = [];
  const consoleMessages = [];
  
  page.on('pageerror', error => {
    errors.push({
      type: 'PAGE_ERROR',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  });

  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location(),
      timestamp: new Date().toISOString()
    });
    
    if (msg.type() === 'error') {
      errors.push({
        type: 'CONSOLE_ERROR',
        message: msg.text(),
        location: msg.location(),
        timestamp: new Date().toISOString()
      });
    }
  });
  
  try {
    console.log('📄 Loading homepage...');
    await page.goto('http://localhost:4175', { 
      waitUntil: 'load',
      timeout: 15000 
    });
    
    console.log('⏳ Waiting for React to initialize...');
    await page.waitForTimeout(3000);
    
    // Test page title
    const title = await page.title();
    console.log(`📋 Page title: ${title}`);
    
    // Test React mount
    const reactRoot = await page.locator('#root').count();
    console.log(`⚛️ React root found: ${reactRoot > 0 ? '✅ Yes' : '❌ No'}`);
    
    // Test for any content inside React root
    const rootContent = await page.locator('#root *').count();
    console.log(`📦 Content elements: ${rootContent}`);
    
    // Test specific elements
    const header = await page.locator('header, [data-testid="header"], nav').count();
    console.log(`🏠 Header/Nav found: ${header > 0 ? '✅ Yes' : '❌ No'}`);
    
    const cards = await page.locator('[data-testid*="card"], .card, .influencer-card, article').count();
    console.log(`🎭 Cards/Articles found: ${cards}`);
    
    const buttons = await page.locator('button').count();
    console.log(`🔘 Buttons found: ${buttons}`);
    
    const links = await page.locator('a').count();
    console.log(`🔗 Links found: ${links}`);
    
    // Test for loading states
    const skeletons = await page.locator('[data-testid*="skeleton"], .skeleton').count();
    console.log(`💀 Skeletons found: ${skeletons}`);
    
    // Wait longer for content to load
    console.log('⏳ Waiting for async content...');
    await page.waitForTimeout(5000);
    
    // Re-check after waiting
    const finalCards = await page.locator('[data-testid*="card"], .card, .influencer-card, article').count();
    console.log(`🎭 Final cards count: ${finalCards}`);
    
    // Test if any text content loaded
    const bodyText = await page.textContent('body');
    const hasNonEmptyContent = bodyText && bodyText.trim().length > 100;
    console.log(`📝 Has meaningful content: ${hasNonEmptyContent ? '✅ Yes' : '❌ No'}`);
    
    if (hasNonEmptyContent) {
      console.log(`📏 Content length: ${bodyText.trim().length} characters`);
    }
    
    // Print all errors
    if (errors.length === 0) {
      console.log('✅ No JavaScript errors detected');
    } else {
      console.log(`❌ ${errors.length} JavaScript errors found:`);
      errors.forEach((error, i) => {
        console.log(`\n--- Error ${i + 1} [${error.type}] ---`);
        console.log(`Time: ${error.timestamp}`);
        console.log(`Message: ${error.message}`);
        if (error.stack) {
          console.log(`Stack: ${error.stack.slice(0, 200)}...`);
        }
        if (error.location) {
          console.log(`Location: ${JSON.stringify(error.location)}`);
        }
      });
    }
    
    // Print recent console messages
    console.log(`\n📋 Console messages (${consoleMessages.length} total):`);
    consoleMessages.slice(-10).forEach(msg => {
      console.log(`[${msg.type}] ${msg.text}`);
    });
    
    // Final verdict
    if (errors.length === 0 && finalCards > 0) {
      console.log('\n🎉 Website is FULLY FUNCTIONAL');
    } else if (errors.length === 0 && hasNonEmptyContent) {
      console.log('\n✅ Website loads but content may not be fully rendered');
    } else if (errors.length > 0 && hasNonEmptyContent) {
      console.log('\n⚠️ Website has errors but some content loads');
    } else {
      console.log('\n❌ Website has serious issues');
    }
    
  } catch (error) {
    console.log('❌ Test failed');
    console.log(`Error: ${error.message}`);
  }
  
  await browser.close();
})();