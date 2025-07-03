import { chromium } from 'playwright';

async function testMobileHeader() {
  console.log('🚀 Starting mobile header test on nattyorjuicy.com...');
  
  const browser = await chromium.launch({ 
    headless: false, // So we can see what's happening
    slowMo: 1000 // Slow down for better observation
  });
  
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 }, // iPhone 12 size
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
  });
  
  const page = await context.newPage();
  
  try {
    console.log('📱 Navigating to nattyorjuicy.com...');
    await page.goto('https://nattyorjuicy.com', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('✅ Page loaded successfully');
    
    // Wait a moment for any animations to complete
    await page.waitForTimeout(2000);
    
    // Take a screenshot to see the current state
    await page.screenshot({ 
      path: '/mnt/c/Users/joaop/Documents/Hobbies/natty-or-not-vote/mobile-header-initial.png',
      fullPage: true 
    });
    
    // Check if header is visible and functional
    console.log('🔍 Testing header visibility...');
    
    const headerInfo = await page.evaluate(() => {
      const header = document.querySelector('header');
      if (!header) return { found: false };
      
      const rect = header.getBoundingClientRect();
      const styles = window.getComputedStyle(header);
      
      return {
        found: true,
        visible: rect.height > 0 && styles.display !== 'none',
        position: styles.position,
        zIndex: styles.zIndex,
        backdropFilter: styles.backdropFilter,
        opacity: styles.opacity,
        height: rect.height,
        top: rect.top,
        isBlurred: styles.filter.includes('blur') || styles.backdropFilter.includes('blur'),
        bounds: {
          top: rect.top,
          left: rect.left,
          bottom: rect.bottom,
          right: rect.right,
          width: rect.width,
          height: rect.height
        }
      };
    });
    
    console.log('📊 Header Info:', headerInfo);
    
    // Check for mobile menu button
    console.log('🔍 Testing mobile menu button...');
    
    const mobileMenuInfo = await page.evaluate(() => {
      // Look for various possible mobile menu selectors
      const selectors = [
        'button[aria-label*="menu"]',
        '.mobile-menu-button',
        '.hamburger',
        '.menu-toggle',
        'button:has-text("Menu")',
        '[data-testid="mobile-menu-button"]'
      ];
      
      for (const selector of selectors) {
        try {
          const button = document.querySelector(selector);
          if (button) {
            const rect = button.getBoundingClientRect();
            const styles = window.getComputedStyle(button);
            return {
              found: true,
              selector,
              visible: rect.height > 0 && styles.display !== 'none',
              bounds: rect,
              styles: {
                display: styles.display,
                visibility: styles.visibility,
                opacity: styles.opacity
              }
            };
          }
        } catch (e) {
          // Skip invalid selectors
        }
      }
      
      return { found: false };
    });
    
    console.log('📊 Mobile Menu Info:', mobileMenuInfo);
    
    // Check for any elements with backdrop blur that might interfere
    console.log('🔍 Testing backdrop blur elements...');
    
    const backdropElements = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      const backdropElements = [];
      
      elements.forEach(el => {
        const styles = window.getComputedStyle(el);
        if (styles.backdropFilter && styles.backdropFilter !== 'none') {
          const rect = el.getBoundingClientRect();
          backdropElements.push({
            tagName: el.tagName,
            className: el.className,
            backdropFilter: styles.backdropFilter,
            zIndex: styles.zIndex,
            bounds: rect,
            visible: rect.height > 0 && styles.display !== 'none'
          });
        }
      });
      
      return backdropElements;
    });
    
    console.log('📊 Backdrop Blur Elements:', backdropElements);
    
    // Try to interact with mobile menu if found
    if (mobileMenuInfo.found) {
      console.log('🖱️ Attempting to click mobile menu button...');
      
      try {
        await page.click(mobileMenuInfo.selector);
        await page.waitForTimeout(1000);
        
        // Check if menu opened
        const menuOpened = await page.evaluate(() => {
          const menu = document.querySelector('#mobile-navigation, .mobile-menu, .menu-open');
          if (menu) {
            const styles = window.getComputedStyle(menu);
            const rect = menu.getBoundingClientRect();
            return {
              found: true,
              visible: rect.height > 0 && styles.display !== 'none',
              maxHeight: styles.maxHeight,
              opacity: styles.opacity
            };
          }
          return { found: false };
        });
        
        console.log('📊 Menu State After Click:', menuOpened);
        
        // Take screenshot after menu interaction
        await page.screenshot({ 
          path: '/mnt/c/Users/joaop/Documents/Hobbies/natty-or-not-vote/mobile-header-menu-clicked.png',
          fullPage: true 
        });
        
      } catch (error) {
        console.log('❌ Failed to click mobile menu:', error.message);
      }
    }
    
    // Check if navigation links are visible/accessible
    console.log('🔍 Testing navigation links...');
    
    const navigationLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('nav a, .nav a, .navigation a'));
      return links.map(link => {
        const rect = link.getBoundingClientRect();
        const styles = window.getComputedStyle(link);
        return {
          text: link.textContent?.trim(),
          href: link.href,
          visible: rect.height > 0 && styles.display !== 'none',
          bounds: rect
        };
      });
    });
    
    console.log('📊 Navigation Links:', navigationLinks);
    
    // Test scrolling behavior
    console.log('🔍 Testing scroll behavior...');
    
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(1000);
    
    const headerAfterScroll = await page.evaluate(() => {
      const header = document.querySelector('header');
      if (!header) return { found: false };
      
      const rect = header.getBoundingClientRect();
      const styles = window.getComputedStyle(header);
      
      return {
        found: true,
        visible: rect.height > 0 && styles.display !== 'none',
        position: styles.position,
        top: rect.top,
        isSticky: styles.position === 'sticky' || styles.position === 'fixed'
      };
    });
    
    console.log('📊 Header After Scroll:', headerAfterScroll);
    
    // Final screenshot
    await page.screenshot({ 
      path: '/mnt/c/Users/joaop/Documents/Hobbies/natty-or-not-vote/mobile-header-after-scroll.png',
      fullPage: true 
    });
    
    // Generate summary report
    const issues = [];
    
    if (!headerInfo.found) {
      issues.push('❌ CRITICAL: Header element not found');
    } else if (!headerInfo.visible) {
      issues.push('❌ CRITICAL: Header is not visible');
    }
    
    if (headerInfo.isBlurred) {
      issues.push('❌ HIGH: Header has blur effects applied');
    }
    
    if (!mobileMenuInfo.found) {
      issues.push('❌ HIGH: Mobile menu button not found');
    } else if (!mobileMenuInfo.visible) {
      issues.push('❌ HIGH: Mobile menu button not visible');
    }
    
    if (navigationLinks.length === 0) {
      issues.push('❌ HIGH: No navigation links found');
    }
    
    if (backdropElements.length > 2) {
      issues.push('⚠️ MEDIUM: Multiple backdrop blur elements may cause conflicts');
    }
    
    console.log('\n📋 ISSUE SUMMARY:');
    if (issues.length === 0) {
      console.log('✅ No major issues found!');
    } else {
      issues.forEach(issue => console.log(issue));
    }
    
    console.log('\n📊 DETAILED FINDINGS:');
    console.log('Header found:', headerInfo.found);
    console.log('Header visible:', headerInfo.visible);
    console.log('Header blurred:', headerInfo.isBlurred);
    console.log('Mobile menu found:', mobileMenuInfo.found);
    console.log('Navigation links count:', navigationLinks.length);
    console.log('Backdrop blur elements:', backdropElements.length);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    // Take error screenshot
    await page.screenshot({ 
      path: '/mnt/c/Users/joaop/Documents/Hobbies/natty-or-not-vote/mobile-header-error.png',
      fullPage: true 
    });
  } finally {
    console.log('🏁 Test completed. Screenshots saved.');
    await browser.close();
  }
}

// Run the test
testMobileHeader().catch(console.error);