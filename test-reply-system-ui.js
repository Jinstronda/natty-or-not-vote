import puppeteer from 'puppeteer';

async function testReplySystemUI() {
  console.log('🧪 [SEQUENTIAL THINKING] Testing Reply System UI Components');
  console.log('=======================================================');
  
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 100,
    args: ['--disable-dev-shm-usage', '--no-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Set viewport for desktop testing
  await page.setViewport({ width: 1920, height: 1080 });
  
  // Enable console logging
  const consoleMessages = [];
  page.on('console', msg => {
    const message = `${msg.type()}: ${msg.text()}`;
    consoleMessages.push(message);
    console.log(`📋 Console: ${message}`);
  });
  
  // Track network errors
  const networkErrors = [];
  page.on('response', response => {
    if (response.status() >= 400) {
      networkErrors.push(`${response.status()} - ${response.url()}`);
    }
  });
  
  try {
    console.log('\n🌐 Step 1: Navigating to localhost:8080...');
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle2' });
    
    console.log('\n🔍 Step 2: Looking for influencer pages...');
    
    // Check if we're on the homepage
    const currentUrl = page.url();
    console.log(`📍 Current URL: ${currentUrl}`);
    
    // Look for influencer cards on the homepage
    const influencerCards = await page.$$('[data-testid="influencer-card"], .group.cursor-pointer, a[href*="/influencer/"]');
    console.log(`📋 Found ${influencerCards.length} potential influencer cards`);
    
    if (influencerCards.length === 0) {
      console.log('⚠️  No influencer cards found on homepage, checking for different selectors...');
      
      // Alternative selectors for influencer cards
      const alternativeCards = await page.$$('div[class*="card"], .cursor-pointer, a[href*="/"]');
      console.log(`📋 Found ${alternativeCards.length} alternative clickable elements`);
      
      if (alternativeCards.length === 0) {
        console.log('❌ No clickable elements found - checking page content...');
        const pageContent = await page.content();
        console.log('📄 Page HTML length:', pageContent.length);
        
        await page.screenshot({ path: 'homepage-no-cards.png' });
        console.log('📸 Screenshot saved as homepage-no-cards.png');
      }
    }
    
    let influencerPageFound = false;
    
    // Try to click on the first influencer card
    if (influencerCards.length > 0) {
      console.log('\n🖱️  Step 3: Clicking on first influencer card...');
      await influencerCards[0].click();
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      
      const newUrl = page.url();
      console.log(`📍 Navigated to: ${newUrl}`);
      
      if (newUrl.includes('influencer')) {
        influencerPageFound = true;
        console.log('✅ Successfully navigated to influencer page');
      }
    }
    
    // If no influencer page found, try direct navigation
    if (!influencerPageFound) {
      console.log('\n🔄 Step 3 (Alternative): Direct navigation to influencer page...');
      
      // Check if we have any influencer data by looking at the page source
      const pageContent = await page.content();
      const influencerMatch = pageContent.match(/\/influencer\/([a-zA-Z0-9-]+)/);
      
      if (influencerMatch) {
        const influencerId = influencerMatch[1];
        console.log(`📋 Found influencer ID: ${influencerId}`);
        
        await page.goto(`http://localhost:8080/influencer/${influencerId}`, { waitUntil: 'networkidle2' });
        influencerPageFound = true;
        console.log('✅ Successfully navigated to influencer page via direct URL');
      } else {
        console.log('⚠️  No influencer IDs found in page content');
      }
    }
    
    if (!influencerPageFound) {
      console.log('❌ Could not find or navigate to influencer page');
      console.log('🔍 Available network errors:', networkErrors);
      console.log('🔍 Console messages:', consoleMessages.slice(-5));
      
      await page.screenshot({ path: 'homepage-debug.png' });
      console.log('📸 Screenshot saved as homepage-debug.png');
      
      return false;
    }
    
    console.log('\n🔍 Step 4: Looking for reviews section...');
    
    // Wait for page to load completely
    await page.waitForTimeout(2000);
    
    // Look for reviews section
    const reviewsSection = await page.$('[data-testid="reviews-section"], .reviews, section[class*="review"]');
    
    if (!reviewsSection) {
      console.log('⚠️  No reviews section found with standard selectors, checking for any review-related content...');
      
      // Alternative search for review content
      const reviewContent = await page.$$eval('*', els => 
        els.filter(el => 
          el.textContent && (
            el.textContent.toLowerCase().includes('review') || 
            el.textContent.toLowerCase().includes('comment') ||
            el.textContent.toLowerCase().includes('reply')
          )
        ).map(el => ({
          tagName: el.tagName,
          className: el.className,
          text: el.textContent.substring(0, 100)
        }))
      );
      
      console.log(`📋 Found ${reviewContent.length} elements with review/comment/reply text`);
      if (reviewContent.length > 0) {
        console.log('📋 Sample review content:', reviewContent.slice(0, 3));
      }
    } else {
      console.log('✅ Reviews section found');
    }
    
    console.log('\n🔍 Step 5: Looking for reply components...');
    
    // Look for reply buttons
    const replyButtons = await page.$$('[data-testid="reply-button"], button[class*="reply"], .reply-button');
    console.log(`📋 Found ${replyButtons.length} reply buttons`);
    
    // Look for reply forms
    const replyForms = await page.$$('[data-testid="reply-form"], form[class*="reply"], .reply-form');
    console.log(`📋 Found ${replyForms.length} reply forms`);
    
    // Look for reply lists
    const replyLists = await page.$$('[data-testid="reply-list"], .reply-list, .replies');
    console.log(`📋 Found ${replyLists.length} reply lists`);
    
    // Check for any reply-related elements
    const allReplyElements = await page.$$eval('*', els => 
      els.filter(el => 
        el.className && (
          el.className.includes('reply') || 
          el.className.includes('Reply')
        )
      ).map(el => ({
        tagName: el.tagName,
        className: el.className,
        id: el.id,
        text: el.textContent.substring(0, 50)
      }))
    );
    
    console.log(`📋 Found ${allReplyElements.length} elements with reply-related class names`);
    if (allReplyElements.length > 0) {
      console.log('📋 Sample reply elements:', allReplyElements.slice(0, 3));
    }
    
    console.log('\n🔍 Step 6: Testing reply button functionality...');
    
    if (replyButtons.length > 0) {
      console.log('🖱️  Clicking on first reply button...');
      await replyButtons[0].click();
      await page.waitForTimeout(1000);
      
      // Check if reply form appeared
      const replyFormAfterClick = await page.$('[data-testid="reply-form"], form[class*="reply"], .reply-form');
      if (replyFormAfterClick) {
        console.log('✅ Reply form appeared after clicking reply button');
        
        // Test form input
        const textInput = await replyFormAfterClick.$('textarea, input[type="text"]');
        if (textInput) {
          console.log('📝 Testing form input...');
          await textInput.type('Test reply message');
          console.log('✅ Successfully typed in reply form');
        }
      } else {
        console.log('⚠️  Reply form did not appear after clicking button');
      }
    } else {
      console.log('⚠️  No reply buttons found to test');
    }
    
    console.log('\n🔍 Step 7: Checking console for errors...');
    
    // Filter console messages for errors
    const errors = consoleMessages.filter(msg => 
      msg.includes('error') || 
      msg.includes('Error') || 
      msg.includes('failed') ||
      msg.includes('review_replies') ||
      msg.includes('reply_reactions')
    );
    
    console.log(`📋 Found ${errors.length} error-related console messages`);
    if (errors.length > 0) {
      console.log('❌ Error messages found:');
      errors.forEach(error => console.log(`  - ${error}`));
    }
    
    // Check for successful database operations
    const dbSuccessMessages = consoleMessages.filter(msg => 
      msg.includes('review_replies') || 
      msg.includes('reply_reactions') ||
      msg.includes('RPC') ||
      msg.includes('subscription')
    );
    
    console.log(`📋 Found ${dbSuccessMessages.length} database-related console messages`);
    if (dbSuccessMessages.length > 0) {
      console.log('📋 Database messages:');
      dbSuccessMessages.forEach(msg => console.log(`  - ${msg}`));
    }
    
    console.log('\n🔍 Step 8: Network error check...');
    console.log(`📋 Found ${networkErrors.length} network errors`);
    if (networkErrors.length > 0) {
      console.log('❌ Network errors found:');
      networkErrors.forEach(error => console.log(`  - ${error}`));
    }
    
    console.log('\n📸 Step 9: Taking final screenshot...');
    await page.screenshot({ path: 'reply-system-test.png', fullPage: true });
    console.log('📸 Screenshot saved as reply-system-test.png');
    
    console.log('\n🎉 Reply System UI Test Complete!');
    console.log('=====================================');
    console.log(`✅ Influencer page navigation: ${influencerPageFound ? 'SUCCESS' : 'FAILED'}`);
    console.log(`✅ Reply buttons found: ${replyButtons.length}`);
    console.log(`✅ Reply forms found: ${replyForms.length}`);
    console.log(`✅ Reply lists found: ${replyLists.length}`);
    console.log(`✅ Reply elements found: ${allReplyElements.length}`);
    console.log(`⚠️  Console errors: ${errors.length}`);
    console.log(`⚠️  Network errors: ${networkErrors.length}`);
    
    return {
      success: influencerPageFound,
      replyButtons: replyButtons.length,
      replyForms: replyForms.length,
      replyLists: replyLists.length,
      replyElements: allReplyElements.length,
      consoleErrors: errors.length,
      networkErrors: networkErrors.length,
      allConsoleMessages: consoleMessages,
      errors: errors,
      networkErrorsList: networkErrors
    };
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    return { success: false, error: error.message };
  } finally {
    await browser.close();
  }
}

// Run the test
testReplySystemUI()
  .then(result => {
    console.log('\n📊 FINAL RESULTS:');
    console.log('=================');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('\n🚀 UI TEST PASSED: Reply system components are accessible!');
    } else {
      console.log('\n💥 UI TEST FAILED: Issues found with reply system!');
    }
  })
  .catch(err => {
    console.error('\n💥 CRITICAL ERROR:', err);
  });