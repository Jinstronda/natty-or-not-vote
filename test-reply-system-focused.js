const { chromium } = require('playwright');

async function testReplySystemIssues() {
  console.log('🔍 Testing Reply System - Focused on Core Issues');
  console.log('=' .repeat(60));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slow down for visibility
  });
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Navigate to localhost development server
    console.log('📱 Navigating to local development server...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    
    // Wait for page to load and take a screenshot to see current state
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'current-homepage.png', fullPage: true });
    console.log('📸 Homepage screenshot saved as current-homepage.png');
    
    // Look for influencers on the homepage
    console.log('🔍 Looking for influencer cards...');
    const influencerCards = await page.locator('.influencer-card, [data-testid*="influencer"], a[href*="/influencer/"]').all();
    console.log(`Found ${influencerCards.length} potential influencer links`);
    
    if (influencerCards.length === 0) {
      console.log('❌ No influencer cards found, checking page structure...');
      const pageContent = await page.content();
      console.log('Page title:', await page.title());
      
      // Check if we need to navigate differently
      const allLinks = await page.locator('a').all();
      for (let i = 0; i < Math.min(allLinks.length, 10); i++) {
        const href = await allLinks[i].getAttribute('href');
        const text = await allLinks[i].textContent();
        console.log(`Link ${i}: ${href} - ${text?.trim()}`);
      }
      return;
    }
    
    // Click on the first influencer
    console.log('🎯 Clicking on first influencer...');
    await influencerCards[0].click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Take screenshot of influencer page
    await page.screenshot({ path: 'influencer-page.png', fullPage: true });
    console.log('📸 Influencer page screenshot saved as influencer-page.png');
    
    // Now test the reply system specifically
    console.log('🔍 Testing Reply System...');
    
    // Look for reviews section
    const reviewsSection = await page.locator('text="Community Reviews", text="Reviews", [data-testid*="review"]').first();
    if (await reviewsSection.isVisible()) {
      console.log('✅ Found reviews section');
      await reviewsSection.scrollIntoViewIfNeeded();
    } else {
      console.log('❌ Reviews section not found, checking page content...');
      const headings = await page.locator('h1, h2, h3, h4').allTextContents();
      console.log('Page headings:', headings);
    }
    
    // Look for existing reviews with reply buttons
    console.log('🔍 Looking for review items...');
    const reviewItems = await page.locator('[data-testid*="review"], .review-item, .review').all();
    console.log(`Found ${reviewItems.length} review items`);
    
    if (reviewItems.length === 0) {
      console.log('❌ No review items found. Let me check the page structure...');
      const textContent = await page.textContent('body');
      console.log('Page contains "review"?', textContent.toLowerCase().includes('review'));
      
      // Look for any buttons or interactive elements
      const buttons = await page.locator('button').all();
      console.log(`Found ${buttons.length} buttons on page`);
      for (let i = 0; i < Math.min(buttons.length, 5); i++) {
        const buttonText = await buttons[i].textContent();
        console.log(`Button ${i}: "${buttonText?.trim()}"`);
      }
      return;
    }
    
    // Test Reply Functionality on First Review
    console.log('🧪 Testing reply functionality on first review...');
    const firstReview = reviewItems[0];
    await firstReview.scrollIntoViewIfNeeded();
    
    // Look for reply-related elements
    const replyButton = await page.locator('button:has-text("Reply"), button:has-text("reply"), [data-testid*="reply-button"]').first();
    const expandRepliesButton = await page.locator('[data-testid="expand-replies-button"], button:has-text("replies"), button:has-text("Show replies")').first();
    
    console.log('Reply button visible:', await replyButton.isVisible());
    console.log('Expand replies button visible:', await expandRepliesButton.isVisible());
    
    // Test Case 1: Check if replies can be expanded
    if (await expandRepliesButton.isVisible()) {
      console.log('✅ Found expand replies button, testing expansion...');
      await expandRepliesButton.click();
      await page.waitForTimeout(1000);
      
      // Check if replies are now visible
      const replyItems = await page.locator('[data-testid*="reply-item"], .reply-item, .reply').all();
      console.log(`Found ${replyItems.length} existing replies`);
      
      // Take screenshot of expanded replies
      await page.screenshot({ path: 'replies-expanded.png', fullPage: true });
      console.log('📸 Expanded replies screenshot saved');
      
    } else {
      console.log('ℹ️  No expand replies button found, might be no existing replies');
    }
    
    // Test Case 2: Try to submit a new reply
    if (await replyButton.isVisible()) {
      console.log('✅ Found reply button, testing reply submission...');
      await replyButton.click();
      await page.waitForTimeout(500);
      
      // Look for reply form
      const replyForm = await page.locator('textarea[placeholder*="reply"], textarea[placeholder*="Write"], input[placeholder*="reply"]').first();
      if (await replyForm.isVisible()) {
        console.log('✅ Reply form appeared');
        
        // Test the core issue: Submit a reply and see if it appears
        const testReplyText = `Test reply ${Date.now()}`;
        await replyForm.fill(testReplyText);
        
        const submitButton = await page.locator('button:has-text("Reply"), button:has-text("Submit"), button[type="submit"]').first();
        if (await submitButton.isVisible() && await submitButton.isEnabled()) {
          console.log('🧪 CORE TEST: Submitting reply and checking for immediate appearance...');
          
          // Count existing replies before submission
          const repliesBeforeSubmission = await page.locator('[data-testid*="reply-item"], .reply-item, .reply').count();
          console.log(`Replies before submission: ${repliesBeforeSubmission}`);
          
          await submitButton.click();
          console.log('✅ Reply submitted, waiting for update...');
          
          // Wait a bit and check if the new reply appears
          await page.waitForTimeout(2000);
          
          const repliesAfterSubmission = await page.locator('[data-testid*="reply-item"], .reply-item, .reply').count();
          console.log(`Replies after submission: ${repliesAfterSubmission}`);
          
          // Check if our specific reply text appears
          const ourReplyVisible = await page.locator(`text="${testReplyText}"`).isVisible();
          console.log(`Our reply visible: ${ourReplyVisible}`);
          
          // Take screenshot after submission
          await page.screenshot({ path: 'after-reply-submission.png', fullPage: true });
          console.log('📸 Post-submission screenshot saved');
          
          // CORE ISSUE ANALYSIS
          if (repliesAfterSubmission > repliesBeforeSubmission || ourReplyVisible) {
            console.log('✅ SUCCESS: Reply appeared immediately after submission');
          } else {
            console.log('❌ ISSUE CONFIRMED: Reply did not appear immediately after submission');
            console.log('🔍 This confirms the user-reported issue');
          }
          
          // Test real-time updates by refreshing
          console.log('🔄 Testing if reply appears after page refresh...');
          await page.reload();
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(2000);
          
          const replyAfterRefresh = await page.locator(`text="${testReplyText}"`).isVisible();
          console.log(`Reply visible after refresh: ${replyAfterRefresh}`);
          
          if (replyAfterRefresh && !ourReplyVisible) {
            console.log('⚠️  CONFIRMED: Reply was saved to database but not updated in real-time UI');
          }
          
        } else {
          console.log('❌ Submit button not available or disabled');
        }
      } else {
        console.log('❌ Reply form not found after clicking reply button');
      }
    } else {
      console.log('❌ No reply button found');
    }
    
    // Final analysis
    console.log('\n🎯 REPLY SYSTEM ANALYSIS COMPLETE');
    console.log('=' .repeat(60));
    console.log('Check the screenshots to see the current state of the UI');
    console.log('Key files to examine:');
    console.log('- src/components/ReplyList.tsx');
    console.log('- src/components/ReplyForm.tsx'); 
    console.log('- src/hooks/api/useReviewReplies.ts');
    console.log('- Real-time subscription setup');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
}

testReplySystemIssues(); 