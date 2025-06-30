import { chromium } from 'playwright';

async function finalVerificationTest() {
  console.log('🔍 Final verification of refined EnhancedPhotoManager approach...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    // Navigate and access influencer profile edit
    console.log('📍 Navigating to test influencer...');
    await page.goto('https://nattyorjuicy.com', { waitUntil: 'networkidle' });
    
    // Click on first influencer
    const influencerElements = await page.$$('a[href*="/influencer"]');
    if (influencerElements.length > 0) {
      await influencerElements[0].click();
      await page.waitForLoadState('networkidle');
      console.log('✅ Navigated to influencer profile');
      
      // Login as admin if needed and access edit
      const hasEdit = await page.locator('button:has-text("Edit")').count() > 0;
      if (!hasEdit) {
        const loginBtn = await page.locator('a[href*="login"], button:has-text("Login")').first();
        if (await loginBtn.count() > 0) {
          await loginBtn.click();
          await page.waitForSelector('input[type="email"]', { timeout: 10000 });
          await page.fill('input[type="email"]', 'testuser@gmail.com');
          await page.fill('input[type="password"]', 'TestPassword123!');
          await page.click('button[type="submit"]');
          await page.waitForLoadState('networkidle');
          
          // Go back to influencer if needed
          if (!page.url().includes('/influencer/')) {
            await page.goBack();
            await page.waitForLoadState('networkidle');
          }
        }
      }
      
      // Click edit button
      const editBtn = await page.locator('button:has-text("Edit")').first();
      if (await editBtn.count() > 0) {
        await editBtn.click();
        await page.waitForTimeout(2000);
        console.log('✅ Accessed edit mode');
        
        // Look for photo gallery
        const photoGallery = await page.locator('text=Photo Gallery').count();
        if (photoGallery > 0) {
          console.log('✅ Found Photo Gallery section');
          
          // Scroll to photo manager
          await page.locator('text=Photo Gallery').scrollIntoViewIfNeeded();
          
          // Measure the actual layout
          const sidebar = page.locator('[class*="lg:col-span-1"]').first();
          const photoGrid = page.locator('.grid').first();
          
          const sidebarBox = await sidebar.boundingBox();
          const gridBox = await photoGrid.boundingBox();
          
          if (sidebarBox && gridBox) {
            console.log('\n📏 LAYOUT ANALYSIS:');
            console.log(`  Sidebar width: ${sidebarBox.width.toFixed(1)}px`);
            console.log(`  Grid width: ${gridBox.width.toFixed(1)}px`);
            console.log(`  Grid overflow: ${gridBox.width > sidebarBox.width ? 'YES' : 'NO'}`);
            
            if (gridBox.width <= sidebarBox.width * 1.05) { // Allow small margin
              console.log('✅ Grid fits properly within sidebar');
            } else {
              console.log('❌ Grid overflows sidebar');
            }
            
            // Check for grid columns by analyzing photos
            const photoCards = await page.locator('[class*="photo-card"], [class*="card"]').count();
            console.log(`  Photo cards found: ${photoCards}`);
            
            // Estimate column count by checking horizontal layout
            if (photoCards >= 2) {
              const firstCard = page.locator('[class*="photo-card"], [class*="card"]').first();
              const secondCard = page.locator('[class*="photo-card"], [class*="card"]').nth(1);
              
              const firstBox = await firstCard.boundingBox();
              const secondBox = await secondCard.boundingBox();
              
              if (firstBox && secondBox) {
                const sameRow = Math.abs(firstBox.y - secondBox.y) < 50; // Within 50px vertically
                const columnCount = sameRow ? '2+' : '1';
                console.log(`  Estimated columns: ${columnCount}`);
                
                if (columnCount === '1') {
                  console.log('✅ Using appropriate single column layout for sidebar');
                } else {
                  console.log('⚠️ Using multi-column in narrow sidebar');
                }
              }
            }
          }
          
          // Take final screenshots
          await page.screenshot({ path: 'final-verification-full.png', fullPage: true });
          await sidebar.screenshot({ path: 'final-verification-sidebar.png' });
          
          console.log('\n🎯 VERIFICATION SUMMARY:');
          console.log('  Component location: Influencer profile sidebar');
          console.log('  Sidebar width: ~435px (constrained context)');
          console.log('  Expected behavior: Single column, taller photos');
          console.log('  Grid approach: Responsive but sidebar-aware');
          
        } else {
          console.log('❌ Photo Gallery section not found');
        }
      } else {
        console.log('❌ Edit button not found');
      }
    } else {
      console.log('❌ No influencer links found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: 'final-verification-error.png' });
  } finally {
    console.log('\n📸 Screenshots saved:');
    console.log('  - final-verification-full.png');
    console.log('  - final-verification-sidebar.png');
    await browser.close();
  }
}

finalVerificationTest().catch(console.error); 