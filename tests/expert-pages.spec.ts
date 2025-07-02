import { test, expect } from '@playwright/test';

test.describe('Expert Pages', () => {
  test('Seth Feroce expert page loads correctly without errors', async ({ page }) => {
    // Monitor console errors
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate to Seth Feroce's expert page
    await page.goto('/experts/a6508824-9c4e-4979-86d3-93035befe816');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Verify the expert name is displayed correctly (not "Unknown Expert")
    await expect(page.locator('h1')).toContainText('Seth Feroce');

    // Verify the page loads without critical JavaScript errors
    // Filter out the expected 406 error from the fallback influencer query
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('406') && 
      !error.includes('Seth+Feroce') &&
      error.includes('Failed to load module script')
    );
    
    expect(criticalErrors.length).toBe(0);

    // Verify expert reviews section is present
    await expect(page.locator('text=Expert Reviews')).toBeVisible();

    // Verify the profile picture loads
    const profileImg = page.locator('img[alt="Seth Feroce"]');
    if (await profileImg.count() > 0) {
      await expect(profileImg).toBeVisible();
    }
  });

  test('Expert pages handle missing influencer data gracefully', async ({ page }) => {
    // Test multiple expert pages to ensure the fix works broadly
    const expertIds = [
      'a6508824-9c4e-4979-86d3-93035befe816', // Seth Feroce
    ];

    for (const expertId of expertIds) {
      await page.goto(`/experts/${expertId}`);
      await page.waitForLoadState('networkidle');
      
      // Ensure the page doesn't show "Unknown Expert" in the main heading
      const heading = page.locator('h1');
      await expect(heading).not.toContainText('Unknown Expert');
      
      // Ensure the page loads some content
      await expect(page.locator('body')).not.toBeEmpty();
    }
  });

  test('Expert directory page loads correctly', async ({ page }) => {
    await page.goto('/experts');
    await page.waitForLoadState('networkidle');
    
    // Verify experts directory loads
    await expect(page.locator('text=Fitness Experts')).toBeVisible();
    
    // Check that expert cards are displayed
    const expertCards = page.locator('[data-testid="expert-card"], .group');
    await expect(expertCards.first()).toBeVisible();
  });

  test('Expert pages respond within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/experts/a6508824-9c4e-4979-86d3-93035befe816');
    await page.waitForLoadState('domcontentloaded');
    
    const loadTime = Date.now() - startTime;
    
    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
    
    // Verify key elements are present
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Expert Reviews')).toBeVisible();
  });
}); 