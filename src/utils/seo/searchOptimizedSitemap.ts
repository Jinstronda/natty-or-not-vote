/**
 * Search-Optimized Sitemap Generator
 * Creates sitemaps specifically targeting "is [name] natural" and "is [name] on steroids" searches
 */

import { createClient } from '@supabase/supabase-js';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const SUPABASE_URL = "https://nutgdqowaqjnxtedascw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51dGdkcW93YXFqbnh0ZWRhc2N3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0OTI4NDIsImV4cCI6MjA2NTA2ODg0Mn0.qMp-opvv1lDphYUYtRGL9XhFlexaEBHtpcSViW3p5_Y";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface InfluencerData {
  id: string;
  name: string;
  updated_at: string;
  total_votes?: number;
  natty_percentage?: number;
  trending?: boolean;
  controversial?: boolean;
}

interface SearchOptimizedUrl {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
  keywords: string[];
  title: string;
  description: string;
}

/**
 * Generate SEO-friendly slug from name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

/**
 * Generate search-optimized keywords for "is [name] natural" searches
 */
function generateSearchKeywords(name: string): string[] {
  const slug = generateSlug(name);
  const firstName = name.split(' ')[0].toLowerCase();
  
  return [
    `is ${name.toLowerCase()} natural`,
    `is ${name.toLowerCase()} juicy`,
    `is ${name.toLowerCase()} on steroids`,
    `${name.toLowerCase()} natty or juice`,
    `${name.toLowerCase()} natural bodybuilding`,
    `${name.toLowerCase()} steroid use`,
    `${name.toLowerCase()} enhanced`,
    `${name.toLowerCase()} peds`,
    `${firstName} natural`,
    `${firstName} steroids`,
    `${slug} natty`,
    `${slug} juice`,
    `natty or juicy ${name.toLowerCase()}`,
    `steroids ${name.toLowerCase()}`,
    `natural ${name.toLowerCase()}`,
    `enhanced ${name.toLowerCase()}`,
    `${name.toLowerCase()} natty or not`,
    `${name.toLowerCase()} natural vs enhanced`,
    `${name.toLowerCase()} community verdict`,
    `${name.toLowerCase()} fitness verdict`
  ];
}

/**
 * Generate search-optimized title
 */
function generateSearchTitle(name: string, stats?: {
  nattyPercentage: number;
  totalVotes: number;
}): string {
  if (stats) {
    const verdict = stats.nattyPercentage > 50 ? 'Natural' : 'Enhanced';
    return `Is ${name} Natural? ${stats.nattyPercentage}% Say ${verdict} | Community Verdict`;
  }
  
  return `Is ${name} Natural or Enhanced? Community Analysis | Natty or Juicy`;
}

/**
 * Generate search-optimized description
 */
function generateSearchDescription(name: string, stats?: {
  nattyPercentage: number;
  juicyPercentage: number;
  totalVotes: number;
}): string {
  if (stats) {
    const verdict = stats.nattyPercentage > 50 ? 'natural' : 'enhanced';
    const confidence = Math.abs(stats.nattyPercentage - 50);
    const confidenceLevel = confidence > 30 ? 'strong' : confidence > 15 ? 'moderate' : 'split';
    
    return `Is ${name} natural or on steroids? ${stats.nattyPercentage}% say natural, ${stats.juicyPercentage}% say enhanced. ${confidenceLevel} community verdict with ${stats.totalVotes} votes. Expert analysis of ${name}'s physique, training, and natural vs enhanced status.`;
  }
  
  return `Is ${name} natural or enhanced? Community analysis and expert reviews to determine if ${name} is natty or juicy. Vote and discover the truth about ${name}'s natural bodybuilding status.`;
}

/**
 * Calculate search-optimized priority
 */
function calculateSearchPriority(influencer: InfluencerData): number {
  let priority = 0.7; // Base priority for search-optimized pages
  
  // Higher priority for popular influencers (more searches)
  if (influencer.total_votes && influencer.total_votes > 50) priority += 0.2;
  else if (influencer.total_votes && influencer.total_votes > 20) priority += 0.1;
  
  // Higher priority for trending (currently popular)
  if (influencer.trending) priority += 0.1;
  
  // Higher priority for controversial (more debate = more searches)
  if (influencer.controversial) priority += 0.1;
  
  return Math.min(1.0, priority);
}

/**
 * Generate search-optimized URLs for influencers
 */
function generateSearchOptimizedUrls(influencers: InfluencerData[]): SearchOptimizedUrl[] {
  const urls: SearchOptimizedUrl[] = [];
  
  influencers.forEach(influencer => {
    const slug = generateSlug(influencer.name);
    const lastmod = influencer.updated_at.split('T')[0];
    const priority = calculateSearchPriority(influencer);
    
    const stats = influencer.total_votes ? {
      nattyPercentage: influencer.natty_percentage || 50,
      juicyPercentage: 100 - (influencer.natty_percentage || 50),
      totalVotes: influencer.total_votes
    } : undefined;
    
    const keywords = generateSearchKeywords(influencer.name);
    const title = generateSearchTitle(influencer.name, stats);
    const description = generateSearchDescription(influencer.name, stats);
    
    // Name-based URL (primary for SEO)
    urls.push({
      loc: `https://nattyorjuicy.com/influencer/${slug}`,
      lastmod,
      changefreq: influencer.trending ? 'daily' : 'weekly',
      priority,
      keywords,
      title,
      description
    });
    
    // ID-based URL (for backward compatibility)
    urls.push({
      loc: `https://nattyorjuicy.com/influencer/${influencer.id}`,
      lastmod,
      changefreq: influencer.trending ? 'daily' : 'weekly',
      priority: priority - 0.1,
      keywords,
      title,
      description
    });
  });
  
  return urls;
}

/**
 * Generate static search-optimized URLs
 */
function generateStaticSearchUrls(): SearchOptimizedUrl[] {
  const currentDate = new Date().toISOString().split('T')[0];
  
  return [
    {
      loc: 'https://nattyorjuicy.com/',
      lastmod: currentDate,
      changefreq: 'daily',
      priority: 1.0,
      keywords: [
        'natty or juicy',
        'natural vs enhanced',
        'steroid detection',
        'bodybuilding natural',
        'fitness community',
        'natural bodybuilding analysis',
        'enhanced athlete detection',
        'steroid use analysis',
        'natty or not',
        'natural vs steroids'
      ],
      title: 'Natty or Juicy - Natural vs Enhanced Bodybuilding Community',
      description: 'Community-driven platform to determine if athletes are natural or enhanced. Vote and discover the truth about your favorite fitness influencers and bodybuilders.'
    },
    {
      loc: 'https://nattyorjuicy.com/experts',
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: 0.8,
      keywords: [
        'fitness experts',
        'bodybuilding experts',
        'natural bodybuilding experts',
        'steroid experts',
        'fitness analysis',
        'expert reviews',
        'professional fitness advice',
        'bodybuilding analysis'
      ],
      title: 'Fitness Experts Analysis - Professional Natural vs Enhanced Reviews',
      description: 'Expert analysis and reviews from professional trainers and bodybuilding experts on natural vs enhanced athletes.'
    },
    {
      loc: 'https://nattyorjuicy.com/how-it-works',
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.6,
      keywords: [
        'how to detect steroids',
        'natural vs enhanced guide',
        'steroid detection methods',
        'bodybuilding analysis',
        'fitness community voting'
      ],
      title: 'How to Detect Natural vs Enhanced Athletes - Complete Guide',
      description: 'Learn how to analyze and determine if athletes are natural or enhanced. Complete guide to detecting steroid use in bodybuilding.'
    }
  ];
}

/**
 * Generate XML sitemap with search optimization
 */
function generateSearchOptimizedXML(urls: SearchOptimizedUrl[]): string {
  const urlsXML = urls.map(url => `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority.toFixed(1)}</priority>
    <image:image>
      <image:loc>https://nattyorjuicy.com/LOGO.png</image:loc>
      <image:title>${url.title}</image:title>
      <image:caption>${url.description}</image:caption>
    </image:image>
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urlsXML}
</urlset>`;
}

/**
 * Generate search-optimized keywords sitemap
 */
function generateKeywordsSitemap(urls: SearchOptimizedUrl[]): string {
  const keywordEntries = urls.map(url => {
    const keywordsList = url.keywords.join(', ');
    return `
  <url>
    <loc>${url.loc}</loc>
    <keywords>${keywordsList}</keywords>
    <title>${url.title}</title>
    <description>${url.description}</description>
  </url>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${keywordEntries}
</urlset>`;
}

/**
 * Main function to generate search-optimized sitemaps
 */
export async function generateSearchOptimizedSitemaps(): Promise<void> {
  try {
    console.log('🔍 Generating search-optimized sitemaps...');
    
    // Fetch influencer data
    const { data: influencers, error } = await supabase
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

    if (error) throw error;

    console.log(`📊 Found ${influencers?.length || 0} influencers for SEO optimization`);

    // Generate search-optimized URLs
    const staticUrls = generateStaticSearchUrls();
    const influencerUrls = generateSearchOptimizedUrls(influencers || []);
    const allUrls = [...staticUrls, ...influencerUrls];

    // Sort by priority for maximum SEO impact
    allUrls.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return b.lastmod.localeCompare(a.lastmod);
    });

    // Create directories
    const publicDir = resolve(process.cwd(), 'public');
    const sitemapsDir = resolve(publicDir, 'sitemaps');
    
    if (!existsSync(sitemapsDir)) {
      mkdirSync(sitemapsDir, { recursive: true });
    }

    // Generate main search-optimized sitemap
    const mainSitemap = generateSearchOptimizedXML(allUrls);
    writeFileSync(resolve(publicDir, 'sitemap.xml'), mainSitemap);

    // Generate keyword-focused sitemap
    const keywordsSitemap = generateKeywordsSitemap(allUrls);
    writeFileSync(resolve(sitemapsDir, 'keywords.xml'), keywordsSitemap);

    // Generate separate influencer sitemap
    const influencerSitemap = generateSearchOptimizedXML(influencerUrls);
    writeFileSync(resolve(sitemapsDir, 'influencers.xml'), influencerSitemap);

    // Generate sitemap index
    const sitemapIndex = generateSitemapIndex();
    writeFileSync(resolve(publicDir, 'sitemap-index.xml'), sitemapIndex);

    console.log('✅ Search-optimized sitemaps generated successfully!');
    console.log(`📈 Total URLs: ${allUrls.length}`);
    console.log(`🎯 High priority URLs: ${allUrls.filter(u => u.priority >= 0.8).length}`);
    console.log(`🔍 Total keywords: ${allUrls.reduce((sum, url) => sum + url.keywords.length, 0)}`);
    
    // Log top search targets
    console.log('\n🎯 Top search targets:');
    allUrls.slice(0, 10).forEach((url, i) => {
      console.log(`${i + 1}. ${url.title} (${url.priority.toFixed(1)})`);
    });

  } catch (error) {
    console.error('❌ Error generating search-optimized sitemaps:', error);
    throw error;
  }
}

/**
 * Generate sitemap index
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
  <sitemap>
    <loc>https://nattyorjuicy.com/sitemaps/keywords.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
</sitemapindex>`;
}

/**
 * Export search data for use in components
 */
export { generateSearchKeywords, generateSearchTitle, generateSearchDescription, generateSlug };