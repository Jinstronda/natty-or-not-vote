import { chromium } from 'playwright';

async function testProductionMerch() {
  console.log('🌐 Testing Production Merch Page (nattyorjuicy.com)...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 
  });
  
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('🔍 Loading production merch page...');
    await page.goto('https://nattyorjuicy.com/merch', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(5000); // Give Shopify components time to load
    
    console.log('📊 Analyzing how products are actually rendered on production...');
    
    const productionAnalysis = await page.evaluate(() => {
      // Check for Shopify components
      const shopifyStore = document.querySelector('shopify-store');
      const shopifyContext = document.querySelector('shopify-list-context');
      const shopifyMedia = document.querySelectorAll('shopify-media');
      const shopifyData = document.querySelectorAll('shopify-data');
      
      // Check for actual product elements
      const productImages = document.querySelectorAll('img');
      const productCards = document.querySelectorAll('[class*="bg-card"]');
      const buyButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
        btn.textContent && btn.textContent.includes('Buy'));
      
      // Check if Shopify components have rendered content
      const shopifyContentLoaded = shopifyContext && shopifyContext.hasAttribute('shopify-content-loaded');
      
      // Get actual product data being displayed
      const visibleProducts = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent && el.textContent.includes('Lightning')).slice(0, 3);
      
      // Check image display
      const imageInfo = Array.from(productImages).map(img => ({
        src: img.src,
        alt: img.alt,
        size: `${img.offsetWidth}x${img.offsetHeight}`,
        loaded: img.complete && img.naturalWidth > 0,
        visible: img.offsetWidth > 0 && img.offsetHeight > 0
      })).filter(info => info.src.includes('shopify') || info.src.includes('Lightning'));
      
      return {
        shopifyStorePresent: !!shopifyStore,
        shopifyContextPresent: !!shopifyContext,
        shopifyMediaCount: shopifyMedia.length,
        shopifyDataCount: shopifyData.length,
        shopifyContentLoaded: shopifyContentLoaded,
        productCardsCount: productCards.length,
        buyButtonsCount: buyButtons.length,
        visibleProductsCount: visibleProducts.length,
        imageInfo: imageInfo,
        actuallyWorking: buyButtons.length > 0 && imageInfo.length > 0
      };
    });
    
    console.log('📊 Production Analysis:', JSON.stringify(productionAnalysis, null, 2));
    
    // Check if we can see the actual product template structure
    const templateStructure = await page.evaluate(() => {
      const shopifyContext = document.querySelector('shopify-list-context');
      if (shopifyContext) {
        const template = shopifyContext.querySelector('template');
        return {
          hasTemplate: !!template,
          templateHTML: template ? template.innerHTML.substring(0, 500) : null
        };
      }
      return { hasTemplate: false };
    });
    
    console.log('📊 Template Structure:', JSON.stringify(templateStructure, null, 2));
    
    await page.screenshot({ 
      path: '/mnt/c/Users/joaop/Documents/Hobbies/natty-or-not-vote/production-merch-analysis.png',
      fullPage: true 
    });
    
    console.log('\n🎯 PRODUCTION MERCH INSIGHTS:');
    console.log('══════════════════════════════════════════════════');
    
    if (productionAnalysis.actuallyWorking) {
      console.log('✅ Production merch page is working and showing products');
      console.log('💡 I can see how Shopify components should work');
      console.log('🔧 Need to fix localhost to match production setup');
    } else {
      console.log('❌ Production page also having issues');
    }
    
    console.log(`- Shopify Store: ${productionAnalysis.shopifyStorePresent ? '✅' : '❌'}`);
    console.log(`- Shopify Context: ${productionAnalysis.shopifyContextPresent ? '✅' : '❌'}`);
    console.log(`- Content Loaded: ${productionAnalysis.shopifyContentLoaded ? '✅' : '❌'}`);
    console.log(`- Product Images: ${productionAnalysis.imageInfo.length} found`);
    console.log(`- Buy Buttons: ${productionAnalysis.buyButtonsCount} found`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ 
      path: '/mnt/c/Users/joaop/Documents/Hobbies/natty-or-not-vote/production-merch-error.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

testProductionMerch().catch(console.error);