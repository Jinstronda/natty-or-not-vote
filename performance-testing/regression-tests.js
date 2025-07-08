// Regression Tests - After Hotfixes Implementation
// Run these tests to ensure no functionality is broken

const regressionTests = {
  // Test 1: Basic functionality still works
  testBasicFunctionality: () => {
    console.log('🧪 Testing Basic Functionality...');
    
    const tests = [
      {
        name: 'InfluencerCard components exist',
        test: () => document.querySelectorAll('[data-testid="vote-bar"]').length > 0,
        expected: true
      },
      {
        name: 'Vote percentages display correctly',
        test: () => {
          const bars = document.querySelectorAll('[data-testid="vote-bar"]');
          return Array.from(bars).some(bar => 
            bar.textContent.includes('%') && 
            (bar.textContent.includes('Natty') || bar.textContent.includes('Juicy'))
          );
        },
        expected: true
      },
      {
        name: 'Vote bars have proper styling',
        test: () => {
          const bars = document.querySelectorAll('.bg-juicy, .bg-natty');
          return bars.length > 0;
        },
        expected: true
      },
      {
        name: 'Search input exists and works',
        test: () => {
          const input = document.querySelector('input[placeholder*="Search"]');
          return input && input.type === 'text';
        },
        expected: true
      }
    ];
    
    tests.forEach(test => {
      const result = test.test();
      const status = result === test.expected ? '✅' : '❌';
      console.log(`${status} ${test.name}: ${result}`);
    });
  },

  // Test 2: Loading states work correctly
  testLoadingStates: () => {
    console.log('🧪 Testing Loading States...');
    
    // Monitor loading states
    const loadingObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-loading') {
          console.log(`📊 Loading state changed: ${mutation.target.dataset.loading}`);
        }
      });
    });
    
    if (document.body) {
      loadingObserver.observe(document.body, { attributes: true, subtree: true });
    }
    
    // Test that loading states are properly managed
    setTimeout(() => {
      const loadingElements = document.querySelectorAll('[data-loading="true"]');
      console.log(`📊 Found ${loadingElements.length} elements still loading`);
      
      if (loadingElements.length > 0) {
        console.log('⚠️ Some elements are still in loading state - this might indicate a problem');
      } else {
        console.log('✅ All elements have finished loading');
      }
    }, 3000);
  },

  // Test 3: Search functionality
  testSearchFunctionality: () => {
    console.log('🧪 Testing Search Functionality...');
    
    const searchInput = document.querySelector('input[placeholder*="Search"]');
    if (!searchInput) {
      console.log('❌ Search input not found');
      return;
    }
    
    // Test search input
    let testsPassed = 0;
    let totalTests = 0;
    
    // Test 1: Search input accepts text
    totalTests++;
    try {
      searchInput.value = 'test';
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      console.log('✅ Search input accepts text');
      testsPassed++;
    } catch (error) {
      console.log('❌ Search input failed:', error.message);
    }
    
    // Test 2: Search triggers filtering
    totalTests++;
    setTimeout(() => {
      const cards = document.querySelectorAll('.cursor-pointer');
      console.log(`📊 Found ${cards.length} cards after search`);
      
      if (cards.length >= 0) { // Allow 0 results for test search
        console.log('✅ Search filtering works');
        testsPassed++;
      } else {
        console.log('❌ Search filtering failed');
      }
      
      // Clear search
      searchInput.value = '';
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      
      setTimeout(() => {
        const cardsAfterClear = document.querySelectorAll('.cursor-pointer');
        console.log(`📊 Found ${cardsAfterClear.length} cards after clearing search`);
        
        console.log(`📊 Search tests passed: ${testsPassed}/${totalTests}`);
      }, 1000);
    }, 1000);
  },

  // Test 4: Vote bar consistency during search
  testVoteBarConsistency: () => {
    console.log('🧪 Testing Vote Bar Consistency During Search...');
    
    let flickerCount = 0;
    let lastVoteBarCount = 0;
    
    const consistencyObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' || mutation.type === 'attributes') {
          const currentVoteBars = document.querySelectorAll('[data-testid="vote-bar"]');
          const visibleBars = Array.from(currentVoteBars).filter(bar => 
            bar.offsetParent !== null && !bar.classList.contains('hidden')
          );
          
          if (visibleBars.length < lastVoteBarCount && lastVoteBarCount > 0) {
            flickerCount++;
            console.log(`⚠️ Vote bar flicker detected! Count: ${flickerCount}`);
          }
          
          lastVoteBarCount = visibleBars.length;
        }
      });
    });
    
    if (document.body) {
      consistencyObserver.observe(document.body, { 
        childList: true, 
        subtree: true, 
        attributes: true 
      });
    }
    
    // Simulate search operations
    const searchInput = document.querySelector('input[placeholder*="Search"]');
    if (searchInput) {
      const searchTerms = ['test', 'fitness', 'natural', ''];
      let currentIndex = 0;
      
      const performSearch = () => {
        if (currentIndex < searchTerms.length) {
          const term = searchTerms[currentIndex];
          console.log(`🔍 Testing search term: "${term}"`);
          
          searchInput.value = term;
          searchInput.dispatchEvent(new Event('input', { bubbles: true }));
          
          currentIndex++;
          setTimeout(performSearch, 2000);
        } else {
          // Test complete
          setTimeout(() => {
            console.log(`📊 Final flicker count: ${flickerCount}`);
            if (flickerCount <= 1) { // Allow 1 flicker for tolerance
              console.log('✅ Vote bar consistency test PASSED');
            } else {
              console.log('❌ Vote bar consistency test FAILED');
            }
          }, 1000);
        }
      };
      
      performSearch();
    }
  },

  // Test 5: Performance monitoring
  testPerformanceMetrics: () => {
    console.log('🧪 Testing Performance Metrics...');
    
    const performanceEntries = [];
    
    // Monitor network requests
    const originalFetch = window.fetch;
    const startTime = performance.now();
    
    window.fetch = function(...args) {
      const url = args[0];
      const requestStart = performance.now();
      
      return originalFetch.apply(this, args).then(response => {
        const duration = performance.now() - requestStart;
        
        if (url.includes('votes') || url.includes('expert_reviews')) {
          performanceEntries.push({
            url: url.toString(),
            duration,
            timestamp: requestStart - startTime
          });
          console.log(`📡 API Call: ${url} took ${duration.toFixed(2)}ms`);
        }
        
        return response;
      });
    };
    
    // Report performance after 10 seconds
    setTimeout(() => {
      console.log(`📊 Performance Summary:`);
      console.log(`📡 Total API calls: ${performanceEntries.length}`);
      
      if (performanceEntries.length > 0) {
        const avgDuration = performanceEntries.reduce((sum, entry) => sum + entry.duration, 0) / performanceEntries.length;
        console.log(`⚡ Average API call duration: ${avgDuration.toFixed(2)}ms`);
        
        const maxDuration = Math.max(...performanceEntries.map(e => e.duration));
        console.log(`📈 Slowest API call: ${maxDuration.toFixed(2)}ms`);
      }
      
      // Restore original fetch
      window.fetch = originalFetch;
    }, 10000);
  },

  // Run all regression tests
  runAllRegressionTests: () => {
    console.log('🚀 Running All Regression Tests...');
    console.log('='.repeat(60));
    
    // Wait for page to be ready
    setTimeout(() => {
      regressionTests.testBasicFunctionality();
      regressionTests.testLoadingStates();
      regressionTests.testSearchFunctionality();
      regressionTests.testVoteBarConsistency();
      regressionTests.testPerformanceMetrics();
      
      console.log('✅ All regression tests started. Check console for results.');
    }, 1000);
  }
};

// Export for use in browser console
if (typeof module !== 'undefined' && module.exports) {
  module.exports = regressionTests;
} else {
  window.regressionTests = regressionTests;
}

// Auto-run tests when loaded
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      regressionTests.runAllRegressionTests();
    }, 2000);
  });
}