import { chromium } from 'playwright';

async function testMikeMentzerReplies() {
  console.log('🔍 Testing Mike Mentzer Reply System Issues');
  console.log('=' .repeat(60));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 
  });
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Navigate to localhost development server
    console.log('📱 Navigating to local development server...');
    await page.goto('http://localhost:8081', { waitUntil: 'networkidle' });
    
    // Look for Mike Mentzer specifically
    console.log('🔍 Looking for Mike Mentzer...');
    await page.waitForTimeout(2000);
    
    // Try different ways to find Mike Mentzer
    const mikeMentzerSelectors = [
      'text="Mike Mentzer"',
      'a[href*="mike"]',
      'a[href*="mentzer"]', 
      '[data-testid*="mike"]',
      '[data-testid*="mentzer"]'
    ];
    
    let mikeMentzerLink = null;
    for (const selector of mikeMentzerSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible()) {
        console.log(`✅ Found Mike Mentzer link using selector: ${selector}`);
        mikeMentzerLink = element;
        break;
      }
    }
    
    if (!mikeMentzerLink) {
      console.log('❌ Mike Mentzer not found, listing all influencer links...');
      const allLinks = await page.locator('a[href*="/influencer/"], a').all();
      for (let i = 0; i < Math.min(allLinks.length, 20); i++) {
        const href = await allLinks[i].getAttribute('href');
        const text = await allLinks[i].textContent();
        console.log(`Link ${i}: ${href} - ${text?.trim()}`);
        if (text?.toLowerCase().includes('mike') || text?.toLowerCase().includes('mentzer')) {
          mikeMentzerLink = allLinks[i];
          console.log(`✅ Found Mike Mentzer at index ${i}`);
          break;
        }
      }
    }
    
    if (!mikeMentzerLink) {
      console.log('❌ Still cannot find Mike Mentzer, taking screenshot...');
      await page.screenshot({ path: 'homepage-search-for-mike.png', fullPage: true });
      return;
    }
    
    // Navigate to Mike Mentzer's page
    console.log('🎯 Navigating to Mike Mentzer page...');
    await mikeMentzerLink.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Take screenshot of Mike Mentzer page
    await page.screenshot({ path: 'mike-mentzer-page.png', fullPage: true });
    console.log('📸 Mike Mentzer page screenshot saved');
    
    // Now examine the reply system issues
    console.log('🧪 EXAMINING REPLY SYSTEM ISSUES...');
    
    // Look for reviews with reply counts
    const reviewsWithReplies = await page.locator('[data-testid*="expand-replies"], button:has-text("replies"), button:has-text("reply")').all();
    console.log(`Found ${reviewsWithReplies.length} elements with reply functionality`);
    
    for (let i = 0; i < Math.min(reviewsWithReplies.length, 3); i++) {
      const replyElement = reviewsWithReplies[i];
      const buttonText = await replyElement.textContent();
      console.log(`\n🔍 Reply Element ${i}: "${buttonText?.trim()}"`);
      
      // Check if this shows a reply count
      if (buttonText?.includes('replies') || buttonText?.includes('reply')) {
        console.log(`📊 Testing reply element: ${buttonText}`);
        
        // Extract the reply count if present
        const countMatch = buttonText.match(/(\d+)\s*(replies?|reply)/i);
        if (countMatch) {
          const expectedCount = parseInt(countMatch[1]);
          console.log(`📈 Expected reply count: ${expectedCount}`);
          
          // Click to expand replies
          await replyElement.scrollIntoViewIfNeeded();
          await replyElement.click();
          await page.waitForTimeout(1500);
          
          // Take screenshot after clicking
          await page.screenshot({ path: `replies-expanded-${i}.png`, fullPage: true });
          
          // Count actual visible replies
          const actualReplies = await page.locator('[data-testid*="reply-item"], .reply-item, .reply').all();
          console.log(`📉 Actual visible replies: ${actualReplies.length}`);
          
          // ISSUE DETECTION
          if (actualReplies.length !== expectedCount) {
            console.log(`❌ ISSUE CONFIRMED: Count mismatch - Expected ${expectedCount}, Found ${actualReplies.length}`);
            
            // Check if replies are being rendered but hidden
            const hiddenReplies = await page.locator('[data-testid*="reply-item"], .reply-item, .reply').count();
            console.log(`🔍 Total reply elements in DOM: ${hiddenReplies}`);
            
            // Check for any error messages or loading states
            const errorMessages = await page.locator('[role="alert"], .error, .loading').allTextContents();
            if (errorMessages.length > 0) {
              console.log(`⚠️  Error/Loading messages: ${errorMessages}`);
            }
          } else {
            console.log(`✅ Reply count matches display`);
          }
          
          // Check reply organization - are they all going to one comment?
          console.log('🧪 Checking reply organization...');
          for (let j = 0; j < actualReplies.length; j++) {
            const reply = actualReplies[j];
            const replyText = await reply.textContent();
            const replyParent = await reply.locator('xpath=../..').textContent(); // Get parent context
            console.log(`Reply ${j}: "${replyText?.trim().substring(0, 50)}..."`);
          }
          
          // Check if there are multiple review parents but replies are mixed up
          const reviewParents = await page.locator('[data-testid*="review-item"], .review-item, .review').all();
          console.log(`📋 Found ${reviewParents.length} review parent elements`);
          
          break; // Focus on first reply set for now
        }
      }
    }
    
    // Test reply submission if we find a reply form
    console.log('\n🧪 Testing reply submission...');
    const replyButton = await page.locator('button:has-text("Reply"), button:has-text("reply")').first();
    if (await replyButton.isVisible()) {
      await replyButton.click();
      await page.waitForTimeout(500);
      
      const replyForm = await page.locator('textarea[placeholder*="reply"], textarea[placeholder*="Write"]').first();
      if (await replyForm.isVisible()) {
        console.log('✅ Reply form found, testing submission...');
        
        const testText = `Test reply ${Date.now()}`;
        await replyForm.fill(testText);
        
        const submitButton = await page.locator('button:has-text("Reply"), button:has-text("Submit")').first();
        if (await submitButton.isVisible() && await submitButton.isEnabled()) {
          console.log('🚀 Submitting test reply...');
          await submitButton.click();
          await page.waitForTimeout(2000);
          
          // Check if reply appears
          const newReply = await page.locator(`text="${testText}"`).isVisible();
          console.log(`📝 New reply visible: ${newReply}`);
          
          await page.screenshot({ path: 'after-reply-submission.png', fullPage: true });
        }
      }
    }
    
    console.log('\n🎯 ANALYSIS SUMMARY');
    console.log('=' .repeat(40));
    console.log('Issues to investigate:');
    console.log('1. Reply count vs display mismatch');
    console.log('2. Reply organization and threading');
    console.log('3. Real-time UI updates');
    console.log('4. Database query correctness');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testMikeMentzerReplies(); 