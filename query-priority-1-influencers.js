#!/usr/bin/env node

/**
 * Priority 1 Influencer Image Analysis
 * 
 * This script queries the Supabase database to identify influencers 
 * that need immediate image fixes, as requested by the user.
 * 
 * Categories:
 * 1. Influencers with NO images (image IS NULL)
 * 2. Influencers with placeholder images (image LIKE '%placeholder%')
 * 3. Influencers with broken/suspicious links
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://nutgdqowaqjnxtedascw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51dGdkcW93YXFqbnh0ZWRhc2N3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0OTI4NDIsImV4cCI6MjA2NTA2ODg0Mn0.qMp-opvv1lDphYUYtRGL9XhFlexaEBHtpcSViW3p5_Y";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function queryPriority1Influencers() {
  console.log('🔍 PRIORITY 1 INFLUENCERS - IMAGE ANALYSIS');
  console.log('='.repeat(60));
  
  try {
    // 1. INFLUENCERS WITH NO IMAGES
    console.log('\n📊 1. INFLUENCERS WITH NO IMAGES (image IS NULL)');
    console.log('-'.repeat(50));
    
    const { data: noImages, error: noImagesError } = await supabase
      .from('influencers')
      .select('id, name, created_at, updated_at')
      .is('image', null);
    
    if (noImagesError) {
      console.error('❌ Error querying influencers with no images:', noImagesError);
    } else {
      console.log(`Found ${noImages.length} influencers with NO images:`);
      noImages.forEach((influencer, index) => {
        console.log(`  ${index + 1}. ID: ${influencer.id}`);
        console.log(`     Name: ${influencer.name}`);
        console.log(`     Created: ${influencer.created_at}`);
        console.log(`     Updated: ${influencer.updated_at}`);
        console.log('');
      });
    }

    // 2. INFLUENCERS WITH PLACEHOLDER IMAGES
    console.log('\n📊 2. INFLUENCERS WITH PLACEHOLDER IMAGES');
    console.log('-'.repeat(50));
    
    const { data: placeholderImages, error: placeholderError } = await supabase
      .from('influencers')
      .select('id, name, image, created_at')
      .or('image.ilike.%placeholder%,image.ilike.%dummy%,image.ilike.%sample%,image.ilike.%temp%');
    
    if (placeholderError) {
      console.error('❌ Error querying placeholder images:', placeholderError);
    } else {
      console.log(`Found ${placeholderImages.length} influencers with PLACEHOLDER images:`);
      placeholderImages.forEach((influencer, index) => {
        console.log(`  ${index + 1}. ID: ${influencer.id}`);
        console.log(`     Name: ${influencer.name}`);
        console.log(`     Image: ${influencer.image}`);
        console.log(`     Created: ${influencer.created_at}`);
        console.log('');
      });
    }

    // 3. INFLUENCERS WITH BROKEN/SUSPICIOUS LINKS
    console.log('\n📊 3. INFLUENCERS WITH BROKEN/SUSPICIOUS LINKS');
    console.log('-'.repeat(50));
    
    const { data: suspiciousImages, error: suspiciousError } = await supabase
      .from('influencers')
      .select('id, name, image, created_at')
      .or('image.ilike.http://%,image.ilike.%.svg%,image.ilike.data:%,image.ilike.%example.com%,image.ilike.%placeholder.com%,image.ilike.%dummyimage.com%,image.ilike.%wikipedia%');
    
    if (suspiciousError) {
      console.error('❌ Error querying suspicious images:', suspiciousError);
    } else {
      console.log(`Found ${suspiciousImages.length} influencers with SUSPICIOUS images:`);
      suspiciousImages.forEach((influencer, index) => {
        console.log(`  ${index + 1}. ID: ${influencer.id}`);
        console.log(`     Name: ${influencer.name}`);
        console.log(`     Image: ${influencer.image}`);
        console.log(`     Created: ${influencer.created_at}`);
        console.log('');
      });
    }

    // 4. COMPREHENSIVE SUMMARY
    console.log('\n📋 COMPREHENSIVE SUMMARY');
    console.log('='.repeat(60));
    
    const totalPriority1 = (noImages?.length || 0) + (placeholderImages?.length || 0) + (suspiciousImages?.length || 0);
    
    console.log(`📊 Total Priority 1 Influencers Needing Image Fixes: ${totalPriority1}`);
    console.log(`   • No Images: ${noImages?.length || 0}`);
    console.log(`   • Placeholder Images: ${placeholderImages?.length || 0}`);
    console.log(`   • Suspicious/Broken Links: ${suspiciousImages?.length || 0}`);
    
    // 5. COLLECT ALL UNIQUE IDs FOR TARGETING
    console.log('\n🎯 COMPLETE LIST OF PRIORITY 1 INFLUENCER IDs:');
    console.log('-'.repeat(50));
    
    const allPriority1Ids = new Set();
    
    if (noImages) {
      noImages.forEach(inf => allPriority1Ids.add(inf.id));
    }
    if (placeholderImages) {
      placeholderImages.forEach(inf => allPriority1Ids.add(inf.id));
    }
    if (suspiciousImages) {
      suspiciousImages.forEach(inf => allPriority1Ids.add(inf.id));
    }
    
    const priority1Array = Array.from(allPriority1Ids);
    console.log(`Total unique Priority 1 influencers: ${priority1Array.length}`);
    console.log('IDs:', priority1Array.join(', '));
    
    // 6. GENERATE TARGETED FIX QUERIES
    console.log('\n⚡ READY-TO-USE UPDATE QUERIES:');
    console.log('-'.repeat(50));
    
    if (priority1Array.length > 0) {
      console.log('-- Use these SQL queries to target the fixes:');
      console.log('');
      console.log('-- Query to select all Priority 1 influencers:');
      console.log(`SELECT id, name, image FROM influencers WHERE id IN ('${priority1Array.join("', '")}');`);
      console.log('');
      console.log('-- Template for bulk updates:');
      console.log('-- UPDATE influencers SET image = \'https://your-image-url.com/image.jpg\' WHERE id = \'influencer-id\';');
      console.log('');
      console.log('-- Remove NULL images for batch processing:');
      console.log('-- UPDATE influencers SET image = NULL WHERE image IS NULL;');
    }
    
    return {
      noImages: noImages || [],
      placeholderImages: placeholderImages || [],
      suspiciousImages: suspiciousImages || [],
      priority1Ids: priority1Array,
      totalCount: totalPriority1
    };
    
  } catch (error) {
    console.error('❌ Fatal error during database query:', error);
    throw error;
  }
}

// Run the analysis
queryPriority1Influencers()
  .then(result => {
    console.log('\n✅ Analysis completed successfully!');
    console.log(`📊 Final count: ${result.totalCount} Priority 1 influencers identified`);
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

export { queryPriority1Influencers };