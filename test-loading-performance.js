import { chromium } from 'playwright';

async function runLoadingPerformanceTest() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    const results = [];
    const loadingIssues = [];
    
    // Track network requests
    const networkRequests = [];
    const failedRequests = [];
    const slowRequests = [];
    
    page.on('request', request => {
        networkRequests.push({
            url: request.url(),
            method: request.method(),
            timestamp: Date.now()
        });
    });
    
    page.on('response', response => {
        const request = networkRequests.find(r => r.url === response.url());
        if (request) {
            const loadTime = Date.now() - request.timestamp;
            
            if (!response.ok()) {
                failedRequests.push({
                    url: response.url(),
                    status: response.status(),
                    loadTime
                });
            } else if (loadTime > 3000) {
                slowRequests.push({
                    url: response.url(),
                    loadTime
                });
            }
        }
    });
    
    console.log('⏱️ Starting Loading Performance Analysis of nattyorjuicy.com');
    
    try {
        // Test 1: Initial Page Load Performance
        console.log('\n1. Testing Initial Page Load...');
        const startTime = Date.now();
        
        await page.goto('https://nattyorjuicy.com', { 
            waitUntil: 'networkidle',
            timeout: 30000
        });
        
        const initialLoadTime = Date.now() - startTime;
        
        results.push({
            test: 'Initial Page Load',
            loadTime: initialLoadTime,
            status: initialLoadTime < 3000 ? 'PASS' : initialLoadTime < 5000 ? 'SLOW' : 'FAIL',
            details: `${initialLoadTime}ms`
        });
        
        // Test 2: Dom Content Loaded vs Full Load
        console.log('\n2. Testing DOM vs Full Load Times...');
        const performanceMetrics = await page.evaluate(() => {
            const navigation = performance.getEntriesByType('navigation')[0];
            return {
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                responseStart: navigation.responseStart - navigation.fetchStart,
                responseEnd: navigation.responseEnd - navigation.fetchStart,
                transferSize: navigation.transferSize,
                encodedBodySize: navigation.encodedBodySize,
                decodedBodySize: navigation.decodedBodySize
            };
        });
        
        results.push({
            test: 'DOM Content Loaded',
            loadTime: performanceMetrics.domContentLoaded,
            status: performanceMetrics.domContentLoaded < 1000 ? 'PASS' : 'SLOW',
            details: `${Math.round(performanceMetrics.domContentLoaded)}ms`
        });
        
        results.push({
            test: 'Full Load Complete',
            loadTime: performanceMetrics.loadComplete,
            status: performanceMetrics.loadComplete < 2000 ? 'PASS' : 'SLOW',
            details: `${Math.round(performanceMetrics.loadComplete)}ms`
        });
        
        // Test 3: Resource Loading Analysis
        console.log('\n3. Analyzing Resource Loading...');
        const resourceTimings = await page.evaluate(() => {
            const resources = performance.getEntriesByType('resource');
            const analysis = {
                totalRequests: resources.length,
                slowResources: resources.filter(r => r.duration > 1000).length,
                largeResources: resources.filter(r => r.transferSize > 500000).length,
                failedResources: resources.filter(r => r.transferSize === 0 && r.duration > 0).length,
                resourceTypes: {}
            };
            
            resources.forEach(resource => {
                const type = resource.initiatorType || 'other';
                analysis.resourceTypes[type] = (analysis.resourceTypes[type] || 0) + 1;
            });
            
            return analysis;
        });
        
        results.push({
            test: 'Resource Loading',
            status: resourceTimings.slowResources === 0 ? 'PASS' : 'WARN',
            details: `${resourceTimings.totalRequests} requests, ${resourceTimings.slowResources} slow (>1s), ${resourceTimings.largeResources} large (>500KB)`
        });
        
        // Test 4: Progressive Loading (Content Appearing)
        console.log('\n4. Testing Progressive Content Loading...');
        await page.reload();
        
        const progressiveLoadingTest = await page.evaluate(() => {
            return new Promise((resolve) => {
                const startTime = Date.now();
                const checkpoints = [];
                
                const checkContent = () => {
                    const cards = document.querySelectorAll('[class*="card"], [class*="Card"]');
                    const images = document.querySelectorAll('img[src]');
                    const buttons = document.querySelectorAll('button');
                    
                    checkpoints.push({
                        time: Date.now() - startTime,
                        cards: cards.length,
                        images: images.length,
                        buttons: buttons.length,
                        loadedImages: Array.from(images).filter(img => img.complete).length
                    });
                    
                    if (checkpoints.length < 10) {
                        setTimeout(checkContent, 500);
                    } else {
                        resolve(checkpoints);
                    }
                };
                
                checkContent();
            });
        });
        
        const finalCheckpoint = progressiveLoadingTest[progressiveLoadingTest.length - 1];
        results.push({
            test: 'Progressive Loading',
            status: finalCheckpoint.cards > 0 ? 'PASS' : 'FAIL',
            details: `${finalCheckpoint.cards} cards, ${finalCheckpoint.loadedImages}/${finalCheckpoint.images} images loaded`
        });
        
        // Test 5: Image Loading Performance
        console.log('\n5. Testing Image Loading...');
        const imageLoadingTest = await page.evaluate(() => {
            const images = document.querySelectorAll('img[src]');
            const imageResults = [];
            
            images.forEach((img, index) => {
                const startTime = Date.now();
                
                if (img.complete) {
                    imageResults.push({
                        index,
                        src: img.src,
                        loadTime: 0,
                        width: img.naturalWidth,
                        height: img.naturalHeight,
                        status: 'already-loaded'
                    });
                } else {
                    img.onload = () => {
                        imageResults.push({
                            index,
                            src: img.src,
                            loadTime: Date.now() - startTime,
                            width: img.naturalWidth,
                            height: img.naturalHeight,
                            status: 'loaded'
                        });
                    };
                    
                    img.onerror = () => {
                        imageResults.push({
                            index,
                            src: img.src,
                            loadTime: Date.now() - startTime,
                            status: 'error'
                        });
                    };
                }
            });
            
            return {
                totalImages: images.length,
                results: imageResults
            };
        });
        
        await page.waitForTimeout(3000); // Wait for images to load
        
        const imageResults = await page.evaluate(() => {
            const images = document.querySelectorAll('img[src]');
            return {
                total: images.length,
                loaded: Array.from(images).filter(img => img.complete && img.naturalWidth > 0).length,
                failed: Array.from(images).filter(img => img.complete && img.naturalWidth === 0).length
            };
        });
        
        results.push({
            test: 'Image Loading',
            status: imageResults.failed === 0 ? 'PASS' : 'FAIL',
            details: `${imageResults.loaded}/${imageResults.total} loaded, ${imageResults.failed} failed`
        });
        
        // Test 6: JavaScript Loading and Execution
        console.log('\n6. Testing JavaScript Loading...');
        const jsLoadingTest = await page.evaluate(() => {
            const scripts = document.querySelectorAll('script[src]');
            const hasReactLoaded = typeof window.React !== 'undefined';
            const hasGlobalErrors = window.onerror ? true : false;
            
            return {
                scriptCount: scripts.length,
                reactLoaded: hasReactLoaded,
                globalErrors: hasGlobalErrors,
                windowLoaded: document.readyState === 'complete'
            };
        });
        
        results.push({
            test: 'JavaScript Loading',
            status: jsLoadingTest.windowLoaded ? 'PASS' : 'FAIL',
            details: `${jsLoadingTest.scriptCount} scripts, React: ${jsLoadingTest.reactLoaded}, Window: ${jsLoadingTest.windowLoaded}`
        });
        
        // Test 7: API Loading (if any)
        console.log('\n7. Testing API Requests...');
        const apiRequests = networkRequests.filter(req => 
            req.url.includes('/api/') || 
            req.url.includes('supabase') || 
            req.url.includes('firebase') ||
            req.method === 'POST' ||
            req.url.includes('json')
        );
        
        results.push({
            test: 'API Requests',
            status: apiRequests.length > 0 ? 'INFO' : 'NONE',
            details: `${apiRequests.length} API requests detected`
        });
        
        // Test 8: Mobile Loading Performance
        console.log('\n8. Testing Mobile Loading...');
        await page.setViewportSize({ width: 375, height: 667 });
        
        const mobileStartTime = Date.now();
        await page.reload({ waitUntil: 'networkidle' });
        const mobileLoadTime = Date.now() - mobileStartTime;
        
        results.push({
            test: 'Mobile Loading',
            loadTime: mobileLoadTime,
            status: mobileLoadTime < 4000 ? 'PASS' : 'SLOW',
            details: `${mobileLoadTime}ms on mobile`
        });
        
        // Test 9: Slow Network Simulation
        console.log('\n9. Testing Slow Network Performance...');
        await page.setViewportSize({ width: 1920, height: 1080 });
        
        // Simulate slow 3G
        await context.route('**/*', route => {
            setTimeout(() => route.continue(), 100); // Add 100ms delay
        });
        
        const slowNetworkStart = Date.now();
        await page.reload({ waitUntil: 'domcontentloaded' });
        const slowNetworkTime = Date.now() - slowNetworkStart;
        
        results.push({
            test: 'Slow Network Loading',
            loadTime: slowNetworkTime,
            status: slowNetworkTime < 8000 ? 'PASS' : 'SLOW',
            details: `${slowNetworkTime}ms with simulated delay`
        });
        
        // Test 10: Cache Performance
        console.log('\n10. Testing Cache Performance...');
        await context.unroute('**/*'); // Remove slow network simulation
        
        const cacheTestStart = Date.now();
        await page.reload({ waitUntil: 'networkidle' });
        const cacheTestTime = Date.now() - cacheTestStart;
        
        results.push({
            test: 'Cache Performance',
            loadTime: cacheTestTime,
            status: cacheTestTime < initialLoadTime * 0.8 ? 'PASS' : 'SLOW',
            details: `${cacheTestTime}ms (${Math.round((cacheTestTime/initialLoadTime)*100)}% of initial load)`
        });
        
    } catch (error) {
        loadingIssues.push({
            type: 'Critical Loading Error',
            message: error.message,
            stack: error.stack
        });
    }
    
    await browser.close();
    return { results, loadingIssues, failedRequests, slowRequests, networkRequests };
}

// Run the loading performance test
runLoadingPerformanceTest().then(({ results, loadingIssues, failedRequests, slowRequests, networkRequests }) => {
    console.log('\n' + '='.repeat(120));
    console.log('⏱️ LOADING PERFORMANCE & BUGS ANALYSIS');
    console.log('='.repeat(120));
    
    let passCount = 0;
    let failCount = 0;
    let slowCount = 0;
    let totalLoadTime = 0;
    
    results.forEach(result => {
        const icon = result.status === 'PASS' ? '✅' : 
                    result.status === 'FAIL' ? '❌' : 
                    result.status === 'SLOW' ? '🐌' : 
                    result.status === 'WARN' ? '⚠️' : 'ℹ️';
        
        console.log(`${icon} ${result.test.padEnd(30)}: ${result.details}`);
        
        if (result.loadTime) totalLoadTime += result.loadTime;
        
        if (result.status === 'PASS') passCount++;
        else if (result.status === 'FAIL') failCount++;
        else if (result.status === 'SLOW') slowCount++;
    });
    
    console.log('\n' + '='.repeat(120));
    console.log(`📊 LOADING SUMMARY: ${passCount} passed, ${failCount} failed, ${slowCount} slow`);
    console.log(`⏱️ TOTAL LOAD TIME: ${totalLoadTime}ms across all tests`);
    
    if (failedRequests.length > 0) {
        console.log('\n🚨 FAILED REQUESTS:');
        failedRequests.forEach((req, i) => {
            console.log(`${i + 1}. ${req.status} - ${req.url} (${req.loadTime}ms)`);
        });
    }
    
    if (slowRequests.length > 0) {
        console.log('\n🐌 SLOW REQUESTS (>3s):');
        slowRequests.forEach((req, i) => {
            console.log(`${i + 1}. ${req.url} (${req.loadTime}ms)`);
        });
    }
    
    if (loadingIssues.length > 0) {
        console.log('\n🔥 LOADING ISSUES:');
        loadingIssues.forEach((issue, i) => {
            console.log(`${i + 1}. ${issue.type}: ${issue.message}`);
        });
    }
    
    console.log('\n📈 LOADING RECOMMENDATIONS:');
    if (slowCount > 0) {
        console.log('• Consider optimizing slow-loading resources');
    }
    if (failedRequests.length > 0) {
        console.log('• Fix failed network requests');
    }
    if (totalLoadTime > 10000) {
        console.log('• Overall loading time could be improved');
    }
    if (passCount > failCount) {
        console.log('• Overall loading performance is good');
    }
    
    console.log('='.repeat(120));
    
}).catch(error => {
    console.error('❌ Loading test failed:', error);
    process.exit(1);
});