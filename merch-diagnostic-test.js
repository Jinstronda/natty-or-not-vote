import { chromium } from 'playwright';

async function diagnoseMerchPage() {
  console.log('🔍 Sequential Thinking: Diagnosing Merch Page Issues...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('\n📋 STEP 1: UNDERSTAND - Loading merch page...');
    
    // Monitor network requests
    const networkRequests = [];
    const networkFailures = [];
    
    page.on('request', request => {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType()
      });
    });
    
    page.on('requestfailed', request => {
      networkFailures.push({
        url: request.url(),
        failure: request.failure()
      });
    });
    
    // Monitor console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Load the page
    await page.goto('http://localhost:8080/merch', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('✅ Page loaded successfully');
    
    // Wait for initial loading state
    await page.waitForTimeout(3000);
    
    console.log('\n📋 STEP 2: HYPOTHESIZE - Checking for common issues...');
    
    // Check 1: Are Shopify components loading?
    const shopifyComponents = await page.evaluate(() => {
      const shopifyStore = document.querySelector('shopify-store');
      const shopifyContext = document.querySelector('shopify-list-context');
      
      return {
        shopifyStore: {
          present: !!shopifyStore,
          attributes: shopifyStore ? Array.from(shopifyStore.attributes).map(attr => ({
            name: attr.name,
            value: attr.value
          })) : [],
          innerHTML: shopifyStore ? shopifyStore.innerHTML.substring(0, 200) : null
        },
        shopifyContext: {
          present: !!shopifyContext,
          attributes: shopifyContext ? Array.from(shopifyContext.attributes).map(attr => ({
            name: attr.name,
            value: attr.value
          })) : [],
          innerHTML: shopifyContext ? shopifyContext.innerHTML.substring(0, 200) : null
        }
      };
    });
    
    console.log('📊 Shopify Components Analysis:', JSON.stringify(shopifyComponents, null, 2));
    
    // Check 2: Are products actually rendering?
    const productVisibility = await page.evaluate(() => {
      const loadingIndicator = document.querySelector('.animate-spin');
      const errorState = document.querySelector('#shopify-error');
      const productCards = document.querySelectorAll('[class*="bg-card"]');
      
      return {
        loadingVisible: loadingIndicator && !loadingIndicator.classList.contains('opacity-0'),
        errorVisible: errorState && !errorState.classList.contains('hidden'),
        productCount: productCards.length,
        productCards: Array.from(productCards).map(card => ({
          classes: card.className,
          hasContent: card.innerHTML.length > 100,
          visible: card.offsetWidth > 0 && card.offsetHeight > 0
        }))
      };
    });
    
    console.log('📊 Product Visibility Analysis:', JSON.stringify(productVisibility, null, 2));
    
    // Check 3: Flash sale timer working?
    const flashSaleTimer = await page.evaluate(() => {
      const timerElements = document.querySelectorAll('.bg-white\\/20');
      return {
        timerPresent: timerElements.length >= 3,
        timerValues: Array.from(timerElements).map(el => el.textContent?.trim()),
        timerVisible: Array.from(timerElements).every(el => el.offsetWidth > 0)
      };
    });
    
    console.log('📊 Flash Sale Timer Analysis:', JSON.stringify(flashSaleTimer, null, 2));
    
    // Check 4: Network issues?
    console.log('\n📊 Network Analysis:');
    console.log('Total requests:', networkRequests.length);
    console.log('Failed requests:', networkFailures.length);
    
    if (networkFailures.length > 0) {
      console.log('❌ Network Failures:', networkFailures);
    }
    
    // Check for Shopify-specific requests
    const shopifyRequests = networkRequests.filter(req => 
      req.url.includes('shopify') || req.url.includes('606ejf-hf')
    );
    console.log('Shopify requests:', shopifyRequests.length);
    
    // Check 5: Console errors?
    console.log('\n📊 Console Errors:');
    console.log('Total console errors:', consoleErrors.length);
    if (consoleErrors.length > 0) {
      console.log('❌ Console Errors:', consoleErrors);
    }
    
    // Check 6: Are custom web components defined?
    const webComponentsStatus = await page.evaluate(() => {
      return {
        shopifyStore: !!customElements.get('shopify-store'),
        shopifyListContext: !!customElements.get('shopify-list-context'),
        shopifyMedia: !!customElements.get('shopify-media'),
        shopifyData: !!customElements.get('shopify-data')
      };
    });
    
    console.log('📊 Web Components Status:', JSON.stringify(webComponentsStatus, null, 2));
    
    // Wait longer to see if anything loads
    console.log('\n📋 STEP 3: TEST - Waiting for delayed loading...');
    await page.waitForTimeout(5000);
    
    // Re-check product visibility after delay
    const delayedProductCheck = await page.evaluate(() => {
      const productCards = document.querySelectorAll('[class*="bg-card"]');
      const shopifyComponents = document.querySelectorAll('shopify-*');
      
      return {
        productCount: productCards.length,
        shopifyComponentCount: shopifyComponents.length,
        anyProductsVisible: Array.from(productCards).some(card => 
          card.offsetWidth > 0 && card.offsetHeight > 0 && card.innerHTML.length > 100
        )
      };
    });
    
    console.log('📊 Delayed Product Check:', JSON.stringify(delayedProductCheck, null, 2));
    
    // Take screenshot for visual inspection
    await page.screenshot({ 
      path: '/mnt/c/Users/joaop/Documents/Hobbies/natty-or-not-vote/merch-diagnostic-screenshot.png',
      fullPage: true 
    });
    
    console.log('\n🎯 SEQUENTIAL ANALYSIS SUMMARY:');
    console.log('══════════════════════════════════════════════════');
    
    // Determine root cause
    if (!webComponentsStatus.shopifyStore) {
      console.log('❌ ROOT CAUSE: Shopify web components not loaded/defined');
      console.log('💡 HYPOTHESIS: Missing Shopify web components library');
    } else if (networkFailures.length > 0) {
      console.log('❌ ROOT CAUSE: Network connectivity issues');
      console.log('💡 HYPOTHESIS: Shopify API calls failing');
    } else if (consoleErrors.length > 0) {
      console.log('❌ ROOT CAUSE: JavaScript errors preventing rendering');
      console.log('💡 HYPOTHESIS: Code execution failures');
    } else if (!delayedProductCheck.anyProductsVisible) {
      console.log('❌ ROOT CAUSE: Products not rendering despite components loading');
      console.log('💡 HYPOTHESIS: Template rendering or API response issues');
    } else {
      console.log('✅ No obvious issues detected - products appear to be loading');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ 
      path: '/mnt/c/Users/joaop/Documents/Hobbies/natty-or-not-vote/merch-diagnostic-error.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

// Run the diagnostic
diagnoseMerchPage().catch(console.error);