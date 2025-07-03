import { test, expect } from '@playwright/test';

test.describe('Merch Store Mobile UX', () => {
  test.use({
    viewport: { width: 390, height: 844 }, // iPhone 12
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
  });

  test('should have no horizontal scroll and all elements accessible', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/merch');
    await page.waitForTimeout(6000); // Wait for Shopify components

    // Check for horizontal scroll
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBeFalsy();

    // Check search box is visible and usable
    const searchBox = page.locator('input[type="search"]');
    await expect(searchBox).toBeVisible();
    await searchBox.fill('lightning');
    await page.waitForTimeout(500);

    // Tap first product card
    const productCard = page.locator('[class*="bg-card"][class*="backdrop-blur-sm"]');
    await expect(productCard.first()).toBeVisible();
    await productCard.first().click();

    // Tap Buy Now button
    const buyNowBtn = page.locator('button', { hasText: 'Buy Now' });
    await expect(buyNowBtn.first()).toBeVisible();
    await buyNowBtn.first().click();

    // Check for visible errors
    const errorBanner = page.locator('#shopify-error');
    await expect(errorBanner).toBeHidden();

    // Wait for merch container to be visible
    const merchContainer = page.locator('[data-testid="merch-container"]');
    try {
      await expect(merchContainer).toBeVisible({ timeout: 20000 });
    } catch (e) {
      // Dump page HTML and console errors for debugging
      const html = await page.content();
      console.log('PAGE HTML:', html);
      console.log('CONSOLE ERRORS:', consoleErrors);
      throw e;
    }
    // Check for overflow on merch container only
    const containerOverflow = await merchContainer.evaluate((el) => {
      return el.scrollWidth > el.clientWidth;
    });
    expect(containerOverflow).toBeFalsy();
  });
}); 