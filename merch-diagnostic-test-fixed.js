import { chromium } from 'playwright';

async function diagnoseMerchPageFixed() {
  console.log('🔍 Sequential Thinking: Diagnosing Merch Page Issues (Fixed)...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:8080/merch', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('✅ Page loaded successfully');
    await page.waitForTimeout(3000);
    
    console.log('\n📋 STEP 3: TEST - Checking actual product rendering...');
    
    // Re-check product visibility after delay
    const delayedProductCheck = await page.evaluate(() => {
      const productCards = document.querySelectorAll('[class*="bg-card"]');
      const shopifyStore = document.querySelector('shopify-store');
      const shopifyContext = document.querySelector('shopify-list-context');
      
      // Check if actual product content is rendered
      const productContent = [];
      productCards.forEach((card, index) => {
        const hasProductInfo = card.innerHTML.includes('product.title') || 
                              card.innerHTML.includes('priceRange') ||
                              card.innerHTML.includes('Buy Now');
        productContent.push({
          index,
          hasProductInfo,
          innerHTML: card.innerHTML.substring(0, 200),
          visible: card.offsetWidth > 0 && card.offsetHeight > 0
        });
      });
      
      return {
        productCount: productCards.length,
        shopifyStoreLoaded: !!shopifyStore,
        shopifyContextLoaded: !!shopifyContext,
        productContent: productContent,
        anyActualProducts: productContent.some(p => p.hasProductInfo && p.visible)
      };
    });
    
    console.log('📊 Product Rendering Analysis:', JSON.stringify(delayedProductCheck, null, 2));
    
    // Check if Shopify components are actually working
    const shopifyStatus = await page.evaluate(() => {
      const shopifyStore = document.querySelector('shopify-store');
      const shopifyContext = document.querySelector('shopify-list-context');
      
      // Check if components have loaded content
      const hasShopifyContent = shopifyContext && shopifyContext.hasAttribute('shopify-content-loaded');
      
      // Check if template is being processed
      const template = shopifyContext ? shopifyContext.querySelector('template') : null;
      const templateContent = template ? template.innerHTML : null;
      
      return {
        shopifyStoreConnected: shopifyStore && shopifyStore.hasAttribute('store-domain'),
        shopifyContextProcessed: hasShopifyContent,
        templatePresent: !!template,
        templateContent: templateContent ? templateContent.substring(0, 300) : null,
        shopifyContextAttributes: shopifyContext ? 
          Array.from(shopifyContext.attributes).map(attr => attr.name) : []
      };
    });
    
    console.log('📊 Shopify Components Status:', JSON.stringify(shopifyStatus, null, 2));
    
    // Wait longer and check for actual Shopify product rendering
    console.log('\n📋 STEP 4: ITERATE - Waiting for Shopify product rendering...');
    await page.waitForTimeout(10000); // Wait 10 seconds for Shopify to load
    
    const finalProductCheck = await page.evaluate(() => {
      // Look for actual rendered product elements
      const productElements = document.querySelectorAll('[onclick*="shopify"]');
      const buyButtons = document.querySelectorAll('button[onclick*="shopify"]');
      const productImages = document.querySelectorAll('shopify-media');
      const productTitles = document.querySelectorAll('shopify-data[query*="title"]');
      const productPrices = document.querySelectorAll('shopify-data[query*="price"]');
      
      return {
        productElements: productElements.length,
        buyButtons: buyButtons.length,
        productImages: productImages.length,
        productTitles: productTitles.length,
        productPrices: productPrices.length,
        actualProductsVisible: productElements.length > 0 && buyButtons.length > 0
      };
    });
    
    console.log('📊 Final Product Check:', JSON.stringify(finalProductCheck, null, 2));
    
    // Take final screenshot
    await page.screenshot({ 
      path: '/mnt/c/Users/joaop/Documents/Hobbies/natty-or-not-vote/merch-diagnostic-final.png',
      fullPage: true 
    });
    
    console.log('\n🎯 SEQUENTIAL ANALYSIS CONCLUSION:');
    console.log('══════════════════════════════════════════════════');
    
    if (!finalProductCheck.actualProductsVisible) {
      console.log('❌ ROOT CAUSE IDENTIFIED: Shopify web components not rendering products');
      console.log('💡 ANALYSIS: Components are loaded but not fetching/displaying product data');
      console.log('🔧 LIKELY ISSUES:');
      console.log('   - Shopify access token may be invalid');
      console.log('   - Store domain configuration issue');
      console.log('   - Shopify API rate limiting');
      console.log('   - Custom web component library not functioning');
      console.log('   - Template rendering failing');
    } else {
      console.log('✅ Products are rendering correctly');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ 
      path: '/mnt/c/Users/joaop/Documents/Hobbies/natty-or-not-vote/merch-diagnostic-error-fixed.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

// Run the diagnostic
diagnoseMerchPageFixed().catch(console.error);