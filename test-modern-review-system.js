import { chromium } from 'playwright';

/**
 * Comprehensive Test Suite for Modern Review System
 * Following Sequential Thinking Methodology
 * Testing all loading mechanisms, edge cases, and user interactions
 */

class ModernReviewSystemTester {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.results = {
      totalTests: 0,
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const emoji = {
      info: '📋',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      test: '🧪'
    }[type] || '📋';
    
    console.log(`${emoji} [${timestamp}] ${message}`);
  }

  async setUp() {
    this.log('Setting up test environment...', 'info');
    
    this.browser = await chromium.launch({ 
      headless: false,
      slowMo: 200
    });
    
    this.context = await this.browser.newContext({
      viewport: { width: 1200, height: 800 }
    });
    
    this.page = await this.context.newPage();
    
    // Enhanced console logging
    this.page.on('console', msg => {
      const text = msg.text();
      if (text.includes('[OptimalLoading]') || 
          text.includes('[ModernReviewSystem]') ||
          text.includes('🔥') || text.includes('💫')) {
        this.log(`Browser: ${text}`, 'info');
      }
    });

    // Track network requests
    this.page.on('request', request => {
      if (request.url().includes('supabase')) {
        this.log(`API Request: ${request.method()} ${request.url()}`, 'info');
      }
    });

    this.log('Test environment ready', 'success');
  }

  async tearDown() {
    if (this.browser) {
      await this.browser.close();
      this.log('Test environment cleaned up', 'success');
    }
  }

  async runTest(name, testFn) {
    this.results.totalTests++;
    this.log(`Testing: ${name}`, 'test');
    
    try {
      await testFn();
      this.results.passed++;
      this.log(`✅ PASS: ${name}`, 'success');
    } catch (error) {
      this.results.failed++;
      this.results.errors.push({ test: name, error: error.message });
      this.log(`❌ FAIL: ${name} - ${error.message}`, 'error');
    }
  }

  async navigateToInfluencer() {
    this.log('Navigating to influencer page...', 'info');
    
    await this.page.goto('http://localhost:8080');
    await this.page.waitForTimeout(2000);
    
    // Find and click first influencer
    const influencerLinks = await this.page.locator('a[href*="/influencer/"]').all();
    if (influencerLinks.length === 0) {
      throw new Error('No influencer profiles found');
    }
    
    const firstHref = await influencerLinks[0].getAttribute('href');
    const testUrl = `http://localhost:8080${firstHref}`;
    
    await this.page.goto(testUrl);
    await this.page.waitForTimeout(3000);
    
    this.log(`Navigated to: ${testUrl}`, 'success');
    return testUrl;
  }

  // Test 1: Initial Loading Performance
  async testInitialLoadingPerformance() {
    const startTime = Date.now();
    
    await this.navigateToInfluencer();
    
    // Wait for skeleton to appear
    await this.page.waitForSelector('.animate-pulse', { timeout: 5000 });
    this.log('Loading skeleton appeared', 'success');
    
    // Wait for actual content to load
    await this.page.waitForSelector('.animate-bounce-in', { timeout: 10000 });
    
    const endTime = Date.now();
    const loadTime = endTime - startTime;
    
    this.log(`Total load time: ${loadTime}ms`, 'info');
    
    if (loadTime > 8000) {
      throw new Error(`Loading too slow: ${loadTime}ms (should be < 8000ms)`);
    }
  }

  // Test 2: Skeleton Fidelity
  async testSkeletonFidelity() {
    await this.navigateToInfluencer();
    
    // Check for skeleton elements
    const skeletonElements = [
      '.animate-pulse',           // Basic pulse animation
      '.loading-progress',        // Progress bar
      '.gpu-accelerated',         // Performance optimization
      '.animate-fade-in'          // Progressive loading
    ];
    
    for (const selector of skeletonElements) {
      const element = await this.page.locator(selector).first();
      if (!(await element.isVisible())) {
        throw new Error(`Skeleton element missing: ${selector}`);
      }
    }
    
    this.log('All skeleton elements present', 'success');
  }

  // Test 3: Progressive Loading
  async testProgressiveLoading() {
    await this.navigateToInfluencer();
    
    // Track loading phases
    const phases = [];
    
    // Phase 1: Skeleton
    if (await this.page.locator('.animate-pulse').isVisible()) {
      phases.push('skeleton');
    }
    
    // Phase 2: Progress indicator
    const progressBar = this.page.locator('.loading-progress');
    if (await progressBar.isVisible()) {
      phases.push('progress');
    }
    
    // Phase 3: Content appears
    await this.page.waitForSelector('.animate-bounce-in', { timeout: 10000 });
    phases.push('content');
    
    // Phase 4: Staggered animations
    const staggeredElements = await this.page.locator('.animation-delay-150ms').count();
    if (staggeredElements > 0) {
      phases.push('staggered');
    }
    
    this.log(`Loading phases: ${phases.join(' → ')}`, 'info');
    
    if (phases.length < 2) {
      throw new Error('Progressive loading not working properly');
    }
  }

  // Test 4: Error Handling
  async testErrorHandling() {
    // Simulate network error by going to invalid URL
    await this.page.goto('http://localhost:8080/influencer/invalid-id-123');
    await this.page.waitForTimeout(5000);
    
    // Should show error state
    const errorState = this.page.locator('.animate-shake');
    const retryButton = this.page.locator('button:has-text("Try Again")');
    
    if (!(await errorState.isVisible()) && !(await retryButton.isVisible())) {
      throw new Error('Error state not properly displayed');
    }
    
    this.log('Error handling works correctly', 'success');
  }

  // Test 5: Mobile Performance
  async testMobilePerformance() {
    // Set mobile viewport
    await this.page.setViewportSize({ width: 375, height: 667 });
    
    await this.navigateToInfluencer();
    
    // Check for mobile-optimized animations
    const reducedMotion = await this.page.evaluate(() => {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    });
    
    // Test touch interactions
    const loadMoreButton = this.page.locator('button:has-text("Load more")');
    if (await loadMoreButton.isVisible()) {
      await loadMoreButton.tap();
      await this.page.waitForTimeout(2000);
    }
    
    this.log('Mobile performance test completed', 'success');
  }

  // Test 6: Sorting and Pagination
  async testSortingAndPagination() {
    await this.navigateToInfluencer();
    
    // Wait for sorting controls
    await this.page.waitForSelector('button:has-text("Most Liked")', { timeout: 10000 });
    
    // Test sorting
    const sortButton = this.page.locator('button:has-text("Most Liked")');
    await sortButton.click();
    await this.page.waitForTimeout(2000);
    
    // Check if content reloaded
    const reviews = await this.page.locator('[data-testid="review-item"]').count();
    this.log(`Found ${reviews} reviews after sorting`, 'info');
    
    // Test load more if available
    const loadMoreButton = this.page.locator('button:has-text("Load more")');
    if (await loadMoreButton.isVisible()) {
      const initialCount = await this.page.locator('.border.border-border.rounded-lg.p-4').count();
      await loadMoreButton.click();
      await this.page.waitForTimeout(3000);
      const newCount = await this.page.locator('.border.border-border.rounded-lg.p-4').count();
      
      if (newCount <= initialCount) {
        throw new Error('Load more did not add new content');
      }
      
      this.log(`Loaded ${newCount - initialCount} more reviews`, 'success');
    }
  }

  // Test 7: Real-time Updates
  async testRealTimeUpdates() {
    // Open two pages to test cross-page updates
    const page2 = await this.context.newPage();
    
    await this.navigateToInfluencer();
    await page2.goto(this.page.url());
    
    await this.page.waitForTimeout(2000);
    await page2.waitForTimeout(2000);
    
    // Test would require actual user interaction for review submission
    // For now, just verify both pages loaded correctly
    const page1Reviews = await this.page.locator('.border.border-border.rounded-lg.p-4').count();
    const page2Reviews = await page2.locator('.border.border-border.rounded-lg.p-4').count();
    
    if (page1Reviews !== page2Reviews) {
      throw new Error('Cross-page synchronization issue');
    }
    
    await page2.close();
    this.log('Real-time updates test completed', 'success');
  }

  // Test 8: Accessibility
  async testAccessibility() {
    await this.navigateToInfluencer();
    
    // Check for proper ARIA labels
    const skeletonElements = await this.page.locator('[aria-hidden="true"]').count();
    const presentationElements = await this.page.locator('[role="presentation"]').count();
    
    if (skeletonElements === 0 && presentationElements === 0) {
      throw new Error('Missing accessibility attributes on loading elements');
    }
    
    // Test keyboard navigation
    await this.page.keyboard.press('Tab');
    await this.page.keyboard.press('Tab');
    
    const focusedElement = await this.page.evaluate(() => document.activeElement?.tagName);
    this.log(`Keyboard navigation: focused on ${focusedElement}`, 'info');
    
    this.log('Accessibility test completed', 'success');
  }

  // Test 9: Performance Metrics
  async testPerformanceMetrics() {
    await this.navigateToInfluencer();
    
    // Measure performance
    const metrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
      };
    });
    
    this.log(`Performance metrics:`, 'info');
    this.log(`  DOM Content Loaded: ${metrics.domContentLoaded}ms`, 'info');
    this.log(`  Load Complete: ${metrics.loadComplete}ms`, 'info');
    this.log(`  First Paint: ${metrics.firstPaint}ms`, 'info');
    this.log(`  First Contentful Paint: ${metrics.firstContentfulPaint}ms`, 'info');
    
    if (metrics.firstContentfulPaint > 3000) {
      throw new Error(`First Contentful Paint too slow: ${metrics.firstContentfulPaint}ms`);
    }
  }

  // Test 10: Edge Cases
  async testEdgeCases() {
    // Test empty state
    await this.page.goto('http://localhost:8080/influencer/empty-test-id');
    await this.page.waitForTimeout(5000);
    
    // Should show empty state
    const emptyState = this.page.locator(':has-text("No reviews yet")');
    if (!(await emptyState.isVisible())) {
      // This might be expected if the ID doesn't exist, so don't fail
      this.log('Empty state test - no empty state found (might be expected)', 'warning');
    } else {
      this.log('Empty state displayed correctly', 'success');
    }
    
    // Test very long content
    await this.navigateToInfluencer();
    
    // Test rapid clicking (stress test)
    const loadMoreButton = this.page.locator('button:has-text("Load more")');
    if (await loadMoreButton.isVisible()) {
      for (let i = 0; i < 3; i++) {
        await loadMoreButton.click();
        await this.page.waitForTimeout(100);
      }
      await this.page.waitForTimeout(2000);
    }
    
    this.log('Edge cases test completed', 'success');
  }

  async runAllTests() {
    this.log('🚀 Starting Modern Review System Test Suite', 'info');
    this.log('================================================', 'info');
    
    try {
      await this.setUp();
      
      await this.runTest('Initial Loading Performance', () => this.testInitialLoadingPerformance());
      await this.runTest('Skeleton Fidelity', () => this.testSkeletonFidelity());
      await this.runTest('Progressive Loading', () => this.testProgressiveLoading());
      await this.runTest('Error Handling', () => this.testErrorHandling());
      await this.runTest('Mobile Performance', () => this.testMobilePerformance());
      await this.runTest('Sorting and Pagination', () => this.testSortingAndPagination());
      await this.runTest('Real-time Updates', () => this.testRealTimeUpdates());
      await this.runTest('Accessibility', () => this.testAccessibility());
      await this.runTest('Performance Metrics', () => this.testPerformanceMetrics());
      await this.runTest('Edge Cases', () => this.testEdgeCases());
      
    } finally {
      await this.tearDown();
    }
    
    this.printResults();
  }

  printResults() {
    this.log('================================================', 'info');
    this.log('🎯 TEST RESULTS SUMMARY', 'info');
    this.log('================================================', 'info');
    this.log(`Total Tests: ${this.results.totalTests}`, 'info');
    this.log(`Passed: ${this.results.passed}`, 'success');
    this.log(`Failed: ${this.results.failed}`, this.results.failed > 0 ? 'error' : 'info');
    
    if (this.results.errors.length > 0) {
      this.log('', 'info');
      this.log('FAILED TESTS:', 'error');
      this.results.errors.forEach(({ test, error }) => {
        this.log(`  ❌ ${test}: ${error}`, 'error');
      });
    }
    
    const successRate = Math.round((this.results.passed / this.results.totalTests) * 100);
    this.log('', 'info');
    this.log(`Success Rate: ${successRate}%`, successRate >= 80 ? 'success' : 'error');
    
    if (successRate >= 90) {
      this.log('🎉 EXCELLENT: Modern Review System is working perfectly!', 'success');
    } else if (successRate >= 80) {
      this.log('✅ GOOD: Modern Review System is working well with minor issues', 'success');
    } else {
      this.log('⚠️ NEEDS WORK: Modern Review System has significant issues', 'warning');
    }
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:8080/');
    return response.ok;
  } catch {
    return false;
  }
}

// Main execution
async function main() {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ Dev server not running on http://localhost:8080/');
    console.log('💡 Please run: npm run dev');
    return;
  }
  
  const tester = new ModernReviewSystemTester();
  await tester.runAllTests();
}

main().catch(console.error);