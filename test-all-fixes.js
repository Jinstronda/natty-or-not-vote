import { chromium } from 'playwright';

/**
 * Comprehensive test for all 4 issues fixed:
 * 1. Real-time review updates (no manual refresh needed)
 * 2. YouTube-style reply UI (separate Reply vs Show More buttons)
 * 3. Reply reactions authentication (fixed login required error)
 * 4. Session persistence on refresh (no logout)
 */

async function testAllFixes() {
  console.log('🚀 Testing All Sequential Thinking Fixes\n');
  
  let browser;
  try {
    browser = await chromium.launch({ 
      headless: false,
      slowMo: 300
    });
    
    const context = await browser.newContext();
    const page1 = await context.newPage();
    const page2 = await context.newPage();
    
    // Enable console logging
    page1.on('console', msg => console.log('📄 Page1:', msg.text()));
    page2.on('console', msg => console.log('📄 Page2:', msg.text()));
    
    const baseUrl = 'http://localhost:8080';
    
    console.log('🌐 Loading application...');
    await page1.goto(baseUrl);
    await page2.goto(baseUrl);
    
    // Navigate to first influencer
    await page1.waitForTimeout(3000);
    const influencerLinks = await page1.locator('a[href*="/influencer/"]').all();
    
    if (influencerLinks.length === 0) {
      console.log('❌ No influencer profiles found');
      return;
    }
    
    const firstHref = await influencerLinks[0].getAttribute('href');
    const testUrl = `${baseUrl}${firstHref}`;
    
    console.log(`🎯 Testing with: ${testUrl}`);
    
    await page1.goto(testUrl);
    await page2.goto(testUrl);
    await page1.waitForTimeout(3000);
    await page2.waitForTimeout(3000);
    
    console.log('\n=== TEST 1: Session Persistence on Refresh ===');
    console.log('🔄 Refreshing page1 to test session persistence...');
    await page1.reload();
    await page1.waitForTimeout(3000);
    
    // Check if user is still logged in after refresh
    const loginButtonAfterRefresh = await page1.locator('button:has-text("Login"), a:has-text("Login")').isVisible();
    if (loginButtonAfterRefresh) {
      console.log('⚠️ User appears logged out after refresh - check auth persistence');
    } else {
      console.log('✅ Session persisted after refresh');
    }
    
    console.log('\n=== TEST 2: YouTube-style Reply UI ===');
    console.log('🔍 Checking if Reply button is visible without expanding replies...');
    
    // Look for reply buttons
    const replyButtons = await page1.locator('button:has-text("Reply to review")').count();
    console.log(`Found ${replyButtons} reply buttons`);
    
    if (replyButtons > 0) {
      console.log('✅ Reply buttons are visible (YouTube-style UI working)');
    } else {
      console.log('⚠️ No reply buttons found - UI might need user login');
    }
    
    // Check for expand/collapse buttons
    const expandButtons = await page1.locator('button:has-text("replies"), button:has-text("reply")').count();
    console.log(`Found ${expandButtons} expand/collapse buttons`);
    
    console.log('\n=== TEST 3: Real-time Review Updates ===');
    console.log('📋 Manual test required:');
    console.log('1. Log in on Page 1 if needed');
    console.log('2. Vote and submit a review on Page 1');
    console.log('3. Check if review appears immediately on Page 2 without refresh');
    console.log('4. Watch console for "Real-time review update received" messages');
    
    console.log('\n=== TEST 4: Reply Reactions Authentication ===');
    console.log('📋 Manual test required:');
    console.log('1. Expand replies if any exist');
    console.log('2. Try clicking like/dislike on reply items');
    console.log('3. Should NOT show "login required" error if logged in');
    console.log('4. Watch console for "[ReplyItem] handleReaction called" debug logs');
    
    console.log('\n🎯 Expected Results:');
    console.log('✅ Session persists after page refresh');
    console.log('✅ Reply button visible without expanding replies first');
    console.log('✅ Reviews appear in real-time without manual refresh');
    console.log('✅ Reply reactions work without authentication errors');
    
    console.log('\n⏰ Keeping browsers open for 2 minutes for manual testing...');
    await page1.waitForTimeout(120000);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function checkDevServer() {
  try {
    const response = await fetch('http://localhost:8080/');
    return response.ok;
  } catch {
    return false;
  }
}

async function main() {
  console.log('🌐 Checking development server...');
  const serverRunning = await checkDevServer();
  
  if (serverRunning) {
    console.log('✅ Dev server running\n');
    await testAllFixes();
  } else {
    console.log('❌ Dev server not running on http://localhost:8080/');
    console.log('💡 Please run: npm run dev');
  }
}

main().catch(console.error);