import { test, expect } from '@playwright/test';

test.describe('Reply system E2E', () => {
  const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:8080';

  test('posting a reply appears instantly and count updates', async ({ page }) => {
    // Go to home
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    // Navigate to Mike Mentzer (adjust selector if needed)
    const mentorLink = page.getByRole('link', { name: /mike mentzer/i }).first();
    await expect(mentorLink).toBeVisible();
    await mentorLink.click();

    // Wait for reviews list
    await page.waitForSelector('[data-testid="expand-replies-button"]');

    // Find first review with replies button
    const expandBtn = page.locator('[data-testid="expand-replies-button"]').first();
    const initialText = await expandBtn.textContent();
    const match = initialText?.match(/(\d+)/);
    const initialCount = match ? parseInt(match[1]) : 0;

    await expandBtn.click();

    // Count visible replies
    const replyItems = page.locator('[data-testid*="reply-item"], .reply-item, .reply');
    const beforeCount = await replyItems.count();

    // Click Reply button
    const replyBtn = page.getByRole('button', { name: /^reply$/i }).first();
    await replyBtn.click();

    const textarea = page.locator('textarea').first();
    const newText = `E2E test reply ${Date.now()}`;
    await textarea.fill(newText);

    const submitBtn = page.getByRole('button', { name: /^reply$/i }).first();
    await submitBtn.click();

    // Wait for new reply to appear
    await expect(page.getByText(newText)).toBeVisible({ timeout: 3000 });

    // Count again
    const afterCount = await replyItems.count();
    expect(afterCount).toBeGreaterThan(beforeCount);

    // Expand button count should increment by 1 (optimistic may lag; allow >=)
    const updatedText = await expandBtn.textContent();
    const updatedMatch = updatedText?.match(/(\d+)/);
    const updatedCount = updatedMatch ? parseInt(updatedMatch[1]) : initialCount;
    expect(updatedCount).toBeGreaterThan(initialCount);
  });
}); 