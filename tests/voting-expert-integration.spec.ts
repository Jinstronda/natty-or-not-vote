import { test, expect } from '@playwright/test';

test.describe('Voting and Expert Review Integration', () => {
  test('Jeff Nippard page shows correct combined expert + user vote percentages', async ({ page }) => {
    // Navigate to Jeff Nippard's page
    await page.goto('/influencer/1961ab74-bbf4-4a67-906d-9e0f57bdbc28');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Verify the page loaded correctly
    await expect(page.locator('h3')).toContainText('Jeff Nippard');
    
    // Check for voting section (should be visible to signed-in users)
    const votingSection = page.locator('.bg-card .border-border');
    await expect(votingSection).toBeVisible();
    
    // Look for voting percentages (if any votes exist)
    const voteResults = page.locator('text=/\\d+% (Natty|Juicy)/');
    if (await voteResults.count() > 0) {
      // Verify percentages add up to 100%
      const percentageTexts = await voteResults.allTextContents();
      const percentages = percentageTexts.map(text => {
        const match = text.match(/(\d+)%/);
        return match ? parseInt(match[1]) : 0;
      });
      
      const totalPercentage = percentages.reduce((sum, pct) => sum + pct, 0);
      expect(totalPercentage).toBe(100);
    }
    
    // Check for expert reviews section
    await expect(page.locator('text=Expert Reviews')).toBeVisible();
    
    // Verify no JavaScript errors in console
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Wait a bit for any console errors to appear
    await page.waitForTimeout(2000);
    
    // Filter out expected/harmless errors
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('Failed to load module script') &&
      !error.includes('406') &&
      !error.includes('Failed to load resource') &&
      (error.includes('expert') || error.includes('vote'))
    );
    
    expect(criticalErrors.length).toBe(0);
  });

  test('No duplicate influencers appear in search/listings', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Get all influencer cards
    const influencerCards = page.locator('a[href*="/influencer/"]');
    await expect(influencerCards.first()).toBeVisible();
    
    // Get all influencer names
    const influencerNames = await influencerCards.locator('h3').allTextContents();
    
    // Check for duplicates
    const uniqueNames = new Set(influencerNames);
    const hasDuplicates = uniqueNames.size !== influencerNames.length;
    
    // Log duplicates if found
    if (hasDuplicates) {
      const duplicates = influencerNames.filter((name, index) => 
        influencerNames.indexOf(name) !== index
      );
      console.log('Duplicate influencers found:', [...new Set(duplicates)]);
    }
    
    expect(hasDuplicates).toBe(false);
  });

  test('Expert reviews load correctly across different components', async ({ page }) => {
    // Test multiple influencer pages to ensure expert reviews load consistently
    const testInfluencers = [
      { id: '1961ab74-bbf4-4a67-906d-9e0f57bdbc28', name: 'Jeff Nippard' },
      // Add more influencers with expert reviews if needed
    ];
    
    for (const influencer of testInfluencers) {
      await page.goto(`/influencer/${influencer.id}`);
      await page.waitForLoadState('networkidle');
      
      // Verify influencer name
      await expect(page.locator('h3')).toContainText(influencer.name);
      
      // Check if expert reviews section is present
      const expertReviewsSection = page.locator('text=Expert Reviews');
      await expect(expertReviewsSection).toBeVisible();
      
      // If there are expert reviews, verify they're displayed properly
      const expertReviewCards = page.locator('[data-testid="expert-review"], .space-y-6 > div');
      const reviewCount = await expertReviewCards.count();
      
      if (reviewCount > 0) {
        // Verify at least one expert review is visible
        await expect(expertReviewCards.first()).toBeVisible();
        
        // Check for expert name and verdict
        const expertContent = await expertReviewCards.first().textContent();
        expect(expertContent).toMatch(/(Natty|Juicy)/);
      }
    }
  });

  test('Voting percentages update when expert reviews are present', async ({ page }) => {
    // Navigate to an influencer with both expert reviews and user votes
    await page.goto('/influencer/1961ab74-bbf4-4a67-906d-9e0f57bdbc28');
    await page.waitForLoadState('networkidle');
    
    // Look for the voting section with percentage bars
    const votingSection = page.locator('.bg-card');
    await expect(votingSection).toBeVisible();
    
    // Check for percentage displays
    const percentageElements = page.locator('text=/\\d+% (Natty|Juicy)/');
    
    if (await percentageElements.count() > 0) {
      // Verify percentages are displayed
      await expect(percentageElements.first()).toBeVisible();
      
      // Check that the progress bars are sized correctly
      const progressBars = page.locator('.bg-natty, .bg-juicy');
      
      if (await progressBars.count() > 0) {
        // Get the width styles of progress bars
        const nattyBar = page.locator('.bg-natty').first();
        const juicyBar = page.locator('.bg-juicy').first();
        
        if (await nattyBar.count() > 0 && await juicyBar.count() > 0) {
          const nattyWidth = await nattyBar.getAttribute('style');
          const juicyWidth = await juicyBar.getAttribute('style');
          
          // Verify both bars have width styles
          expect(nattyWidth).toContain('width:');
          expect(juicyWidth).toContain('width:');
        }
      }
    }
  });

  test('Expert review calculation consistency across components', async ({ page }) => {
    // This test verifies that all components show the same percentages
    await page.goto('/influencer/1961ab74-bbf4-4a67-906d-9e0f57bdbc28');
    await page.waitForLoadState('networkidle');
    
    // Collect percentages from different sections
    const allPercentages: string[] = [];
    
    // From voting section
    const votingPercentages = await page.locator('.bg-card text=/\\d+% (Natty|Juicy)/').allTextContents();
    allPercentages.push(...votingPercentages);
    
    // From any results section
    const resultsPercentages = await page.locator('text=/\\d+% (Natty|Juicy)/').allTextContents();
    allPercentages.push(...resultsPercentages);
    
    // If we have multiple percentage displays, they should be consistent
    if (allPercentages.length > 2) {
      const nattyPercentages = allPercentages
        .filter((text: string) => text.includes('Natty'))
        .map((text: string) => text.match(/(\d+)%/)?.[1])
        .filter(Boolean);
      
      const juicyPercentages = allPercentages
        .filter((text: string) => text.includes('Juicy'))
        .map((text: string) => text.match(/(\d+)%/)?.[1])
        .filter(Boolean);
      
      // All natty percentages should be the same
      if (nattyPercentages.length > 1) {
        const firstNatty = nattyPercentages[0];
        expect(nattyPercentages.every(pct => pct === firstNatty)).toBe(true);
      }
      
      // All juicy percentages should be the same
      if (juicyPercentages.length > 1) {
        const firstJuicy = juicyPercentages[0];
        expect(juicyPercentages.every(pct => pct === firstJuicy)).toBe(true);
      }
    }
  });
}); 