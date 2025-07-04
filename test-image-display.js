import { chromium } from 'playwright';

async function testImageDisplay() {
  console.log('🖼️ Testing Product Image Display...');
  
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
    
    const imageAnalysis = await page.evaluate(() => {
      const productImages = document.querySelectorAll('img[src*="shopify"]');
      const allImages = document.querySelectorAll('img');
      
      if (productImages.length > 0) {
        const img = productImages[0];
        const rect = img.getBoundingClientRect();
        const styles = window.getComputedStyle(img);
        
        return {
          imageFound: true,
          imageSrc: img.src,
          imageAlt: img.alt,
          imageSize: `${rect.width}x${rect.height}`,
          objectFit: styles.objectFit,
          objectPosition: styles.objectPosition,
          loaded: img.complete && img.naturalWidth > 0,
          visible: rect.width > 0 && rect.height > 0,
          parentClasses: img.parentElement?.className
        };
      } else {
        return {
          imageFound: false,
          allImagesCount: allImages.length,
          allImagesSrcs: Array.from(allImages).map(img => img.src)
        };
      }
    });
    
    console.log('📊 Image Analysis:', JSON.stringify(imageAnalysis, null, 2));
    
    await page.screenshot({ 
      path: '/mnt/c/Users/joaop/Documents/Hobbies/natty-or-not-vote/image-display-test.png',
      fullPage: true 
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testImageDisplay().catch(console.error);