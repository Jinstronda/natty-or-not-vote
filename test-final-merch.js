import { chromium } from 'playwright';

async function testFinalMerch() {
  console.log('🎯 Testing Final Enhanced Merch Implementation...');
  
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
    
    await page.waitForTimeout(3000);
    
    console.log('🔍 Testing final implementation...');
    
    const finalAnalysis = await page.evaluate(() => {
      // Check products are loading
      const productCards = document.querySelectorAll('[class*="cursor-pointer"]');
      const productImages = document.querySelectorAll('img[src*="shopify"]');
      
      // Check image sizing and coverage
      const imageInfo = Array.from(productImages).map(img => {
        const rect = img.getBoundingClientRect();
        const styles = window.getComputedStyle(img);
        return {
          src: img.src,
          size: `${Math.round(rect.width)}x${Math.round(rect.height)}`,
          objectFit: styles.objectFit,
          visible: rect.width > 0 && rect.height > 0,
          fillsContainer: rect.width > 300 && rect.height > 300 // Good size for UI
        };
      });
      
      // Check for removed fake content
      const fakeDescription = Array.from(document.querySelectorAll('*')).find(el => 
        el.textContent && el.textContent.includes('Compact lighting device'));
      
      const fakeSocialProof = Array.from(document.querySelectorAll('*')).find(el => 
        el.textContent && el.textContent.includes('Join Thousands'));
      
      // Check flash sale timer is red
      const flashSaleTimer = document.querySelector('[class*="from-destructive"]');
      
      // Check buy buttons
      const buyButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
        btn.textContent && btn.textContent.includes('GET IT NOW'));
      
      // Check juicy theme
      const juicyElements = document.querySelectorAll('[class*="juicy"], [class*="pink-500"]');
      
      return {
        productsLoaded: productCards.length > 0,
        imagesLoaded: productImages.length > 0,
        imageInfo: imageInfo,
        imagesFillUI: imageInfo.some(img => img.fillsContainer),
        fakeDescriptionRemoved: !fakeDescription,
        fakeSocialProofRemoved: !fakeSocialProof,
        flashSaleIsRed: !!flashSaleTimer,
        buyButtonsWorking: buyButtons.length > 0,
        juicyThemeStrong: juicyElements.length > 10,
        overallSuccess: productCards.length > 0 && imageInfo.length > 0 && !fakeDescription && !fakeSocialProof
      };
    });
    
    console.log('📊 Final Analysis:', JSON.stringify(finalAnalysis, null, 2));
    
    await page.screenshot({ 
      path: '/mnt/c/Users/joaop/Documents/Hobbies/natty-or-not-vote/final-enhanced-merch.png',
      fullPage: true 
    });
    
    console.log('\n🎯 FINAL MERCH RESULTS:');
    console.log('══════════════════════════════════════════════════');
    
    if (finalAnalysis.overallSuccess) {
      console.log('🎉 SUCCESS: Enhanced merch page working perfectly!');
    } else {
      console.log('⚠️  Some issues still need fixing');
    }
    
    console.log(`✅ Products Loading: ${finalAnalysis.productsLoaded ? 'YES' : 'NO'}`);
    console.log(`✅ Images Fill UI: ${finalAnalysis.imagesFillUI ? 'YES' : 'NO'}`);
    console.log(`✅ Fake Description Removed: ${finalAnalysis.fakeDescriptionRemoved ? 'YES' : 'NO'}`);
    console.log(`✅ Fake Social Proof Removed: ${finalAnalysis.fakeSocialProofRemoved ? 'YES' : 'NO'}`);
    console.log(`✅ Flash Sale Red: ${finalAnalysis.flashSaleIsRed ? 'YES' : 'NO'}`);
    console.log(`✅ Juicy Theme Strong: ${finalAnalysis.juicyThemeStrong ? 'YES' : 'NO'}`);
    
    if (finalAnalysis.imageInfo.length > 0) {
      console.log('\n📸 IMAGE DETAILS:');
      finalAnalysis.imageInfo.forEach((img, i) => {
        console.log(`Image ${i + 1}: ${img.size} (${img.objectFit}) - Fills UI: ${img.fillsContainer ? 'YES' : 'NO'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ 
      path: '/mnt/c/Users/joaop/Documents/Hobbies/natty-or-not-vote/final-merch-error.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

testFinalMerch().catch(console.error);