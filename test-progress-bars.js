#!/usr/bin/env node

/**
 * Test Progress Bars and Loading States
 * Tests voting bars, loading animations, and state management
 */

import puppeteer from 'puppeteer';

async function testProgressBars() {
  console.log('📊 Testing Progress Bars and Loading States...\n');
  
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
    
    // Test 1: Check loading skeletons
    console.log('\n🔄 Testing Loading Skeletons...');
    
    // Check for skeleton loaders
    const skeletons = await page.$$('[class*="skeleton"], [class*="animate-pulse"]');
    console.log(`📊 Found ${skeletons.length} skeleton loading elements`);
    
    // Test 2: Check progress bars on cards
    console.log('\n📊 Testing Progress Bars...');
    
    // Wait for cards to load
    await page.waitForSelector('[class*="grid"] > div', { timeout: 10000 });
    
    // Find progress bars
    const progressBars = await page.$$('[class*="rounded-full"][class*="h-2"], [class*="bg-juicy"], [class*="bg-natty"]');
    console.log(`📊 Found ${progressBars.length} progress bar elements`);
    
    // Test 3: Check vote percentages
    console.log('\n🔢 Testing Vote Percentages...');
    
    // Look for percentage text
    const percentages = await page.$$eval('*', (els) => {
      return els.filter(el => {
        const text = el.textContent || '';
        return text.includes('%') && (text.includes('Natty') || text.includes('Juicy'));
      }).length;
    });
    
    console.log(`📊 Found ${percentages} percentage displays`);
    
    // Test 4: Check loading states
    console.log('\n⏳ Testing Loading States...');
    
    // Check for loading spinners
    const loadingSpinners = await page.$$('[class*="animate-spin"], [class*="loading"]');
    console.log(`🔄 Found ${loadingSpinners.length} loading spinner elements`);
    
    // Test 5: Navigate to individual influencer page
    console.log('\n👤 Testing Individual Influencer Page...');
    
    const firstCard = await page.$('[class*="grid"] > div a');
    if (firstCard) {
      await firstCard.click();
      await page.waitForSelector('[class*="voting"], [class*="results"]', { timeout: 5000 });
      
      console.log('✅ Navigated to influencer page');
      
      // Check voting section progress bars
      const votingBars = await page.$$('[class*="rounded-full"][class*="h-4"], [class*="bg-juicy"], [class*="bg-natty"]');
      console.log(`📊 Found ${votingBars.length} voting progress bars`);
      
      // Check if percentages are displayed
      const detailPercentages = await page.$$eval('*', (els) => {
        return els.filter(el => {
          const text = el.textContent || '';
          return text.includes('%') && text.length < 10;
        }).length;
      });
      
      console.log(`📊 Found ${detailPercentages} percentage displays on detail page`);
      
    } else {
      console.log('❌ Could not find influencer card to click');
    }
    
    // Test 6: Test responsive behavior
    console.log('\n📱 Testing Responsive Behavior...');
    
    // Test mobile viewport
    await page.setViewport({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    const mobileBars = await page.$$('[class*="rounded-full"][class*="h-2"], [class*="bg-juicy"], [class*="bg-natty"]');
    console.log(`📊 Found ${mobileBars.length} progress bars on mobile`);
    
    // Test tablet viewport
    await page.setViewport({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    
    const tabletBars = await page.$$('[class*="rounded-full"][class*="h-2"], [class*="bg-juicy"], [class*="bg-natty"]');
    console.log(`📊 Found ${tabletBars.length} progress bars on tablet`);
    
    // Test desktop viewport
    await page.setViewport({ width: 1440, height: 900 });
    await page.waitForTimeout(1000);
    
    const desktopBars = await page.$$('[class*="rounded-full"][class*="h-2"], [class*="bg-juicy"], [class*="bg-natty"]');
    console.log(`📊 Found ${desktopBars.length} progress bars on desktop`);
    
    console.log('\n📋 Progress Bar Test Summary:');
    console.log(`- Skeleton loaders: ${skeletons.length > 0 ? '✅ Present' : '❌ Missing'}`);
    console.log(`- Progress bars: ${progressBars.length > 0 ? '✅ Present' : '❌ Missing'}`);
    console.log(`- Vote percentages: ${percentages > 0 ? '✅ Present' : '❌ Missing'}`);
    console.log(`- Loading spinners: ${loadingSpinners.length > 0 ? '✅ Present' : '❌ Missing'}`);
    console.log(`- Responsive design: ${mobileBars > 0 && tabletBars > 0 && desktopBars > 0 ? '✅ Working' : '❌ Issues'}`);
    
  } catch (error) {
    console.error('❌ Error during progress bar testing:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the test
testProgressBars().catch(console.error);