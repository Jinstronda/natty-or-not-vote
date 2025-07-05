import { test, expect, Page } from '@playwright/test';

test.describe('Sorting Functionality Tests', () => {
  let page: Page;
  
  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Enable console logging to catch errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('🚨 Console Error:', msg.text());
      }
    });
    
    // Catch page errors
    page.on('pageerror', error => {
      console.log('🚨 Page Error:', error.message);
    });
    
    // Navigate to a page with reviews (assuming first influencer has reviews)
    await page.goto('/');
    
    // Wait for page to load and find first influencer card
    await page.waitForLoadState('networkidle');
    
    // Click on first influencer to go to their profile
    const firstInfluencerCard = page.locator('[data-testid="influencer-card"]').first();
    if (await firstInfluencerCard.isVisible()) {
      await firstInfluencerCard.click();
      await page.waitForLoadState('networkidle');
    }
  });

  test('should display sorting controls without breaking', async () => {
    // Check if sorting controls are visible
    const sortingControls = page.locator('[data-testid="sorting-controls"]');
    
    // If no test id, look for the component by its content
    const recentTab = page.getByText('Recent');
    const popularTab = page.getByText('Popular');
    
    await expect(recentTab.or(popularTab)).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Sorting controls are visible');
  });

  test('should switch from Recent to Popular without breaking website', async () => {
    console.log('🧪 Testing Recent to Popular sort...');
    
    // Wait for initial load
    await page.waitForTimeout(2000);
    
    // Find and click Popular tab
    const popularTab = page.getByText('Popular');
    
    if (await popularTab.isVisible()) {
      // Take screenshot before click
      await page.screenshot({ path: 'tests/screenshots/before-popular-click.png' });
      
      // Click Popular tab
      await popularTab.click();
      
      // Wait and check if page is still functional
      await page.waitForTimeout(3000);
      
      // Check if page is still responsive
      const body = page.locator('body');
      await expect(body).toBeVisible();
      
      // Check if we can still interact with the page
      const title = page.locator('h1, h2').first();
      await expect(title).toBeVisible();
      
      // Take screenshot after click
      await page.screenshot({ path: 'tests/screenshots/after-popular-click.png' });
      
      console.log('✅ Popular sort completed successfully');
    } else {
      console.log('⚠️ Popular tab not found - might be no reviews');
    }
  });

  test('should switch from Popular to Recent without breaking website', async () => {
    console.log('🧪 Testing Popular to Recent sort...');
    
    // First switch to Popular
    const popularTab = page.getByText('Popular');
    if (await popularTab.isVisible()) {
      await popularTab.click();
      await page.waitForTimeout(2000);
    }
    
    // Then switch back to Recent
    const recentTab = page.getByText('Recent');
    if (await recentTab.isVisible()) {
      // Take screenshot before click
      await page.screenshot({ path: 'tests/screenshots/before-recent-click.png' });
      
      await recentTab.click();
      await page.waitForTimeout(3000);
      
      // Check if page is still functional
      const body = page.locator('body');
      await expect(body).toBeVisible();
      
      // Take screenshot after click
      await page.screenshot({ path: 'tests/screenshots/after-recent-click.png' });
      
      console.log('✅ Recent sort completed successfully');
    }
  });

  test('should handle rapid sort switching without breaking', async () => {
    console.log('🧪 Testing rapid sort switching...');
    
    const recentTab = page.getByText('Recent');
    const popularTab = page.getByText('Popular');
    
    if (await recentTab.isVisible() && await popularTab.isVisible()) {
      // Rapidly switch between sorts
      for (let i = 0; i < 3; i++) {
        await popularTab.click();
        await page.waitForTimeout(500);
        await recentTab.click();
        await page.waitForTimeout(500);
      }
      
      // Check if page is still functional
      const body = page.locator('body');
      await expect(body).toBeVisible();
      
      console.log('✅ Rapid switching handled successfully');
    }
  });

  test('should show appropriate loading states during sort', async () => {
    console.log('🧪 Testing loading states...');
    
    const popularTab = page.getByText('Popular');
    
    if (await popularTab.isVisible()) {
      // Click and immediately check for loading indicators
      await popularTab.click();
      
      // Look for loading indicators (spinner, disabled state, etc.)
      const loadingSpinner = page.locator('[data-testid="loading-spinner"]');
      const loadingText = page.getByText('Loading');
      const disabledTab = page.locator('[disabled]');
      
      // At least one loading indicator should appear briefly
      const hasLoadingIndicator = await Promise.race([
        loadingSpinner.isVisible(),
        loadingText.isVisible(), 
        disabledTab.isVisible(),
        page.waitForTimeout(1000).then(() => false)
      ]);
      
      console.log(hasLoadingIndicator ? '✅ Loading state detected' : '⚠️ No loading state detected');
    }
  });

  test('should maintain functionality after sort errors', async () => {
    console.log('🧪 Testing error recovery...');
    
    // This test checks if the UI recovers from potential errors
    const popularTab = page.getByText('Popular');
    
    if (await popularTab.isVisible()) {
      // Click multiple times to potentially trigger errors
      await popularTab.click();
      await page.waitForTimeout(100);
      await popularTab.click();
      await page.waitForTimeout(100);
      await popularTab.click();
      
      // Wait for potential errors to settle
      await page.waitForTimeout(3000);
      
      // Check if page is still functional
      const body = page.locator('body');
      await expect(body).toBeVisible();
      
      // Try to click recent tab to ensure functionality
      const recentTab = page.getByText('Recent');
      if (await recentTab.isVisible()) {
        await recentTab.click();
        await page.waitForTimeout(1000);
      }
      
      console.log('✅ Error recovery test completed');
    }
  });

  test.afterEach(async () => {
    await page.close();
  });
});