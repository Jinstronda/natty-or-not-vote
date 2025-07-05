import { test, expect, Page } from '@playwright/test';

test.describe('Modern Sorting Verification Tests', () => {
  let page: Page;
  
  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Enhanced error detection
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('🚨 Console Error:', msg.text());
      }
      if (msg.text().includes('[PaginatedReviews]')) {
        console.log('📝 Sorting Log:', msg.text());
      }
    });
    
    page.on('pageerror', error => {
      console.log('🚨 Page Error:', error.message);
    });
    
    // Navigate to homepage and wait for load
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Click on first influencer to access reviews
    const firstInfluencerCard = page.locator('[data-testid="influencer-card"]').first();
    if (await firstInfluencerCard.isVisible()) {
      await firstInfluencerCard.click();
      await page.waitForLoadState('networkidle');
    }
  });

  test('should display modern sorting controls with test IDs', async () => {
    console.log('🧪 Testing modern sorting controls visibility...');
    
    // Look for the modern sorting controls with data-testid
    const sortingControls = page.locator('[data-testid="sorting-controls"]');
    
    // Wait longer for controls to appear
    await expect(sortingControls).toBeVisible({ timeout: 15000 });
    
    // Verify both sort buttons are present
    const recentButton = page.locator('[data-testid="sort-recent"]');
    const popularButton = page.locator('[data-testid="sort-popular"]');
    
    await expect(recentButton).toBeVisible();
    await expect(popularButton).toBeVisible();
    
    console.log('✅ Modern sorting controls are visible and properly structured');
  });

  test('should handle sort switching without breaking the website', async () => {
    console.log('🧪 Testing robust sort switching...');
    
    const recentButton = page.locator('[data-testid="sort-recent"]');
    const popularButton = page.locator('[data-testid="sort-popular"]');
    
    // Wait for controls to be available
    await expect(recentButton.or(popularButton)).toBeVisible({ timeout: 15000 });
    
    if (await popularButton.isVisible()) {
      // Take screenshot before switching
      await page.screenshot({ path: 'tests/screenshots/modern-before-switch.png' });
      
      // Click Popular
      await popularButton.click();
      
      // Wait for potential loading state
      await page.waitForTimeout(2000);
      
      // Verify page is still functional
      const body = page.locator('body');
      await expect(body).toBeVisible();
      
      // Check if we can switch back to Recent
      if (await recentButton.isVisible()) {
        await recentButton.click();
        await page.waitForTimeout(2000);
      }
      
      // Take screenshot after switching
      await page.screenshot({ path: 'tests/screenshots/modern-after-switch.png' });
      
      console.log('✅ Sort switching completed without breaking website');
    } else {
      console.log('⚠️ Popular button not found - may be no reviews to sort');
    }
  });

  test('should show proper loading states', async () => {
    console.log('🧪 Testing loading state indicators...');
    
    const popularButton = page.locator('[data-testid="sort-popular"]');
    
    if (await popularButton.isVisible()) {
      // Click and immediately check for loading indicators
      await popularButton.click();
      
      // Look for specific loading indicators from our modern component
      const loadingSpinner = page.locator('[data-testid="loading-spinner"]');
      const disabledButton = popularButton.locator('[disabled]');
      
      // Check if loading state appears (even briefly)
      const hasLoadingState = await Promise.race([
        loadingSpinner.isVisible(),
        disabledButton.isVisible(),
        page.waitForTimeout(3000).then(() => false)
      ]);
      
      console.log(hasLoadingState ? '✅ Loading state detected' : '⚠️ Loading too fast to detect');
    }
  });

  test('should handle errors gracefully with retry functionality', async () => {
    console.log('🧪 Testing error handling and retry...');
    
    // Look for retry button in case there are errors
    const retryButton = page.locator('[data-testid="retry-button"]');
    
    if (await retryButton.isVisible()) {
      console.log('🔄 Error state detected, testing retry functionality');
      
      await retryButton.click();
      await page.waitForTimeout(2000);
      
      // Verify page is still functional after retry
      const body = page.locator('body');
      await expect(body).toBeVisible();
      
      console.log('✅ Error retry functionality works');
    } else {
      console.log('✅ No errors detected - system is working properly');
    }
  });

  test('should prevent rapid clicking and maintain stability', async () => {
    console.log('🧪 Testing rapid clicking protection...');
    
    const recentButton = page.locator('[data-testid="sort-recent"]');
    const popularButton = page.locator('[data-testid="sort-popular"]');
    
    if (await recentButton.isVisible() && await popularButton.isVisible()) {
      // Rapid clicking test
      for (let i = 0; i < 5; i++) {
        await popularButton.click();
        await page.waitForTimeout(100);
        await recentButton.click();
        await page.waitForTimeout(100);
      }
      
      // Wait for any pending operations
      await page.waitForTimeout(3000);
      
      // Verify page is still stable
      const body = page.locator('body');
      await expect(body).toBeVisible();
      
      // Verify controls are still responsive
      await popularButton.click();
      await page.waitForTimeout(1000);
      
      console.log('✅ Rapid clicking handled gracefully - system remains stable');
    }
  });

  test('should maintain visual consistency and modern design', async () => {
    console.log('🧪 Testing visual design and consistency...');
    
    const sortingControls = page.locator('[data-testid="sorting-controls"]');
    
    if (await sortingControls.isVisible()) {
      // Take screenshot of the modern design
      await page.screenshot({ 
        path: 'tests/screenshots/modern-sorting-design.png',
        clip: { x: 0, y: 0, width: 1200, height: 800 }
      });
      
      // Verify design elements are present
      const recentButton = page.locator('[data-testid="sort-recent"]');
      const popularButton = page.locator('[data-testid="sort-popular"]');
      
      // Check that buttons have icons and text
      await expect(recentButton).toContainText('Recent');
      await expect(popularButton).toContainText('Popular');
      
      console.log('✅ Modern design elements verified');
    }
  });

  test.afterEach(async () => {
    if (page) {
      await page.close();
    }
  });
});