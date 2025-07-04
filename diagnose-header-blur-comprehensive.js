import { chromium } from 'playwright';

async function comprehensiveHeaderBlurDiagnosis() {
  console.log('🔍 COMPREHENSIVE MOBILE HEADER BLUR DIAGNOSIS');
  console.log('═'.repeat(60));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 
  });
  
  // Test multiple mobile viewports to catch device-specific issues
  const mobileDevices = [
    { name: 'iPhone 12', width: 390, height: 844, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15' },
    { name: 'iPhone SE', width: 375, height: 667, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15' },
    { name: 'Samsung Galaxy', width: 360, height: 740, userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36' },
    { name: 'iPad Mini', width: 768, height: 1024, userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15' }
  ];
  
  for (const device of mobileDevices) {
    console.log(`\n📱 Testing ${device.name} (${device.width}x${device.height})`);
    
    const context = await browser.newContext({
      viewport: { width: device.width, height: device.height },
      userAgent: device.userAgent
    });
    
    const page = await context.newPage();
    
    try {
      await page.goto('http://localhost:8080', { 
        waitUntil: 'networkidle',
        timeout: 15000 
      });
      
      await page.waitForTimeout(2000);
      
      const headerAnalysis = await page.evaluate(() => {
        const header = document.querySelector('header');
        const adminTopBar = document.querySelector('.bg-gradient-to-r.from-red-900');
        
        if (!header) return { error: 'Header not found' };
        
        const headerStyles = window.getComputedStyle(header);
        const headerRect = header.getBoundingClientRect();
        
        // Check all elements with backdrop-blur
        const backdropBlurElements = Array.from(document.querySelectorAll('*')).filter(el => {
          const styles = window.getComputedStyle(el);
          return styles.backdropFilter && styles.backdropFilter !== 'none';
        }).map(el => ({
          tagName: el.tagName,
          className: el.className,
          backdropFilter: window.getComputedStyle(el).backdropFilter,
          zIndex: window.getComputedStyle(el).zIndex,
          position: window.getComputedStyle(el).position,
          bounds: el.getBoundingClientRect()
        }));
        
        // Check stacking context issues
        const elementsAboveHeader = Array.from(document.querySelectorAll('*')).filter(el => {
          const styles = window.getComputedStyle(el);
          const zIndex = parseInt(styles.zIndex || '0');
          const headerZIndex = parseInt(headerStyles.zIndex || '0');
          return zIndex > headerZIndex && (styles.position === 'fixed' || styles.position === 'absolute' || styles.position === 'sticky');
        }).map(el => ({
          tagName: el.tagName,
          className: el.className,
          zIndex: window.getComputedStyle(el).zIndex,
          position: window.getComputedStyle(el).position,
          bounds: el.getBoundingClientRect()
        }));
        
        // Check for iOS Safari specific issues
        const isIOSSafari = /iPhone|iPad|iPod/.test(navigator.userAgent) && /Safari/.test(navigator.userAgent);
        
        return {
          header: {
            visible: headerRect.width > 0 && headerRect.height > 0 && headerStyles.opacity !== '0',
            bounds: headerRect,
            styles: {
              position: headerStyles.position,
              zIndex: headerStyles.zIndex,
              opacity: headerStyles.opacity,
              backdropFilter: headerStyles.backdropFilter,
              background: headerStyles.background,
              display: headerStyles.display
            }
          },
          adminTopBar: adminTopBar ? {
            present: true,
            styles: {
              backdropFilter: window.getComputedStyle(adminTopBar).backdropFilter,
              background: window.getComputedStyle(adminTopBar).background,
              zIndex: window.getComputedStyle(adminTopBar).zIndex
            }
          } : { present: false },
          backdropBlurElements: backdropBlurElements,
          elementsAboveHeader: elementsAboveHeader,
          isIOSSafari: isIOSSafari,
          devicePixelRatio: window.devicePixelRatio,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          }
        };
      });
      
      console.log(`📊 ${device.name} Analysis:`, JSON.stringify(headerAnalysis, null, 2));
      
      // Test menu interaction to see if blur appears during interaction
      const menuButton = await page.locator('button[aria-label*="menu"]');
      if (await menuButton.count() > 0) {
        console.log(`🔍 Testing menu interaction on ${device.name}...`);
        
        await menuButton.click();
        await page.waitForTimeout(1000);
        
        const menuOpenAnalysis = await page.evaluate(() => {
          const header = document.querySelector('header');
          const mobileNav = document.querySelector('#mobile-navigation');
          
          if (!header) return { error: 'Header lost during menu interaction' };
          
          const headerStyles = window.getComputedStyle(header);
          const headerRect = header.getBoundingClientRect();
          
          return {
            headerAfterMenuOpen: {
              visible: headerRect.width > 0 && headerRect.height > 0 && headerStyles.opacity !== '0',
              backdropFilter: headerStyles.backdropFilter,
              opacity: headerStyles.opacity,
              bounds: headerRect
            },
            mobileMenuVisible: mobileNav ? mobileNav.getBoundingClientRect().height > 0 : false
          };
        });
        
        console.log(`📊 ${device.name} Menu Interaction:`, JSON.stringify(menuOpenAnalysis, null, 2));
        
        // Close menu
        await menuButton.click();
        await page.waitForTimeout(500);
      }
      
      // Take device-specific screenshot
      await page.screenshot({ 
        path: `/mnt/c/Users/joaop/Documents/Hobbies/natty-or-not-vote/header-blur-${device.name.replace(' ', '-').toLowerCase()}.png`,
        fullPage: false 
      });
      
    } catch (error) {
      console.error(`❌ ${device.name} test failed:`, error.message);
    } finally {
      await context.close();
    }
  }
  
  console.log('\n🎯 COMPREHENSIVE DIAGNOSIS COMPLETE');
  console.log('═'.repeat(60));
  
  await browser.close();
}

comprehensiveHeaderBlurDiagnosis().catch(console.error);