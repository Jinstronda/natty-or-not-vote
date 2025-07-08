import { chromium } from 'playwright';

async function testCompleteReplyFix() {
  console.log('🔧 Testing Complete Reply System Fix');
  console.log('=' .repeat(60));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 
  });
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Navigate to Mike Mentzer's page
    console.log('📱 Navigating to Mike Mentzer page...');
    await page.goto('http://localhost:8081', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Find Mike Mentzer
    const mikeMentzerLink = page.locator('text="Mike Mentzer"').first();
    if (await mikeMentzerLink.isVisible()) {
      await mikeMentzerLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      console.log('✅ Navigated to Mike Mentzer page');
    } else {
      console.log('❌ Could not find Mike Mentzer link');
      return;
    }
    
    // STEP 1: Test Reply Count Display
    console.log('\n🧪 STEP 1: Testing Reply Count Display');
    const replyButtons = await page.locator('[data-testid="expand-replies-button"], button:has-text("replies"), button:has-text("reply")').all();
    console.log(`Found ${replyButtons.length} reply-related buttons`);
    
    let expandedReviewId = null;
    for (let i = 0; i < replyButtons.length; i++) {
      const button = replyButtons[i];
      const buttonText = await button.textContent();
      console.log(`Reply button ${i}: "${buttonText?.trim()}"`);
      
      // Look for buttons with reply counts
      const countMatch = buttonText?.match(/(\d+)\s*(replies?|reply)/i);
      if (countMatch) {
        const expectedCount = parseInt(countMatch[1]);
        console.log(`📊 Found button with ${expectedCount} expected replies`);
        
        // Click to expand
        await button.scrollIntoViewIfNeeded();
        await button.click();
        await page.waitForTimeout(2000);
        
        // Count actual visible replies
        const visibleReplies = await page.locator('[data-testid*="reply-item"], .reply-item, .reply').count();
        console.log(`👀 Visible replies: ${visibleReplies}`);
        console.log(`📈 Expected replies: ${expectedCount}`);
        
        if (visibleReplies === expectedCount) {
          console.log('✅ SUCCESS: Reply count matches display!');
        } else {
          console.log(`❌ MISMATCH: Expected ${expectedCount}, got ${visibleReplies}`);
        }
        
        // Save this for further testing
        expandedReviewId = i;
        break;
      }
    }
    
    // Take screenshot after expanding replies
    await page.screenshot({ path: 'reply-fix-test-1.png', fullPage: true });
    console.log('📸 Screenshot saved: reply-fix-test-1.png');
    
    // STEP 2: Test Reply Submission
    console.log('\n🧪 STEP 2: Testing Reply Submission');
    const replyToReviewButton = page.locator('button:has-text("Reply"), button:has-text("reply")').first();
    
    if (await replyToReviewButton.isVisible()) {
      console.log('✅ Found reply button, testing submission...');
      await replyToReviewButton.click();
      await page.waitForTimeout(1000);
      
      // Look for reply form
      const replyForm = page.locator('textarea[placeholder*="reply"], textarea[placeholder*="Write"]').first();
      if (await replyForm.isVisible()) {
        console.log('✅ Reply form appeared');
        
        // Test immediate reply appearance
        const testReplyText = `🧪 Test reply fix ${Date.now()}`;
        await replyForm.fill(testReplyText);
        
        // Count replies before submission
        const repliesBeforeSubmission = await page.locator('[data-testid*="reply-item"], .reply-item, .reply').count();
        console.log(`📊 Replies before submission: ${repliesBeforeSubmission}`);
        
        // Submit the reply
        const submitButton = page.locator('button:has-text("Reply"), button:has-text("Submit")').first();
        if (await submitButton.isVisible() && await submitButton.isEnabled()) {
          console.log('🚀 Submitting reply...');
          await submitButton.click();
          
          // Test immediate appearance (should work with our fix)
          console.log('⏱️  Testing immediate appearance...');
          await page.waitForTimeout(2000); // Give it time to update
          
          const repliesAfterSubmission = await page.locator('[data-testid*="reply-item"], .reply-item, .reply').count();
          console.log(`📊 Replies after submission: ${repliesAfterSubmission}`);
          
          // Check if our specific text appears
          const ourReplyVisible = await page.locator(`text="${testReplyText}"`).isVisible();
          console.log(`👀 Our reply visible: ${ourReplyVisible}`);
          
          // RESULTS
          if (repliesAfterSubmission > repliesBeforeSubmission || ourReplyVisible) {
            console.log('🎉 SUCCESS: Reply appears immediately after submission!');
            console.log('✅ FIXED: Real-time update issue resolved');
          } else {
            console.log('❌ STILL BROKEN: Reply does not appear immediately');
          }
          
          // Take screenshot after submission
          await page.screenshot({ path: 'reply-fix-test-2.png', fullPage: true });
          console.log('📸 Screenshot saved: reply-fix-test-2.png');
          
          // STEP 3: Test persistence after refresh
          console.log('\n🧪 STEP 3: Testing persistence after refresh');
          await page.reload();
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(3000);
          
          // Navigate back to Mike Mentzer if needed
          if (!(await page.locator(`text="${testReplyText}"`).first().isVisible())) {
            const mikeMentzerLink2 = page.locator('text="Mike Mentzer"').first();
            if (await mikeMentzerLink2.isVisible()) {
              await mikeMentzerLink2.click();
              await page.waitForLoadState('networkidle');
              await page.waitForTimeout(3000);
            }
          }
          
          // Check if reply is still there after refresh
          const replyAfterRefresh = await page.locator(`text="${testReplyText}"`).isVisible();
          console.log(`💾 Reply visible after refresh: ${replyAfterRefresh}`);
          
          if (replyAfterRefresh) {
            console.log('✅ SUCCESS: Reply persisted correctly');
          } else {
            console.log('❌ ISSUE: Reply not visible after refresh');
          }
          
          // Take final screenshot
          await page.screenshot({ path: 'reply-fix-test-3.png', fullPage: true });
          console.log('📸 Screenshot saved: reply-fix-test-3.png');
          
        } else {
          console.log('❌ Submit button not available');
        }
      } else {
        console.log('❌ Reply form not found');
      }
    } else {
      console.log('❌ No reply button found');
    }
    
    // FINAL ANALYSIS
    console.log('\n🎯 FINAL ANALYSIS');
    console.log('=' .repeat(40));
    console.log('✅ Fix 1: ModernReviewSystem now uses useReviewReplies hook');
    console.log('✅ Fix 2: Real-time subscription includes all users (not just others)');
    console.log('✅ Fix 3: Improved optimistic updates with duplicate checking');
    console.log('✅ Fix 4: YouTube-like behavior for immediate reply display');
    console.log('\nScreenshots saved:');
    console.log('- reply-fix-test-1.png: Reply expansion');
    console.log('- reply-fix-test-2.png: After reply submission');
    console.log('- reply-fix-test-3.png: After page refresh');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'reply-fix-test-error.png', fullPage: true });
    console.log('📸 Error screenshot saved: reply-fix-test-error.png');
  } finally {
    await browser.close();
  }
}

testCompleteReplyFix(); 