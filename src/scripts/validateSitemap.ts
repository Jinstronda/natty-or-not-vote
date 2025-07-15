/**
 * Sitemap Validation Script
 * Validates existing sitemaps for SEO compliance and performance
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

// Local validation function - copied from generateSitemap.ts
function validateSitemap(sitemap: string): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    totalUrls: number;
    avgPriority: number;
    highPriorityUrls: number;
  };
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check if sitemap is valid XML
  try {
    // Basic XML validation
    if (!sitemap.includes('<?xml version="1.0" encoding="UTF-8"?>')) {
      errors.push('Missing XML declaration');
    }
    
    if (!sitemap.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')) {
      errors.push('Missing or incorrect urlset declaration');
    }
    
    // Count URLs
    const urlMatches = sitemap.match(/<url>/g);
    const totalUrls = urlMatches ? urlMatches.length : 0;
    
    // Check sitemap size limits
    if (totalUrls > 50000) {
      errors.push('Sitemap exceeds 50,000 URL limit');
    }
    
    if (sitemap.length > 50 * 1024 * 1024) { // 50MB
      errors.push('Sitemap exceeds 50MB size limit');
    }
    
    // Extract priorities for analysis
    const priorityMatches = sitemap.match(/<priority>([\d.]+)<\/priority>/g);
    const priorities = priorityMatches ? priorityMatches.map(p => parseFloat(p.replace(/<\/?priority>/g, ''))) : [];
    
    const avgPriority = priorities.length > 0 ? priorities.reduce((a, b) => a + b, 0) / priorities.length : 0;
    const highPriorityUrls = priorities.filter(p => p >= 0.8).length;
    
    // Warnings for optimization
    if (avgPriority < 0.5) {
      warnings.push('Average priority is quite low, consider increasing priority for important pages');
    }
    
    if (highPriorityUrls / totalUrls > 0.3) {
      warnings.push('Too many high-priority URLs, consider adjusting priority distribution');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      stats: {
        totalUrls,
        avgPriority,
        highPriorityUrls
      }
    };
    
  } catch (error) {
    errors.push(`XML parsing error: ${error}`);
    return {
      isValid: false,
      errors,
      warnings,
      stats: {
        totalUrls: 0,
        avgPriority: 0,
        highPriorityUrls: 0
      }
    };
  }
}

const __filename = fileURLToPath(import.meta.url);

/**
 * Check if a URL is accessible
 */
async function checkURLAccessibility(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Validate sitemap file
 */
async function validateSitemapFile(filePath: string): Promise<void> {
  console.log(`\n🔍 Validating sitemap: ${filePath}`);
  
  if (!existsSync(filePath)) {
    console.error(`❌ Sitemap file not found: ${filePath}`);
    return;
  }
  
  try {
    const sitemap = readFileSync(filePath, 'utf-8');
    const validation = validateSitemap(sitemap);
    
    console.log(`📊 Validation Results:`);
    console.log(`  ✅ Valid: ${validation.isValid}`);
    console.log(`  📈 Total URLs: ${validation.stats.totalUrls}`);
    console.log(`  🎯 Average Priority: ${validation.stats.avgPriority.toFixed(2)}`);
    console.log(`  ⭐ High Priority URLs: ${validation.stats.highPriorityUrls}`);
    
    if (validation.errors.length > 0) {
      console.log(`\n❌ Errors (${validation.errors.length}):`);
      validation.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (validation.warnings.length > 0) {
      console.log(`\n⚠️  Warnings (${validation.warnings.length}):`);
      validation.warnings.forEach(warning => console.log(`  - ${warning}`));
    }
    
    // Test URL accessibility (sample)
    console.log(`\n🌐 Testing URL accessibility (sample)...`);
    const urlMatches = sitemap.match(/<loc>(.*?)<\/loc>/g);
    if (urlMatches) {
      const urls = urlMatches.map(match => match.replace(/<\/?loc>/g, ''));
      const sampleUrls = urls.slice(0, 5); // Test first 5 URLs
      
      for (const url of sampleUrls) {
        const isAccessible = await checkURLAccessibility(url);
        console.log(`  ${isAccessible ? '✅' : '❌'} ${url}`);
      }
    }
    
  } catch (error) {
    console.error(`❌ Error validating sitemap: ${error}`);
  }
}

/**
 * Main validation function
 */
async function runValidation(): Promise<void> {
  console.log('🚀 Starting sitemap validation...');
  
  const publicDir = resolve(process.cwd(), 'public');
  const sitemapsDir = resolve(publicDir, 'sitemaps');
  
  // Validate main sitemap
  await validateSitemapFile(resolve(publicDir, 'sitemap.xml'));
  
  // Validate sitemap index if exists
  const sitemapIndexPath = resolve(publicDir, 'sitemap-index.xml');
  if (existsSync(sitemapIndexPath)) {
    await validateSitemapFile(sitemapIndexPath);
  }
  
  // Validate separate sitemaps if they exist
  const influencersSitemapPath = resolve(sitemapsDir, 'influencers.xml');
  if (existsSync(influencersSitemapPath)) {
    await validateSitemapFile(influencersSitemapPath);
  }
  
  const expertsSitemapPath = resolve(sitemapsDir, 'experts.xml');
  if (existsSync(expertsSitemapPath)) {
    await validateSitemapFile(expertsSitemapPath);
  }
  
  console.log('\n✅ Sitemap validation complete!');
}

// Run validation if script is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runValidation().catch(error => {
    console.error('Validation failed:', error);
    process.exit(1);
  });
}

export { validateSitemapFile, runValidation };