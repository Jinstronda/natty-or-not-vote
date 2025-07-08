// UI Fixes Test - Verify the two fixes work correctly
// Run this in browser console to test

const uiFixesTest = {
  // Test 1: Verify "No votes yet" only shows to authenticated users
  testNoVotesYetVisibility: () => {
    console.log('🧪 Testing "No votes yet" visibility...');
    
    // Look for any "No votes yet" text
    const noVotesElements = Array.from(document.querySelectorAll('*')).filter(el => 
      el.textContent && el.textContent.includes('No votes yet')
    );
    
    console.log(`📊 Found ${noVotesElements.length} "No votes yet" elements`);
    
    // Check if user is authenticated (look for authenticated user indicators)
    const authElements = document.querySelectorAll('[data-testid="user-menu"], .user-avatar, [href="/user/"]');
    const isAuthenticated = authElements.length > 0;
    
    console.log(`🔐 User authenticated: ${isAuthenticated}`);
    
    if (!isAuthenticated && noVotesElements.length > 0) {
      console.log('❌ FAILED: "No votes yet" showing to non-authenticated users');
      return false;
    } else if (isAuthenticated && noVotesElements.length === 0) {
      console.log('⚠️  Note: No "No votes yet" elements found (may be normal if all influencers have votes)');
      return true;
    } else {
      console.log('✅ PASSED: "No votes yet" visibility is correct');
      return true;
    }
  },
  
  // Test 2: Verify search bar has no loading indicators
  testSearchBarLoadingRemoval: () => {
    console.log('🧪 Testing search bar loading removal...');
    
    // Look for loading indicators in search bar
    const searchContainer = document.querySelector('form');
    if (!searchContainer) {
      console.log('❌ Search form not found');
      return false;
    }
    
    // Check for spinning loaders
    const spinners = searchContainer.querySelectorAll('.animate-spin');
    const loadingTexts = Array.from(searchContainer.querySelectorAll('*')).filter(el => 
      el.textContent && el.textContent.includes('Searching...')
    );
    
    console.log(`📊 Found ${spinners.length} spinners in search bar`);
    console.log(`📊 Found ${loadingTexts.length} "Searching..." texts`);
    
    if (spinners.length > 0) {
      console.log('❌ FAILED: Still has spinning loaders in search bar');
      return false;
    }
    
    if (loadingTexts.length > 0) {
      console.log('❌ FAILED: Still has "Searching..." text in search bar');
      return false;
    }
    
    // Check that search icon is clean (no loading states)
    const searchIcon = searchContainer.querySelector('svg');
    if (searchIcon && !searchIcon.classList.contains('animate-spin')) {
      console.log('✅ PASSED: Search bar has clean, static search icon');
      return true;
    }
    
    console.log('✅ PASSED: Search bar loading indicators removed');
    return true;
  },
  
  // Test 3: Verify search functionality still works
  testSearchFunctionality: () => {
    console.log('🧪 Testing search functionality still works...');
    
    const searchInput = document.querySelector('input[placeholder*="Search"]');
    if (!searchInput) {
      console.log('❌ Search input not found');
      return false;
    }
    
    const searchButton = document.querySelector('button[type="submit"]');
    if (!searchButton) {
      console.log('❌ Search button not found');
      return false;
    }
    
    // Check button text is clean
    if (searchButton.textContent.trim() === 'Search') {
      console.log('✅ PASSED: Search button has clean text');
    } else {
      console.log(`⚠️  Search button text: "${searchButton.textContent.trim()}"`);
    }
    
    // Test input functionality
    try {
      searchInput.value = 'test';
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      console.log('✅ PASSED: Search input accepts text');
      
      // Clear for next test
      searchInput.value = '';
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      
      return true;
    } catch (error) {
      console.log('❌ FAILED: Search input error:', error.message);
      return false;
    }
  },
  
  // Test 4: Verify vote bars still work correctly
  testVoteBarsStillWork: () => {
    console.log('🧪 Testing vote bars still work...');
    
    const voteBars = document.querySelectorAll('[data-testid="vote-bar"]');
    console.log(`📊 Found ${voteBars.length} vote bars`);
    
    if (voteBars.length > 0) {
      // Check first vote bar has proper structure
      const firstBar = voteBars[0];
      const percentages = firstBar.querySelectorAll('span');
      const hasPercentages = Array.from(percentages).some(span => 
        span.textContent && span.textContent.includes('%')
      );
      
      if (hasPercentages) {
        console.log('✅ PASSED: Vote bars have percentage displays');
        return true;
      } else {
        console.log('❌ FAILED: Vote bars missing percentage displays');
        return false;
      }
    } else {
      console.log('⚠️  No vote bars found (may be normal depending on auth state)');
      return true;
    }
  },
  
  // Run all UI fix tests
  runAllTests: () => {
    console.log('🚀 Running UI Fixes Tests...');
    console.log('='.repeat(50));
    
    const results = {
      noVotesYetVisibility: uiFixesTest.testNoVotesYetVisibility(),
      searchBarLoadingRemoval: uiFixesTest.testSearchBarLoadingRemoval(),
      searchFunctionality: uiFixesTest.testSearchFunctionality(),
      voteBarsStillWork: uiFixesTest.testVoteBarsStillWork()
    };
    
    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    console.log('');
    console.log('📊 UI FIXES TEST RESULTS:');
    console.log('='.repeat(50));
    console.log(`✅ Tests passed: ${passedTests}/${totalTests}`);
    
    if (passedTests === totalTests) {
      console.log('🎉 ALL UI FIXES WORKING CORRECTLY!');
    } else {
      console.log('⚠️  Some tests failed - check individual results above');
    }
    
    return results;
  }
};

// Export for use in browser console
if (typeof module !== 'undefined' && module.exports) {
  module.exports = uiFixesTest;
} else {
  window.uiFixesTest = uiFixesTest;
}

// Auto-run tests when loaded
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      uiFixesTest.runAllTests();
    }, 2000);
  });
}