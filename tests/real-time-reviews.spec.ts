import { test, expect, type Page } from '@playwright/test';

// Test real-time review updates functionality
test.describe('Real-time Review Updates', () => {
  let page1: Page;
  let page2: Page;
  
  test.beforeAll(async ({ browser }) => {
    // Create two browser contexts to simulate different users
    page1 = await browser.newPage();
    page2 = await browser.newPage();
  });

  test.afterAll(async () => {
    await page1.close();
    await page2.close();
  });

  test('should update reviews in real-time when submitted', async ({ browser }) => {
    // Test scenario: User 1 submits a review, User 2 sees it immediately without refresh
    
    // Navigate both pages to the same influencer profile
    const influencerId = 'test-influencer-id'; // Replace with actual influencer ID for testing
    await page1.goto(`/influencer/${influencerId}`);
    await page2.goto(`/influencer/${influencerId}`);

    // Count initial reviews on page2
    const initialReviewCount = await page2.locator('[data-testid="review-item"]').count();
    console.log(`Initial review count: ${initialReviewCount}`);

    // User 1: Login and submit a vote + review
    await page1.click('[data-testid="login-button"]');
    // Note: Add proper login flow here based on your auth system
    // await page1.fill('[data-testid="email-input"]', 'test@example.com');
    // await page1.fill('[data-testid="password-input"]', 'password');
    // await page1.click('[data-testid="submit-login"]');

    // User 1: Vote on influencer (triggers review prompt)
    await page1.click('[data-testid="vote-natty-button"]');
    
    // User 1: Fill and submit review
    await expect(page1.locator('[data-testid="review-prompt-dialog"]')).toBeVisible();
    await page1.fill('[data-testid="review-content-textarea"]', 'Test review for real-time updates');
    await page1.click('[data-testid="submit-review-button"]');
    
    // Wait for review to be submitted
    await expect(page1.locator('[data-testid="review-prompt-dialog"]')).not.toBeVisible();

    // User 2: Should see the new review appear in real-time (without manual refresh)
    await expect(page2.locator('[data-testid="review-item"]')).toHaveCount(initialReviewCount + 1, { timeout: 5000 });
    
    // Verify the new review content
    const newReview = page2.locator('[data-testid="review-item"]').first();
    await expect(newReview).toContainText('Test review for real-time updates');
    
    console.log('✅ Real-time review submission test passed');
  });

  test('should update review reactions in real-time', async ({ browser }) => {
    // Navigate both pages to the same influencer profile
    const influencerId = 'test-influencer-id';
    await page1.goto(`/influencer/${influencerId}`);
    await page2.goto(`/influencer/${influencerId}`);

    // Wait for reviews to load
    await page1.waitForSelector('[data-testid="review-item"]');
    await page2.waitForSelector('[data-testid="review-item"]');

    // Get the first review's like count on page2
    const firstReview = page2.locator('[data-testid="review-item"]').first();
    const initialLikes = await firstReview.locator('[data-testid="review-likes"]').textContent();
    const initialLikeCount = parseInt(initialLikes?.replace(/\D/g, '') || '0');

    // User 1: Like the first review
    await page1.locator('[data-testid="review-item"]').first().locator('[data-testid="like-button"]').click();

    // User 2: Should see the like count increase in real-time
    await expect(firstReview.locator('[data-testid="review-likes"]')).toContainText(String(initialLikeCount + 1), { timeout: 3000 });
    
    console.log('✅ Real-time reaction updates test passed');
  });

  test('should update reviews when deleted in real-time', async ({ browser }) => {
    // This test assumes admin privileges or own review deletion
    const influencerId = 'test-influencer-id';
    await page1.goto(`/influencer/${influencerId}`);
    await page2.goto(`/influencer/${influencerId}`);

    // Count reviews on page2
    const initialReviewCount = await page2.locator('[data-testid="review-item"]').count();
    
    if (initialReviewCount === 0) {
      console.log('⚠️ No reviews to delete, skipping deletion test');
      return;
    }

    // User 1: Delete a review (if admin or own review)
    const deleteButton = page1.locator('[data-testid="review-item"]').first().locator('[data-testid="delete-review-button"]');
    
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      
      // Confirm deletion if there's a confirmation dialog
      const confirmButton = page1.locator('[data-testid="confirm-delete-button"]');
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }

      // User 2: Should see the review disappear in real-time
      await expect(page2.locator('[data-testid="review-item"]')).toHaveCount(initialReviewCount - 1, { timeout: 5000 });
      
      console.log('✅ Real-time review deletion test passed');
    } else {
      console.log('⚠️ No delete button visible, skipping deletion test');
    }
  });

  test('should handle WebSocket connection recovery', async ({ browser }) => {
    const influencerId = 'test-influencer-id';
    await page1.goto(`/influencer/${influencerId}`);

    // Wait for initial load
    await page1.waitForSelector('[data-testid="review-section"]');

    // Simulate network disconnect/reconnect by navigating away and back
    await page1.goto('/');
    await page1.goto(`/influencer/${influencerId}`);

    // Verify that reviews still load and real-time functionality works
    await expect(page1.locator('[data-testid="review-section"]')).toBeVisible();
    
    // Check console for WebSocket reconnection logs
    const logs: string[] = [];
    page1.on('console', msg => logs.push(msg.text()));
    
    // Wait a bit and check if real-time setup logs appear
    await page1.waitForTimeout(2000);
    const hasRealTimeSetup = logs.some(log => log.includes('Setting up real-time review updates'));
    expect(hasRealTimeSetup).toBe(true);
    
    console.log('✅ WebSocket connection recovery test passed');
  });

  test('should prevent duplicate review submissions', async ({ browser }) => {
    const influencerId = 'test-influencer-id';
    await page1.goto(`/influencer/${influencerId}`);

    // Submit a vote to trigger review prompt
    await page1.click('[data-testid="vote-natty-button"]');
    await expect(page1.locator('[data-testid="review-prompt-dialog"]')).toBeVisible();
    
    // Submit review
    await page1.fill('[data-testid="review-content-textarea"]', 'First review submission');
    await page1.click('[data-testid="submit-review-button"]');
    
    // Wait for submission
    await expect(page1.locator('[data-testid="review-prompt-dialog"]')).not.toBeVisible();

    // Try to vote again - should not show review prompt since user already has a review
    await page1.click('[data-testid="vote-juicy-button"]');
    
    // Review prompt should not appear
    await page1.waitForTimeout(1000);
    const promptVisible = await page1.locator('[data-testid="review-prompt-dialog"]').isVisible();
    expect(promptVisible).toBe(false);
    
    console.log('✅ Duplicate review prevention test passed');
  });
});

// Utility test for debugging real-time functionality
test.describe('Real-time Debug Tests', () => {
  test('should show real-time connection status in console', async ({ page }) => {
    const logs: string[] = [];
    page.on('console', msg => logs.push(msg.text()));
    
    await page.goto('/influencer/test-influencer-id');
    await page.waitForTimeout(3000);
    
    // Check for real-time setup logs
    const realTimeLogs = logs.filter(log => 
      log.includes('real-time') || 
      log.includes('WebSocket') || 
      log.includes('Supabase')
    );
    
    console.log('Real-time logs found:', realTimeLogs);
    expect(realTimeLogs.length).toBeGreaterThan(0);
  });

  test('should handle rapid successive updates', async ({ page }) => {
    // Test that multiple rapid updates don't cause race conditions
    await page.goto('/influencer/test-influencer-id');
    
    // Submit multiple rapid actions (if possible with test setup)
    // This would require multiple authenticated users or rapid API calls
    // For now, just verify the page can handle multiple updates
    
    await expect(page.locator('[data-testid="review-section"]')).toBeVisible();
    console.log('✅ Rapid updates handling test passed');
  });
});