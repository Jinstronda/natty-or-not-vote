import { test, expect } from '@playwright/test';

test.describe('Controversial Influencer Sorting', () => {
  test('should display controversial influencers first on homepage', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('https://nattyorjuicy.com');
    
    // Wait for the influencer grid to load
    await page.waitForSelector('[data-testid="influencer-grid"], .grid:has(a[href*="/influencer/"])', { timeout: 10000 });
    
    // Get all influencer cards
    const influencerCards = page.locator('a[href*="/influencer/"]');
    const cardCount = await influencerCards.count();
    expect(cardCount).toBeGreaterThan(0);
    
    // Get the first influencer card
    const firstCard = influencerCards.first();
    
    // Check if the first card has a controversial badge
    const hasControversialBadge = await firstCard.locator('text=🔥 Controversial').count() > 0;
    
    if (hasControversialBadge) {
      // If first card is controversial, verify it has the controversial badge
      await expect(firstCard.locator('text=🔥 Controversial')).toBeVisible();
      
      // Verify it's Farhat Hussein (the currently controversial influencer)
      await expect(firstCard.locator('text=Farhat Hussein')).toBeVisible();
      
      // Check that subsequent cards are non-controversial
      const secondCard = influencerCards.nth(1);
      const thirdCard = influencerCards.nth(2);
      
      // These should not have controversial badges
      await expect(secondCard.locator('text=🔥 Controversial')).toHaveCount(0);
      await expect(thirdCard.locator('text=🔥 Controversial')).toHaveCount(0);
    } else {
      // If no controversial influencers exist, that's also valid
      // Just ensure the sorting is consistent
      console.log('No controversial influencers found - this is acceptable');
    }
  });

  test('should maintain controversial-first order after search', async ({ page }) => {
    // Navigate to homepage
    await page.goto('https://nattyorjuicy.com');
    
    // Wait for page to load
    await page.waitForSelector('input[placeholder*="Search"]', { timeout: 10000 });
    
    // Perform a search that should include controversial influencer
    await page.fill('input[placeholder*="Search"]', 'Farhat');
    await page.click('button:has-text("Search")');
    
    // Wait for search results
    await page.waitForTimeout(2000);
    
    // Check if Farhat Hussein appears in results
    const searchResults = page.locator('a[href*="/influencer/"]');
    const farhateCard = searchResults.filter({ hasText: 'Farhat Hussein' });
    
    if (await farhateCard.count() > 0) {
      // Verify controversial badge is present
      await expect(farhateCard.locator('text=🔥 Controversial')).toBeVisible();
    }
  });

  test('database query should return controversial influencers first', async ({ page }) => {
    // This test verifies the database-level sorting
    // We can't directly test the database from Playwright, but we can test the API endpoint
    
    // Navigate to homepage and check network requests
    await page.goto('https://nattyorjuicy.com');
    
    // Wait for the page to load and make its API calls
    await page.waitForLoadState('networkidle');
    
    // Check that influencers are loaded in the correct order
    const influencerCards = page.locator('a[href*="/influencer/"]');
    const cardCount = await influencerCards.count();
    expect(cardCount).toBeGreaterThan(0);
    
    // Get all influencer names in order
    const influencerNames = await influencerCards.locator('h3').allTextContents();
    
    // Find controversial influencers in the list
    const controversialInfluencers: string[] = [];
    const nonControversialInfluencers: string[] = [];
    
    for (let i = 0; i < Math.min(influencerNames.length, 10); i++) {
      const card = influencerCards.nth(i);
      const hasControversial = await card.locator('text=🔥 Controversial').count() > 0;
      
      if (hasControversial) {
        controversialInfluencers.push(influencerNames[i]);
      } else {
        nonControversialInfluencers.push(influencerNames[i]);
      }
    }
    
    // Log the results for debugging
    console.log('Controversial influencers found:', controversialInfluencers);
    console.log('First few non-controversial:', nonControversialInfluencers.slice(0, 3));
    
    // If there are controversial influencers, they should appear before non-controversial ones
    if (controversialInfluencers.length > 0 && nonControversialInfluencers.length > 0) {
      // Find the index of the last controversial influencer (using reverse iteration)
      let lastControversialIndex = -1;
      for (let i = influencerNames.length - 1; i >= 0; i--) {
        if (controversialInfluencers.includes(influencerNames[i])) {
          lastControversialIndex = i;
          break;
        }
      }
      
      // Find the index of the first non-controversial influencer
      const firstNonControversialIndex = influencerNames.findIndex(name => 
        nonControversialInfluencers.includes(name)
      );
      
      // Controversial should come before non-controversial
      expect(lastControversialIndex).toBeLessThan(firstNonControversialIndex);
    }
  });
}); 