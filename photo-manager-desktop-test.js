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
    
    // First, let's see what's actually on the page
    console.log('🔍 Checking page content...');
    await page.screenshot({ path: 'homepage-initial.png', fullPage: true });
    
    // Look for any login-related elements
    const loginElements = await page.$$('a[href*="login"], button:has-text("Login"), button:has-text("Sign"), a:has-text("Login")');
    console.log(`Found ${loginElements.length} potential login elements`);
    
    // Try to find and click login
    let loginClicked = false;
    if (loginElements.length > 0) {
      await loginElements[0].click();
      loginClicked = true;
      console.log('✅ Clicked first login element');
    } else {
      // Try navigating directly to login page
      console.log('🔄 No login button found, trying direct navigation...');
      await page.goto('https://nattyorjuicy.com/login', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      loginClicked = true;
    }
    
    if (loginClicked) {
      // Wait for login form
      await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });
    }
    
    // Use a test admin account
    await page.fill('input[type="email"], input[name="email"]', 'testuser@gmail.com');
    await page.fill('input[type="password"], input[name="password"]', 'TestPassword123!');
    
    await page.click('button[type="submit"]');
    
    // Wait for login to complete
    await page.waitForSelector('text=User Profile', { timeout: 15000 });
    console.log('✅ Successfully logged in');
    
    // Navigate to admin panel
    console.log('🔧 Navigating to admin panel...');
    await page.goto('https://nattyorjuicy.com/admin', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait for admin panel to load
    await page.waitForSelector('text=Admin Panel', { timeout: 10000 });
    console.log('✅ Admin panel loaded');
    
    // Look for influencer management section and click on an influencer to edit
    console.log('🎯 Looking for influencer to edit...');
    
    // Wait for influencers to load and find the first "Edit Influencer" button
    await page.waitForSelector('button:has-text("Edit Influencer")', { timeout: 15000 });
    
    // Take a screenshot before clicking edit
    await page.screenshot({ path: 'admin-panel-before-edit.png', fullPage: true });
    
    // Click the first "Edit Influencer" button
    await page.click('button:has-text("Edit Influencer")');
    console.log('✅ Clicked Edit Influencer');
    
    // Wait for the edit form to appear and the EnhancedPhotoManager to load
    await page.waitForSelector('text=Enhanced Photo Gallery', { timeout: 10000 });
    console.log('✅ Edit form with photo manager loaded');
    
    // Scroll to the photo manager section
    await page.locator('text=Enhanced Photo Gallery').scrollIntoViewIfNeeded();
    
    // Wait a moment for everything to settle
    await page.waitForTimeout(2000);
    
    // Take a full page screenshot to see overall layout
    await page.screenshot({ path: 'photo-manager-full-page.png', fullPage: true });
    
    // Take a focused screenshot of just the photo manager section
    const photoManagerSection = page.locator('div:has(h3:text("Photo Gallery"))').first();
    await photoManagerSection.screenshot({ path: 'photo-manager-section.png' });
    
    // Measure the width and height of the photo manager container
    const boundingBox = await photoManagerSection.boundingBox();
    console.log('📏 Photo Manager Dimensions:', {
      width: boundingBox?.width,
      height: boundingBox?.height,
      screenCoverage: {
        widthPercentage: ((boundingBox?.width || 0) / 1920 * 100).toFixed(1) + '%',
        heightPercentage: ((boundingBox?.height || 0) / 1080 * 100).toFixed(1) + '%'
      }
    });
    
    // Get viewport dimensions to calculate coverage
    const viewport = page.viewportSize();
    console.log('💻 Current viewport:', viewport);
    
    // Check if there are existing photos or if we need to test the add photo functionality
    const existingPhotos = await page.locator('img[alt*="Gallery photo"]').count();
    console.log(`📸 Found ${existingPhotos} existing gallery photos`);
    
    if (existingPhotos === 0) {
      console.log('📝 No existing photos, testing add photo interface...');
      // Take screenshot of the add photo interface
      await page.locator('text=Upload a photo').screenshot({ path: 'add-photo-interface.png' });
    }
    
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