# 🎭 Playwright Interactive Testing Guide

## 📋 Overview
This guide provides comprehensive instructions for using Playwright with Chrome to manually navigate and test the Natty or Juicy website, particularly for mobile UX improvements.

## 🚀 Quick Start Commands

### Basic Interactive Testing
```bash
# Run all interactive tests with Chrome browser
npx playwright test tests/interactive-mobile-test.spec.ts --headed --debug

# Run specific test with extended timeout
npx playwright test tests/interactive-mobile-test.spec.ts --headed --timeout=300000 --project=chromium

# Run single test function
npx playwright test tests/interactive-mobile-test.spec.ts -g "open browser for manual mobile testing" --headed --debug
```

### Advanced Configuration
```bash
# Use specific browser (Chrome)
npx playwright test --project=chromium --headed

# Set custom viewport for testing
npx playwright test --headed --debug --reporter=dot
```

## 📱 Mobile Testing Setup

### Viewport Configuration
```typescript
// iPhone 12 viewport (390x844)
await page.setViewportSize({ width: 390, height: 844 });

// iPad viewport (768x1024)
await page.setViewportSize({ width: 768, height: 1024 });

// Android viewport (360x640)
await page.setViewportSize({ width: 360, height: 640 });
```

### Navigation Commands
```typescript
// Navigate to main website
await page.goto('https://nattyorjuicy.com');

// Navigate to specific influencer page
await page.goto('https://nattyorjuicy.com/influencer/[id]');

// Wait for page to fully load
await page.waitForLoadState('networkidle');
```

## 🔍 Interactive Testing Features

### Manual Navigation with `page.pause()`
```typescript
// Opens Playwright Inspector for manual testing
await page.pause();
```

**What happens when you use `page.pause()`:**
1. **Browser stays open** - The Chrome browser window remains active
2. **Playwright Inspector opens** - A debugging interface appears
3. **Manual control** - You can manually navigate, click, and test the website
4. **Resume execution** - Click "Resume" in the inspector to continue the test

### Console Logging for Guidance
```typescript
console.log('🌐 Opened browser at: https://nattyorjuicy.com');
console.log('📱 Mobile viewport set: 390x844 (iPhone 12)');
console.log('🔍 Ready for manual testing of mobile improvements');
```

## 🎯 Testing Scenarios

### 1. Expert Reviews Carousel Testing
**Test File:** `tests/interactive-mobile-test.spec.ts`

**Manual Testing Checklist:**
- [ ] Expert reviews display as carousel on mobile
- [ ] Swipe left/right navigation works
- [ ] Navigation dots allow jumping to specific reviews
- [ ] Arrow buttons function correctly
- [ ] Responsive design adapts to mobile viewport

**Test Commands:**
```bash
npx playwright test tests/interactive-mobile-test.spec.ts -g "expert reviews carousel" --headed --debug
```

### 2. Review Sorting Mobile Testing
**Manual Testing Checklist:**
- [ ] Scroll to reviews section
- [ ] Sorting controls are visible and responsive
- [ ] "Recent" and "Popular" tabs work correctly
- [ ] Reviews reorder properly when sorting changes
- [ ] Loading states display during sort changes
- [ ] Mobile sort indicator shows current sort

**Test Commands:**
```bash
npx playwright test tests/interactive-mobile-test.spec.ts -g "review sorting on mobile" --headed --debug
```

### 3. General Mobile Navigation Testing
**Manual Testing Checklist:**
- [ ] Mobile menu functions correctly
- [ ] Navigation between pages works
- [ ] Responsive design elements display properly
- [ ] Touch interactions work smoothly
- [ ] Loading states are appropriate

## 🛠️ Interactive Testing Best Practices

### 1. Start with Clean Browser State
```typescript
// Clear cookies and local storage
await page.context().clearCookies();
await page.evaluate(() => localStorage.clear());
```

### 2. Use Realistic Mobile Conditions
```typescript
// Simulate slower network
await page.route('**/*', route => {
  setTimeout(() => route.continue(), 100);
});

// Simulate mobile device
await page.emulate({
  viewport: { width: 390, height: 844 },
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true
});
```

### 3. Document Test Results
```typescript
// Take screenshots during testing
await page.screenshot({ path: 'mobile-test-results.png', fullPage: true });

// Log important observations
console.log('✅ Expert reviews carousel working correctly');
console.log('❌ Issue found: Sort buttons not responsive on mobile');
```

## 📊 Advanced Testing Techniques

### Debugging Network Issues
```typescript
// Monitor network requests
page.on('request', request => {
  console.log('Request:', request.url());
});

page.on('response', response => {
  console.log('Response:', response.url(), response.status());
});
```

### Performance Testing
```typescript
// Measure page load time
const startTime = Date.now();
await page.goto('https://nattyorjuicy.com');
const loadTime = Date.now() - startTime;
console.log(`Page loaded in ${loadTime}ms`);
```

### Mobile-Specific Interactions
```typescript
// Simulate touch gestures
await page.touchscreen.tap(100, 100);

// Simulate swipe gestures
await page.mouse.move(100, 100);
await page.mouse.down();
await page.mouse.move(300, 100);
await page.mouse.up();
```

## 🚨 Common Issues and Solutions

### Issue: Tests Timeout
**Solution:** Increase timeout or add explicit waits
```typescript
// Set higher timeout
test.setTimeout(300000); // 5 minutes

// Add explicit waits
await page.waitForSelector('[data-testid="expert-reviews"]');
```

### Issue: Mobile Layout Not Loading
**Solution:** Force mobile viewport and user agent
```typescript
await page.setViewportSize({ width: 390, height: 844 });
await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)');
```

### Issue: Interactive Mode Not Opening
**Solution:** Ensure correct flags are used
```bash
# Correct command
npx playwright test --headed --debug

# Alternative
npx playwright test --ui
```

## 📁 File Structure

```
tests/
├── interactive-mobile-test.spec.ts    # Main interactive tests
├── playwright.config.ts               # Playwright configuration
└── test-results/                      # Screenshots and reports
```

## 🎯 Key Testing URLs

**Main Website:**
- Production: `https://nattyorjuicy.com`
- Development: `http://localhost:5173`

**Influencer Page Example:**
- `https://nattyorjuicy.com/influencer/2e97f60a-9f4b-4fc7-a010-f24f411ed709`

**Test Pages:**
- Home: `/`
- Influencer Profile: `/influencer/[id]`
- Merch: `/merch`
- About: `/about`

## 🔧 Configuration

### Playwright Config Example
```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'https://nattyorjuicy.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
});
```

## 🎉 Success Criteria

### Expert Reviews Carousel
- ✅ Displays one review at a time on mobile
- ✅ Swipe navigation works smoothly
- ✅ Navigation dots are functional
- ✅ Arrow buttons work correctly
- ✅ Responsive design adapts properly

### Review Sorting
- ✅ Mobile sorting controls are visible
- ✅ Sort options ("Recent", "Popular") work
- ✅ Reviews reorder correctly
- ✅ Loading states display properly
- ✅ Mobile sort indicator shows current state

### General Mobile UX
- ✅ No horizontal scrolling issues
- ✅ Touch interactions are responsive
- ✅ Loading performance is acceptable
- ✅ Navigation flows work correctly

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright Inspector](https://playwright.dev/docs/inspector)
- [Mobile Testing Best Practices](https://playwright.dev/docs/emulation)
- [Network Simulation](https://playwright.dev/docs/network)

---

## 🚀 Quick Reference Commands

```bash
# Start interactive testing session
npx playwright test tests/interactive-mobile-test.spec.ts --headed --debug

# Run specific mobile test
npx playwright test tests/interactive-mobile-test.spec.ts -g "mobile" --headed

# Open Playwright UI for visual testing
npx playwright test --ui

# Generate test report
npx playwright show-report
```

---

**Last Updated:** 2025-07-05  
**Version:** 1.0  
**Author:** Claude (Natty or Juicy Development Team)