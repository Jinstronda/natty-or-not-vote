import { chromium } from 'playwright';
import fs from 'fs';

// Simplified mobile testing without system dependencies
const bugs = [];
const baseURL = 'http://localhost:8080';

// Mobile viewports to test
const mobileViewports = [
  { name: 'iPhone 12', width: 390, height: 844 },
  { name: 'iPhone 12 Pro Max', width: 428, height: 926 },
  { name: 'iPhone SE', width: 320, height: 568 },
  { name: 'Android Large', width: 412, height: 915 },
  { name: 'Android Small', width: 360, height: 640 },
  { name: 'iPad Portrait', width: 768, height: 1024 }
];

// Pages to test
const pages = [
  { url: '/', name: 'Home' },
  { url: '/login', name: 'Login' },
  { url: '/signup', name: 'SignUp' },
  { url: '/how-it-works', name: 'How It Works' },
  { url: '/terms', name: 'Terms' },
  { url: '/merch', name: 'Merch' },
  { url: '/experts', name: 'Experts Directory' }
];

function logBug(category, severity, description, device, page) {
  const bug = {
    category,
    severity,
    description,
    device,
    page,
    timestamp: new Date().toISOString()
  };
  bugs.push(bug);
  console.log(`🐛 [${severity}] ${category}: ${description} (${device} - ${page})`);
}

async function testMobileViewport(page, viewport) {
  try {
    // Set mobile viewport
    await page.setViewportSize(viewport);
    
    // Test for horizontal scroll
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    
    if (hasHorizontalScroll) {
      logBug('Layout', 'HIGH', 'Horizontal scrolling detected', viewport.name, await page.url());
    }
    
    // Test touch target sizes
    const smallTouchTargets = await page.evaluate(() => {
      const clickableElements = document.querySelectorAll('button, a, input, select, textarea');
      const tooSmall = [];
      
      clickableElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0;
        const isTooSmall = (rect.width < 44 || rect.height < 44) && isVisible;
        
        if (isTooSmall) {
          tooSmall.push({
            tag: el.tagName,
            class: el.className,
            width: rect.width,
            height: rect.height,
            text: el.textContent?.slice(0, 30) || ''
          });
        }
      });
      
      return tooSmall;
    });
    
    if (smallTouchTargets.length > 0) {
      logBug('Accessibility', 'MEDIUM', `${smallTouchTargets.length} elements smaller than 44px touch target`, viewport.name, await page.url());
    }
    
    // Test text size
    const textSizeIssues = await page.evaluate(() => {
      const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, li, td, th');
      let smallTextCount = 0;
      
      textElements.forEach(el => {
        const styles = window.getComputedStyle(el);
        const fontSize = parseInt(styles.fontSize);
        
        if (fontSize < 14 && el.textContent && el.textContent.trim().length > 0) {
          smallTextCount++;
        }
      });
      
      return smallTextCount;
    });
    
    if (textSizeIssues > 0) {
      logBug('Typography', 'MEDIUM', `${textSizeIssues} text elements smaller than 14px`, viewport.name, await page.url());
    }
    
    // Test for missing viewport meta tag
    const hasViewportMeta = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="viewport"]');
      return meta && meta.getAttribute('content').includes('width=device-width');
    });
    
    if (!hasViewportMeta) {
      logBug('SEO/Mobile', 'HIGH', 'Missing or incorrect viewport meta tag', viewport.name, await page.url());
    }
    
  } catch (error) {
    logBug('Testing', 'HIGH', `Error testing mobile viewport: ${error.message}`, viewport.name, await page.url());
  }
}

async function testImages(page, viewport) {
  try {
    const imageIssues = await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      const issues = [];
      
      images.forEach(img => {
        // Check if image is loaded
        const isLoaded = img.complete && img.naturalWidth > 0;
        
        // Check for alt text
        const hasAlt = img.hasAttribute('alt');
        
        // Check for proper sizing
        const rect = img.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0;
        
        if (!isLoaded && isVisible) {
          issues.push({ type: 'broken', src: img.src });
        }
        
        if (!hasAlt && isVisible) {
          issues.push({ type: 'no-alt', src: img.src });
        }
      });
      
      return issues;
    });
    
    const brokenImages = imageIssues.filter(i => i.type === 'broken');
    const imagesWithoutAlt = imageIssues.filter(i => i.type === 'no-alt');
    
    if (brokenImages.length > 0) {
      logBug('Images', 'HIGH', `${brokenImages.length} broken images`, viewport.name, await page.url());
    }
    
    if (imagesWithoutAlt.length > 0) {
      logBug('Accessibility', 'MEDIUM', `${imagesWithoutAlt.length} images missing alt text`, viewport.name, await page.url());
    }
    
  } catch (error) {
    logBug('Testing', 'HIGH', `Error testing images: ${error.message}`, viewport.name, await page.url());
  }
}

async function testForms(page, viewport) {
  try {
    const formIssues = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input, textarea, select');
      const issues = [];
      
      inputs.forEach(input => {
        const hasLabel = input.hasAttribute('aria-label') || 
                        input.hasAttribute('aria-labelledby') ||
                        document.querySelector(`label[for="${input.id}"]`) ||
                        input.closest('label');
        
        const isVisible = input.offsetWidth > 0 && input.offsetHeight > 0;
        
        if (!hasLabel && isVisible) {
          issues.push({ type: 'no-label', tag: input.tagName, type: input.type });
        }
      });
      
      return issues;
    });
    
    if (formIssues.length > 0) {
      logBug('Accessibility', 'MEDIUM', `${formIssues.length} form elements missing labels`, viewport.name, await page.url());
    }
    
  } catch (error) {
    logBug('Testing', 'HIGH', `Error testing forms: ${error.message}`, viewport.name, await page.url());
  }
}

async function testNavigation(page, viewport) {
  try {
    const navIssues = await page.evaluate(() => {
      const issues = [];
      
      // Check for mobile menu
      const mobileMenu = document.querySelector('[data-testid="mobile-menu-button"], .mobile-menu-button, .hamburger, .menu-toggle');
      
      if (!mobileMenu) {
        issues.push({ type: 'no-mobile-menu' });
      }
      
      // Check for navigation links
      const navLinks = document.querySelectorAll('nav a, .nav a, .navigation a');
      
      if (navLinks.length === 0) {
        issues.push({ type: 'no-nav-links' });
      }
      
      // Check link sizes
      navLinks.forEach(link => {
        const rect = link.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0;
        
        if (isVisible && (rect.width < 44 || rect.height < 44)) {
          issues.push({ type: 'small-nav-link', width: rect.width, height: rect.height });
        }
      });
      
      return issues;
    });
    
    const noMobileMenu = navIssues.filter(i => i.type === 'no-mobile-menu');
    const noNavLinks = navIssues.filter(i => i.type === 'no-nav-links');
    const smallNavLinks = navIssues.filter(i => i.type === 'small-nav-link');
    
    if (noMobileMenu.length > 0) {
      logBug('Navigation', 'MEDIUM', 'No mobile menu button found', viewport.name, await page.url());
    }
    
    if (noNavLinks.length > 0) {
      logBug('Navigation', 'HIGH', 'No navigation links found', viewport.name, await page.url());
    }
    
    if (smallNavLinks.length > 0) {
      logBug('Navigation', 'MEDIUM', `${smallNavLinks.length} navigation links too small for touch`, viewport.name, await page.url());
    }
    
  } catch (error) {
    logBug('Testing', 'HIGH', `Error testing navigation: ${error.message}`, viewport.name, await page.url());
  }
}

async function testPerformance(page, viewport) {
  try {
    const startTime = Date.now();
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    if (loadTime > 5000) {
      logBug('Performance', 'HIGH', `Slow page load: ${loadTime}ms`, viewport.name, await page.url());
    }
    
    // Check for performance issues
    const performanceIssues = await page.evaluate(() => {
      const issues = [];
      
      // Check for large images
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        const rect = img.getBoundingClientRect();
        if (rect.width > 800 || rect.height > 600) {
          issues.push({ type: 'large-image', width: rect.width, height: rect.height });
        }
      });
      
      // Check for excessive DOM elements
      const elementCount = document.querySelectorAll('*').length;
      if (elementCount > 5000) {
        issues.push({ type: 'excessive-dom', count: elementCount });
      }
      
      return issues;
    });
    
    const largeImages = performanceIssues.filter(i => i.type === 'large-image');
    const excessiveDom = performanceIssues.filter(i => i.type === 'excessive-dom');
    
    if (largeImages.length > 0) {
      logBug('Performance', 'MEDIUM', `${largeImages.length} large images found`, viewport.name, await page.url());
    }
    
    if (excessiveDom.length > 0) {
      logBug('Performance', 'MEDIUM', `Excessive DOM elements: ${excessiveDom[0].count}`, viewport.name, await page.url());
    }
    
  } catch (error) {
    logBug('Testing', 'HIGH', `Error testing performance: ${error.message}`, viewport.name, await page.url());
  }
}

async function testSpecificFeatures(page, viewport) {
  try {
    const currentUrl = await page.url();
    
    // Test voting functionality if on home page
    if (currentUrl.includes('localhost:8080/')) {
      const votingIssues = await page.evaluate(() => {
        const issues = [];
        
        // Look for voting buttons
        const voteButtons = document.querySelectorAll('[data-testid*="vote"], button:has-text("Vote"), button:has-text("Natty"), button:has-text("Not")');
        
        if (voteButtons.length === 0) {
          issues.push({ type: 'no-vote-buttons' });
        }
        
        voteButtons.forEach(btn => {
          const rect = btn.getBoundingClientRect();
          if (rect.width < 44 || rect.height < 44) {
            issues.push({ type: 'small-vote-button', width: rect.width, height: rect.height });
          }
        });
        
        return issues;
      });
      
      if (votingIssues.some(i => i.type === 'no-vote-buttons')) {
        logBug('Functionality', 'HIGH', 'No voting buttons found on home page', viewport.name, 'Home');
      }
      
      if (votingIssues.some(i => i.type === 'small-vote-button')) {
        logBug('Accessibility', 'MEDIUM', 'Vote buttons too small for touch', viewport.name, 'Home');
      }
    }
    
    // Test login form if on login page
    if (currentUrl.includes('/login')) {
      const loginIssues = await page.evaluate(() => {
        const issues = [];
        
        const emailInput = document.querySelector('input[type="email"], input[name="email"]');
        const passwordInput = document.querySelector('input[type="password"], input[name="password"]');
        const submitButton = document.querySelector('button[type="submit"], input[type="submit"]');
        
        if (!emailInput) issues.push({ type: 'no-email-input' });
        if (!passwordInput) issues.push({ type: 'no-password-input' });
        if (!submitButton) issues.push({ type: 'no-submit-button' });
        
        return issues;
      });
      
      if (loginIssues.length > 0) {
        logBug('Functionality', 'HIGH', `Login form missing elements: ${loginIssues.map(i => i.type).join(', ')}`, viewport.name, 'Login');
      }
    }
    
    // Test signup form if on signup page
    if (currentUrl.includes('/signup')) {
      const signupIssues = await page.evaluate(() => {
        const issues = [];
        
        const inputs = document.querySelectorAll('input');
        const submitButton = document.querySelector('button[type="submit"], input[type="submit"]');
        
        if (inputs.length < 2) issues.push({ type: 'insufficient-inputs' });
        if (!submitButton) issues.push({ type: 'no-submit-button' });
        
        return issues;
      });
      
      if (signupIssues.length > 0) {
        logBug('Functionality', 'HIGH', `Signup form issues: ${signupIssues.map(i => i.type).join(', ')}`, viewport.name, 'SignUp');
      }
    }
    
    // Test merch page if on merch page
    if (currentUrl.includes('/merch')) {
      const merchIssues = await page.evaluate(() => {
        const issues = [];
        
        const productItems = document.querySelectorAll('[data-testid*="product"], .product-item, .product-card');
        const buyButtons = document.querySelectorAll('button:has-text("Buy"), button:has-text("Purchase"), a:has-text("Shop")');
        
        if (productItems.length === 0) issues.push({ type: 'no-products' });
        if (buyButtons.length === 0) issues.push({ type: 'no-buy-buttons' });
        
        return issues;
      });
      
      if (merchIssues.length > 0) {
        logBug('Functionality', 'HIGH', `Merch page issues: ${merchIssues.map(i => i.type).join(', ')}`, viewport.name, 'Merch');
      }
    }
    
  } catch (error) {
    logBug('Testing', 'HIGH', `Error testing specific features: ${error.message}`, viewport.name, await page.url());
  }
}

async function runComprehensiveTest() {
  console.log('🚀 Starting comprehensive mobile testing...');
  
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    for (const viewport of mobileViewports) {
      console.log(`📱 Testing on ${viewport.name} (${viewport.width}x${viewport.height})...`);
      
      const page = await browser.newPage();
      await page.setViewportSize(viewport);
      
      for (const testPage of pages) {
        try {
          console.log(`  Testing ${testPage.name}...`);
          
          await page.goto(`${baseURL}${testPage.url}`, { 
            waitUntil: 'networkidle',
            timeout: 30000
          });
          
          // Run all tests for this page
          await testMobileViewport(page, viewport);
          await testImages(page, viewport);
          await testForms(page, viewport);
          await testNavigation(page, viewport);
          await testPerformance(page, viewport);
          await testSpecificFeatures(page, viewport);
          
        } catch (error) {
          logBug('Testing', 'HIGH', `Error testing ${testPage.name}: ${error.message}`, viewport.name, testPage.name);
        }
      }
      
      await page.close();
    }
    
  } catch (error) {
    console.error('Browser launch failed:', error);
    logBug('Testing', 'CRITICAL', `Browser launch failed: ${error.message}`, 'System', 'General');
  } finally {
    if (browser) {
      await browser.close();
    }
  }
  
  // Generate comprehensive report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalBugs: bugs.length,
      criticalBugs: bugs.filter(b => b.severity === 'CRITICAL').length,
      highBugs: bugs.filter(b => b.severity === 'HIGH').length,
      mediumBugs: bugs.filter(b => b.severity === 'MEDIUM').length,
      lowBugs: bugs.filter(b => b.severity === 'LOW').length
    },
    categories: bugs.reduce((acc, bug) => {
      acc[bug.category] = (acc[bug.category] || 0) + 1;
      return acc;
    }, {}),
    devices: bugs.reduce((acc, bug) => {
      acc[bug.device] = (acc[bug.device] || 0) + 1;
      return acc;
    }, {}),
    pages: bugs.reduce((acc, bug) => {
      acc[bug.page] = (acc[bug.page] || 0) + 1;
      return acc;
    }, {}),
    bugs: bugs.sort((a, b) => {
      const severityOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    })
  };
  
  fs.writeFileSync('./mobile-test-report.json', JSON.stringify(report, null, 2));
  
  console.log('\n📊 COMPREHENSIVE MOBILE TEST COMPLETE!');
  console.log('='.repeat(50));
  console.log(`Total bugs found: ${bugs.length}`);
  console.log(`Critical: ${report.summary.criticalBugs}`);
  console.log(`High: ${report.summary.highBugs}`);
  console.log(`Medium: ${report.summary.mediumBugs}`);
  console.log(`Low: ${report.summary.lowBugs}`);
  console.log('='.repeat(50));
  
  // Display bugs by category
  console.log('\n📋 BUGS BY CATEGORY:');
  Object.entries(report.categories).forEach(([category, count]) => {
    console.log(`${category}: ${count}`);
  });
  
  // Display bugs by device
  console.log('\n📱 BUGS BY DEVICE:');
  Object.entries(report.devices).forEach(([device, count]) => {
    console.log(`${device}: ${count}`);
  });
  
  return report;
}

// Run the test
runComprehensiveTest().catch(console.error);