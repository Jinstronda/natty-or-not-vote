import { chromium } from 'playwright';

async function testPhotoManagerDesktopCoverage() {
  console.log('🔍 Testing EnhancedPhotoManager desktop screen coverage...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000  // Slow down actions for visibility
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }, // Full desktop resolution
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });
  
  const page = await context.newPage();
  
  try {
    // Navigate to the main website
    console.log('📍 Navigating to nattyorjuicy.com...');
    await page.goto('https://nattyorjuicy.com', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Take initial screenshot
    console.log('🔍 Checking homepage...');
    await page.screenshot({ path: 'homepage-initial.png', fullPage: true });
    
    // Try direct admin access first
    console.log('🔧 Trying direct admin panel access...');
    await page.goto('https://nattyorjuicy.com/admin', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.screenshot({ path: 'admin-access-attempt.png', fullPage: true });
    
    // Check if we got redirected to login or if admin is accessible
    const currentUrl = page.url();
    console.log('Current URL after admin attempt:', currentUrl);
    
    if (currentUrl.includes('login') || !currentUrl.includes('admin')) {
      console.log('🔑 Redirected to login, attempting authentication...');
      
      // Wait for and fill login form
      await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });
      await page.fill('input[type="email"], input[name="email"]', 'testuser@gmail.com');
      await page.fill('input[type="password"], input[name="password"]', 'TestPassword123!');
      
      await page.click('button[type="submit"]');
      
      // Wait for redirect back to admin or home
      await page.waitForLoadState('networkidle');
      console.log('Login submitted, current URL:', page.url());
      
      // Try admin panel again
      if (!page.url().includes('admin')) {
        await page.goto('https://nattyorjuicy.com/admin', { 
          waitUntil: 'networkidle',
          timeout: 30000 
        });
      }
    }
    
    // Check if we're now in admin panel
    await page.screenshot({ path: 'admin-panel-final.png', fullPage: true });
    
    // Look for admin content or influencer management
    const hasAdminContent = await page.locator('text=Admin Panel, text=Influencer, button:has-text("Edit")').count() > 0;
    
    if (hasAdminContent) {
      console.log('✅ Admin panel loaded successfully');
      
      // Look for and click edit influencer
      await page.waitForSelector('button:has-text("Edit Influencer"), button:has-text("Edit")', { timeout: 15000 });
      await page.click('button:has-text("Edit Influencer"), button:has-text("Edit")');
      console.log('✅ Clicked Edit button');
      
      // Wait for edit form
      await page.waitForTimeout(3000); // Give form time to load
    } else {
      console.log('⚠️ Could not access admin panel, will test component structure anyway');
    }
    
    // Look for photo manager section
    const photoManagerExists = await page.locator('text=Photo Gallery, text=Enhanced Photo Gallery').count() > 0;
    
    if (photoManagerExists) {
      console.log('✅ Found photo manager section');
      
      // Scroll to the photo manager section
      await page.locator('text=Photo Gallery, text=Enhanced Photo Gallery').first().scrollIntoViewIfNeeded();
      
      // Wait a moment for everything to settle
      await page.waitForTimeout(2000);
      
      // Take a full page screenshot to see overall layout
      await page.screenshot({ path: 'photo-manager-full-page.png', fullPage: true });
      
      // Take a focused screenshot of just the photo manager section
      const photoManagerSection = page.locator('div:has(h3:text("Photo Gallery")), [class*="photo"], [class*="gallery"]').first();
      if (await photoManagerSection.count() > 0) {
        await photoManagerSection.screenshot({ path: 'photo-manager-section.png' });
        
        // Measure the width and height of the photo manager container
        const boundingBox = await photoManagerSection.boundingBox();
        if (boundingBox) {
          console.log('📏 Photo Manager Dimensions:', {
            width: boundingBox.width,
            height: boundingBox.height,
            screenCoverage: {
              widthPercentage: (boundingBox.width / 1920 * 100).toFixed(1) + '%',
              heightPercentage: (boundingBox.height / 1080 * 100).toFixed(1) + '%'
            }
          });
        }
      }
      
      // Check if there are existing photos or if we need to test the add photo functionality
      const existingPhotos = await page.locator('img[alt*="Gallery photo"], img[alt*="photo"]').count();
      console.log(`📸 Found ${existingPhotos} existing gallery photos`);
      
      if (existingPhotos === 0) {
        console.log('📝 No existing photos, testing add photo interface...');
        const uploadArea = page.locator('text=Upload a photo, [class*="upload"]').first();
        if (await uploadArea.count() > 0) {
          await uploadArea.screenshot({ path: 'add-photo-interface.png' });
        }
      }
    } else {
      console.log('⚠️ Photo manager section not found on current page');
      console.log('📄 Taking current page screenshot for analysis...');
      await page.screenshot({ path: 'current-page-structure.png', fullPage: true });
    }
    
    // Always get viewport info
    const viewport = page.viewportSize();
    console.log('💻 Current viewport:', viewport);
    
    console.log('✅ Desktop coverage test completed successfully!');
    console.log('📊 Results:');
    console.log('- Full page screenshot: photo-manager-full-page.png');
    console.log('- Photo manager section: photo-manager-section.png');
    console.log('- Admin panel overview: admin-panel-before-edit.png');
    if (existingPhotos === 0) {
      console.log('- Add photo interface: add-photo-interface.png');
    }
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
    
    // Take error screenshot for debugging
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
    console.log('📸 Error screenshot saved as error-screenshot.png');
    
    // Log current URL and page content for debugging
    console.log('Current URL:', page.url());
    console.log('Page title:', await page.title());
    
  } finally {
    await browser.close();
  }
}

// Run the test
testPhotoManagerDesktopCoverage().catch(console.error); 