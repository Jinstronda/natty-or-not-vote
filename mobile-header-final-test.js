import { chromium } from 'playwright';

async function testMobileHeaderFix() {
  console.log('🔧 Testing mobile header fix...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 
  });
  
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
  });
  
  const page = await context.newPage();
  
  try {
    console.log('📱 Testing localhost with mobile header safety...');
    
    await page.goto('http://localhost:8080', { 
      waitUntil: 'networkidle',
      timeout: 15000 
    });
    
    // Wait for the mobile header safety hook to initialize
    await page.waitForTimeout(3000);
    
    console.log('🔍 Checking mobile header safety implementation...');
    
    // Check if the mobile header safety is working
    const safetyCheck = await page.evaluate(() => {
      const header = document.querySelector('header');
      if (!header) return { status: 'FAIL', reason: 'Header not found' };
      
      const headerStyles = window.getComputedStyle(header);
      const headerRect = header.getBoundingClientRect();
      
      // Check for common mobile header issues
      const checks = {
        headerVisible: headerRect.height > 0 && headerStyles.display !== 'none',
        properZIndex: parseInt(headerStyles.zIndex || '0') >= 50,
        noBlurConflicts: true, // Will be updated if conflicts found
        touchTargetsAdequate: true // Will be updated if issues found
      };
      
      // Check for backdrop blur conflicts
      const backdropElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const styles = window.getComputedStyle(el);
        return styles.backdropFilter && styles.backdropFilter !== 'none';
      });
      
      if (backdropElements.length > 0) {
        backdropElements.forEach(el => {
          const rect = el.getBoundingClientRect();
          const overlaps = !(
            rect.bottom < headerRect.top ||
            rect.top > headerRect.bottom
          );
          if (overlaps) {
            checks.noBlurConflicts = false;
          }
        });
      }
      
      // Check touch targets in header
      const clickableElements = header.querySelectorAll('button, a, [role="button"]');
      clickableElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.width < 44 || rect.height < 44) {
          checks.touchTargetsAdequate = false;
        }
      });
      
      return {
        status: Object.values(checks).every(Boolean) ? 'PASS' : 'PARTIAL',
        checks,
        headerInfo: {
          visible: checks.headerVisible,
          zIndex: headerStyles.zIndex,
          position: headerStyles.position,
          height: headerRect.height
        },
        backdropElements: backdropElements.length
      };
    });
    
    console.log('📊 Mobile Header Safety Check:', safetyCheck);
    
    // Test mobile menu functionality
    console.log('🔍 Testing mobile menu with safety measures...');
    
    const menuTest = await page.evaluate(() => {
      const menuButton = document.querySelector('button[aria-label*="menu"]');
      if (!menuButton) return { status: 'FAIL', reason: 'Menu button not found' };
      
      const rect = menuButton.getBoundingClientRect();
      const styles = window.getComputedStyle(menuButton);
      
      return {
        status: 'READY',
        button: {
          visible: rect.width > 0 && rect.height > 0,
          touchSafe: rect.width >= 44 && rect.height >= 44,
          clickable: styles.pointerEvents !== 'none',
          bounds: rect
        }
      };
    });
    
    console.log('📊 Menu Button Check:', menuTest);
    
    if (menuTest.status === 'READY') {
      // Click the menu button
      await page.click('button[aria-label*="menu"]');
      await page.waitForTimeout(1000);
      
      // Check if safety measures maintained menu functionality
      const menuOpenCheck = await page.evaluate(() => {
        const mobileNav = document.querySelector('#mobile-navigation');
        const header = document.querySelector('header');
        
        if (!mobileNav || !header) {
          return { status: 'FAIL', reason: 'Navigation or header missing' };
        }
        
        const navStyles = window.getComputedStyle(mobileNav);
        const navRect = mobileNav.getBoundingClientRect();
        const headerRect = header.getBoundingClientRect();
        
        return {
          status: 'SUCCESS',
          menu: {
            visible: navRect.height > 0 && navStyles.opacity !== '0',
            maxHeight: navStyles.maxHeight,
            opacity: navStyles.opacity,
            height: navRect.height
          },
          headerStillVisible: headerRect.height > 0,
          noOverlapIssues: navRect.top >= headerRect.bottom || navRect.bottom <= headerRect.top
        };
      });
      
      console.log('📊 Menu Open Check:', menuOpenCheck);
      
      // Test navigation links in mobile menu
      const navLinksCheck = await page.evaluate(() => {
        const navLinks = Array.from(document.querySelectorAll('#mobile-navigation a'));
        
        return {
          count: navLinks.length,
          touchSafe: navLinks.every(link => {
            const rect = link.getBoundingClientRect();
            return rect.width >= 44 && rect.height >= 44;
          }),
          visible: navLinks.every(link => {
            const rect = link.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
          })
        };
      });
      
      console.log('📊 Navigation Links Check:', navLinksCheck);
    }
    
    // Take final screenshot
    await page.screenshot({ 
      path: '/mnt/c/Users/joaop/Documents/Hobbies/natty-or-not-vote/mobile-header-fix-verified.png',
      fullPage: true 
    });
    
    // Generate final report
    console.log('\n🎯 MOBILE HEADER FIX SUMMARY:');
    console.log('═'.repeat(50));
    
    if (safetyCheck.status === 'PASS') {
      console.log('✅ ALL SAFETY CHECKS PASSED');
      console.log('✅ Header is visible and functional');
      console.log('✅ No backdrop blur conflicts detected');
      console.log('✅ Touch targets are adequate');
      console.log('✅ Z-index is properly configured');
    } else {
      console.log('⚠️  SOME ISSUES DETECTED:');
      if (!safetyCheck.checks.headerVisible) console.log('❌ Header visibility issue');
      if (!safetyCheck.checks.properZIndex) console.log('❌ Z-index too low');
      if (!safetyCheck.checks.noBlurConflicts) console.log('❌ Backdrop blur conflicts');
      if (!safetyCheck.checks.touchTargetsAdequate) console.log('❌ Touch targets too small');
    }
    
    console.log('\n📊 TECHNICAL DETAILS:');
    console.log('Header Height:', safetyCheck.headerInfo.height + 'px');
    console.log('Header Z-Index:', safetyCheck.headerInfo.zIndex);
    console.log('Header Position:', safetyCheck.headerInfo.position);
    console.log('Backdrop Elements:', safetyCheck.backdropElements);
    
    if (menuTest.button) {
      console.log('Menu Button Size:', `${menuTest.button.bounds.width}x${menuTest.button.bounds.height}px`);
      console.log('Menu Button Touch Safe:', menuTest.button.touchSafe ? 'YES' : 'NO');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ 
      path: '/mnt/c/Users/joaop/Documents/Hobbies/natty-or-not-vote/mobile-header-fix-error.png',
      fullPage: true 
    });
  } finally {
    console.log('🏁 Test completed. Check screenshots for visual verification.');
    await browser.close();
  }
}

// Run the test
testMobileHeaderFix().catch(console.error);