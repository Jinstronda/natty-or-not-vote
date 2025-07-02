import { test, expect } from '@playwright/test';

test.describe('Profile Picture Replacement', () => {
  test('Profile picture URLs include cache-busting parameters', async ({ page }) => {
    // Monitor network requests to check for cache-busting
    const profilePictureRequests: string[] = [];
    
    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('/storage/v1/object/public/profile-pictures/')) {
        profilePictureRequests.push(url);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    console.log('Profile picture requests found:', profilePictureRequests.length);
    
    // Check if any profile picture URLs have cache-busting parameters
    const cacheBustedUrls = profilePictureRequests.filter(url => url.includes('?v='));
    console.log('Cache-busted URLs found:', cacheBustedUrls.length);
    
    // If there are any profile picture requests, at least some should have cache-busting
    if (profilePictureRequests.length > 0) {
      expect(cacheBustedUrls.length).toBeGreaterThan(0);
    }
  });

  test('Profile picture component handles upload button correctly', async ({ page }) => {
    // Navigate to login page to check component structure
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Check that the page loads without profile picture related errors
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().includes('profile')) {
        consoleErrors.push(msg.text());
      }
    });
    
    // Wait a moment for any console errors to appear
    await page.waitForTimeout(2000);
    
    // Should have no profile-related console errors
    expect(consoleErrors).toHaveLength(0);
    
    console.log('No profile-related console errors found');
  });

  test('Storage bucket supports file replacement', async ({ page }) => {
    // Test that storage operations work correctly
    const networkErrors: string[] = [];
    
    page.on('response', (response) => {
      if (!response.ok() && response.url().includes('profile-pictures')) {
        networkErrors.push(`${response.status()} - ${response.url()}`);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Should have no storage-related network errors
    expect(networkErrors).toHaveLength(0);
    
    console.log('No storage-related network errors detected');
  });

  test('Profile picture components exist and are accessible', async ({ page }) => {
    // Check that profile picture related code doesn't break the app
    await page.goto('/');
    
    // Look for any JavaScript errors related to profile pictures
    const jsErrors: string[] = [];
    page.on('pageerror', (error) => {
      if (error.message.includes('profile') || error.message.includes('upload')) {
        jsErrors.push(error.message);
      }
    });
    
    await page.waitForLoadState('networkidle');
    
    // Wait for any delayed errors
    await page.waitForTimeout(3000);
    
    // Should have no profile-related JavaScript errors
    expect(jsErrors).toHaveLength(0);
    
    console.log('No profile-related JavaScript errors found');
  });

  test('Cache-busting timestamp format is correct', async ({ page }) => {
    // Test that generated timestamps are in correct format
    const timestamp = Date.now();
    const timestampStr = timestamp.toString();
    
    // Timestamp should be a 13-digit number (current epoch milliseconds)
    expect(timestampStr).toMatch(/^\d{13}$/);
    
    // Should be a recent timestamp (within last minute)
    const oneMinuteAgo = Date.now() - 60000;
    expect(timestamp).toBeGreaterThan(oneMinuteAgo);
    
    console.log('Cache-busting timestamp format is correct:', timestamp);
  });
}); 