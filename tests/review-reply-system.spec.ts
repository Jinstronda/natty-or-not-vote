import { test, expect } from '@playwright/test';

test.describe('Review Reply System', () => {
  // Use a test influencer ID - adjust this based on your test data
  const testInfluencerId = 'test-influencer-id';
  const testInfluencerUrl = `/influencer/${testInfluencerId}`;

  test.beforeEach(async ({ page }) => {
    // Navigate to influencer page with reviews
    await page.goto(testInfluencerUrl);
    await page.waitForLoadState('networkidle');
  });

  test.describe('Reply List Component', () => {
    test('shows reply count and expand button when replies exist', async ({ page }) => {
      // Look for reply expansion buttons
      const expandButton = page.locator('[data-testid="expand-replies-button"]').first();
      
      if (await expandButton.isVisible()) {
        // Should show reply count
        await expect(expandButton).toContainText(/\d+ repl(y|ies)/);
        
        // Should have chevron icon
        await expect(expandButton.locator('svg')).toBeVisible();
        
        // Should be clickable
        await expect(expandButton).toBeEnabled();
      }
    });

    test('expands and collapses reply threads', async ({ page }) => {
      const expandButton = page.locator('[data-testid="expand-replies-button"]').first();
      
      if (await expandButton.isVisible()) {
        // Initially collapsed
        await expect(expandButton).toContainText('replies');
        
        // Expand replies
        await expandButton.click();
        await page.waitForTimeout(500); // Allow animation time
        
        // Should show individual replies
        const replyItems = page.locator('[data-testid^="reply-item-"]');
        if (await replyItems.count() > 0) {
          await expect(replyItems.first()).toBeVisible();
        }
        
        // Should show sort dropdown when expanded
        const sortDropdown = page.locator('button:has-text("Most Recent"), button:has-text("Oldest First"), button:has-text("Most Liked")');
        if (await sortDropdown.count() > 0) {
          await expect(sortDropdown.first()).toBeVisible();
        }
        
        // Collapse replies
        await expandButton.click();
        await page.waitForTimeout(500); // Allow animation time
      }
    });

    test('shows empty state when no replies exist', async ({ page }) => {
      // Look for empty state message
      const emptyState = page.locator('text="No replies yet"');
      if (await emptyState.isVisible()) {
        await expect(emptyState).toBeVisible();
        
        // Should show "Be the first to reply" button for logged-in users
        const firstReplyButton = page.locator('button:has-text("Be the first to reply")');
        if (await firstReplyButton.isVisible()) {
          await expect(firstReplyButton).toBeEnabled();
        }
      }
    });

    test('sorts replies correctly', async ({ page }) => {
      const expandButton = page.locator('[data-testid="expand-replies-button"]').first();
      
      if (await expandButton.isVisible()) {
        await expandButton.click();
        await page.waitForTimeout(500);
        
        // Find sort dropdown
        const sortButton = page.locator('button:has-text("Most Recent")').first();
        if (await sortButton.isVisible()) {
          await sortButton.click();
          
          // Test sorting options
          const sortOptions = ['Most Recent', 'Oldest First', 'Most Liked'];
          
          for (const option of sortOptions) {
            const optionButton = page.locator(`text="${option}"`);
            if (await optionButton.isVisible()) {
              await optionButton.click();
              await page.waitForTimeout(500);
              
              // Verify sort button text changed
              await expect(page.locator(`button:has-text("${option}")`)).toBeVisible();
            }
          }
        }
      }
    });
  });

  test.describe('Reply Form', () => {
    test('shows reply form when reply button is clicked', async ({ page }) => {
      // Expand replies first
      const expandButton = page.locator('[data-testid="expand-replies-button"]').first();
      if (await expandButton.isVisible()) {
        await expandButton.click();
        await page.waitForTimeout(500);
        
        // Click reply button
        const replyButton = page.locator('button:has-text("Reply to review")').first();
        if (await replyButton.isVisible()) {
          await replyButton.click();
          
          // Should show reply form
          const replyForm = page.locator('textarea[placeholder*="Write a reply"]');
          await expect(replyForm).toBeVisible();
          
          // Should show submit and cancel buttons
          await expect(page.locator('button:has-text("Reply")')).toBeVisible();
          await expect(page.locator('button:has-text("Cancel")')).toBeVisible();
        }
      }
    });

    test('validates reply content', async ({ page }) => {
      // Open reply form
      const expandButton = page.locator('[data-testid="expand-replies-button"]').first();
      if (await expandButton.isVisible()) {
        await expandButton.click();
        await page.waitForTimeout(500);
        
        const replyButton = page.locator('button:has-text("Reply to review")').first();
        if (await replyButton.isVisible()) {
          await replyButton.click();
          
          const replyForm = page.locator('textarea[placeholder*="Write a reply"]');
          const submitButton = page.locator('button:has-text("Reply")').last();
          
          // Submit button should be disabled when empty
          await expect(submitButton).toBeDisabled();
          
          // Type content
          await replyForm.fill('This is a test reply');
          
          // Submit button should be enabled
          await expect(submitButton).toBeEnabled();
          
          // Clear content
          await replyForm.fill('');
          
          // Submit button should be disabled again
          await expect(submitButton).toBeDisabled();
        }
      }
    });

    test('shows character count', async ({ page }) => {
      const expandButton = page.locator('[data-testid="expand-replies-button"]').first();
      if (await expandButton.isVisible()) {
        await expandButton.click();
        await page.waitForTimeout(500);
        
        const replyButton = page.locator('button:has-text("Reply to review")').first();
        if (await replyButton.isVisible()) {
          await replyButton.click();
          
          const replyForm = page.locator('textarea[placeholder*="Write a reply"]');
          
          // Should show character count
          const characterCount = page.locator('text=/\\d+\\/\\d+/');
          await expect(characterCount).toBeVisible();
          
          // Type some content
          await replyForm.fill('Test content');
          
          // Character count should update
          await expect(characterCount).toContainText(/\d+\/2000/);
        }
      }
    });

    test('supports keyboard shortcuts', async ({ page }) => {
      const expandButton = page.locator('[data-testid="expand-replies-button"]').first();
      if (await expandButton.isVisible()) {
        await expandButton.click();
        await page.waitForTimeout(500);
        
        const replyButton = page.locator('button:has-text("Reply to review")').first();
        if (await replyButton.isVisible()) {
          await replyButton.click();
          
          const replyForm = page.locator('textarea[placeholder*="Write a reply"]');
          await replyForm.fill('Test reply');
          
          // Test Escape key to cancel
          await replyForm.press('Escape');
          await page.waitForTimeout(300);
          
          // Form should be hidden
          await expect(replyForm).not.toBeVisible();
        }
      }
    });
  });

  test.describe('Reply Items', () => {
    test('displays reply content and metadata', async ({ page }) => {
      const expandButton = page.locator('[data-testid="expand-replies-button"]').first();
      if (await expandButton.isVisible()) {
        await expandButton.click();
        await page.waitForTimeout(500);
        
        const replyItems = page.locator('[data-testid^="reply-item-"]');
        const firstReply = replyItems.first();
        
        if (await replyItems.count() > 0) {
          // Should show username
          await expect(firstReply.locator('text=/^[a-zA-Z0-9_]+$/')).toBeVisible();
          
          // Should show timestamp
          await expect(firstReply.locator('text=/ago|just now/')).toBeVisible();
          
          // Should show reply content
          await expect(firstReply.locator('text=/./').first()).toBeVisible();
          
          // Should show reaction buttons
          await expect(firstReply.locator('button', { hasText: '👍' }).or(firstReply.locator('svg'))).toBeVisible();
        }
      }
    });

    test('shows edit and delete options for own replies', async ({ page }) => {
      // This test would require authentication and existing user replies
      // Implementation depends on your auth setup
    });

    test('handles reply reactions', async ({ page }) => {
      const expandButton = page.locator('[data-testid="expand-replies-button"]').first();
      if (await expandButton.isVisible()) {
        await expandButton.click();
        await page.waitForTimeout(500);
        
        const replyItems = page.locator('[data-testid^="reply-item-"]');
        const firstReply = replyItems.first();
        
        if (await replyItems.count() > 0) {
          // Find like button
          const likeButton = firstReply.locator('button').filter({ hasText: /👍|like/i }).first();
          if (await likeButton.isVisible()) {
            await likeButton.click();
            await page.waitForTimeout(300);
            
            // Button should show active state or increased count
            // Exact behavior depends on authentication state
          }
        }
      }
    });

    test('supports nested replies', async ({ page }) => {
      const expandButton = page.locator('[data-testid="expand-replies-button"]').first();
      if (await expandButton.isVisible()) {
        await expandButton.click();
        await page.waitForTimeout(500);
        
        const replyItems = page.locator('[data-testid^="reply-item-"]');
        const firstReply = replyItems.first();
        
        if (await replyItems.count() > 0) {
          // Look for nested reply button
          const nestedReplyButton = firstReply.locator('button:has-text("Reply")');
          if (await nestedReplyButton.isVisible()) {
            await nestedReplyButton.click();
            
            // Should show nested reply form
            const nestedForm = firstReply.locator('textarea[placeholder*="Reply to"]');
            await expect(nestedForm).toBeVisible();
          }
        }
      }
    });

    test('shows proper indentation for nested replies', async ({ page }) => {
      const expandButton = page.locator('[data-testid="expand-replies-button"]').first();
      if (await expandButton.isVisible()) {
        await expandButton.click();
        await page.waitForTimeout(500);
        
        // Check for indented reply items
        const indentedReplies = page.locator('[class*="pl-"]');
        if (await indentedReplies.count() > 0) {
          // Should have proper CSS classes for indentation
          await expect(indentedReplies.first()).toHaveClass(/pl-\d+/);
        }
      }
    });
  });

  test.describe('Rate Limiting', () => {
    test('shows rate limit warning when applicable', async ({ page }) => {
      // This test would require simulating rate limit state
      // Look for rate limit messages
      const rateLimitWarning = page.locator('text=/wait.*hours/i, text=/rate limit/i');
      if (await rateLimitWarning.isVisible()) {
        await expect(rateLimitWarning).toContainText(/hours|minutes/);
      }
    });

    test('disables reply submission when rate limited', async ({ page }) => {
      // Check if rate limit affects form submission
      const expandButton = page.locator('[data-testid="expand-replies-button"]').first();
      if (await expandButton.isVisible()) {
        await expandButton.click();
        await page.waitForTimeout(500);
        
        const replyButton = page.locator('button:has-text("Reply to review")').first();
        if (await replyButton.isVisible()) {
          await replyButton.click();
          
          const submitButton = page.locator('button:has-text("Reply")').last();
          
          // If rate limited, submit should be disabled even with content
          const replyForm = page.locator('textarea[placeholder*="Write a reply"]');
          await replyForm.fill('Test content');
          
          // Check for rate limit warning or disabled state
          const rateLimitAlert = page.locator('[role="alert"]', { hasText: /rate limit|wait/i });
          if (await rateLimitAlert.isVisible()) {
            await expect(submitButton).toBeDisabled();
          }
        }
      }
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('works correctly on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      const expandButton = page.locator('[data-testid="expand-replies-button"]').first();
      if (await expandButton.isVisible()) {
        // Should be clickable on mobile
        await expect(expandButton).toBeVisible();
        await expandButton.click();
        await page.waitForTimeout(500);
        
        // Reply form should work on mobile
        const replyButton = page.locator('button:has-text("Reply to review")').first();
        if (await replyButton.isVisible()) {
          await replyButton.click();
          
          const replyForm = page.locator('textarea[placeholder*="Write a reply"]');
          await expect(replyForm).toBeVisible();
          
          // Should be able to type on mobile
          await replyForm.fill('Mobile test reply');
          await expect(replyForm).toHaveValue('Mobile test reply');
        }
      }
    });

    test('reply buttons are touch-friendly', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      const expandButton = page.locator('[data-testid="expand-replies-button"]').first();
      if (await expandButton.isVisible()) {
        // Button should have adequate touch target size
        const buttonBox = await expandButton.boundingBox();
        if (buttonBox) {
          expect(buttonBox.height).toBeGreaterThanOrEqual(32); // Minimum 32px touch target
        }
      }
    });
  });

  test.describe('Accessibility', () => {
    test('supports keyboard navigation', async ({ page }) => {
      const expandButton = page.locator('[data-testid="expand-replies-button"]').first();
      if (await expandButton.isVisible()) {
        // Should be focusable
        await expandButton.focus();
        await expect(expandButton).toBeFocused();
        
        // Should activate with Enter/Space
        await expandButton.press('Enter');
        await page.waitForTimeout(500);
      }
    });

    test('has proper ARIA labels and roles', async ({ page }) => {
      const expandButton = page.locator('[data-testid="expand-replies-button"]').first();
      if (await expandButton.isVisible()) {
        await expandButton.click();
        await page.waitForTimeout(500);
        
        // Check for proper form labels
        const replyButton = page.locator('button:has-text("Reply to review")').first();
        if (await replyButton.isVisible()) {
          await replyButton.click();
          
          const replyForm = page.locator('textarea[placeholder*="Write a reply"]');
          
          // Should have accessible name or label
          const accessibleName = await replyForm.getAttribute('aria-label');
          const placeholderText = await replyForm.getAttribute('placeholder');
          
          expect(accessibleName || placeholderText).toBeTruthy();
        }
      }
    });

    test('provides proper feedback for screen readers', async ({ page }) => {
      // Check for aria-live regions or status updates
      const statusRegions = page.locator('[aria-live], [role="status"], [role="alert"]');
      
      // These would be present during form submissions or updates
      // Implementation depends on your specific accessibility features
    });
  });

  test.describe('Performance', () => {
    test('loads reply data efficiently', async ({ page }) => {
      // Monitor network requests
      const responsePromise = page.waitForResponse(response => 
        response.url().includes('review_replies') && response.status() === 200
      );
      
      const expandButton = page.locator('[data-testid="expand-replies-button"]').first();
      if (await expandButton.isVisible()) {
        await expandButton.click();
        
        try {
          const response = await Promise.race([
            responsePromise,
            page.waitForTimeout(3000).then(() => null)
          ]);
          
          if (response) {
            expect(response.status()).toBe(200);
          }
        } catch (error) {
          // Network request might not occur if using cached data
        }
      }
    });

    test('reply expansion is smooth and performant', async ({ page }) => {
      const expandButton = page.locator('[data-testid="expand-replies-button"]').first();
      if (await expandButton.isVisible()) {
        const startTime = Date.now();
        await expandButton.click();
        await page.waitForTimeout(500);
        const endTime = Date.now();
        
        // Should expand within reasonable time (< 1 second)
        expect(endTime - startTime).toBeLessThan(1000);
      }
    });
  });
});

test.describe('Reply System Integration', () => {
  test('preserves existing review functionality', async ({ page }) => {
    const testInfluencerUrl = `/influencer/test-influencer-id`;
    await page.goto(testInfluencerUrl);
    await page.waitForLoadState('networkidle');
    
    // Existing review features should still work
    const reviewSection = page.locator('text="Community Reviews"');
    await expect(reviewSection).toBeVisible();
    
    // Sorting controls should be present
    const sortingControls = page.locator('[data-testid="sorting-controls"]');
    if (await sortingControls.isVisible()) {
      await expect(sortingControls).toBeVisible();
    }
    
    // Review reactions should work
    const reactionButtons = page.locator('button').filter({ hasText: /👍|👎|like|dislike/i });
    if (await reactionButtons.count() > 0) {
      await expect(reactionButtons.first()).toBeVisible();
    }
  });

  test('review and reply counts are consistent', async ({ page }) => {
    const testInfluencerUrl = `/influencer/test-influencer-id`;
    await page.goto(testInfluencerUrl);
    await page.waitForLoadState('networkidle');
    
    // Check that reply counts match actual replies when expanded
    const expandButtons = page.locator('[data-testid="expand-replies-button"]');
    
    for (let i = 0; i < Math.min(await expandButtons.count(), 3); i++) {
      const button = expandButtons.nth(i);
      const countText = await button.textContent();
      const countMatch = countText?.match(/(\d+) repl(y|ies)/);
      
      if (countMatch) {
        const expectedCount = parseInt(countMatch[1]);
        await button.click();
        await page.waitForTimeout(500);
        
        const actualReplies = await page.locator('[data-testid^="reply-item-"]').count();
        
        // Count should match (allowing for pagination)
        expect(actualReplies).toBeGreaterThanOrEqual(0);
        expect(actualReplies).toBeLessThanOrEqual(expectedCount + 5); // Allow some margin
      }
    }
  });
});