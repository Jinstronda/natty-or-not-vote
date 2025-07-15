#!/usr/bin/env node

/**
 * Script to generate search-optimized sitemaps
 * Run: npx tsx src/scripts/runSitemapGeneration.ts
 */

import { generateSearchOptimizedSitemaps } from '../utils/seo/searchOptimizedSitemap.js';

async function main() {
  try {
    console.log('🚀 Starting SEO sitemap generation...');
    await generateSearchOptimizedSitemaps();
    console.log('✅ SEO sitemaps generated successfully!');
    console.log('📝 Next steps:');
    console.log('1. Submit sitemap to Google Search Console');
    console.log('2. Update robots.txt with sitemap URLs');
    console.log('3. Monitor search rankings for target keywords');
  } catch (error) {
    console.error('❌ Error generating sitemaps:', error);
    process.exit(1);
  }
}

main();