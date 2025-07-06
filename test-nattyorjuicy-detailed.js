import { chromium } from 'playwright';

async function runDetailedTest() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    const results = [];
    const consoleErrors = [];
    const networkErrors = [];
    
    // Capture console errors
    page.on('console', msg => {
        if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
        }
    });
    
    // Capture network errors
    page.on('response', response => {
        if (!response.ok()) {
            networkErrors.push(`${response.status()} ${response.url()}`);
        }
    });
    
    console.log('🔍 Starting detailed analysis of nattyorjuicy.com');
    
    try {
        // 1. Homepage Loading Analysis
        console.log('\n1. Analyzing Homepage Loading...');
        const homeStart = Date.now();
        
        await page.goto('https://nattyorjuicy.com', { 
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });
        
        const homeLoadTime = Date.now() - homeStart;
        
        // Wait for potential loading to complete
        await page.waitForTimeout(5000);
        
        // Check page title
        const title = await page.title();
        results.push({
            test: 'Page Title',
            status: title ? 'PASS' : 'FAIL',
            details: title || 'No title found'
        });
        
        // Check if React app loaded
        const reactRoot = await page.locator('#root, #__next, [data-reactroot]').count();
        results.push({
            test: 'React App Mount',
            status: reactRoot > 0 ? 'PASS' : 'FAIL',
            details: reactRoot > 0 ? 'React app mounted' : 'React app not detected'
        });
        
        // 2. Comprehensive Element Search
        console.log('\n2. Searching for UI Elements...');
        
        // Look for various selectors that might represent cards/content
        const potentialSelectors = [
            'div[class*="card"]',
            'div[class*="Card"]',
            'div[class*="influencer"]',
            'div[class*="Influencer"]',
            'div[class*="profile"]',
            'div[class*="Profile"]',
            'article',
            '[data-testid*="card"]',
            '[data-testid*="influencer"]',
            '.grid > div',
            '.grid-container > div',
            'main > div > div',
            'section > div'
        ];
        
        let foundElements = 0;
        for (const selector of potentialSelectors) {
            const count = await page.locator(selector).count();
            if (count > 0) {
                console.log(`  Found ${count} elements with selector: ${selector}`);
                foundElements += count;
            }
        }
        
        results.push({
            test: 'Content Elements',
            status: foundElements > 0 ? 'PASS' : 'FAIL',
            details: `Found ${foundElements} potential content elements`
        });
        
        // 3. Check for loading states
        console.log('\n3. Checking Loading States...');
        const loadingElements = await page.locator('[class*="loading"], [class*="Loading"], [class*="spinner"], [class*="skeleton"]').count();
        results.push({
            test: 'Loading Indicators',
            status: 'INFO',
            details: `Found ${loadingElements} loading indicators`
        });
        
        // 4. Navigation Analysis
        console.log('\n4. Analyzing Navigation...');
        const navElements = await page.locator('nav, header, [role="navigation"]').count();
        const navLinks = await page.locator('nav a, header a, [role="navigation"] a').count();
        
        results.push({
            test: 'Navigation Structure',
            status: navElements > 0 ? 'PASS' : 'FAIL',
            details: `Found ${navElements} nav containers, ${navLinks} nav links`
        });
        
        // Test specific navigation items
        const homeLink = await page.locator('a[href="/"], a:has-text("Home")').count();
        const merchLink = await page.locator('a[href="/merch"], a:has-text("Merch")').count();
        const loginLink = await page.locator('a[href="/login"], a:has-text("Login")').count();
        
        results.push({
            test: 'Navigation Links',
            status: 'INFO',
            details: `Home: ${homeLink}, Merch: ${merchLink}, Login: ${loginLink}`
        });
        
        // 5. Button Analysis
        console.log('\n5. Analyzing Buttons...');
        const buttons = await page.locator('button').count();
        const voteButtons = await page.locator('button:has-text("Natty"), button:has-text("Juicy"), button:has-text("Vote")').count();
        
        results.push({
            test: 'Button Elements',
            status: buttons > 0 ? 'PASS' : 'FAIL',
            details: `Found ${buttons} buttons total, ${voteButtons} vote-related buttons`
        });
        
        // 6. Image Analysis
        console.log('\n6. Analyzing Images...');
        const images = await page.locator('img').count();
        const imagesWithSrc = await page.locator('img[src]').count();
        
        results.push({
            test: 'Image Elements',
            status: images > 0 ? 'PASS' : 'FAIL',
            details: `Found ${images} img elements, ${imagesWithSrc} with src attribute`
        });
        
        // 7. Form Analysis
        console.log('\n7. Analyzing Forms...');
        const forms = await page.locator('form').count();
        const inputs = await page.locator('input').count();
        const searchInputs = await page.locator('input[type="search"], input[placeholder*="search" i]').count();
        
        results.push({
            test: 'Form Elements',
            status: 'INFO',
            details: `Found ${forms} forms, ${inputs} inputs, ${searchInputs} search inputs`
        });
        
        // 8. Mobile Responsiveness Test
        console.log('\n8. Testing Mobile View...');
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(2000);
        
        const mobileMenuButton = await page.locator('button[aria-label*="menu" i], button:has-text("☰"), .mobile-menu-button, [class*="mobile"]').count();
        results.push({
            test: 'Mobile Menu Button',
            status: mobileMenuButton > 0 ? 'PASS' : 'FAIL',
            details: `Found ${mobileMenuButton} mobile menu buttons`
        });
        
        // Reset viewport
        await page.setViewportSize({ width: 1920, height: 1080 });
        
        // 9. Performance Analysis
        console.log('\n9. Analyzing Performance...');
        const performanceMetrics = await page.evaluate(() => {
            const navigation = performance.getEntriesByType('navigation')[0];
            const paint = performance.getEntriesByType('paint');
            return {
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
                firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
                transferSize: navigation.transferSize,
                encodedBodySize: navigation.encodedBodySize
            };
        });
        
        results.push({
            test: 'Performance Metrics',
            status: performanceMetrics.firstContentfulPaint < 2000 ? 'PASS' : 'SLOW',
            details: `FCP: ${Math.round(performanceMetrics.firstContentfulPaint)}ms, Size: ${Math.round(performanceMetrics.transferSize/1024)}KB`
        });
        
        // 10. Page Source Analysis
        console.log('\n10. Analyzing Page Source...');
        const pageContent = await page.content();
        const hasReactDevTools = pageContent.includes('__REACT_DEVTOOLS_GLOBAL_HOOK__');
        const hasNextJS = pageContent.includes('__NEXT_DATA__');
        const hasVite = pageContent.includes('vite');
        
        results.push({
            test: 'Framework Detection',
            status: 'INFO',
            details: `React: ${hasReactDevTools}, Next.js: ${hasNextJS}, Vite: ${hasVite}`
        });
        
        // 11. Error Analysis
        results.push({
            test: 'Console Errors',
            status: consoleErrors.length === 0 ? 'PASS' : 'WARN',
            details: consoleErrors.length === 0 ? 'No console errors' : `${consoleErrors.length} errors: ${consoleErrors.slice(0, 3).join(', ')}`
        });
        
        results.push({
            test: 'Network Errors',
            status: networkErrors.length === 0 ? 'PASS' : 'WARN',
            details: networkErrors.length === 0 ? 'No network errors' : `${networkErrors.length} errors: ${networkErrors.slice(0, 3).join(', ')}`
        });
        
        // 12. Specific Route Testing
        console.log('\n12. Testing Specific Routes...');
        const routesToTest = ['/merch', '/login', '/signup'];
        
        for (const route of routesToTest) {
            try {
                await page.goto(`https://nattyorjuicy.com${route}`, { 
                    waitUntil: 'domcontentloaded',
                    timeout: 10000
                });
                
                const routeTitle = await page.title();
                const routeContent = await page.locator('main, #root, body').textContent();
                
                results.push({
                    test: `Route ${route}`,
                    status: routeContent.length > 100 ? 'PASS' : 'FAIL',
                    details: `Title: "${routeTitle}", Content: ${routeContent.length} chars`
                });
            } catch (error) {
                results.push({
                    test: `Route ${route}`,
                    status: 'FAIL',
                    details: `Error: ${error.message}`
                });
            }
        }
        
    } catch (error) {
        results.push({
            test: 'Critical Error',
            status: 'FAIL',
            details: error.message
        });
    }
    
    await browser.close();
    return { results, consoleErrors, networkErrors };
}

// Run the detailed test
runDetailedTest().then(({ results, consoleErrors, networkErrors }) => {
    console.log('\n' + '='.repeat(100));
    console.log('🔍 DETAILED WEBSITE ANALYSIS RESULTS');
    console.log('='.repeat(100));
    
    let passCount = 0;
    let failCount = 0;
    let warnCount = 0;
    let infoCount = 0;
    
    results.forEach(result => {
        const icon = result.status === 'PASS' ? '✅' : 
                    result.status === 'FAIL' ? '❌' : 
                    result.status === 'WARN' ? '⚠️' : 
                    result.status === 'SLOW' ? '🐌' : 'ℹ️';
        
        console.log(`${icon} ${result.test.padEnd(25)}: ${result.details}`);
        
        if (result.status === 'PASS') passCount++;
        else if (result.status === 'FAIL') failCount++;
        else if (result.status === 'WARN' || result.status === 'SLOW') warnCount++;
        else infoCount++;
    });
    
    console.log('\n' + '='.repeat(100));
    console.log(`📊 SUMMARY: ${passCount} passed, ${failCount} failed, ${warnCount} warnings, ${infoCount} info`);
    
    if (consoleErrors.length > 0) {
        console.log('\n🚨 CONSOLE ERRORS:');
        consoleErrors.forEach((error, i) => {
            console.log(`${i + 1}. ${error}`);
        });
    }
    
    if (networkErrors.length > 0) {
        console.log('\n🌐 NETWORK ERRORS:');
        networkErrors.forEach((error, i) => {
            console.log(`${i + 1}. ${error}`);
        });
    }
    
    console.log('='.repeat(100));
    
    // Exit with appropriate code
    process.exit(failCount > 0 ? 1 : 0);
}).catch(error => {
    console.error('❌ Test failed to run:', error);
    process.exit(1);
});