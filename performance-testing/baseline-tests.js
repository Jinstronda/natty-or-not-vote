// Baseline Performance Tests - Before Fixes
// Run these tests before implementing changes

const performanceTests = {
  // Test 1: Initial Load Performance
  testInitialLoad: () => {
    console.log('🔍 Testing Initial Load Performance...');
    const startTime = performance.now();
    
    // Simulate initial page load
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name.includes('vote-stats') || entry.name.includes('expert-reviews')) {
          console.log(`📊 ${entry.name}: ${entry.duration}ms`);
        }
      }
    });
    
    observer.observe({ entryTypes: ['measure'] });
    
    // Monitor vote bar appearance
    const voteBarObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          const voteBar = mutation.target.querySelector('[data-testid="vote-bar"]');
          if (voteBar) {
            const loadTime = performance.now() - startTime;
            console.log(`✅ First vote bar appeared: ${loadTime}ms`);
          }
        }
      });
    });
    
    if (document.body) {
      voteBarObserver.observe(document.body, { childList: true, subtree: true });
    }
  },

  // Test 2: Search Operation Performance
  testSearchOperation: () => {
    console.log('🔍 Testing Search Operation Performance...');
    let searchStartTime = performance.now();
    let flickerCount = 0;
    
    // Monitor vote bar visibility changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' || mutation.type === 'attributes') {
          const voteBars = document.querySelectorAll('[data-testid="vote-bar"]');
          const visibleBars = Array.from(voteBars).filter(bar => 
            bar.offsetParent !== null && !bar.classList.contains('hidden')
          );
          
          if (visibleBars.length === 0 && voteBars.length > 0) {
            flickerCount++;
            console.log(`⚠️ Vote bar flicker detected (count: ${flickerCount})`);
          }
        }
      });
    });
    
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    }
    
    // Monitor search input changes
    const searchInput = document.querySelector('input[placeholder*="Search"]');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchStartTime = performance.now();
        console.log(`🔤 Search input: "${e.target.value}"`);
      });
    }
    
    return { observer, flickerCount };
  },

  // Test 3: API Call Monitoring
  testAPICallCount: () => {
    console.log('🔍 Testing API Call Count...');
    const apiCalls = [];
    
    // Override fetch to monitor API calls
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      const url = args[0];
      const timestamp = performance.now();
      
      if (url.includes('votes') || url.includes('expert_reviews')) {
        apiCalls.push({
          url: url.toString(),
          timestamp,
          type: url.includes('votes') ? 'vote-stats' : 'expert-reviews'
        });
        console.log(`📡 API Call: ${url} at ${timestamp}ms`);
      }
      
      return originalFetch.apply(this, args);
    };
    
    return { apiCalls };
  },

  // Test 4: Cache Hit Rate
  testCacheHitRate: () => {
    console.log('🔍 Testing Cache Hit Rate...');
    const cacheStats = { hits: 0, misses: 0 };
    
    // Monitor React Query cache
    if (window.queryClient) {
      const queryCache = window.queryClient.getQueryCache();
      const originalGet = queryCache.get.bind(queryCache);
      
      queryCache.get = function(queryKey) {
        const result = originalGet(queryKey);
        if (result && result.state.data) {
          cacheStats.hits++;
          console.log(`✅ Cache hit: ${JSON.stringify(queryKey)}`);
        } else {
          cacheStats.misses++;
          console.log(`❌ Cache miss: ${JSON.stringify(queryKey)}`);
        }
        return result;
      };
    }
    
    return cacheStats;
  },

  // Run all baseline tests
  runAllTests: () => {
    console.log('🚀 Running Baseline Performance Tests...');
    console.log('='.repeat(50));
    
    const results = {
      initialLoad: performanceTests.testInitialLoad(),
      searchOperation: performanceTests.testSearchOperation(),
      apiCalls: performanceTests.testAPICallCount(),
      cacheHitRate: performanceTests.testCacheHitRate()
    };
    
    // Log results summary after 10 seconds
    setTimeout(() => {
      console.log('📊 BASELINE RESULTS SUMMARY:');
      console.log('='.repeat(50));
      console.log('Initial Load: See console for timing');
      console.log(`Search Flickers: ${results.searchOperation.flickerCount}`);
      console.log(`API Calls: ${results.apiCalls.apiCalls.length}`);
      console.log(`Cache Hit Rate: ${results.cacheHitRate.hits}/${results.cacheHitRate.hits + results.cacheHitRate.misses}`);
    }, 10000);
    
    return results;
  }
};

// Export for use in browser console
if (typeof module !== 'undefined' && module.exports) {
  module.exports = performanceTests;
} else {
  window.performanceTests = performanceTests;
}

// Auto-run tests when loaded
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      performanceTests.runAllTests();
    }, 1000);
  });
}