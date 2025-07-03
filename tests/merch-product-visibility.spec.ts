import { test, expect } from '@playwright/test';

test.describe('Merch Store Product Visibility', () => {
  test('should display at least one product card', async ({ page }) => {
    await page.goto('/merch');
    // Wait for Shopify web components to load
    await page.waitForTimeout(6000);
    // Use a more robust selector for the product card
    const productCard = page.locator('[class*="bg-card"][class*="backdrop-blur-sm"]');
    await expect(productCard.first()).toBeVisible();
  });
}); 