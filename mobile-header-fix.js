import { chromium } from 'playwright';

async function testAndFixMobileHeader() {
  console.log('🔧 Testing and fixing mobile header issues...');
  
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
    // Test both production and localhost
    const urls = [
      'https://nattyorjuicy.com',
      'http://localhost:8080'
    ];
    
    for (const url of urls) {
      console.log(`\n📱 Testing ${url}...`);
      
      try {
        await page.goto(url, { 
          waitUntil: 'networkidle',
          timeout: 10000 
        });
        
        // Wait for any animations
        await page.waitForTimeout(2000);
        
        // Check for the specific backdrop blur issue
        const backdropBlurIssue = await page.evaluate(() => {
          const adminTopBar = document.querySelector('.bg-gradient-to-r.from-red-900\\/90');
          const header = document.querySelector('header');
          
          if (!adminTopBar || !header) {
            return { hasIssue: false, reason: 'Elements not found' };
          }
          
          const adminStyles = window.getComputedStyle(adminTopBar);
          const headerStyles = window.getComputedStyle(header);
          const adminRect = adminTopBar.getBoundingClientRect();
          const headerRect = header.getBoundingClientRect();
          
          // Check if admin bar has backdrop blur and is positioned above header
          const hasBackdropBlur = adminStyles.backdropFilter && adminStyles.backdropFilter !== 'none';
          const isAboveHeader = adminRect.bottom >= headerRect.top;
          
          return {
            hasIssue: hasBackdropBlur && isAboveHeader,
            adminBackdropFilter: adminStyles.backdropFilter,
            adminPosition: adminStyles.position,
            headerPosition: headerStyles.position,
            adminRect: adminRect,
            headerRect: headerRect,
            reason: hasBackdropBlur ? 'AdminTopBar has backdrop-blur-sm' : 'No backdrop blur detected'
          };
        });
        
        console.log(`📊 Backdrop blur analysis for ${url}:`, backdropBlurIssue);
        
        // Test mobile menu functionality
        const mobileMenuTest = await page.evaluate(() => {
          const menuButton = document.querySelector('button[aria-label*="menu"]');
          const header = document.querySelector('header');
          
          if (!menuButton || !header) {
            return { working: false, reason: 'Menu button or header not found' };
          }
          
          // Check if elements are properly visible and clickable
          const buttonRect = menuButton.getBoundingClientRect();
          const headerRect = header.getBoundingClientRect();
          const buttonStyles = window.getComputedStyle(menuButton);
          const headerStyles = window.getComputedStyle(header);
          
          return {
            working: true,
            menuButton: {
              visible: buttonRect.width > 0 && buttonRect.height > 0,
              clickable: buttonStyles.pointerEvents !== 'none',
              zIndex: buttonStyles.zIndex,
              position: buttonStyles.position
            },
            header: {
              visible: headerRect.width > 0 && headerRect.height > 0,
              zIndex: headerStyles.zIndex,
              position: headerStyles.position,
              backdropFilter: headerStyles.backdropFilter
            }
          };
        });
        
        console.log(`📊 Mobile menu test for ${url}:`, mobileMenuTest);
        
        // Actually test clicking the mobile menu
        try {
          await page.click('button[aria-label*="menu"]');
          await page.waitForTimeout(1000);
          
          const menuOpened = await page.evaluate(() => {
            const mobileNav = document.querySelector('#mobile-navigation');
            if (!mobileNav) return { opened: false, reason: 'Mobile navigation not found' };
            
            const styles = window.getComputedStyle(mobileNav);
            const rect = mobileNav.getBoundingClientRect();
            
            return {
              opened: rect.height > 0 && styles.opacity !== '0',
              maxHeight: styles.maxHeight,
              opacity: styles.opacity,
              height: rect.height
            };
          });
          
          console.log(`📊 Menu interaction result for ${url}:`, menuOpened);
          
        } catch (clickError) {
          console.log(`❌ Failed to click menu button on ${url}:`, clickError.message);
        }
        
        // Take screenshot for visual confirmation
        const urlName = url.includes('localhost') ? 'localhost' : 'production';
        await page.screenshot({ 
          path: `/mnt/c/Users/joaop/Documents/Hobbies/natty-or-not-vote/mobile-header-test-${urlName}.png`,
          fullPage: true 
        });
        
      } catch (error) {
        console.log(`❌ Failed to test ${url}:`, error.message);
      }
    }
    
  } finally {
    await browser.close();
  }
}

// Run the comprehensive test
testAndFixMobileHeader().catch(console.error);