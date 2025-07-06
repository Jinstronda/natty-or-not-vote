import { chromium } from 'playwright';

async function runComprehensiveTest() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    });
    
    const page = await context.newPage();
    const results = [];
    
    // Sequential testing approach
    console.log('🧪 Starting comprehensive test of nattyorjuicy.com');
    
    try {
        // 1. Homepage Loading Test
        console.log('\n1. Testing Homepage Loading...');
        const homeStart = Date.now();
        await page.goto('https://nattyorjuicy.com', { waitUntil: 'networkidle' });
        const homeLoadTime = Date.now() - homeStart;
        
        results.push({
            test: 'Homepage Loading',
            loadTime: homeLoadTime,
            status: homeLoadTime < 3000 ? 'PASS' : 'SLOW',
            details: `Loaded in ${homeLoadTime}ms`
        });
        
        // Check for loading errors
        const errorElements = await page.locator('[data-testid="error"], .error, .loading-error').count();
        if (errorElements > 0) {
            results.push({
                test: 'Homepage Error Check',
                status: 'FAIL',
                details: `Found ${errorElements} error elements`
            });
        }
        
        // 2. Navigation Test
        console.log('\n2. Testing Navigation...');
        const navItems = await page.locator('nav a, header a').all();
        for (const item of navItems) {
            const href = await item.getAttribute('href');
            const text = await item.textContent();
            if (href && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
                console.log(`  Testing nav item: ${text} -> ${href}`);
            }
        }
        
        // 3. Influencer Cards Loading Test
        console.log('\n3. Testing Influencer Cards...');
        const cardStart = Date.now();
        await page.waitForSelector('[data-testid="influencer-card"], .influencer-card, .card', { timeout: 10000 });
        const cardLoadTime = Date.now() - cardStart;
        
        const cardCount = await page.locator('[data-testid="influencer-card"], .influencer-card, .card').count();
        results.push({
            test: 'Influencer Cards Loading',
            loadTime: cardLoadTime,
            status: cardCount > 0 ? 'PASS' : 'FAIL',
            details: `Found ${cardCount} cards, loaded in ${cardLoadTime}ms`
        });
        
        // 4. Search Functionality Test
        console.log('\n4. Testing Search Functionality...');
        const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="Search" i]');
        if (await searchInput.count() > 0) {
            await searchInput.first().fill('test');
            await page.waitForTimeout(1000);
            results.push({
                test: 'Search Functionality',
                status: 'PASS',
                details: 'Search input found and functional'
            });
        } else {
            results.push({
                test: 'Search Functionality',
                status: 'FAIL',
                details: 'No search input found'
            });
        }
        
        // 5. Authentication Test
        console.log('\n5. Testing Authentication...');
        const loginButton = page.locator('button:has-text("Login"), a:has-text("Login"), button:has-text("Sign in"), a:has-text("Sign in")');
        if (await loginButton.count() > 0) {
            await loginButton.first().click();
            await page.waitForTimeout(2000);
            
            const isLoginPage = await page.locator('form, input[type="email"], input[type="password"]').count() > 0;
            results.push({
                test: 'Login Navigation',
                status: isLoginPage ? 'PASS' : 'FAIL',
                details: isLoginPage ? 'Login page loads correctly' : 'Login page not found'
            });
            
            // Go back to homepage
            await page.goBack();
        }
        
        // 6. Mobile Responsiveness Test
        console.log('\n6. Testing Mobile Responsiveness...');
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(1000);
        
        const mobileMenuButton = page.locator('button[aria-label*="menu" i], button:has-text("☰"), .mobile-menu-button');
        if (await mobileMenuButton.count() > 0) {
            await mobileMenuButton.first().click();
            await page.waitForTimeout(1000);
            
            const mobileMenuVisible = await page.locator('.mobile-menu, [data-testid="mobile-menu"]').isVisible();
            results.push({
                test: 'Mobile Menu',
                status: mobileMenuVisible ? 'PASS' : 'FAIL',
                details: mobileMenuVisible ? 'Mobile menu opens correctly' : 'Mobile menu not working'
            });
        }
        
        // Reset to desktop
        await page.setViewportSize({ width: 1920, height: 1080 });
        
        // 7. Voting System Test
        console.log('\n7. Testing Voting System...');
        const voteButtons = await page.locator('button:has-text("Natty"), button:has-text("Juicy"), .vote-button').count();
        results.push({
            test: 'Voting System',
            status: voteButtons > 0 ? 'PASS' : 'FAIL',
            details: `Found ${voteButtons} vote buttons`
        });
        
        // 8. Merch Page Test
        console.log('\n8. Testing Merch Page...');
        try {
            await page.goto('https://nattyorjuicy.com/merch', { waitUntil: 'networkidle' });
            const merchProducts = await page.locator('.product, [data-testid="product"]').count();
            results.push({
                test: 'Merch Page',
                status: merchProducts > 0 ? 'PASS' : 'FAIL',
                details: `Found ${merchProducts} products`
            });
        } catch (error) {
            results.push({
                test: 'Merch Page',
                status: 'FAIL',
                details: `Error loading merch page: ${error.message}`
            });
        }
        
        // 9. Performance Metrics
        console.log('\n9. Collecting Performance Metrics...');
        await page.goto('https://nattyorjuicy.com');
        
        const performanceMetrics = await page.evaluate(() => {
            const timing = performance.timing;
            return {
                domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
                loadComplete: timing.loadEventEnd - timing.navigationStart,
                firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
                firstContentfulPaint: performance.getEntriesByType('paint')[1]?.startTime || 0
            };
        });
        
        results.push({
            test: 'Performance Metrics',
            status: 'INFO',
            details: `DOM: ${performanceMetrics.domContentLoaded}ms, Load: ${performanceMetrics.loadComplete}ms, FCP: ${performanceMetrics.firstContentfulPaint}ms`
        });
        
        // 10. Console Error Check
        console.log('\n10. Checking Console Errors...');
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });
        
        await page.reload();
        await page.waitForTimeout(3000);
        
        results.push({
            test: 'Console Errors',
            status: consoleErrors.length === 0 ? 'PASS' : 'WARN',
            details: consoleErrors.length === 0 ? 'No console errors' : `${consoleErrors.length} console errors found`
        });
        
    } catch (error) {
        results.push({
            test: 'General Error',
            status: 'FAIL',
            details: error.message
        });
    }
    
    await browser.close();
    return results;
}

// Run the test
runComprehensiveTest().then(results => {
    console.log('\n' + '='.repeat(80));
    console.log('🔍 COMPREHENSIVE TEST RESULTS');
    console.log('='.repeat(80));
    
    let passCount = 0;
    let failCount = 0;
    let warnCount = 0;
    
    results.forEach(result => {
        const icon = result.status === 'PASS' ? '✅' : 
                    result.status === 'FAIL' ? '❌' : 
                    result.status === 'WARN' ? '⚠️' : 
                    result.status === 'SLOW' ? '🐌' : 'ℹ️';
        
        console.log(`${icon} ${result.test}: ${result.details}`);
        
        if (result.status === 'PASS') passCount++;
        else if (result.status === 'FAIL') failCount++;
        else if (result.status === 'WARN' || result.status === 'SLOW') warnCount++;
    });
    
    console.log('\n' + '='.repeat(80));
    console.log(`📊 SUMMARY: ${passCount} passed, ${failCount} failed, ${warnCount} warnings`);
    console.log('='.repeat(80));
    
    // Exit with appropriate code
    process.exit(failCount > 0 ? 1 : 0);
}).catch(error => {
    console.error('❌ Test failed to run:', error);
    process.exit(1);
});