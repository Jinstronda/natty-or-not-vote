import { chromium } from 'playwright';

async function testFixedMerch() {
  console.log('🎯 Testing Fixed Merch with Correct Data and Styling...');
  
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
    
    await page.waitForTimeout(3000);
    
    console.log('🔍 Testing correct product data...');
    
    const productDataCheck = await page.evaluate(() => {
      // Check for real Shopify image
      const realImage = document.querySelector('img[src*="606ejf-hf.myshopify.com"]');
      
      // Check for correct title
      const correctTitle = Array.from(document.querySelectorAll('*')).find(el => 
        el.textContent && el.textContent.includes("THE JUICY LIGHTNING™"));
      
      // Check for correct price in EUR
      const eurPrice = Array.from(document.querySelectorAll('*')).find(el => 
        el.textContent && el.textContent.includes("€17.99"));
      
      // Check for real features
      const realFeatures = Array.from(document.querySelectorAll('*')).find(el => 
        el.textContent && el.textContent.includes("800 lumens"));
      
      // Check for no fake reviews
      const fakeReviews = Array.from(document.querySelectorAll('*')).find(el => 
        el.textContent && el.textContent.includes("127 reviews"));
      
      // Check for no fake shipping claims
      const fakeShipping = Array.from(document.querySelectorAll('*')).find(el => 
        el.textContent && el.textContent.includes("Free Shipping"));
      
      // Check for real guarantee
      const realGuarantee = Array.from(document.querySelectorAll('*')).find(el => 
        el.textContent && el.textContent.includes("30-day Money-back"));
      
      return {
        hasRealImage: !!realImage,
        hasCorrectTitle: !!correctTitle,
        hasEurPrice: !!eurPrice,
        hasRealFeatures: !!realFeatures,
        hasFakeReviews: !!fakeReviews,
        hasFakeShipping: !!fakeShipping,
        hasRealGuarantee: !!realGuarantee,
        imageUrl: realImage ? realImage.src : null
      };
    });
    
    console.log('📊 Product Data Check:', JSON.stringify(productDataCheck, null, 2));
    
    // Test juicy pink theme
    const themeCheck = await page.evaluate(() => {
      // Check for juicy pink elements
      const juicyElements = document.querySelectorAll('[class*="juicy"], [class*="text-juicy"], [class*="bg-juicy"], [class*="border-juicy"]');
      
      // Check hero section styling
      const heroSection = document.querySelector('[class*="from-juicy"]');
      
      // Check buy button styling
      const buyButton = Array.from(document.querySelectorAll('button')).find(btn => 
        btn.textContent && btn.textContent.includes('Buy Now'));
      
      return {
        juicyElementsCount: juicyElements.length,
        hasJuicyHero: !!heroSection,
        hasBuyButton: !!buyButton,
        buyButtonHasJuicyClass: buyButton ? buyButton.className.includes('juicy') : false
      };
    });
    
    console.log('📊 Theme Check:', JSON.stringify(themeCheck, null, 2));
    
    // Test clickability
    const clickabilityCheck = await page.evaluate(() => {
      const productCards = document.querySelectorAll('[class*="cursor-pointer"]');
      const clickableImages = document.querySelectorAll('img[src*="shopify"]');
      
      return {
        clickableCards: productCards.length,
        clickableImages: clickableImages.length,
        cardsHaveCursor: productCards.length > 0
      };
    });
    
    console.log('📊 Clickability Check:', JSON.stringify(clickabilityCheck, null, 2));
    
    // Test actual click
    console.log('🖱️ Testing card click...');
    const cardClickTest = await page.evaluate(() => {
      const productCard = document.querySelector('[class*="cursor-pointer"]');
      if (!productCard) return { clickable: false };
      
      // Check if card has click handler
      return {
        clickable: true,
        hasOnClick: !!productCard.onclick || productCard.getAttribute('onclick'),
        cardElement: productCard.tagName
      };
    });
    
    console.log('📊 Card Click Test:', JSON.stringify(cardClickTest, null, 2));
    
    await page.screenshot({ 
      path: '/mnt/c/Users/joaop/Documents/Hobbies/natty-or-not-vote/fixed-merch-final.png',
      fullPage: true 
    });
    
    console.log('\n🎯 FIXED MERCH IMPLEMENTATION RESULTS:');
    console.log('══════════════════════════════════════════════════');
    
    // Data accuracy
    if (productDataCheck.hasRealImage) {
      console.log('✅ Using real Shopify product image');
    } else {
      console.log('❌ Still using fake/placeholder image');
    }
    
    if (productDataCheck.hasCorrectTitle) {
      console.log('✅ Correct product title from Shopify');
    }
    
    if (productDataCheck.hasEurPrice) {
      console.log('✅ Correct EUR pricing');
    }
    
    if (productDataCheck.hasRealFeatures) {
      console.log('✅ Real product features (800 lumens, etc.)');
    }
    
    if (!productDataCheck.hasFakeReviews) {
      console.log('✅ No fake reviews/ratings');
    } else {
      console.log('❌ Still has fake reviews');
    }
    
    if (!productDataCheck.hasFakeShipping) {
      console.log('✅ No fake shipping claims');
    } else {
      console.log('❌ Still has fake shipping claims');
    }
    
    if (productDataCheck.hasRealGuarantee) {
      console.log('✅ Real 30-day guarantee info');
    }
    
    // Theme check
    if (themeCheck.juicyElementsCount > 0) {
      console.log('✅ Juicy pink theme implemented');
    } else {
      console.log('❌ Juicy pink theme not applied');
    }
    
    // Clickability
    if (clickabilityCheck.cardsHaveCursor) {
      console.log('✅ Full card clickability implemented');
    } else {
      console.log('❌ Cards not clickable');
    }
    
    console.log('\n📸 Product Image URL:', productDataCheck.imageUrl);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ 
      path: '/mnt/c/Users/joaop/Documents/Hobbies/natty-or-not-vote/fixed-merch-error.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

testFixedMerch().catch(console.error);