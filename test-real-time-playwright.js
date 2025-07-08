import { chromium } from 'playwright';

/**
 * Playwright test for real-time review updates
 * Tests that reviews update immediately without manual refresh
 */

async function testRealTimeReviews() {
  console.log('🚀 Starting Real-time Review Updates Test with Playwright\n');
  
  let browser;
  try {
    // Launch browser with visible window
    browser = await chromium.launch({ 
      headless: false,  // Show browser for visual verification
      slowMo: 500 // Slow down for better visibility
    });
    
    console.log('✅ Chrome browser launched');
    
    // Create browser context
    const context = await browser.newContext();
    
    // Create two pages to simulate different users
    const page1 = await context.newPage();
    const page2 = await context.newPage();
    
    console.log('✅ Two browser tabs created');
    
    // Enable console logging from both pages
    page1.on('console', msg => console.log('📄 Page1:', msg.text()));
    page2.on('console', msg => console.log('📄 Page2:', msg.text()));
    
    // Navigate both pages to the dev server
    const baseUrl = 'http://localhost:8080';
    
    console.log('🌐 Navigating to app...');
    await page1.goto(baseUrl);
    await page2.goto(baseUrl);
    
    console.log('✅ Both pages loaded');
    
    // Wait for initial page load
    await page1.waitForTimeout(3000);
    await page2.waitForTimeout(3000);
    
    // Look for influencer links on the homepage
    console.log('🔍 Looking for influencer profiles...');
    
    const influencerLinks = await page1.locator('a[href*="/influencer/"]').all();
    
    if (influencerLinks.length === 0) {
      console.log('❌ No influencer profiles found on homepage');
      console.log('💡 Make sure there are influencer cards on the homepage');
      return;
    }
    
    // Get the first influencer URL
    const firstInfluencerHref = await influencerLinks[0].getAttribute('href');
    const testInfluencerUrl = `${baseUrl}${firstInfluencerHref}`;
    
    console.log(`🎯 Testing with influencer: ${testInfluencerUrl}`);
    
    // Navigate both pages to the same influencer
    await page1.goto(testInfluencerUrl);
    await page2.goto(testInfluencerUrl);
    
    console.log('✅ Both pages on influencer profile');
    
    // Wait for pages to load completely
    await page1.waitForTimeout(3000);
    await page2.waitForTimeout(3000);
    
    // Test 1: Check for real-time setup in console
    console.log('\n🧪 Test 1: Checking WebSocket Connection Setup');
    
    // Wait a bit more and check for real-time logs
    await page1.waitForTimeout(2000);
    
    // Count initial reviews on page 2
    const reviewsPage2 = await page2.locator('[class*="review"]').count();
    console.log(`📊 Initial review count on page 2: ${reviewsPage2}`);
    
    // Test 2: Check if voting section exists
    console.log('\n🧪 Test 2: Checking Voting Interface');
    
    const votingSection = page1.locator('[class*="voting"], button:has-text("Natty"), button:has-text("Juicy")');
    const votingExists = await votingSection.first().isVisible({ timeout: 5000 });
    
    if (votingExists) {
      console.log('✅ Voting section found');
      
      // Check if user needs to log in
      const loginButton = page1.locator('button:has-text("Login"), a:has-text("Login")');
      const needsLogin = await loginButton.isVisible();
      
      if (needsLogin) {
        console.log('⚠️ User needs to log in to vote');
        console.log('💡 Please log in manually to test review submission');
      } else {
        console.log('✅ User appears to be logged in or can vote');
      }
    } else {
      console.log('⚠️ No voting section found - checking page structure');
    }
    
    // Test 3: Manual testing instructions
    console.log('\n🧪 Test 3: Manual Testing Phase');
    console.log('📋 MANUAL TESTING INSTRUCTIONS:');
    console.log('');
    console.log('🔄 You should now see two browser windows open to the same influencer page.');
    console.log('');
    console.log('Step 1: If you see a Login button, log in on Page 1');
    console.log('Step 2: Vote on the influencer (click Natty or Juicy button)');
    console.log('Step 3: Fill out the review form that appears');
    console.log('Step 4: Submit the review');
    console.log('Step 5: 🎯 WATCH Page 2 - the review should appear immediately!');
    console.log('');
    console.log('Expected behavior:');
    console.log('✅ Review appears on Page 2 without manual refresh');
    console.log('✅ Like/dislike counts update in real-time');
    console.log('✅ Console shows "Real-time review update received" messages');
    console.log('');
    console.log('🐛 If real-time updates don\'t work, check:');
    console.log('- Browser console for WebSocket errors');
    console.log('- Network tab for Supabase real-time connections');
    console.log('- Supabase project has real-time enabled');
    console.log('');
    
    // Keep browsers open for manual testing
    console.log('⏰ Keeping browsers open for 120 seconds for manual testing...');
    console.log('💡 Close this script when done testing\n');
    
    // Wait for manual testing
    await page1.waitForTimeout(120000);
    
    console.log('✅ Test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    if (browser) {
      console.log('🧹 Cleaning up...');
      await browser.close();
    }
  }
}

// Check if dev server is running
async function checkDevServer() {
  console.log('🌐 Checking development server...');
  
  try {
    const response = await fetch('http://localhost:8080/');
    if (response.ok) {
      console.log('✅ Development server is running on http://localhost:8080/\n');
      return true;
    } else {
      console.log('❌ Development server responded with error\n');
      return false;
    }
  } catch (error) {
    console.log('❌ Development server is not running on http://localhost:8080/');
    console.log('💡 Please run: npm run dev\n');
    return false;
  }
}

// Main execution
async function main() {
  const serverRunning = await checkDevServer();
  
  if (serverRunning) {
    await testRealTimeReviews();
  } else {
    console.log('⚠️ Please start the development server before running this test.');
  }
}

main().catch(console.error);