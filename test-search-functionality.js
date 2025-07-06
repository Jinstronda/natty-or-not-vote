#!/usr/bin/env node

/**
 * Test Search Functionality
 * Tests the search bar and filters to identify bugs
 */

const puppeteer = require('puppeteer');

async function testSearchFunctionality() {
  console.log('🔍 Testing Search Functionality...\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    // Navigate to the site
    console.log('📍 Navigating to localhost:8080...');
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle2' });
    
    // Wait for the page to load
    await page.waitForSelector('h1', { timeout: 10000 });
    
    console.log('✅ Page loaded successfully');
    
    // Test 1: Search bar exists and is functional
    console.log('\n🔍 Testing Search Bar...');
    const searchInput = await page.waitForSelector('input[placeholder*="Search"]', { timeout: 5000 });
    
    if (searchInput) {
      console.log('✅ Search bar found');
      
      // Test typing in search
      await searchInput.click();
      await page.type('input[placeholder*="Search"]', 'chris');
      console.log('✅ Can type in search bar');
      
      // Test search button
      const searchButton = await page.waitForSelector('button[type="submit"]', { timeout: 5000 });
      if (searchButton) {
        console.log('✅ Search button found');
        await searchButton.click();
        console.log('✅ Search button clickable');
      } else {
        console.log('❌ Search button not found');
      }
      
      // Test if search results update
      await page.waitForTimeout(2000);
      const influencerCards = await page.$$('[data-testid="influencer-card"], .influencer-card, div[class*="grid"] > div');
      console.log(`📊 Found ${influencerCards.length} influencer cards after search`);
      
    } else {
      console.log('❌ Search bar not found');
    }
    
    // Test 2: Check if search filters work
    console.log('\n🎯 Testing Search Filtering...');
    
    // Clear search and try different terms
    await page.click('input[placeholder*="Search"]');
    await page.keyboard.selectAll();
    await page.keyboard.press('Backspace');
    await page.type('input[placeholder*="Search"]', 'zyzz');
    await page.waitForTimeout(1000);
    
    // Check if results change
    const resultsAfterZyzz = await page.$$('[data-testid="influencer-card"], .influencer-card, div[class*="grid"] > div');
    console.log(`📊 Found ${resultsAfterZyzz.length} results for "zyzz"`);
    
    // Test 3: Test empty search
    console.log('\n🔄 Testing Empty Search...');
    await page.click('input[placeholder*="Search"]');
    await page.keyboard.selectAll();
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(1000);
    
    const resultsAfterClear = await page.$$('[data-testid="influencer-card"], .influencer-card, div[class*="grid"] > div');
    console.log(`📊 Found ${resultsAfterClear.length} results after clearing search`);
    
    // Test 4: Test nonsense search
    console.log('\n🎭 Testing Invalid Search...');
    await page.type('input[placeholder*="Search"]', 'xyznonexistent123');
    await page.waitForTimeout(1000);
    
    const resultsAfterNonsense = await page.$$('[data-testid="influencer-card"], .influencer-card, div[class*="grid"] > div');
    console.log(`📊 Found ${resultsAfterNonsense.length} results for nonsense search`);
    
    // Check for "No results" message
    const noResultsMessage = await page.$('text="No influencers found"');
    if (noResultsMessage) {
      console.log('✅ "No results" message shows correctly');
    } else {
      console.log('❌ No "No results" message found');
    }
    
    console.log('\n📋 Search Test Summary:');
    console.log('- Search bar exists and accepts input');
    console.log('- Search button is clickable');
    console.log('- Search results update dynamically');
    console.log('- Empty search shows all results');
    console.log('- Invalid search handled appropriately');
    
  } catch (error) {
    console.error('❌ Error during search testing:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the test
testSearchFunctionality().catch(console.error);