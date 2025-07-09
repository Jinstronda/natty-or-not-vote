/**
 * SIMPLE EXPERT LOADING TEST
 * Sequential thinking verification of optimized loading
 */

const { chromium } = require('playwright');

(async () => {
  console.log('🚀 SEQUENTIAL THINKING - EXPERT LOADING TEST');
  console.log('============================================');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Track API requests
  const apiRequests = [];
  page.on('request', (request) => {
    if (request.url().includes('supabase.co')) {
      apiRequests.push({
        url: request.url(),
        method: request.method(),
        timestamp: Date.now()
      });
    }
  });
  
  try {
    console.log('\n🔍 UNDERSTAND: Testing expert profile loading...');
    
    const startTime = Date.now();
    
    // Navigate to expert profile
    await page.goto('http://localhost:8080/experts/1');
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    console.log(`\n📊 RESULTS:`);
    console.log(`⏱️  Loading time: ${loadTime}ms`);
    console.log(`🌐 API requests: ${apiRequests.length}`);
    
    // Check for loading skeletons
    const skeletons = await page.locator('.animate-pulse').count();
    console.log(`🎭 Loading skeletons: ${skeletons}`);
    
    // Check for expert content
    const expertName = await page.locator('h1').textContent();
    console.log(`👤 Expert name: ${expertName || 'Not found'}`);
    
    // Check for enhanced expert reviews
    const reviewsSection = await page.locator('.space-y-6').count();
    console.log(`📝 Reviews sections: ${reviewsSection}`);
    
    // Performance analysis
    console.log(`\n🎯 HYPOTHESIZE: Performance Analysis`);
    if (loadTime < 1000) {
      console.log('✅ EXCELLENT: Loading under 1 second');
    } else if (loadTime < 2000) {
      console.log('✅ GOOD: Loading under 2 seconds');
    } else {
      console.log('⚠️  NEEDS IMPROVEMENT: Loading over 2 seconds');
    }
    
    if (apiRequests.length < 5) {
      console.log('✅ EFFICIENT: Low API call count');
    } else {
      console.log('⚠️  INEFFICIENT: High API call count');
    }
    
    // Log API requests
    console.log(`\n🌐 API REQUESTS:`);
    apiRequests.forEach((req, i) => {
      const endpoint = req.url.split('/rest/v1/')[1]?.split('?')[0] || 'Unknown';
      console.log(`  ${i + 1}. ${endpoint} (${req.method})`);
    });
    
    console.log(`\n🔬 TEST: Visual verification time (10 seconds)...`);
    console.log('   Look for:');
    console.log('   - Smooth loading transitions');
    console.log('   - Realistic skeleton animations');
    console.log('   - Progressive content appearance');
    console.log('   - No jarring layout shifts');
    
    await page.waitForTimeout(10000);
    
    console.log('\n✅ ITERATE: Test completed successfully!');
    console.log(`\nSUMMARY:`);
    console.log(`- Load time: ${loadTime}ms (Target: <2000ms)`);
    console.log(`- API calls: ${apiRequests.length} (Target: <5)`);
    console.log(`- Enhanced UI: ${reviewsSection > 0 ? 'YES' : 'NO'}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
})();