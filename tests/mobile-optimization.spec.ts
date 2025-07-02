import { test, expect } from '@playwright/test';

test.describe('Mobile Experience Optimization', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test('Header should have mobile hamburger menu and responsive navigation', async ({ page }) => {
    await page.goto('/merch');
    
    // Check if hamburger menu button is visible on mobile
    const hamburgerButton = page.locator('button[aria-label="Toggle mobile menu"]');
    await expect(hamburgerButton).toBeVisible();
    
    // Check if desktop navigation is hidden on mobile
    const desktopNav = page.locator('nav.hidden.md\\:flex');
    await expect(desktopNav).toBeHidden();
    
    // Click hamburger menu to open mobile navigation
    await hamburgerButton.click();
    
    // Check if mobile menu slides down
    const mobileMenu = page.locator('nav').filter({ hasText: '🔥 Trending' });
    await expect(mobileMenu).toBeVisible();
    
    // Test mobile navigation links with emojis
    await expect(page.locator('text=🔥 Trending')).toBeVisible();
    await expect(page.locator('text=🛍️ Merch')).toBeVisible();
    await expect(page.locator('text=❓ How It Works')).toBeVisible();
    
    // Test touch-friendly button heights (should be 48px minimum)
    const mobileNavButtons = page.locator('nav button.h-12');
    const buttonCount = await mobileNavButtons.count();
    expect(buttonCount).toBeGreaterThan(0);
    
    // Close mobile menu by clicking backdrop
    const backdrop = page.locator('div.fixed.inset-0.bg-black\\/20');
    await backdrop.click();
    
    // Menu should close
    await expect(mobileMenu).toBeHidden();
  });

  test('Merch page should have responsive mobile layout', async ({ page }) => {
    await page.goto('/merch');
    await page.waitForTimeout(3000); // Wait for content to load
    
    // Test hero section mobile typography
    const heroTitle = page.locator('h1');
    await expect(heroTitle).toBeVisible();
    await expect(heroTitle).toContainText('Official Natty or Juicy Store');
    
    // Test mobile countdown timer layout
    const countdownTimer = page.locator('.bg-gradient-to-r.from-destructive\\/90');
    await expect(countdownTimer).toBeVisible();
    
    // Check countdown timer containers have proper mobile spacing
    const timerBoxes = page.locator('.bg-white\\/20.backdrop-blur-sm');
    await expect(timerBoxes.first()).toBeVisible();
    
    // Test search input is touch-friendly (12 units height)
    const searchInput = page.locator('input[placeholder="Search products..."]');
    await expect(searchInput).toBeVisible();
    
    // Test that product grid is single column on mobile
    const productGrid = page.locator('.grid.grid-cols-1.md\\:grid-cols-2');
    await expect(productGrid).toBeVisible();
  });

  test('Mobile touch targets should be appropriately sized', async ({ page }) => {
    await page.goto('/merch');
    await page.waitForTimeout(3000);
    
    // Test hamburger menu button size
    const hamburgerButton = page.locator('button[aria-label="Toggle mobile menu"]');
    const hamburgerBox = await hamburgerButton.boundingBox();
    expect(hamburgerBox?.height).toBeGreaterThanOrEqual(44); // Minimum touch target
    
    // Test search input height
    const searchInput = page.locator('input[placeholder="Search products..."]');
    const searchBox = await searchInput.boundingBox();
    expect(searchBox?.height).toBeGreaterThanOrEqual(44);
  });

  test('Mobile navigation should work correctly', async ({ page }) => {
    await page.goto('/merch');
    
    // Open mobile menu
    await page.locator('button[aria-label="Toggle mobile menu"]').click();
    
    // Test navigation to Trending page
    await page.locator('text=🔥 Trending').click();
    await expect(page).toHaveURL('/');
    
    // Go back to merch and test How It Works navigation
    await page.goto('/merch');
    await page.locator('button[aria-label="Toggle mobile menu"]').click();
    await page.locator('text=❓ How It Works').click();
    await expect(page).toHaveURL('/how-it-works');
  });

  test('Mobile layout should handle different screen sizes', async ({ page }) => {
    // Test on different mobile viewport sizes
    const viewports = [
      { width: 320, height: 568 }, // iPhone SE
      { width: 375, height: 667 }, // iPhone 6/7/8
      { width: 414, height: 896 }, // iPhone XR
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/merch');
      
      // Check that hamburger menu is always visible on mobile
      const hamburgerButton = page.locator('button[aria-label="Toggle mobile menu"]');
      await expect(hamburgerButton).toBeVisible();
      
      // Check that content doesn't overflow horizontally
      const body = page.locator('body');
      const bodyBox = await body.boundingBox();
      expect(bodyBox?.width).toBeLessThanOrEqual(viewport.width + 1); // Allow for rounding
    }
  });

  test('Responsive typography should scale correctly on mobile', async ({ page }) => {
    await page.goto('/merch');
    
    // Test that mobile typography is readable but not too large
    const heroTitle = page.locator('h1');
    const titleBox = await heroTitle.boundingBox();
    
    // Hero title should not be too tall on mobile (indicating proper scaling)
    expect(titleBox?.height).toBeLessThan(150);
    
    // Text should still be readable
    expect(titleBox?.height).toBeGreaterThan(30);
  });

  test('Product cards should be mobile-optimized', async ({ page }) => {
    await page.goto('/merch');
    await page.waitForTimeout(3000);
    
    // Check that product cards exist and are properly sized for mobile
    const productCards = page.locator('.bg-card\\/95.backdrop-blur-sm');
    
    if (await productCards.count() > 0) {
      const firstCard = productCards.first();
      await expect(firstCard).toBeVisible();
      
      // Product card should not be too wide on mobile
      const cardBox = await firstCard.boundingBox();
      expect(cardBox?.width).toBeLessThan(375); // Should fit on mobile screen
    }
  });
}); 