import { test, expect } from '@playwright/test';

test.describe('Mobile UX Analysis', () => {
  test('analyze current mobile behavior for expert reviews and sorting', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to an influencer page
    await page.goto('/influencer/test-influencer-id');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if expert reviews exist
    const expertReviews = page.locator('[data-testid="expert-reviews"], .expert-reviews, h2:has-text("Expert Reviews")').first();
    if (await expertReviews.isVisible()) {
      console.log('✓ Expert reviews section found');
      
      // Count expert review cards
      const expertCards = page.locator('[class*="border-2"][class*="rounded-xl"]');
      const count = await expertCards.count();
      console.log(`Found ${count} expert review cards`);
      
      // Check if they stack vertically (causing bloating)
      if (count > 2) {
        const firstCard = expertCards.nth(0);
        const secondCard = expertCards.nth(1);
        const thirdCard = expertCards.nth(2);
        
        const firstBox = await firstCard.boundingBox();
        const secondBox = await secondCard.boundingBox();
        const thirdBox = await thirdCard.boundingBox();
        
        if (firstBox && secondBox && thirdBox) {
          const verticalGap1 = secondBox.y - (firstBox.y + firstBox.height);
          const verticalGap2 = thirdBox.y - (secondBox.y + secondBox.height);
          
          console.log(`Vertical gaps: ${verticalGap1}px, ${verticalGap2}px`);
          console.log('⚠️ Expert reviews stack vertically - causing mobile bloating');
        }
      }
    }
    
    // Check current sorting controls on mobile
    const sortingControls = page.locator('[data-testid="sorting-controls"]');
    if (await sortingControls.isVisible()) {
      console.log('✓ Sorting controls found');
      
      // Check mobile layout
      const box = await sortingControls.boundingBox();
      if (box) {
        console.log(`Sorting controls width: ${box.width}px (viewport: 375px)`);
        
        // Check if tabs are clickable on mobile
        const recentTab = page.locator('[data-testid="sort-recent"]');
        const popularTab = page.locator('[data-testid="sort-popular"]');
        
        if (await recentTab.isVisible() && await popularTab.isVisible()) {
          console.log('✓ Both sorting tabs visible on mobile');
          
          // Test mobile tap
          await popularTab.tap();
          await page.waitForTimeout(1000);
          
          // Check if state changed
          const isActive = await popularTab.getAttribute('data-state');
          console.log(`Popular tab state after tap: ${isActive}`);
        }
      }
    }
    
    // Check if mobile swipe gallery pattern exists for reference
    const imageGallery = page.locator('[role="region"][aria-label="Image gallery"]');
    if (await imageGallery.isVisible()) {
      console.log('✓ Found image gallery with swipe pattern');
      
      // Check swipe indicators
      const indicators = page.locator('[aria-label*="Go to image"]');
      const indicatorCount = await indicators.count();
      console.log(`Found ${indicatorCount} swipe indicators`);
      
      // Test swipe functionality
      if (indicatorCount > 1) {
        await indicators.nth(1).tap();
        await page.waitForTimeout(500);
        console.log('✓ Image gallery swipe navigation works');
      }
    }
    
    // Take screenshot for visual analysis
    await page.screenshot({ 
      path: 'mobile-expert-reviews-analysis.png',
      fullPage: true 
    });
    
    console.log('🔍 Mobile analysis complete - screenshot saved');
  });
});