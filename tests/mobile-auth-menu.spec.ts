import { test, expect } from '@playwright/test';

test.describe('Mobile Auth Menu Buttons', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone 8 size
    await page.goto('/');
  });

  test('Sign In and Sign Up buttons are clickable in mobile menu', async ({ page }) => {
    // Open mobile menu
    const menuButton = page.locator('button[aria-label="Open navigation menu"]');
    await expect(menuButton).toBeVisible();
    await menuButton.click();

    // Wait for the mobile menu to be visible
    const mobileMenu = page.locator('#mobile-navigation');
    await expect(mobileMenu).toBeVisible();

    // Click Sign In
    const loginBtn = page.locator('[data-testid="mobile-login-btn"]');
    await expect(loginBtn).toBeVisible();
    await loginBtn.click();
    await expect(page).toHaveURL(/\/login/);

    // Go back to home and open menu again
    await page.goto('/');
    await menuButton.click();
    await expect(mobileMenu).toBeVisible();

    // Click Sign Up
    const signupBtn = page.locator('[data-testid="mobile-signup-btn"]');
    await expect(signupBtn).toBeVisible();
    await signupBtn.click();
    await expect(page).toHaveURL(/\/signup/);
  });
}); 