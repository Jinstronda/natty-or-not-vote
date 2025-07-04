import { chromium, devices } from 'playwright';
import fs from 'fs';

// Mobile devices to test
const mobileDevices = [
  devices['iPhone 12'],
  devices['iPhone 12 Pro Max'],
  devices['iPhone SE'],
  devices['Pixel 5'],
  devices['Samsung Galaxy S21'],
  devices['iPad Mini']
];

// Pages to test
const pagesToTest = [
  { url: '/', name: 'Home' },
  { url: '/login', name: 'Login' },
  { url: '/signup', name: 'SignUp' },
  { url: '/how-it-works', name: 'How It Works' },
  { url: '/terms', name: 'Terms' },
  { url: '/merch', name: 'Merch' },
  { url: '/experts', name: 'Experts Directory' },
  { url: '/admin', name: 'Admin Panel' }
];

const bugs = [];

function logBug(category, severity, description, device, page, screenshot = null) {
  bugs.push({
    category,
    severity,
    description,
    device: device.name,
    page,
    screenshot,
    timestamp: new Date().toISOString()
  });
  console.log(`🐛 [${severity}] ${category} - ${description} (${device.name} - ${page})`);
}

async function testMobileViewport(page, device) {
  try {
    // Check viewport meta tag
    const viewport = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="viewport"]');
      return meta ? meta.getAttribute('content') : null;
    });
    
    if (!viewport || !viewport.includes('width=device-width')) {
      logBug('SEO/Mobile', 'HIGH', 'Missing or incorrect viewport meta tag', device, 'All pages');
    }
    
    // Check for horizontal scrolling
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    
    if (hasHorizontalScroll) {
      logBug('Layout', 'HIGH', 'Horizontal scrolling detected', device, await page.url());
    }
    
    // Check for elements that might be too small to tap
    const smallElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('button, a, input, select, textarea');
      const tooSmall = [];
      
      elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0;
        const isTooSmall = (rect.width < 44 || rect.height < 44) && isVisible;
        
        if (isTooSmall) {
          tooSmall.push({
            tag: el.tagName,
            class: el.className,
            text: el.textContent?.slice(0, 50) || '',
            width: rect.width,
            height: rect.height
          });
        }
      });
      
      return tooSmall;
    });
    
    if (smallElements.length > 0) {
      logBug('Accessibility', 'MEDIUM', `${smallElements.length} elements smaller than 44px touch target`, device, await page.url());
    }
    
    // Check for text readability
    const textIssues = await page.evaluate(() => {
      const elements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
      const issues = [];
      
      elements.forEach(el => {
        const styles = window.getComputedStyle(el);
        const fontSize = parseInt(styles.fontSize);
        const lineHeight = parseFloat(styles.lineHeight);
        
        if (fontSize < 14) {
          issues.push(`Text too small: ${fontSize}px`);
        }
        
        if (lineHeight < 1.2) {
          issues.push(`Line height too small: ${lineHeight}`);
        }
      });
      
      return issues;
    });
    
    if (textIssues.length > 0) {
      logBug('Typography', 'MEDIUM', `Text readability issues found: ${textIssues.length}`, device, await page.url());
    }
    
  } catch (error) {
    logBug('Testing', 'HIGH', `Error testing mobile viewport: ${error.message}`, device, await page.url());
  }
}

async function testPageLoad(page, device) {
  try {
    // Measure page load time
    const startTime = Date.now();
    await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;
    
    if (loadTime > 5000) {
      logBug('Performance', 'HIGH', `Slow page load: ${loadTime}ms`, device, 'Home');
    }
    
    // Check for loading states
    const hasLoadingIndicator = await page.evaluate(() => {
      return document.querySelector('[data-testid="loading"], .loading, .spinner') !== null;
    });
    
    // Wait a bit to see if loading persists
    await page.waitForTimeout(2000);
    
    const stillLoading = await page.evaluate(() => {
      return document.querySelector('[data-testid="loading"], .loading, .spinner') !== null;
    });
    
    if (stillLoading) {
      logBug('UX', 'HIGH', 'Loading state persists too long', device, 'Home');
    }
    
  } catch (error) {
    logBug('Testing', 'HIGH', `Error testing page load: ${error.message}`, device, 'Home');
  }
}

async function testNavigation(page, device) {
  try {
    // Test mobile menu
    const menuButton = await page.locator('[data-testid="mobile-menu-button"], button[aria-label*="menu"], .hamburger, .menu-toggle').first();
    
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await page.waitForTimeout(500);
      
      // Check if menu opened
      const menuOpen = await page.evaluate(() => {
        return document.querySelector('[data-testid="mobile-menu"], .mobile-menu, .menu-open') !== null;
      });
      
      if (!menuOpen) {
        logBug('Navigation', 'HIGH', 'Mobile menu does not open when clicked', device, 'Home');
      }
      
      // Test menu links
      const menuLinks = await page.locator('[data-testid="mobile-menu"] a, .mobile-menu a, .menu-open a').all();
      
      if (menuLinks.length === 0) {
        logBug('Navigation', 'HIGH', 'No navigation links found in mobile menu', device, 'Home');
      }
      
      // Close menu
      await menuButton.click();
    } else {
      logBug('Navigation', 'MEDIUM', 'No mobile menu button found', device, 'Home');
    }
    
  } catch (error) {
    logBug('Testing', 'HIGH', `Error testing navigation: ${error.message}`, device, 'Home');
  }
}

async function testForms(page, device) {
  try {
    // Test login form
    await page.goto('http://localhost:8080/login');
    await page.waitForLoadState('networkidle');
    
    const emailInput = await page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = await page.locator('input[type="password"], input[name="password"]').first();
    
    if (await emailInput.isVisible()) {
      // Test keyboard interaction
      await emailInput.tap();
      await page.waitForTimeout(300);
      
      // Check if keyboard shows (by checking if viewport changed)
      const viewportAfterFocus = await page.evaluate(() => ({
        height: window.innerHeight,
        width: window.innerWidth
      }));
      
      // Test form validation
      const submitButton = await page.locator('button[type="submit"], input[type="submit"]').first();
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForTimeout(1000);
        
        // Check for validation messages
        const validationMessages = await page.locator('.error, .invalid, [role="alert"]').all();
        
        if (validationMessages.length === 0) {
          logBug('Forms', 'MEDIUM', 'No validation messages shown for empty form', device, 'Login');
        }
      }
    }
    
    // Test signup form
    await page.goto('http://localhost:8080/signup');
    await page.waitForLoadState('networkidle');
    
    const signupInputs = await page.locator('input').all();
    
    if (signupInputs.length > 0) {
      // Test first input
      await signupInputs[0].tap();
      await page.waitForTimeout(300);
      
      // Test form accessibility
      const labels = await page.locator('label').all();
      const inputsWithLabels = await page.evaluate(() => {
        const inputs = document.querySelectorAll('input');
        let labeledInputs = 0;
        
        inputs.forEach(input => {
          const hasLabel = input.hasAttribute('aria-label') || 
                          document.querySelector(`label[for="${input.id}"]`) ||
                          input.closest('label');
          if (hasLabel) labeledInputs++;
        });
        
        return { total: inputs.length, labeled: labeledInputs };
      });
      
      if (inputsWithLabels.labeled < inputsWithLabels.total) {
        logBug('Accessibility', 'MEDIUM', `${inputsWithLabels.total - inputsWithLabels.labeled} inputs missing labels`, device, 'SignUp');
      }
    }
    
  } catch (error) {
    logBug('Testing', 'HIGH', `Error testing forms: ${error.message}`, device, 'Forms');
  }
}

async function testImages(page, device) {
  try {
    await page.goto('http://localhost:8080/');
    await page.waitForLoadState('networkidle');
    
    // Test image loading
    const images = await page.locator('img').all();
    
    let brokenImages = 0;
    let imagesWithoutAlt = 0;
    
    for (const img of images) {
      // Check if image loaded
      const isLoaded = await img.evaluate(el => {
        return el.complete && el.naturalWidth > 0;
      });
      
      if (!isLoaded) {
        brokenImages++;
      }
      
      // Check for alt text
      const altText = await img.getAttribute('alt');
      if (!altText) {
        imagesWithoutAlt++;
      }
    }
    
    if (brokenImages > 0) {
      logBug('Images', 'HIGH', `${brokenImages} broken images found`, device, 'Home');
    }
    
    if (imagesWithoutAlt > 0) {
      logBug('Accessibility', 'MEDIUM', `${imagesWithoutAlt} images missing alt text`, device, 'Home');
    }
    
    // Test image upload if available
    const fileInput = await page.locator('input[type="file"]').first();
    if (await fileInput.isVisible()) {
      // Test file input accessibility
      const hasLabel = await fileInput.evaluate(el => {
        return el.hasAttribute('aria-label') || 
               document.querySelector(`label[for="${el.id}"]`) ||
               el.closest('label');
      });
      
      if (!hasLabel) {
        logBug('Accessibility', 'MEDIUM', 'File input missing label', device, 'Image Upload');
      }
    }
    
  } catch (error) {
    logBug('Testing', 'HIGH', `Error testing images: ${error.message}`, device, 'Images');
  }
}

async function testVoting(page, device) {
  try {
    await page.goto('http://localhost:8080/');
    await page.waitForLoadState('networkidle');
    
    // Look for voting elements
    const voteButtons = await page.locator('[data-testid*="vote"], button:has-text("Vote"), button:has-text("Natty"), button:has-text("Not")').all();
    
    if (voteButtons.length > 0) {
      // Test voting button accessibility
      for (const button of voteButtons) {
        const buttonText = await button.textContent();
        const hasAccessibleName = await button.evaluate(el => {
          return el.getAttribute('aria-label') || 
                 el.getAttribute('title') ||
                 el.textContent?.trim();
        });
        
        if (!hasAccessibleName) {
          logBug('Accessibility', 'MEDIUM', 'Vote button missing accessible name', device, 'Voting');
        }
        
        // Test button size
        const buttonSize = await button.boundingBox();
        if (buttonSize && (buttonSize.width < 44 || buttonSize.height < 44)) {
          logBug('Accessibility', 'MEDIUM', `Vote button too small: ${buttonSize.width}x${buttonSize.height}`, device, 'Voting');
        }
      }
    }
    
    // Test percentage/stats display
    const percentageElements = await page.locator('[data-testid*="percentage"], .percentage, .stats').all();
    
    if (percentageElements.length > 0) {
      // Check if percentages are readable
      for (const element of percentageElements) {
        const fontSize = await element.evaluate(el => {
          return window.getComputedStyle(el).fontSize;
        });
        
        if (parseInt(fontSize) < 14) {
          logBug('Typography', 'MEDIUM', `Percentage text too small: ${fontSize}`, device, 'Voting');
        }
      }
    }
    
  } catch (error) {
    logBug('Testing', 'HIGH', `Error testing voting: ${error.message}`, device, 'Voting');
  }
}

async function testResponsiveness(page, device) {
  try {
    // Test different orientations
    await page.setViewportSize({ width: device.viewport.width, height: device.viewport.height });
    
    // Portrait mode
    await page.goto('http://localhost:8080/');
    await page.waitForLoadState('networkidle');
    
    const portraitScreenshot = await page.screenshot({ fullPage: true });
    
    // Landscape mode (if applicable)
    if (device.viewport.width < device.viewport.height) {
      await page.setViewportSize({ width: device.viewport.height, height: device.viewport.width });
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Check for layout issues in landscape
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      
      if (hasHorizontalScroll) {
        logBug('Layout', 'HIGH', 'Horizontal scrolling in landscape mode', device, 'Home');
      }
    }
    
  } catch (error) {
    logBug('Testing', 'HIGH', `Error testing responsiveness: ${error.message}`, device, 'Responsiveness');
  }
}

async function testPerformance(page, device) {
  try {
    // Test Core Web Vitals
    await page.goto('http://localhost:8080/');
    
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const vitals = {};
          
          entries.forEach((entry) => {
            if (entry.name === 'largest-contentful-paint') {
              vitals.LCP = entry.startTime;
            }
            if (entry.name === 'first-input-delay') {
              vitals.FID = entry.processingStart - entry.startTime;
            }
            if (entry.name === 'cumulative-layout-shift') {
              vitals.CLS = entry.value;
            }
          });
          
          resolve(vitals);
        }).observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
        
        // Timeout after 10 seconds
        setTimeout(() => resolve({}), 10000);
      });
    });
    
    if (metrics.LCP > 2500) {
      logBug('Performance', 'HIGH', `Poor LCP: ${metrics.LCP}ms`, device, 'Home');
    }
    
    if (metrics.FID > 100) {
      logBug('Performance', 'HIGH', `Poor FID: ${metrics.FID}ms`, device, 'Home');
    }
    
    if (metrics.CLS > 0.1) {
      logBug('Performance', 'MEDIUM', `High CLS: ${metrics.CLS}`, device, 'Home');
    }
    
  } catch (error) {
    logBug('Testing', 'HIGH', `Error testing performance: ${error.message}`, device, 'Performance');
  }
}

async function testExpertsPage(page, device) {
  try {
    await page.goto('http://localhost:8080/experts');
    await page.waitForLoadState('networkidle');
    
    // Test expert cards/listings
    const expertCards = await page.locator('[data-testid*="expert"], .expert-card, .expert-item').all();
    
    if (expertCards.length > 0) {
      // Test card clickability
      const firstCard = expertCards[0];
      const cardBounds = await firstCard.boundingBox();
      
      if (cardBounds && cardBounds.height < 44) {
        logBug('Accessibility', 'MEDIUM', 'Expert card too small for touch', device, 'Experts');
      }
      
      // Test card content
      const cardText = await firstCard.textContent();
      if (!cardText || cardText.trim().length < 5) {
        logBug('Content', 'MEDIUM', 'Expert card missing content', device, 'Experts');
      }
    }
    
  } catch (error) {
    logBug('Testing', 'HIGH', `Error testing experts page: ${error.message}`, device, 'Experts');
  }
}

async function testMerchPage(page, device) {
  try {
    await page.goto('http://localhost:8080/merch');
    await page.waitForLoadState('networkidle');
    
    // Test product grid
    const productItems = await page.locator('[data-testid*="product"], .product-item, .product-card').all();
    
    if (productItems.length > 0) {
      // Test product images
      const productImages = await page.locator('[data-testid*="product"] img, .product-item img, .product-card img').all();
      
      let brokenProductImages = 0;
      for (const img of productImages) {
        const isLoaded = await img.evaluate(el => {
          return el.complete && el.naturalWidth > 0;
        });
        
        if (!isLoaded) {
          brokenProductImages++;
        }
      }
      
      if (brokenProductImages > 0) {
        logBug('Images', 'HIGH', `${brokenProductImages} broken product images`, device, 'Merch');
      }
    }
    
    // Test buy buttons
    const buyButtons = await page.locator('button:has-text("Buy"), button:has-text("Purchase"), a:has-text("Shop")').all();
    
    for (const button of buyButtons) {
      const buttonBounds = await button.boundingBox();
      if (buttonBounds && (buttonBounds.width < 44 || buttonBounds.height < 44)) {
        logBug('Accessibility', 'MEDIUM', `Buy button too small: ${buttonBounds.width}x${buttonBounds.height}`, device, 'Merch');
      }
    }
    
  } catch (error) {
    logBug('Testing', 'HIGH', `Error testing merch page: ${error.message}`, device, 'Merch');
  }
}

async function runComprehensiveTest() {
  console.log('🚀 Starting comprehensive mobile testing...');
  
  for (const device of mobileDevices) {
    console.log(`📱 Testing on ${device.name}...`);
    
    const browser = await chromium.launch();
    const context = await browser.newContext({
      ...device,
      permissions: ['geolocation', 'camera', 'microphone']
    });
    
    const page = await context.newPage();
    
    try {
      // Test page load and performance
      await testPageLoad(page, device);
      await testPerformance(page, device);
      
      // Test each page
      for (const testPage of pagesToTest) {
        try {
          console.log(`  Testing ${testPage.name}...`);
          await page.goto(`http://localhost:8080${testPage.url}`);
          await page.waitForLoadState('networkidle');
          
          // Basic viewport and layout tests
          await testMobileViewport(page, device);
          await testResponsiveness(page, device);
          
        } catch (error) {
          logBug('Testing', 'HIGH', `Error loading ${testPage.name}: ${error.message}`, device, testPage.name);
        }
      }
      
      // Test specific functionality
      await testNavigation(page, device);
      await testForms(page, device);
      await testImages(page, device);
      await testVoting(page, device);
      await testExpertsPage(page, device);
      await testMerchPage(page, device);
      
    } catch (error) {
      logBug('Testing', 'HIGH', `General error testing ${device.name}: ${error.message}`, device, 'General');
    } finally {
      await browser.close();
    }
  }
  
  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    totalBugs: bugs.length,
    bugsByCategory: bugs.reduce((acc, bug) => {
      acc[bug.category] = (acc[bug.category] || 0) + 1;
      return acc;
    }, {}),
    bugsBySeverity: bugs.reduce((acc, bug) => {
      acc[bug.severity] = (acc[bug.severity] || 0) + 1;
      return acc;
    }, {}),
    bugsByDevice: bugs.reduce((acc, bug) => {
      acc[bug.device] = (acc[bug.device] || 0) + 1;
      return acc;
    }, {}),
    bugs: bugs
  };
  
  fs.writeFileSync('/mnt/c/Users/joaop/Documents/Hobbies/natty-or-not-vote/mobile-test-report.json', JSON.stringify(report, null, 2));
  
  console.log('\n📊 TEST COMPLETE!');
  console.log(`Total bugs found: ${bugs.length}`);
  console.log(`High severity: ${report.bugsBySeverity.HIGH || 0}`);
  console.log(`Medium severity: ${report.bugsBySeverity.MEDIUM || 0}`);
  console.log(`Low severity: ${report.bugsBySeverity.LOW || 0}`);
  
  return bugs;
}

// Run the test
runComprehensiveTest().catch(console.error);