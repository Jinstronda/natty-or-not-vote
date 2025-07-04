import { chromium } from 'playwright';

async function testEnhancedMerchUI() {
  console.log('🎨 Testing Enhanced Merch UI for Maximum Conversions...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 
  });
  
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:8080/merch', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait for the page to fully load
    await page.waitForTimeout(3000);
    
    console.log('🔍 Testing enhanced UI elements...');
    
    const enhancedUIAnalysis = await page.evaluate(() => {
      // Check for enhanced hero section
      const heroSection = document.querySelector('[class*="from-juicy/20"]');
      const heroTitle = document.querySelector('h1');
      const heroAnimations = document.querySelectorAll('[class*="animate-"]');
      
      // Check for enhanced flash sale timer (should be red)
      const flashSaleTimer = document.querySelector('[class*="from-destructive"]');
      const timerElements = document.querySelectorAll('[class*="bg-white/20"]');
      
      // Check for enhanced search section
      const searchInput = document.querySelector('input[placeholder*="perfect gear"]');
      const searchEnhancements = document.querySelectorAll('[class*="group"]');
      
      // Check for enhanced product cards
      const productCards = document.querySelectorAll('[class*="cursor-pointer"]');
      const buyButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
        btn.textContent && btn.textContent.includes('GET IT NOW'));
      
      // Check for juicy theme coverage
      const juicyElements = document.querySelectorAll('[class*="juicy"], [class*="pink-500"]');
      const gradientElements = document.querySelectorAll('[class*="gradient"]');
      
      // Check for social proof section
      const socialProofSection = Array.from(document.querySelectorAll('*')).find(el => 
        el.textContent && el.textContent.includes('Join Thousands'));
      
      // Check for loading skeletons
      const skeletonElements = document.querySelectorAll('[class*="animate-pulse"]');
      
      // Check for conversion elements
      const urgencyElements = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent && (
          el.textContent.includes('ONLY') || 
          el.textContent.includes('ORDER NOW') ||
          el.textContent.includes('FLASH SALE')
        ));
      
      const trustElements = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent && (
          el.textContent.includes('30-Day') || 
          el.textContent.includes('Guarantee') ||
          el.textContent.includes('Fast Shipping')
        ));
      
      return {
        heroEnhanced: !!heroSection && heroAnimations.length > 0,
        flashSaleRed: !!flashSaleTimer,
        timerWorking: timerElements.length >= 3,
        searchEnhanced: !!searchInput,
        productsLoaded: productCards.length > 0,
        buyButtonsEnhanced: buyButtons.length > 0,
        juicyThemeStrong: juicyElements.length > 10,
        gradientsPresent: gradientElements.length > 5,
        socialProofVisible: !!socialProofSection,
        loadingSkeletons: skeletonElements.length,
        urgencyElementsCount: urgencyElements.length,
        trustElementsCount: trustElements.length,
        overallUIEnhanced: heroSection && flashSaleTimer && juicyElements.length > 10
      };
    });
    
    console.log('📊 Enhanced UI Analysis:', JSON.stringify(enhancedUIAnalysis, null, 2));
    
    // Test conversion psychology elements
    const conversionPsychologyCheck = await page.evaluate(() => {
      // Check for scarcity elements
      const scarcityElements = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent && (
          el.textContent.includes('Only') || 
          el.textContent.includes('left in stock') ||
          el.textContent.includes('LIMITED')
        ));
      
      // Check for urgency elements  
      const urgencyTimers = document.querySelectorAll('[class*="animate-pulse"]');
      
      // Check for social proof badges
      const socialProofBadges = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent && (
          el.textContent.includes('BESTSELLER') || 
          el.textContent.includes('Premium Quality') ||
          el.textContent.includes('Satisfied Customers')
        ));
      
      // Check for price anchoring
      const priceElements = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent && el.textContent.includes('€'));
      
      const savingsElements = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent && el.textContent.includes('Save'));
      
      // Check for visual hierarchy
      const largeTexts = document.querySelectorAll('[class*="text-5xl"], [class*="text-4xl"], [class*="text-3xl"]');
      const boldTexts = document.querySelectorAll('[class*="font-black"], [class*="font-bold"]');
      
      return {
        scarcityElementsCount: scarcityElements.length,
        urgencyTimersCount: urgencyTimers.length,
        socialProofBadgesCount: socialProofBadges.length,
        priceElementsCount: priceElements.length,
        savingsElementsCount: savingsElements.length,
        visualHierarchyStrong: largeTexts.length > 3 && boldTexts.length > 5,
        conversionOptimized: scarcityElements.length > 0 && socialProofBadges.length > 0 && savingsElements.length > 0
      };
    });
    
    console.log('📊 Conversion Psychology Check:', JSON.stringify(conversionPsychologyCheck, null, 2));
    
    // Take comprehensive screenshots
    await page.screenshot({ 
      path: '/mnt/c/Users/joaop/Documents/Hobbies/natty-or-not-vote/enhanced-merch-ui-full.png',
      fullPage: true 
    });
    
    await page.screenshot({ 
      path: '/mnt/c/Users/joaop/Documents/Hobbies/natty-or-not-vote/enhanced-merch-ui-hero.png',
      clip: { x: 0, y: 0, width: 1440, height: 600 }
    });
    
    console.log('\n🎯 ENHANCED MERCH UI RESULTS:');
    console.log('══════════════════════════════════════════════════');
    
    // UI Enhancement Results
    if (enhancedUIAnalysis.overallUIEnhanced) {
      console.log('✅ Enhanced UI successfully implemented');
    } else {
      console.log('❌ UI enhancements need more work');
    }
    
    if (enhancedUIAnalysis.flashSaleRed) {
      console.log('✅ Flash sale timer kept RED for urgency');
    }
    
    if (enhancedUIAnalysis.juicyThemeStrong) {
      console.log('✅ Strong juicy pink theme throughout UI');
    } else {
      console.log('❌ Juicy theme needs more coverage');
    }
    
    if (enhancedUIAnalysis.productsLoaded) {
      console.log('✅ Products are loading and displaying');
    } else {
      console.log('❌ Products not loading - check component logic');
    }
    
    // Conversion Optimization Results
    if (conversionPsychologyCheck.conversionOptimized) {
      console.log('✅ Conversion psychology elements implemented');
    } else {
      console.log('❌ Need more conversion optimization elements');
    }
    
    console.log('\n🎨 UI ENHANCEMENT SUMMARY:');
    console.log(`- Juicy Elements: ${enhancedUIAnalysis.juicyThemeStrong ? '✅' : '❌'} ${enhancedUIAnalysis.juicyElementsCount || 0} elements`);
    console.log(`- Gradient Effects: ${enhancedUIAnalysis.gradientsPresent ? '✅' : '❌'} ${enhancedUIAnalysis.gradientElements || 0} gradients`);
    console.log(`- Urgency Elements: ${conversionPsychologyCheck.urgencyTimersCount > 0 ? '✅' : '❌'} ${conversionPsychologyCheck.urgencyTimersCount} timers`);
    console.log(`- Social Proof: ${conversionPsychologyCheck.socialProofBadgesCount > 0 ? '✅' : '❌'} ${conversionPsychologyCheck.socialProofBadgesCount} badges`);
    console.log(`- Trust Signals: ${enhancedUIAnalysis.trustElementsCount > 0 ? '✅' : '❌'} ${enhancedUIAnalysis.trustElementsCount} signals`);
    
    console.log('\n💡 CONVERSION FEATURES:');
    console.log('- Enhanced hero with animated backgrounds');
    console.log('- Larger, more prominent product images'); 
    console.log('- Stronger call-to-action buttons');
    console.log('- Scarcity and urgency indicators');
    console.log('- Social proof and trust badges');
    console.log('- Gradient text effects and visual hierarchy');
    console.log('- Enhanced loading states');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ 
      path: '/mnt/c/Users/joaop/Documents/Hobbies/natty-or-not-vote/enhanced-merch-ui-error.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

testEnhancedMerchUI().catch(console.error);