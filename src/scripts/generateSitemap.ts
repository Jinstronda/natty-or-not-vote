/**
 * Dynamic Sitemap Generator
 * Automatically generates XML sitemaps with real data from Supabase
 * Optimized for SEO with proper priorities and frequencies
 */

import { createClient } from '@supabase/supabase-js';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Types for sitemap entries
interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

interface InfluencerData {
  id: string;
  name: string;
  updated_at: string;
  total_votes?: number;
  natty_percentage?: number;
  trending?: boolean;
  controversial?: boolean;
}

interface ExpertData {
  id: string;
  name: string;
  updated_at: string;
  bio?: string;
}

// Supabase client setup
const SUPABASE_URL = "https://nutgdqowaqjnxtedascw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51dGdkcW93YXFqbnh0ZWRhc2N3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0OTI4NDIsImV4cCI6MjA2NTA2ODg0Mn0.qMp-opvv1lDphYUYtRGL9XhFlexaEBHtpcSViW3p5_Y";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Calculate priority based on influence metrics
 */
function calculateInfluencerPriority(influencer: InfluencerData): number {
  let priority = 0.6; // Base priority for influencers
  
  // Higher priority for trending influencers
  if (influencer.trending) {
    priority += 0.2;
  }
  
  // Higher priority for controversial influencers (more engagement)
  if (influencer.controversial) {
    priority += 0.1;
  }
  
  // Higher priority based on vote count
  if (influencer.total_votes) {
    if (influencer.total_votes > 100) priority += 0.1;
    if (influencer.total_votes > 500) priority += 0.1;
  }
  
  // Cap at 1.0
  return Math.min(1.0, priority);
}

/**
 * Calculate change frequency based on vote activity
 */
function calculateInfluencerChangeFreq(influencer: InfluencerData): SitemapUrl['changefreq'] {
  if (influencer.trending) return 'daily';
  if (influencer.controversial) return 'weekly';
  if (influencer.total_votes && influencer.total_votes > 50) return 'weekly';
  return 'monthly';
}

/**
 * Generate SEO-friendly slug from name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Fetch influencer data from database
 */
async function fetchInfluencers(): Promise<InfluencerData[]> {
  const { data, error } = await supabase
    .from('influencers_sorted_by_votes')
    .select(`
      id,
      name,
      updated_at,
      total_votes,
      natty_percentage,
      trending,
      controversial
    `)
    .order('total_votes', { ascending: false });

  if (error) {
    console.error('Error fetching influencers:', error);
    throw error;
  }

  return data || [];
}

/**
 * Fetch expert data from database
 */
async function fetchExperts(): Promise<ExpertData[]> {
  const { data, error } = await supabase
    .from('experts')
    .select(`
      id,
      name,
      updated_at,
      bio
    `)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching experts:', error);
    throw error;
  }

  return data || [];
}

/**
 * Generate static page URLs
 */
function generateStaticUrls(): SitemapUrl[] {
  const currentDate = new Date().toISOString().split('T')[0];
  
  return [
    {
      loc: 'https://nattyorjuicy.com/',
      lastmod: currentDate,
      changefreq: 'daily',
      priority: 1.0
    },
    {
      loc: 'https://nattyorjuicy.com/merch',
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: 0.9
    },
    {
      loc: 'https://nattyorjuicy.com/how-it-works',
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.8
    },
    {
      loc: 'https://nattyorjuicy.com/experts',
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: 0.8
    },
    {
      loc: 'https://nattyorjuicy.com/login',
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.6
    },
    {
      loc: 'https://nattyorjuicy.com/signup',
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.6
    },
    {
      loc: 'https://nattyorjuicy.com/terms',
      lastmod: currentDate,
      changefreq: 'yearly',
      priority: 0.3
    }
  ];
}

/**
 * Generate influencer page URLs
 */
function generateInfluencerUrls(influencers: InfluencerData[]): SitemapUrl[] {
  return influencers.map(influencer => {
    const slug = generateSlug(influencer.name);
    const lastmod = influencer.updated_at.split('T')[0];
    
    return {
      loc: `https://nattyorjuicy.com/influencer/${influencer.id}`,
      lastmod,
      changefreq: calculateInfluencerChangeFreq(influencer),
      priority: calculateInfluencerPriority(influencer)
    };
  });
}

/**
 * Generate expert page URLs
 */
function generateExpertUrls(experts: ExpertData[]): SitemapUrl[] {
  return experts.map(expert => {
    const slug = generateSlug(expert.name);
    const lastmod = expert.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0];
    
    return {
      loc: `https://nattyorjuicy.com/experts/${expert.id}`,
      lastmod,
      changefreq: 'monthly',
      priority: 0.7
    };
  });
}

/**
 * Generate XML sitemap string
 */
function generateXMLSitemap(urls: SitemapUrl[]): string {
  const urlsXML = urls.map(url => `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority.toFixed(1)}</priority>
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlsXML}
</urlset>`;
}

/**
 * Generate sitemap index for large datasets
 */
function generateSitemapIndex(): string {
  const currentDate = new Date().toISOString().split('T')[0];
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://nattyorjuicy.com/sitemap.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://nattyorjuicy.com/sitemaps/influencers.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://nattyorjuicy.com/sitemaps/experts.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
</sitemapindex>`;
}

/**
 * Generate separate sitemaps for different content types
 */
async function generateSeparateSitemaps(): Promise<void> {
  const influencers = await fetchInfluencers();
  const experts = await fetchExperts();
  
  // Generate influencers sitemap
  const influencerUrls = generateInfluencerUrls(influencers);
  const influencersSitemap = generateXMLSitemap(influencerUrls);
  
  // Generate experts sitemap
  const expertUrls = generateExpertUrls(experts);
  const expertsSitemap = generateXMLSitemap(expertUrls);
  
  // Write separate sitemap files
  const publicDir = resolve(process.cwd(), 'public');
  const sitemapsDir = resolve(publicDir, 'sitemaps');
  
  // Create sitemaps directory if it doesn't exist
  try {
    if (!existsSync(sitemapsDir)) {
      mkdirSync(sitemapsDir, { recursive: true });
    }
  } catch (error) {
    console.error('Error creating sitemaps directory:', error);
  }
  
  // Write sitemap files
  writeFileSync(resolve(sitemapsDir, 'influencers.xml'), influencersSitemap);
  writeFileSync(resolve(sitemapsDir, 'experts.xml'), expertsSitemap);
  
  console.log(`Generated influencers sitemap with ${influencerUrls.length} URLs`);
  console.log(`Generated experts sitemap with ${expertUrls.length} URLs`);
}

/**
 * Main sitemap generation function
 */
export async function generateSitemap(): Promise<string> {
  try {
    console.log('🚀 Generating dynamic sitemap...');
    
    // Fetch data from database
    const [influencers, experts] = await Promise.all([
      fetchInfluencers(),
      fetchExperts()
    ]);
    
    console.log(`📊 Found ${influencers.length} influencers and ${experts.length} experts`);
    
    // Generate URLs
    const staticUrls = generateStaticUrls();
    const influencerUrls = generateInfluencerUrls(influencers);
    const expertUrls = generateExpertUrls(experts);
    
    // Combine all URLs
    const allUrls = [...staticUrls, ...influencerUrls, ...expertUrls];
    
    // Sort by priority (descending) and then by lastmod (descending)
    allUrls.sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      return b.lastmod.localeCompare(a.lastmod);
    });
    
    // Generate XML sitemap
    const sitemap = generateXMLSitemap(allUrls);
    
    // Write main sitemap
    const publicDir = resolve(process.cwd(), 'public');
    writeFileSync(resolve(publicDir, 'sitemap.xml'), sitemap);
    
    // Generate separate sitemaps if dataset is large
    if (allUrls.length > 100) {
      await generateSeparateSitemaps();
      
      // Generate sitemap index
      const sitemapIndex = generateSitemapIndex();
      writeFileSync(resolve(publicDir, 'sitemap-index.xml'), sitemapIndex);
    }
    
    console.log(`✅ Generated sitemap with ${allUrls.length} URLs`);
    console.log(`📍 Priority distribution:`);
    console.log(`   - Priority 1.0: ${allUrls.filter(u => u.priority === 1.0).length} URLs`);
    console.log(`   - Priority 0.9: ${allUrls.filter(u => u.priority === 0.9).length} URLs`);
    console.log(`   - Priority 0.8: ${allUrls.filter(u => u.priority === 0.8).length} URLs`);
    console.log(`   - Priority 0.7: ${allUrls.filter(u => u.priority === 0.7).length} URLs`);
    console.log(`   - Priority 0.6: ${allUrls.filter(u => u.priority === 0.6).length} URLs`);
    
    return sitemap;
    
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    throw error;
  }
}

/**
 * Validate sitemap for SEO compliance
 */
export function validateSitemap(sitemap: string): {
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
    
    if (!sitemap.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')) {
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

/**
 * CLI command to generate sitemap
 */
async function runCLI() {
  try {
    const sitemap = await generateSitemap();
    const validation = validateSitemap(sitemap);
    
    console.log('\n📋 Sitemap Validation Results:');
    console.log(`✅ Valid: ${validation.isValid}`);
    console.log(`📊 Total URLs: ${validation.stats.totalUrls}`);
    console.log(`🎯 Average Priority: ${validation.stats.avgPriority.toFixed(2)}`);
    console.log(`⭐ High Priority URLs: ${validation.stats.highPriorityUrls}`);
    
    if (validation.errors.length > 0) {
      console.log('\n❌ Errors:');
      validation.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (validation.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      validation.warnings.forEach(warning => console.log(`  - ${warning}`));
    }
  } catch (error) {
    console.error('Failed to generate sitemap:', error);
    process.exit(1);
  }
}

// Check if script is run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runCLI();
}

// Export for use in other modules
export { fetchInfluencers, fetchExperts, generateStaticUrls, generateInfluencerUrls, generateExpertUrls, generateXMLSitemap };