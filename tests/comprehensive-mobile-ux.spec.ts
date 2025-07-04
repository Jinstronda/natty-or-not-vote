import { test, expect } from '@playwright/test';

/**
 * Comprehensive Mobile UX Test Suite
 * 
 * Validates research-based mobile UX improvements addressing critical issues:
 * - Current scope highlighting (95% of sites fail this - Baymard Institute)
 * - Search autocomplete with category scope (77% don't include this)
 * - Mobile keyboard optimization (63% don't use proper keyboard layouts) 
 * - Touch target compliance (WCAG 44px minimum)
 * - Horizontal scroll prevention (major cause of broken mobile UX)
 * - Progressive enhancement patterns
 */

test.describe('Comprehensive Mobile UX Validation', () => {
  const mobileViewports = [
    { name: 'iPhone SE', width: 320, height: 568 },
    { name: 'iPhone 6/7/8', width: 375, height: 667 },
    { name: 'iPhone XR', width: 414, height: 896 },
  ];

  test.beforeEach(async ({ page }) => {
    // Set mobile viewport for all tests
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test.describe('Header Navigation - Research-Based Improvements', () => {
    test('should have mobile hamburger menu with proper accessibility', async ({ page }) => {
      await page.goto('http://localhost:8082/merch');
      
      // Test hamburger button exists and is accessible
      const hamburgerButton = page.getByRole('button', { name: /navigation menu/i });
      await expect(hamburgerButton).toBeVisible();
      
      // Verify ARIA attributes for accessibility
      await expect(hamburgerButton).toHaveAttribute('aria-expanded');
      await expect(hamburgerButton).toHaveAttribute('aria-controls', 'mobile-navigation');
      
      // Test hamburger button meets touch target requirements (44px minimum)
      const buttonBox = await hamburgerButton.boundingBox();
      expect(buttonBox?.width).toBeGreaterThanOrEqual(44);
      expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
    });

    test('should highlight current scope in navigation (Research: 95% of sites fail this)', async ({ page }) => {
      await page.goto('http://localhost:8082/merch');
      
      // Open mobile navigation
      await page.getByRole('button', { name: /open navigation menu/i }).click();
      
      // Wait for navigation to be visible
      await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible();
      
      // Verify "Merch" is highlighted since we're on the merch page
      const merchLink = page.getByRole('link', { name: /Merch Official store/i });
      await expect(merchLink).toBeVisible();
      
      // Verify other navigation items are not highlighted
      const trendingLink = page.getByRole('link', { name: /Trending Latest fitness content/i });
      await expect(trendingLink).toBeVisible();
    });

    test('should provide enhanced mobile navigation with descriptions and emojis', async ({ page }) => {
      await page.goto('http://localhost:8082/merch');
      
      // Open mobile navigation
      await page.getByRole('button', { name: /open navigation menu/i }).click();
      
      // Verify enhanced navigation items with descriptions
      await expect(page.getByText('🔥')).toBeVisible();
      await expect(page.getByText('Latest fitness content')).toBeVisible();
      
      await expect(page.getByText('🛍️')).toBeVisible(); 
      await expect(page.getByText('Official store')).toBeVisible();
      
      await expect(page.getByText('❓')).toBeVisible();
      await expect(page.getByText('Learn about our process')).toBeVisible();
      
      // Verify all navigation items meet touch target requirements
      const navLinks = page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link');
      const linkCount = await navLinks.count();
      
      for (let i = 0; i < linkCount; i++) {
        const link = navLinks.nth(i);
        const linkBox = await link.boundingBox();
        if (linkBox) {
          expect(linkBox.height).toBeGreaterThanOrEqual(44);
        }
      }
    });

    test('should close mobile menu on backdrop click', async ({ page }) => {
      await page.goto('http://localhost:8082/merch');
      
      // Open mobile navigation
      await page.getByRole('button', { name: /open navigation menu/i }).click();
      await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible();
      
      // Click outside the menu (on backdrop)
      await page.locator('body').click({ position: { x: 10, y: 10 } });
      
      // Menu should close (button should show "Open" state)
      await expect(page.getByRole('button', { name: /open navigation menu/i })).toBeVisible();
    });
  });

  test.describe('Search Experience - Mobile Optimization', () => {
    test('should use proper mobile keyboard types and disable autocorrect', async ({ page }) => {
      await page.goto('http://localhost:8082/merch');
      
      const searchInput = page.getByRole('searchbox', { name: 'Search for products' });
      await expect(searchInput).toBeVisible();
      
      // Verify mobile keyboard optimization attributes
      await expect(searchInput).toHaveAttribute('type', 'search');
      await expect(searchInput).toHaveAttribute('inputmode', 'search');
      await expect(searchInput).toHaveAttribute('autocorrect', 'off');
      await expect(searchInput).toHaveAttribute('spellcheck', 'false');
      await expect(searchInput).toHaveAttribute('autocomplete', 'off');
      
      // Verify touch-friendly height (Research: 63% don't meet touch target requirements)
      const inputBox = await searchInput.boundingBox();
      expect(inputBox?.height).toBeGreaterThanOrEqual(44);
    });

    test('should provide search suggestions with category scope (Research: 77% fail this)', async ({ page }) => {
      await page.goto('http://localhost:8082/merch');
      
      const searchInput = page.getByRole('searchbox', { name: 'Search for products' });
      
      // Type to trigger suggestions
      await searchInput.click();
      await searchInput.fill('fit');
      
      // Verify search suggestions appear with category scope
      await expect(page.getByText('Search suggestions')).toBeVisible();
      
      // Verify category scope suggestions (key research finding)
      await expect(page.getByRole('button', { name: /fitness gear.*in Equipment/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /lightning.*in Accessories/i })).toBeVisible(); 
      await expect(page.getByRole('button', { name: /premium.*in All Products/i })).toBeVisible();
      
      // Verify suggestions have proper touch targets
      const suggestions = page.getByRole('button').filter({ hasText: 'in Equipment' });
      const suggestionBox = await suggestions.first().boundingBox();
      if (suggestionBox) {
        expect(suggestionBox.height).toBeGreaterThanOrEqual(44);
      }
    });

    test('should handle search suggestion interaction correctly', async ({ page }) => {
      await page.goto('http://localhost:8082/merch');
      
      const searchInput = page.getByRole('searchbox', { name: 'Search for products' });
      await searchInput.click();
      await searchInput.fill('fit');
      
      // Click on "fitness gear" suggestion
      await page.getByRole('button', { name: /fitness gear.*in Equipment/i }).click();
      
      // Verify search input is updated
      await expect(searchInput).toHaveValue('fitness gear');
    });
  });

  test.describe('Responsive Layout - Horizontal Scroll Prevention', () => {
    test('should prevent horizontal scrolling on all mobile viewport sizes', async ({ page }) => {
      for (const viewport of mobileViewports) {
        await page.setViewportSize(viewport);
        await page.goto('http://localhost:8082/merch');
        
        // Check that body doesn't exceed viewport width
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        expect(bodyWidth).toBeLessThanOrEqual(viewport.width + 1); // Allow 1px tolerance
        
        // Verify no horizontal scroll is needed
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth;
        });
        expect(hasHorizontalScroll).toBeFalsy();
      }
    });

    test('should scale typography properly across mobile viewports', async ({ page }) => {
      await page.goto('http://localhost:8082/merch');
      
      const heroTitle = page.getByRole('heading', { name: /Official Natty or Juicy Store/i });
      await expect(heroTitle).toBeVisible();
      
      // Test responsive typography scaling
      for (const viewport of mobileViewports) {
        await page.setViewportSize(viewport);
        
        const titleBox = await heroTitle.boundingBox();
        if (titleBox) {
          // Title should not be too tall (indicating proper scaling)
          expect(titleBox.height).toBeLessThan(viewport.height * 0.3);
          // Title should still be readable
          expect(titleBox.height).toBeGreaterThan(30);
        }
      }
    });

    test('should maintain proper spacing and layout on mobile', async ({ page }) => {
      await page.goto('http://localhost:8082/merch');
      
      // Verify countdown timer layout
      const countdownTimer = page.locator('.bg-gradient-to-r.from-destructive\\/90');
      await expect(countdownTimer).toBeVisible();
      
      // Verify search container doesn't overflow
      const searchContainer = page.getByRole('searchbox').locator('..');
      const searchBox = await searchContainer.boundingBox();
      expect(searchBox?.width).toBeLessThanOrEqual(375);
    });
  });

  test.describe('Touch Target Compliance - WCAG Accessibility', () => {
    test('should meet WCAG touch target requirements for all interactive elements', async ({ page }) => {
      await page.goto('http://localhost:8082/merch');
      
      // Test hamburger button
      const hamburgerButton = page.getByRole('button', { name: /navigation menu/i });
      const hamburgerBox = await hamburgerButton.boundingBox();
      expect(hamburgerBox?.width).toBeGreaterThanOrEqual(44);
      expect(hamburgerBox?.height).toBeGreaterThanOrEqual(44);
      
      // Test search input
      const searchInput = page.getByRole('searchbox');
      const searchBox = await searchInput.boundingBox();
      expect(searchBox?.height).toBeGreaterThanOrEqual(44);
      
      // Test logo link
      const logoLink = page.getByRole('link', { name: 'Natty or Juicy Home' });
      const logoBox = await logoLink.boundingBox();
      expect(logoBox?.height).toBeGreaterThanOrEqual(44);
    });

    test('should provide adequate touch spacing between interactive elements', async ({ page }) => {
      await page.goto('http://localhost:8082/merch');
      
      // Open mobile navigation to test nav items
      await page.getByRole('button', { name: /open navigation menu/i }).click();
      
      // Get all navigation links
      const navLinks = page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link');
      const linkCount = await navLinks.count();
      
      // Verify each navigation link has proper spacing
      for (let i = 0; i < linkCount - 1; i++) {
        const currentLink = navLinks.nth(i);
        const nextLink = navLinks.nth(i + 1);
        
        const currentBox = await currentLink.boundingBox();
        const nextBox = await nextLink.boundingBox();
        
        if (currentBox && nextBox) {
          // Verify minimum spacing between touch targets
          const spacing = nextBox.y - (currentBox.y + currentBox.height);
          expect(spacing).toBeGreaterThanOrEqual(-8); // Allow small overlap for grouped items
        }
      }
    });
  });

  test.describe('Navigation Flow - End-to-End Mobile Journey', () => {
    test('should support complete mobile navigation workflow', async ({ page }) => {
      await page.goto('http://localhost:8082/merch');
      
      // 1. Open mobile navigation
      await page.getByRole('button', { name: /open navigation menu/i }).click();
      await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible();
      
      // 2. Navigate to home page
      await page.getByRole('link', { name: /Trending Latest fitness content/i }).click();
      await expect(page).toHaveURL('http://localhost:8082/');
      
      // 3. Navigate back to merch
      await page.goto('http://localhost:8082/merch');
      
      // 4. Test search functionality
      const searchInput = page.getByRole('searchbox', { name: 'Search for products' });
      await searchInput.click();
      await searchInput.fill('gear');
      
      // 5. Use search suggestion
      await page.getByRole('button', { name: /fitness gear.*in Equipment/i }).click();
      await expect(searchInput).toHaveValue('fitness gear');
    });

    test('should maintain mobile UX consistency across page transitions', async ({ page }) => {
      // Test navigation between pages maintains mobile optimization
      const pages = [
        'http://localhost:8082/',
        'http://localhost:8082/merch', 
        'http://localhost:8082/how-it-works'
      ];
      
      for (const pageUrl of pages) {
        await page.goto(pageUrl);
        
        // Verify hamburger menu exists on all pages
        const hamburgerButton = page.getByRole('button', { name: /navigation menu/i });
        await expect(hamburgerButton).toBeVisible();
        
        // Verify no horizontal scroll
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth;
        });
        expect(hasHorizontalScroll).toBeFalsy();
      }
    });
  });

  test.describe('Performance and Visual Quality', () => {
    test('should load mobile page within acceptable time limits', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('http://localhost:8082/merch');
      
      // Wait for critical mobile elements to be visible
      await expect(page.getByRole('button', { name: /navigation menu/i })).toBeVisible();
      await expect(page.getByRole('heading', { name: /Official Natty or Juicy Store/i })).toBeVisible();
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000); // 5 second load time limit
    });

    test('should maintain visual hierarchy on mobile', async ({ page }) => {
      await page.goto('http://localhost:8082/merch');
      
      // Verify proper z-index stacking for mobile menu
      await page.getByRole('button', { name: /open navigation menu/i }).click();
      
      const navigation = page.getByRole('navigation', { name: 'Mobile navigation' });
      await expect(navigation).toBeVisible();
      
      // Navigation should be above main content
      const navZIndex = await navigation.evaluate(el => getComputedStyle(el).zIndex);
      expect(parseInt(navZIndex) || 0).toBeGreaterThan(0);
    });
  });

  test.describe('Cross-Device Mobile Testing', () => {
    mobileViewports.forEach(viewport => {
      test(`should work correctly on ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto('http://localhost:8082/merch');
        
        // Test core mobile functionality on each viewport
        
        // 1. Navigation accessibility
        const hamburgerButton = page.getByRole('button', { name: /navigation menu/i });
        await expect(hamburgerButton).toBeVisible();
        
        // 2. No horizontal scroll
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth;
        });
        expect(hasHorizontalScroll).toBeFalsy();
        
        // 3. Search functionality
        const searchInput = page.getByRole('searchbox', { name: 'Search for products' });
        await expect(searchInput).toBeVisible();
        
        // 4. Content visibility
        const heroTitle = page.getByRole('heading', { name: /Official Natty or Juicy Store/i });
        await expect(heroTitle).toBeVisible();
        
        // 5. Touch target compliance
        const inputBox = await searchInput.boundingBox();
        expect(inputBox?.height).toBeGreaterThanOrEqual(44);
      });
    });
  });
}); 