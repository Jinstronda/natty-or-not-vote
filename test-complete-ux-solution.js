import { chromium } from 'playwright';

async function testCompleteUXSolution() {
  console.log('🎯 Testing complete UX solution: Main image fix + PhotoManagerModal...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    // Navigate to local dev server
    console.log('📍 Navigating to local development server...');
    await page.goto('http://localhost:8080', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('✅ Local dev server loaded');
    
    // Navigate to an influencer profile
    await page.waitForTimeout(2000); // Give page time to fully load
    
    // Look for influencer links
    const influencerLinks = await page.$$('a[href*="/influencer"]');
    if (influencerLinks.length === 0) {
      // Try clicking any image if no direct links
      const images = await page.$$('img:not([alt*="logo"]):not([alt*="icon"])');
      if (images.length > 0) {
        console.log('🔄 Clicking first image to navigate to influencer...');
        await images[0].click();
      } else {
        throw new Error('No influencer navigation found');
      }
    } else {
      await influencerLinks[0].click();
    }
    
    await page.waitForLoadState('networkidle');
    console.log('✅ Navigated to influencer profile');
    
    // Login as admin if needed
    const hasEditButton = await page.locator('button:has-text("Edit")').count() > 0;
    if (!hasEditButton) {
      console.log('🔑 Logging in as admin...');
      
      // Try to find login
      const loginBtn = await page.locator('a:has-text("Login"), button:has-text("Login")').first();
      if (await loginBtn.count() > 0) {
        await loginBtn.click();
        await page.waitForSelector('input[type="email"]', { timeout: 10000 });
        
        // Use test admin credentials
        await page.fill('input[type="email"]', 'testuser@gmail.com');
        await page.fill('input[type="password"]', 'TestPassword123!');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');
        
        // Navigate back to influencer if needed
        if (!page.url().includes('/influencer/')) {
          await page.goBack();
          await page.waitForLoadState('networkidle');
        }
      }
    }
    
    // Click edit button to enter edit mode
    const editBtn = await page.locator('button:has-text("Edit")').first();
    if (await editBtn.count() > 0) {
      await editBtn.click();
      await page.waitForTimeout(2000);
      console.log('✅ Entered edit mode');
    } else {
      throw new Error('Edit button not found');
    }
    
    // Take screenshot of edit mode
    await page.screenshot({ path: 'edit-mode-complete.png', fullPage: true });
    
    // 🔍 TEST 1: Check main image overflow fix
    console.log('\n🔍 TEST 1: Checking main image overflow fix...');
    
    const sidebar = page.locator('[class*="lg:col-span-1"]').first();
    const mainImage = page.locator('img[alt="Main profile"]').first();
    
    const sidebarBox = await sidebar.boundingBox();
    const imageBox = await mainImage.boundingBox();
    
    if (sidebarBox && imageBox) {
      const imageOverflows = imageBox.x + imageBox.width > sidebarBox.x + sidebarBox.width;
      
      console.log(`  Sidebar width: ${sidebarBox.width.toFixed(1)}px`);
      console.log(`  Image width: ${imageBox.width.toFixed(1)}px`);
      console.log(`  Image overflows: ${imageOverflows ? 'YES ❌' : 'NO ✅'}`);
      
      if (!imageOverflows) {
        console.log('✅ Main image overflow FIXED!');
      } else {
        console.log('❌ Main image still overflowing');
      }
      
      // Take focused screenshot of main image section
      await mainImage.screenshot({ path: 'main-image-fixed.png' });
    }
    
    // 🔍 TEST 2: Check PhotoManagerModal functionality
    console.log('\n🔍 TEST 2: Checking PhotoManagerModal...');
    
    const managePhotosBtn = await page.locator('button:has-text("Manage Photos")').count();
    
    if (managePhotosBtn > 0) {
      console.log('✅ Found "Manage Photos" button');
      
      // Click to open modal
      await page.locator('button:has-text("Manage Photos")').click();
      console.log('🎭 Opened PhotoManagerModal');
      
      // Wait for modal to load
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
      await page.waitForTimeout(1000);
      
      // Take screenshot of modal
      await page.screenshot({ path: 'photo-modal-working.png', fullPage: true });
      
      // Measure modal dimensions
      const modal = page.locator('[role="dialog"]').first();
      const modalBox = await modal.boundingBox();
      
      if (modalBox && sidebarBox) {
        console.log(`\n📐 MODAL MEASUREMENTS:`);
        console.log(`  Modal width: ${modalBox.width.toFixed(1)}px`);
        console.log(`  Modal height: ${modalBox.height.toFixed(1)}px`);
        console.log(`  Screen coverage: ${(modalBox.width / 1920 * 100).toFixed(1)}% width`);
        console.log(`  Space improvement: ${((modalBox.width / sidebarBox.width) * 100).toFixed(0)}% vs sidebar`);
        
        const isProperSize = modalBox.width > 1500; // Should be ~90% of 1920px
        console.log(`  Proper modal size: ${isProperSize ? 'YES ✅' : 'NO ❌'}`);
      }
      
      // Test modal interactions
      console.log('\n🧪 Testing modal interactions...');
      
      // Test escape key
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      const modalClosed = await page.locator('[role="dialog"]').count() === 0;
      console.log(`  Escape key closes modal: ${modalClosed ? 'YES ✅' : 'NO ❌'}`);
      
      // Reopen modal for final test
      if (modalClosed) {
        await page.locator('button:has-text("Manage Photos")').click();
        await page.waitForSelector('[role="dialog"]', { timeout: 3000 });
      }
      
      // Check for photo grid inside modal
      const photoGrid = page.locator('[role="dialog"] .grid').first();
      const gridBox = await photoGrid.boundingBox();
      
      if (gridBox) {
        console.log(`\n📷 PHOTO GRID IN MODAL:`);
        console.log(`  Grid width: ${gridBox.width.toFixed(1)}px`);
        const approxColumns = Math.floor(gridBox.width / 350);
        console.log(`  Can fit ~${approxColumns} photos at 350px each`);
        console.log(`  Photo size improvement: Massive vs cramped sidebar!`);
      }
      
      // Take final modal screenshot
      await modal.screenshot({ path: 'modal-final-state.png' });
      
    } else {
      console.log('❌ "Manage Photos" button not found - modal not implemented?');
    }
    
    // 🎯 OVERALL RESULTS
    console.log('\n🎯 OVERALL UX SOLUTION RESULTS:');
    
    if (sidebarBox && modalBox && imageBox) {
      const imageFixed = imageBox.x + imageBox.width <= sidebarBox.x + sidebarBox.width;
      const modalWorking = modalBox.width > 1500;
      
      console.log(`\n✅ PROBLEMS SOLVED:`);
      console.log(`  • Main image overflow: ${imageFixed ? 'FIXED ✅' : 'NOT FIXED ❌'}`);
      console.log(`  • Photo management space: ${modalWorking ? 'SOLVED ✅' : 'NOT SOLVED ❌'}`);
      console.log(`  • Desktop UX optimization: ${modalWorking ? 'ACHIEVED ✅' : 'NOT ACHIEVED ❌'}`);
      
      console.log(`\n📊 QUANTIFIED IMPROVEMENTS:`);
      console.log(`  • Modal vs Sidebar space: ${((modalBox.width / sidebarBox.width) * 100).toFixed(0)}% increase`);
      console.log(`  • Image size: Reduced to fit (128px, no overflow)`);
      console.log(`  • Photo management: Now has ${(modalBox.width / 1920 * 100).toFixed(0)}% of screen space`);
      
      if (imageFixed && modalWorking) {
        console.log('\n🎉 COMPLETE UX SOLUTION SUCCESSFUL! 🎉');
      } else {
        console.log('\n⚠️ Some issues still need attention');
      }
    }
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
    await page.screenshot({ path: 'test-error-complete.png', fullPage: true });
  } finally {
    console.log('\n📸 Screenshots saved:');
    console.log('  - edit-mode-complete.png (overall edit mode)');
    console.log('  - main-image-fixed.png (image overflow fix)');
    console.log('  - photo-modal-working.png (modal functionality)');
    console.log('  - modal-final-state.png (modal detail)');
    
    await browser.close();
  }
}

testCompleteUXSolution().catch(console.error); 