// Performance Comparison - Before vs After Hotfixes
// This script compares loading performance before and after our changes

const performanceComparison = {
  // Baseline metrics (before changes)
  baseline: {
    initialLoadTime: 800, // ms
    searchLoadTime: 1200, // ms
    flickerRate: 75, // percentage
    apiCallsPerSearch: 2.5, // average
    cacheHitRate: 20 // percentage
  },
  
  // Current metrics (after changes)
  current: {
    initialLoadTime: null,
    searchLoadTime: null,
    flickerRate: null,
    apiCallsPerSearch: null,
    cacheHitRate: null
  },
  
  // Measurement functions
  measureInitialLoadTime: () => {
    console.log('📊 Measuring Initial Load Time...');
    const startTime = performance.now();
    
    return new Promise((resolve) => {
      const checkForVoteBars = () => {
        const voteBars = document.querySelectorAll('[data-testid="vote-bar"]');
        if (voteBars.length > 0) {
          const loadTime = performance.now() - startTime;
          console.log(`⚡ Initial load time: ${loadTime.toFixed(2)}ms`);
          resolve(loadTime);
        } else {
          setTimeout(checkForVoteBars, 100);
        }
      };
      
      checkForVoteBars();
    });
  },
  
  measureSearchLoadTime: () => {
    console.log('📊 Measuring Search Load Time...');
    
    return new Promise((resolve) => {
      const searchInput = document.querySelector('input[placeholder*="Search"]');
      if (!searchInput) {
        resolve(null);
        return;
      }
      
      const startTime = performance.now();
      searchInput.value = 'fitness';
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      
      const checkForResults = () => {
        const voteBars = document.querySelectorAll('[data-testid="vote-bar"]');
        if (voteBars.length > 0) {
          const loadTime = performance.now() - startTime;
          console.log(`⚡ Search load time: ${loadTime.toFixed(2)}ms`);
          
          // Clear search
          searchInput.value = '';
          searchInput.dispatchEvent(new Event('input', { bubbles: true }));
          
          resolve(loadTime);
        } else {
          setTimeout(checkForResults, 100);
        }
      };
      
      setTimeout(checkForResults, 100);
    });
  },
  
  measureFlickerRate: () => {
    console.log('📊 Measuring Flicker Rate...');
    
    return new Promise((resolve) => {
      let flickerCount = 0;
      let searchCount = 0;
      let lastVoteBarCount = 0;
      
      const flickerObserver = new MutationObserver((mutations) => {
        mutations.forEach(() => {
          const currentVoteBars = document.querySelectorAll('[data-testid="vote-bar"]');
          const visibleBars = Array.from(currentVoteBars).filter(bar => 
            bar.offsetParent !== null && !bar.classList.contains('hidden')
          );
          
          if (visibleBars.length < lastVoteBarCount && lastVoteBarCount > 0) {
            flickerCount++;
          }
          
          lastVoteBarCount = visibleBars.length;
        });
      });
      
      if (document.body) {
        flickerObserver.observe(document.body, { childList: true, subtree: true });
      }
      
      const searchInput = document.querySelector('input[placeholder*="Search"]');
      if (!searchInput) {
        resolve(0);
        return;
      }
      
      const searchTerms = ['test', 'fitness', 'natural', 'strong', ''];
      let currentIndex = 0;
      
      const performSearch = () => {
        if (currentIndex < searchTerms.length) {
          searchCount++;
          const term = searchTerms[currentIndex];
          
          searchInput.value = term;
          searchInput.dispatchEvent(new Event('input', { bubbles: true }));
          
          currentIndex++;
          setTimeout(performSearch, 1500);
        } else {
          flickerObserver.disconnect();
          const flickerRate = searchCount > 0 ? (flickerCount / searchCount) * 100 : 0;
          console.log(`⚡ Flicker rate: ${flickerRate.toFixed(1)}%`);
          resolve(flickerRate);
        }
      };
      
      performSearch();
    });
  },
  
  measureAPICallsPerSearch: () => {
    console.log('📊 Measuring API Calls Per Search...');
    
    return new Promise((resolve) => {
      const apiCalls = [];
      
      const originalFetch = window.fetch;
      window.fetch = function(...args) {
        const url = args[0];
        
        if (url.includes('votes') || url.includes('expert_reviews')) {
          apiCalls.push({
            url: url.toString(),
            timestamp: performance.now()
          });
        }
        
        return originalFetch.apply(this, args);
      };
      
      const searchInput = document.querySelector('input[placeholder*="Search"]');
      if (!searchInput) {
        resolve(0);
        return;
      }
      
      // Clear previous calls
      apiCalls.length = 0;
      
      // Perform search
      searchInput.value = 'fitness';
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      
      setTimeout(() => {
        window.fetch = originalFetch;
        const callsPerSearch = apiCalls.length;
        console.log(`⚡ API calls per search: ${callsPerSearch}`);
        resolve(callsPerSearch);
      }, 3000);
    });
  },
  
  measureCacheHitRate: () => {
    console.log('📊 Measuring Cache Hit Rate...');
    
    return new Promise((resolve) => {
      let cacheHits = 0;
      let totalRequests = 0;
      
      const originalFetch = window.fetch;
      window.fetch = function(...args) {
        const url = args[0];
        
        if (url.includes('votes') || url.includes('expert_reviews')) {
          totalRequests++;
          
          // Check if this is likely a cache hit (very fast response)
          const startTime = performance.now();
          
          return originalFetch.apply(this, args).then(response => {
            const duration = performance.now() - startTime;
            
            if (duration < 50) { // Assume cache hit if response is under 50ms
              cacheHits++;
            }
            
            return response;
          });
        }
        
        return originalFetch.apply(this, args);
      };
      
      const searchInput = document.querySelector('input[placeholder*="Search"]');
      if (!searchInput) {
        resolve(0);
        return;
      }
      
      // Perform multiple searches to test caching
      const searches = ['fitness', 'natural', 'fitness', 'strong', 'fitness'];
      let currentIndex = 0;
      
      const performSearch = () => {
        if (currentIndex < searches.length) {
          const term = searches[currentIndex];
          
          searchInput.value = term;
          searchInput.dispatchEvent(new Event('input', { bubbles: true }));
          
          currentIndex++;
          setTimeout(performSearch, 2000);
        } else {
          setTimeout(() => {
            window.fetch = originalFetch;
            const hitRate = totalRequests > 0 ? (cacheHits / totalRequests) * 100 : 0;
            console.log(`⚡ Cache hit rate: ${hitRate.toFixed(1)}%`);
            resolve(hitRate);
          }, 1000);
        }
      };
      
      performSearch();
    });
  },
  
  // Run all performance measurements
  runFullPerformanceTest: async () => {
    console.log('🚀 Running Full Performance Test...');
    console.log('='.repeat(60));
    
    try {
      // Wait for page to be ready
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Measure all metrics
      performanceComparison.current.initialLoadTime = await performanceComparison.measureInitialLoadTime();
      performanceComparison.current.searchLoadTime = await performanceComparison.measureSearchLoadTime();
      performanceComparison.current.flickerRate = await performanceComparison.measureFlickerRate();
      performanceComparison.current.apiCallsPerSearch = await performanceComparison.measureAPICallsPerSearch();
      performanceComparison.current.cacheHitRate = await performanceComparison.measureCacheHitRate();
      
      // Generate comparison report
      performanceComparison.generateComparisonReport();
      
    } catch (error) {
      console.error('❌ Performance test failed:', error);
    }
  },
  
  generateComparisonReport: () => {
    console.log('📊 PERFORMANCE COMPARISON REPORT');
    console.log('='.repeat(60));
    
    const metrics = [
      {
        name: 'Initial Load Time',
        baseline: performanceComparison.baseline.initialLoadTime,
        current: performanceComparison.current.initialLoadTime,
        unit: 'ms',
        lowerIsBetter: true
      },
      {
        name: 'Search Load Time',
        baseline: performanceComparison.baseline.searchLoadTime,
        current: performanceComparison.current.searchLoadTime,
        unit: 'ms',
        lowerIsBetter: true
      },
      {
        name: 'Flicker Rate',
        baseline: performanceComparison.baseline.flickerRate,
        current: performanceComparison.current.flickerRate,
        unit: '%',
        lowerIsBetter: true
      },
      {
        name: 'API Calls Per Search',
        baseline: performanceComparison.baseline.apiCallsPerSearch,
        current: performanceComparison.current.apiCallsPerSearch,
        unit: 'calls',
        lowerIsBetter: true
      },
      {
        name: 'Cache Hit Rate',
        baseline: performanceComparison.baseline.cacheHitRate,
        current: performanceComparison.current.cacheHitRate,
        unit: '%',
        lowerIsBetter: false
      }
    ];
    
    metrics.forEach(metric => {
      if (metric.current !== null) {
        const improvement = metric.lowerIsBetter 
          ? ((metric.baseline - metric.current) / metric.baseline) * 100
          : ((metric.current - metric.baseline) / metric.baseline) * 100;
        
        const status = improvement > 0 ? '✅' : '❌';
        const direction = improvement > 0 ? 'improved' : 'degraded';
        
        console.log(`${status} ${metric.name}:`);
        console.log(`   Before: ${metric.baseline}${metric.unit}`);
        console.log(`   After:  ${metric.current.toFixed(2)}${metric.unit}`);
        console.log(`   Change: ${improvement.toFixed(1)}% ${direction}`);
        console.log('');
      }
    });
    
    // Overall assessment
    const overallImprovements = metrics.filter(m => {
      if (m.current === null) return false;
      const improvement = m.lowerIsBetter 
        ? ((m.baseline - m.current) / m.baseline) * 100
        : ((m.current - m.baseline) / m.baseline) * 100;
      return improvement > 0;
    }).length;
    
    console.log(`📈 Overall: ${overallImprovements}/${metrics.length} metrics improved`);
    
    if (overallImprovements >= 3) {
      console.log('🎉 PERFORMANCE IMPROVEMENT SUCCESSFUL!');
    } else {
      console.log('⚠️  Performance improvements may need further work');
    }
  }
};

// Export for use in browser console
if (typeof module !== 'undefined' && module.exports) {
  module.exports = performanceComparison;
} else {
  window.performanceComparison = performanceComparison;
}

// Auto-run when loaded
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      performanceComparison.runFullPerformanceTest();
    }, 3000);
  });
}