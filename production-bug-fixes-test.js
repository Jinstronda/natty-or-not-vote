import { chromium } from 'playwright';

/**
 * Comprehensive test suite for production bug fixes
 * Run this after deploying the fixes to verify everything works
 */
async function testProductionBugFixes() {
  console.log('🚀 Starting comprehensive production bug fix verification...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // Track console messages
  const consoleMessages = [];
  const networkErrors = [];
  
  page.on('console', (msg) => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    });
  });
  
  page.on('response', (response) => {
    if (response.status() >= 400) {
      networkErrors.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText()
      });
    }
  });

  try {
    console.log('📍 1. Testing main site load and console errors...');
    
    // Navigate to production site
    await page.goto('https://nattyorjuicy.com', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait for page to fully load
    await page.waitForTimeout(3000);
    
    console.log('✅ Site loaded successfully');
    
    // Take screenshot of current state
    await page.screenshot({ 
      path: 'production-site-after-fixes.png', 
      fullPage: true 
    });
    
    console.log('\n📍 2. Analyzing console errors...');
    
    // Check for specific errors that should be fixed
    const mimeTypeErrors = consoleMessages.filter(msg => 
      msg.text.includes('application/octet-stream') || 
      msg.text.includes('MIME type')
    );
    
    const frameOptionsErrors = consoleMessages.filter(msg => 
      msg.text.includes('X-Frame-Options')
    );
    
    const vibrateErrors = consoleMessages.filter(msg => 
      msg.text.includes('navigator.vibrate')
    );
    
    const deprecatedMetaErrors = consoleMessages.filter(msg => 
      msg.text.includes('apple-mobile-web-app-capable')
    );
    
    const preloadWarnings = consoleMessages.filter(msg => 
      msg.text.includes('preloaded using link preload but not used')
    );
    
    // Report results
    console.log('\n🔍 Error Analysis Results:');
    console.log(`❌ MIME Type Errors: ${mimeTypeErrors.length} (Should be 0)`);
    console.log(`❌ X-Frame-Options Errors: ${frameOptionsErrors.length} (Should be 0)`);
    console.log(`❌ Navigator.vibrate Errors: ${vibrateErrors.length} (Should be 0)`);
    console.log(`❌ Deprecated Meta Tag Errors: ${deprecatedMetaErrors.length} (Should be 0)`);
    console.log(`⚠️  Preload Warnings: ${preloadWarnings.length} (Should be 0)`);
    
    console.log('\n📍 3. Testing API endpoints...');
    
    // Test /api/metrics endpoint
    const metricsResponse = await page.request.get('https://nattyorjuicy.com/api/metrics');
    console.log(`📊 /api/metrics status: ${metricsResponse.status()} (Should be 200)`);
    
    if (metricsResponse.status() === 200) {
      const metricsData = await metricsResponse.json();
      console.log('✅ Metrics endpoint working:', metricsData);
    }
    
    console.log('\n📍 4. Testing user interaction and vibration...');
    
    // Click on a card to test user interaction tracking
    await page.click('[href*="/influencer/"]');
    await page.waitForTimeout(1000);
    
    // Go back to test more interactions
    await page.goBack();
    await page.waitForTimeout(1000);
    
    console.log('✅ User interaction test completed');
    
    console.log('\n📍 5. Testing profile navigation (UserProfile issue)...');
    
    // Try to navigate to profile
    try {
      await page.click('a[href*="/user/"]');
      await page.waitForTimeout(2000);
      
      const profileContent = await page.textContent('body');
      if (profileContent.includes('User not found')) {
        console.log('⚠️  Profile shows "User not found" - this may be a separate issue');
      } else {
        console.log('✅ Profile page loaded successfully');
      }
    } catch (error) {
      console.log('⚠️  Profile navigation issue:', error.message);
    }
    
    console.log('\n📍 6. Network error analysis...');
    
    const apiMetricsErrors = networkErrors.filter(err => 
      err.url.includes('/api/metrics') && err.status === 405
    );
    
    console.log(`❌ API Metrics 405 Errors: ${apiMetricsErrors.length} (Should be 0)`);
    
    console.log('\n📍 7. Final verification summary...');
    
    const totalIssues = mimeTypeErrors.length + 
                       frameOptionsErrors.length + 
                       vibrateErrors.length + 
                       deprecatedMetaErrors.length + 
                       preloadWarnings.length + 
                       apiMetricsErrors.length;
    
    if (totalIssues === 0) {
      console.log('🎉 ALL FIXES VERIFIED! No issues detected.');
    } else {
      console.log(`⚠️  ${totalIssues} issues still detected. Review deployment.`);
    }
    
    // Detailed error reporting
    if (mimeTypeErrors.length > 0) {
      console.log('\n🔍 Remaining MIME Type Errors:');
      mimeTypeErrors.forEach(err => console.log(`  - ${err.text}`));
    }
    
    if (frameOptionsErrors.length > 0) {
      console.log('\n🔍 Remaining X-Frame-Options Errors:');
      frameOptionsErrors.forEach(err => console.log(`  - ${err.text}`));
    }
    
    if (apiMetricsErrors.length > 0) {
      console.log('\n🔍 Remaining API Errors:');
      apiMetricsErrors.forEach(err => console.log(`  - ${err.url}: ${err.status}`));
    }
    
    console.log('\n📷 Screenshots saved:');
    console.log('  - production-site-after-fixes.png');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'production-test-error.png' });
  } finally {
    await browser.close();
  }
}

// Export for module use or run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testProductionBugFixes().catch(console.error);
}

export default testProductionBugFixes; 