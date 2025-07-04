import { chromium } from 'playwright';

async function testCurrentMerchUI() {
  console.log('🎨 Testing Current Merch UI and Planning Conversion Optimization...');
  
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
    
    console.log('🔍 Testing current UI state...');
    
    const currentUIAnalysis = await page.evaluate(() => {
      // Check if products are loading
      const productCards = document.querySelectorAll('[class*="Card"]');
      const loadingStates = document.querySelectorAll('[class*="animate-pulse"]');
      const buyButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
        btn.textContent && btn.textContent.includes('Buy'));
      
      // Check flash sale timer
      const flashSaleSection = document.querySelector('[class*="bg-gradient-to-r"]');
      const timerElements = document.querySelectorAll('[class*="bg-white/20"]');
      
      // Check juicy theme coverage
      const juicyElements = document.querySelectorAll('[class*="juicy"]');
      const heroSection = document.querySelector('h1').parentElement;
      
      // Check overall visual hierarchy
      const mainSections = document.querySelectorAll('div[class*="space-y"]');
      
      return {
        productsLoaded: productCards.length > 0,
        stillLoading: loadingStates.length > 0,
        buyButtonsPresent: buyButtons.length > 0,
        flashSalePresent: !!flashSaleSection,
        timerWorking: timerElements.length >= 3,
        juicyElementsCount: juicyElements.length,
        heroSectionClasses: heroSection ? heroSection.className : null,
        mainSectionsCount: mainSections.length,
        overallUILoaded: productCards.length > 0 && buyButtons.length > 0
      };
    });
    
    console.log('📊 Current UI Analysis:', JSON.stringify(currentUIAnalysis, null, 2));
    
    // Test visual hierarchy and conversion elements
    const conversionAnalysis = await page.evaluate(() => {
      // Check for urgency elements
      const urgencyElements = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent && (
          el.textContent.includes('Only') || 
          el.textContent.includes('left in stock') ||
          el.textContent.includes('FLASH SALE')
        ));
      
      // Check for trust signals
      const trustElements = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent && (
          el.textContent.includes('Guarantee') || 
          el.textContent.includes('Secure') ||
          el.textContent.includes('Money-back')
        ));
      
      // Check color scheme consistency
      const redElements = document.querySelectorAll('[class*="destructive"], [class*="red"]');
      const juicyElements = document.querySelectorAll('[class*="juicy"]');
      
      // Check visual spacing and layout
      const spacingElements = document.querySelectorAll('[class*="space-y"], [class*="gap"]');
      
      return {
        urgencyElementsCount: urgencyElements.length,
        trustElementsCount: trustElements.length,
        redElementsCount: redElements.length,
        juicyElementsCount: juicyElements.length,
        spacingElementsCount: spacingElements.length,
        hasStrongVisualHierarchy: urgencyElements.length > 0 && trustElements.length > 0
      };
    });
    
    console.log('📊 Conversion Analysis:', JSON.stringify(conversionAnalysis, null, 2));
    
    await page.screenshot({ 
      path: '/mnt/c/Users/joaop/Documents/Hobbies/natty-or-not-vote/current-merch-ui-analysis.png',
      fullPage: true 
    });
    
    console.log('\n🎯 UI IMPROVEMENT STRATEGY:');
    console.log('══════════════════════════════════════════════════');
    
    if (currentUIAnalysis.overallUILoaded) {
      console.log('✅ Products and UI are loading correctly');
      console.log('🎨 AREAS FOR CONVERSION OPTIMIZATION:');
      console.log('- Expand juicy pink theme throughout more elements');
      console.log('- Keep flash sale timer red for urgency');
      console.log('- Enhance visual hierarchy for buying psychology');
      console.log('- Add more visual elements that encourage purchases');
      console.log('- Improve spacing and layout for cleaner look');
    } else {
      console.log('❌ UI not loading properly - need to fix basic functionality first');
    }
    
    console.log('\n💡 CONVERSION-FOCUSED IMPROVEMENTS NEEDED:');
    console.log('1. Larger, more prominent product images');
    console.log('2. Stronger juicy pink accents and gradients');
    console.log('3. Better visual flow from hero → timer → product');
    console.log('4. More compelling call-to-action buttons');
    console.log('5. Enhanced urgency and scarcity indicators');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ 
      path: '/mnt/c/Users/joaop/Documents/Hobbies/natty-or-not-vote/merch-ui-test-error.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

testCurrentMerchUI().catch(console.error);