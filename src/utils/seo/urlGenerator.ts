/**
 * SEO URL Generator
 * Generates SEO-friendly URLs and handles name-based routing
 */

export interface InfluencerUrlData {
  id: string;
  name: string;
  trending?: boolean;
  controversial?: boolean;
}

/**
 * Generate SEO-friendly slug from name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate both ID-based and name-based URLs for an influencer
 */
export function generateInfluencerUrls(influencer: InfluencerUrlData): {
  idUrl: string;
  nameUrl: string;
  canonicalUrl: string;
} {
  const slug = generateSlug(influencer.name);
  const idUrl = `/influencer/${influencer.id}`;
  const nameUrl = `/influencer/${slug}`;
  
  // Use name-based URL as canonical for SEO
  const canonicalUrl = `https://nattyorjuicy.com/influencer/${slug}`;
  
  return {
    idUrl,
    nameUrl,
    canonicalUrl,
  };
}

/**
 * Generate sitemap URLs with both ID and name-based routes
 */
export function generateSitemapUrls(influencers: InfluencerUrlData[]): Array<{
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}> {
  const urls: Array<{
    loc: string;
    lastmod: string;
    changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority: number;
  }> = [];

  influencers.forEach(influencer => {
    const { nameUrl, canonicalUrl } = generateInfluencerUrls(influencer);
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Calculate priority based on influence metrics
    let priority = 0.7; // Higher base priority for name-based URLs
    if (influencer.trending) priority += 0.2;
    if (influencer.controversial) priority += 0.1;
    priority = Math.min(1.0, priority);
    
    // Calculate change frequency
    let changefreq: 'daily' | 'weekly' | 'monthly' = 'monthly';
    if (influencer.trending) changefreq = 'daily';
    else if (influencer.controversial) changefreq = 'weekly';
    
    // Add name-based URL (canonical)
    urls.push({
      loc: canonicalUrl,
      lastmod: currentDate,
      changefreq,
      priority,
    });
    
    // Add ID-based URL with slightly lower priority (for backward compatibility)
    urls.push({
      loc: `https://nattyorjuicy.com/influencer/${influencer.id}`,
      lastmod: currentDate,
      changefreq,
      priority: priority - 0.1,
    });
  });

  return urls;
}

/**
 * Extract influencer ID from slug
 */
export function extractIdFromSlug(slug: string, influencers: InfluencerUrlData[]): string | null {
  const influencer = influencers.find(inf => generateSlug(inf.name) === slug);
  return influencer?.id || null;
}

/**
 * Generate search-friendly keywords for URL optimization
 */
export function generateSearchKeywords(name: string): string[] {
  const slug = generateSlug(name);
  return [
    `is-${slug}-juicy`,
    `is-${slug}-natural`,
    `${slug}-natty-or-juicy`,
    `${slug}-natural-or-enhanced`,
    `${slug}-steroid-use`,
    `${slug}-community-verdict`,
  ];
}

/**
 * Generate meta description optimized for search
 */
export function generateSearchOptimizedDescription(
  name: string,
  stats?: {
    nattyPercentage: number;
    juicyPercentage: number;
    totalVotes: number;
  }
): string {
  if (stats) {
    return `Is ${name} juicy? ${stats.nattyPercentage}% say natty, ${stats.juicyPercentage}% say juicy. Community analysis of ${name}'s natural vs enhanced status with ${stats.totalVotes} votes and expert reviews.`;
  }
  
  return `Is ${name} natural or juicy? Community analysis and expert reviews to determine if ${name} is enhanced or natural. Vote and discover the truth about ${name}'s physique.`;
}

/**
 * Generate title optimized for "is [name] juicy" searches
 */
export function generateSearchOptimizedTitle(
  name: string,
  stats?: {
    nattyPercentage: number;
    juicyPercentage: number;
    totalVotes: number;
  }
): string {
  if (stats) {
    return `Is ${name} Juicy? ${stats.nattyPercentage}% Natty | Community Verdict`;
  }
  
  return `Is ${name} Juicy? Natural vs Enhanced Analysis | Community Verdict`;
}