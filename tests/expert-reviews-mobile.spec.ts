import { test, expect } from '@playwright/test';

test.describe('Mobile Expert Reviews Carousel', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

  test('expert reviews carousel displays and navigates correctly', async ({ page }) => {
    // Navigate to an influencer page with expert reviews
    await page.goto('/influencer/550e8400-e29b-41d4-a716-446655440002'); // David Laid
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Scroll to expert reviews section
    const expertReviewsSection = page.locator('h3:has-text("Expert Reviews")');
    await expertReviewsSection.scrollIntoViewIfNeeded();

    // Verify carousel is present
    const carousel = page.locator('[aria-label="Expert reviews carousel"]');
    await expect(carousel).toBeVisible();

    // Verify initial state shows "1 of 3"
    await expect(page.locator('text=1 of 3')).toBeVisible();

    // Verify swipe instruction is visible
    await expect(page.locator('text=Swipe to navigate')).toBeVisible();

    // Verify navigation buttons are visible
    const prevButton = page.locator('button[aria-label="Previous expert review"]');
    const nextButton = page.locator('button[aria-label="Next expert review"]');
    await expect(prevButton).toBeVisible();
    await expect(nextButton).toBeVisible();

    // Test navigation to second review
    await nextButton.click();
    await page.waitForTimeout(400); // Wait for animation

    // Verify it shows "2 of 3"
    await expect(page.locator('text=2 of 3')).toBeVisible();

    // Verify expert review content is visible (not cut off)
    const reviewContent = carousel.locator('.text-white.drop-shadow');
    const isContentVisible = await reviewContent.isVisible();
    expect(isContentVisible).toBeTruthy();

    // Test navigation to third review
    await nextButton.click();
    await page.waitForTimeout(400);

    // Verify it shows "3 of 3"
    await expect(page.locator('text=3 of 3')).toBeVisible();

    // Test navigation back to first review
    await nextButton.click();
    await page.waitForTimeout(400);
    await expect(page.locator('text=1 of 3')).toBeVisible();

    // Test dot navigation
    const dots = page.locator('button[aria-label*="Go to expert review"]');
    await expect(dots).toHaveCount(3);
    
    // Click second dot
    await dots.nth(1).click();
    await page.waitForTimeout(400);
    await expect(page.locator('text=2 of 3')).toBeVisible();
  });

  test('expert reviews do not show invalid "Read Full Review" links', async ({ page }) => {
    await page.goto('/influencer/550e8400-e29b-41d4-a716-446655440002');
    await page.waitForLoadState('networkidle');

    const expertReviewsSection = page.locator('h3:has-text("Expert Reviews")');
    await expertReviewsSection.scrollIntoViewIfNeeded();

    // Check that no malformed links are present
    const readFullReviewLinks = page.locator('a:has-text("Read Full Review")');
    const count = await readFullReviewLinks.count();
    
    for (let i = 0; i < count; i++) {
      const href = await readFullReviewLinks.nth(i).getAttribute('href');
      // Verify href is a valid URL or null
      if (href) {
        expect(href).toMatch(/^https?:\/\//);
      }
    }
  });

  test('expert reviews carousel handles swipe gestures', async ({ page }) => {
    await page.goto('/influencer/550e8400-e29b-41d4-a716-446655440002');
    await page.waitForLoadState('networkidle');

    const expertReviewsSection = page.locator('h3:has-text("Expert Reviews")');
    await expertReviewsSection.scrollIntoViewIfNeeded();

    const carousel = page.locator('[aria-label="Expert reviews carousel"]');
    
    // Simulate swipe left
    await carousel.dispatchEvent('touchstart', { touches: [{ clientX: 300, clientY: 300 }] });
    await carousel.dispatchEvent('touchmove', { touches: [{ clientX: 100, clientY: 300 }] });
    await carousel.dispatchEvent('touchend', { changedTouches: [{ clientX: 100, clientY: 300 }] });
    
    await page.waitForTimeout(400);
    
    // Should move to next review
    await expect(page.locator('text=2 of 3')).toBeVisible();
  });

  test('expert reviews carousel is responsive', async ({ page }) => {
    await page.goto('/influencer/550e8400-e29b-41d4-a716-446655440002');
    await page.waitForLoadState('networkidle');

    const expertReviewsSection = page.locator('h3:has-text("Expert Reviews")');
    await expertReviewsSection.scrollIntoViewIfNeeded();

    const carousel = page.locator('[aria-label="Expert reviews carousel"]');
    
    // Check minimum height is applied
    const height = await carousel.evaluate(el => el.offsetHeight);
    expect(height).toBeGreaterThanOrEqual(400);

    // Verify content doesn't overflow horizontally
    const width = await carousel.evaluate(el => el.scrollWidth);
    const clientWidth = await carousel.evaluate(el => el.clientWidth);
    expect(width).toBeLessThanOrEqual(clientWidth + 1); // +1 for rounding
  });
}); 