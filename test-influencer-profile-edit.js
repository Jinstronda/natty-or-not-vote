import { chromium } from 'playwright';

async function testInfluencerProfileEdit() {
  console.log('🔍 Testing EnhancedPhotoManager in influencer profile sidebar...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    // Navigate to main website
    console.log('📍 Navigating to nattyorjuicy.com...');
    await page.goto('https://nattyorjuicy.com', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Take initial screenshot
    await page.screenshot({ path: 'homepage-initial.png', fullPage: true });
    
    // Look for influencer cards to click on
    console.log('🎯 Looking for influencer cards...');
    await page.waitForSelector('[class*="influencer"], [class*="card"], img[alt*="influencer"], img[alt*="profile"]', { timeout: 10000 });
    
    // Find clickable influencer elements
    const influencerElements = await page.$$('a[href*="/influencer"], [role="button"]:has(img), [class*="card"]:has(img)');
    console.log(`Found ${influencerElements.length} potential influencer links`);
    
    if (influencerElements.length === 0) {
      // Try finding any images that might be influencer photos
      const imageElements = await page.$$('img:not([alt*="logo"]):not([alt*="icon"])');
      console.log(`Found ${imageElements.length} images, trying to click the first one`);
      
      if (imageElements.length > 0) {
        // Click on the parent element of the first image
        await imageElements[0].click();
      }
    } else {
      // Click on first influencer
      await influencerElements[0].click();
    }
    
    console.log('✅ Clicked on influencer');
    
    // Wait for navigation to profile page
    await page.waitForLoadState('networkidle');
    
    const currentUrl = page.url();
    console.log('📍 Current URL after click:', currentUrl);
    
    // Check if we're on an influencer profile page
    if (currentUrl.includes('/influencer/') || currentUrl.includes('profile')) {
      console.log('✅ Successfully navigated to influencer profile page');
      
      // Take screenshot of profile page
      await page.screenshot({ path: 'influencer-profile-page.png', fullPage: true });
      
      // Check if we need to login as admin to see edit functionality
      const editButtons = await page.locator('button:has-text("Edit")').count();
      const adminText = await page.locator('text=Admin').count();
      const photoText = await page.locator('text=Photo Gallery').count();
      const hasEditButton = editButtons > 0 || adminText > 0 || photoText > 0;
      
      if (!hasEditButton) {
        console.log('🔑 No edit functionality visible, attempting admin login...');
        
        // Look for login button
        const loginBtn = await page.locator('a[href*="login"], button:has-text("Login")').first();
        if (await loginBtn.count() > 0) {
          await loginBtn.click();
          
          // Wait for login form
          await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });
          
          // Login with admin account
          await page.fill('input[type="email"], input[name="email"]', 'testuser@gmail.com');
          await page.fill('input[type="password"], input[name="password"]', 'TestPassword123!');
          await page.click('button[type="submit"]');
          
          // Wait for redirect back
          await page.waitForLoadState('networkidle');
          
          // Navigate back to the influencer profile if needed
          if (!page.url().includes('/influencer/')) {
            await page.goBack();
            await page.waitForLoadState('networkidle');
          }
        }
      }
      
      // Now look for admin edit functionality
      await page.screenshot({ path: 'profile-after-potential-login.png', fullPage: true });
      
      // Look for the admin editor or photo manager
      const photoGalleryText = await page.locator('text=Photo Gallery').count();
      const editInfluencerText = await page.locator('text=Edit Influencer').count();
      const photoElements = await page.locator('[class*="photo"]').count();
      const photoManagerExists = photoGalleryText > 0 || editInfluencerText > 0 || photoElements > 0;
      
      if (photoManagerExists) {
        console.log('✅ Found admin edit functionality!');
        
        // Click edit if there's an edit button
        const editBtn = page.locator('button:has-text("Edit Influencer"), button:has-text("Edit")').first();
        if (await editBtn.count() > 0) {
          await editBtn.click();
          await page.waitForTimeout(2000);
          console.log('✅ Clicked edit button');
        }
        
        // Look for photo manager section specifically
        const photoManager = page.locator('text=Photo Gallery').first();
        if (await photoManager.count() > 0) {
          await photoManager.scrollIntoViewIfNeeded();
          console.log('✅ Found Photo Gallery section');
          
                     // Take focused screenshot of the sidebar area
           const sidebar = page.locator('div.lg\\:col-span-1, [class*="col-span-1"]').first();
           let sidebarBox = null;
           if (await sidebar.count() > 0) {
             await sidebar.screenshot({ path: 'sidebar-with-photo-manager.png' });
             
             // Measure sidebar dimensions
             sidebarBox = await sidebar.boundingBox();
             if (sidebarBox) {
               console.log('📏 Sidebar dimensions:', {
                 width: sidebarBox.width,
                 height: sidebarBox.height,
                 screenPercentage: (sidebarBox.width / 1920 * 100).toFixed(1) + '%'
               });
             }
           }
           
           // Take screenshot of photo manager section
           const photoSection = page.locator('div:has(h3:text("Photo Gallery")), [class*="photo-manager"]').first();
           if (await photoSection.count() > 0) {
             await photoSection.screenshot({ path: 'photo-manager-in-sidebar.png' });
             
             // Check if it's using responsive grid
             const gridElement = page.locator('.grid').first();
             const gridBox = await gridElement.boundingBox();
             if (gridBox && sidebarBox) {
               console.log('📏 Photo grid dimensions:', {
                 width: gridBox.width,
                 height: gridBox.height,
                 sidebarUsage: ((gridBox.width / sidebarBox.width) * 100).toFixed(1) + '%'
               });
               
               // Analyze grid layout in sidebar context
               console.log('🔍 Analyzing grid layout:');
               console.log(`  Sidebar width: ${sidebarBox.width}px`);
               console.log(`  Grid width: ${gridBox.width}px`);
               const approxColumnsIfTwo = Math.floor(gridBox.width / 200); // ~200px per photo
               const approxColumnsIfThree = Math.floor(gridBox.width / 150); // ~150px per photo
               console.log(`  Could fit ~${approxColumnsIfTwo} columns at 200px each`);
               console.log(`  Could fit ~${approxColumnsIfThree} columns at 150px each`);
             }
           }
        }
      } else {
        console.log('⚠️ No admin edit functionality found on this profile page');
        console.log('🔍 Available text on page:');
        const pageText = await page.textContent('body');
        console.log(pageText?.slice(0, 500) + '...');
      }
      
    } else {
      console.log('❌ Did not navigate to influencer profile page');
      console.log('Current URL:', currentUrl);
    }
    
    // Final full page screenshot
    await page.screenshot({ path: 'final-state.png', fullPage: true });
    
    console.log('\n✅ Test completed!');
    console.log('📸 Screenshots saved:');
    console.log('  - homepage-initial.png');
    console.log('  - influencer-profile-page.png');  
    console.log('  - profile-after-potential-login.png');
    console.log('  - sidebar-with-photo-manager.png (if found)');
    console.log('  - photo-manager-in-sidebar.png (if found)');
    console.log('  - final-state.png');
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
    await page.screenshot({ path: 'test-error.png', fullPage: true });
    console.log('📸 Error screenshot saved');
  } finally {
    await browser.close();
  }
}

testInfluencerProfileEdit().catch(console.error); 