#!/usr/bin/env node

/**
 * Manual Test Guide for Real-time Review Updates
 * 
 * This script verifies the code changes and provides manual testing instructions
 */

const fs = require('fs');
const path = require('path');

function checkFileChanges() {
  console.log('🔍 Verifying Real-time Review Implementation\n');
  
  const checks = [];
  
  // Check 1: useRealTime.ts has callback support
  try {
    const useRealTimeContent = fs.readFileSync('./src/hooks/useRealTime.ts', 'utf8');
    const hasCallbackSupport = useRealTimeContent.includes('onReviewsUpdate?: () => void');
    checks.push({
      name: 'useRealTimeReviews hook enhanced with callback support',
      passed: hasCallbackSupport,
      details: hasCallbackSupport ? '✅ Callback parameter added' : '❌ Callback parameter missing'
    });
    
    const hasCallbackExecution = useRealTimeContent.includes('onReviewsUpdate()');
    checks.push({
      name: 'Real-time updates trigger callback',
      passed: hasCallbackExecution,
      details: hasCallbackExecution ? '✅ Callback execution found' : '❌ Callback execution missing'
    });
  } catch (e) {
    checks.push({
      name: 'useRealTime.ts file check',
      passed: false,
      details: '❌ Could not read useRealTime.ts'
    });
  }
  
  // Check 2: EnhancedUserReviews uses real-time
  try {
    const enhancedReviewsContent = fs.readFileSync('./src/components/EnhancedUserReviews.tsx', 'utf8');
    const hasRealTimeImport = enhancedReviewsContent.includes("import { useRealTimeReviews }");
    const hasRealTimeUsage = enhancedReviewsContent.includes('useRealTimeReviews(influencerId, refresh)');
    
    checks.push({
      name: 'EnhancedUserReviews imports real-time hook',
      passed: hasRealTimeImport,
      details: hasRealTimeImport ? '✅ Real-time hook imported' : '❌ Real-time hook not imported'
    });
    
    checks.push({
      name: 'EnhancedUserReviews connects to real-time updates',
      passed: hasRealTimeUsage,
      details: hasRealTimeUsage ? '✅ Real-time hook connected with refresh callback' : '❌ Real-time hook not connected'
    });
    
    // Check for removed manual refresh calls
    const hasManualRefresh = enhancedReviewsContent.includes('await refresh()');
    checks.push({
      name: 'Manual refresh calls removed from EnhancedUserReviews',
      passed: !hasManualRefresh,
      details: !hasManualRefresh ? '✅ Manual refresh calls removed' : '❌ Manual refresh calls still present'
    });
  } catch (e) {
    checks.push({
      name: 'EnhancedUserReviews.tsx file check',
      passed: false,
      details: '❌ Could not read EnhancedUserReviews.tsx'
    });
  }
  
  // Check 3: useSupabaseReviews has manual refresh removed
  try {
    const supabaseReviewsContent = fs.readFileSync('./src/hooks/useSupabaseReviews.ts', 'utf8');
    const hasManualRefresh = supabaseReviewsContent.includes('await fetchReviews()');
    
    checks.push({
      name: 'Manual refresh calls removed from useSupabaseReviews',
      passed: !hasManualRefresh,
      details: !hasManualRefresh ? '✅ Manual refresh calls removed' : '❌ Manual refresh calls still present'
    });
  } catch (e) {
    checks.push({
      name: 'useSupabaseReviews.ts file check',
      passed: false,
      details: '❌ Could not read useSupabaseReviews.ts'
    });
  }
  
  // Check 4: UserReviews also updated
  try {
    const userReviewsContent = fs.readFileSync('./src/components/UserReviews.tsx', 'utf8');
    const hasRealTimeWithCallback = userReviewsContent.includes('useRealTimeReviews(influencerId, fetchReviews)');
    
    checks.push({
      name: 'UserReviews component updated with real-time callback',
      passed: hasRealTimeWithCallback,
      details: hasRealTimeWithCallback ? '✅ Real-time callback connected' : '❌ Real-time callback not connected'
    });
  } catch (e) {
    checks.push({
      name: 'UserReviews.tsx file check',
      passed: false,
      details: '❌ Could not read UserReviews.tsx'
    });
  }
  
  return checks;
}

function printResults(checks) {
  console.log('📊 Implementation Verification Results:\n');
  
  let passedCount = 0;
  checks.forEach((check, index) => {
    console.log(`${index + 1}. ${check.name}`);
    console.log(`   ${check.details}`);
    if (check.passed) passedCount++;
    console.log('');
  });
  
  console.log(`\n📈 Summary: ${passedCount}/${checks.length} checks passed\n`);
  
  if (passedCount === checks.length) {
    console.log('🎉 All implementation checks passed!\n');
    return true;
  } else {
    console.log('⚠️ Some implementation checks failed. Please review the issues above.\n');
    return false;
  }
}

function printManualTestInstructions() {
  console.log('📋 Manual Testing Instructions:\n');
  console.log('🖥️ Since the dev server is running on http://localhost:8080/, follow these steps:\n');
  
  console.log('1. 🌐 Open TWO browser windows/tabs:');
  console.log('   - Tab 1: http://localhost:8080/');
  console.log('   - Tab 2: http://localhost:8080/ (same URL)');
  console.log('');
  
  console.log('2. 🎯 Navigate to the same influencer profile in both tabs');
  console.log('   - Click on any influencer card from the homepage');
  console.log('   - Make sure both tabs show the same influencer');
  console.log('');
  
  console.log('3. 🔐 Log in to Tab 1:');
  console.log('   - Click Login/Signup button');
  console.log('   - Complete authentication');
  console.log('   - Return to the influencer profile');
  console.log('');
  
  console.log('4. 🗳️ Test Real-time Review Submission:');
  console.log('   - In Tab 1: Click "Natty" or "Juicy" vote button');
  console.log('   - A review dialog should appear');
  console.log('   - Fill in the review text (e.g., "Testing real-time updates")');
  console.log('   - Click "Submit Review"');
  console.log('   - 🎯 WATCH Tab 2: The new review should appear immediately without refreshing!');
  console.log('');
  
  console.log('5. 👍 Test Real-time Reactions:');
  console.log('   - In Tab 1: Click the like/dislike buttons on any review');
  console.log('   - 🎯 WATCH Tab 2: The like/dislike counts should update immediately!');
  console.log('');
  
  console.log('6. 🗑️ Test Real-time Deletion (if you have admin access):');
  console.log('   - In Tab 1: Click delete button on a review (if visible)');
  console.log('   - 🎯 WATCH Tab 2: The review should disappear immediately!');
  console.log('');
  
  console.log('7. 🔄 Test Connection Recovery:');
  console.log('   - Navigate away from the influencer page and back');
  console.log('   - Real-time updates should still work');
  console.log('');
  
  console.log('✅ Expected Results:');
  console.log('   - Reviews appear in Tab 2 immediately after submission in Tab 1');
  console.log('   - Like/dislike counts update in real-time across tabs');
  console.log('   - No manual page refresh needed');
  console.log('   - Console shows "Real-time review update received" messages');
  console.log('');
  
  console.log('❌ If real-time updates DON\'T work:');
  console.log('   - Check browser console for WebSocket errors');
  console.log('   - Check network tab for Supabase connections');
  console.log('   - Verify Supabase real-time is enabled in your project');
  console.log('   - Check database RLS policies allow real-time subscriptions');
  console.log('');
  
  console.log('🐛 Debug Tips:');
  console.log('   - Open browser DevTools > Console in both tabs');
  console.log('   - Look for messages containing "real-time", "review update", "WebSocket"');
  console.log('   - Check Network tab for active WebSocket connections to Supabase');
  console.log('');
}

function checkDevServer() {
  console.log('🌐 Checking development server...\n');
  
  const http = require('http');
  
  return new Promise((resolve) => {
    const req = http.get('http://localhost:8080/', (res) => {
      console.log('✅ Development server is running on http://localhost:8080/');
      resolve(true);
    });
    
    req.on('error', () => {
      console.log('❌ Development server is not running on http://localhost:8080/');
      console.log('💡 Please run: npm run dev');
      resolve(false);
    });
    
    req.setTimeout(3000, () => {
      console.log('⏰ Development server check timed out');
      resolve(false);
    });
  });
}

// Main execution
async function main() {
  console.log('🚀 Real-time Review Updates - Test Verification\n');
  
  // Check implementation
  const checks = checkFileChanges();
  const implementationOk = printResults(checks);
  
  // Check dev server
  const serverRunning = await checkDevServer();
  
  if (implementationOk && serverRunning) {
    console.log('\n🎯 Ready for manual testing!');
    printManualTestInstructions();
  } else {
    console.log('\n⚠️ Please fix the issues above before testing.');
  }
}

main().catch(console.error);