import { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { generateComprehensiveSEO, InfluencerKeywordInput } from '@/utils/seo/keywordGenerator';

export interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  canonicalUrl?: string;
  noindex?: boolean;
  nofollow?: boolean;
  ogType?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  alternateUrls?: { lang: string; url: string; }[];
  structuredData?: any;
}

export interface SEOMetrics {
  titleLength: number;
  descriptionLength: number;
  keywordsCount: number;
  hasImage: boolean;
  hasCanonical: boolean;
  hasStructuredData: boolean;
  isOptimized: boolean;
  score: number;
  recommendations: string[];
}

export interface SEOState {
  config: SEOConfig;
  metrics: SEOMetrics;
  isLoading: boolean;
  error: string | null;
}

/**
 * Centralized SEO Management Hook
 * Provides real-time meta tag updates and SEO optimization
 */
export function useSEO(initialConfig?: SEOConfig) {
  const location = useLocation();
  const navigate = useNavigate();
  const [state, setState] = useState<SEOState>({
    config: initialConfig || {},
    metrics: calculateSEOMetrics(initialConfig || {}),
    isLoading: false,
    error: null
  });

  // Update SEO configuration
  const updateSEO = useCallback((newConfig: Partial<SEOConfig>) => {
    setState(prev => {
      const updatedConfig = { ...prev.config, ...newConfig };
      return {
        ...prev,
        config: updatedConfig,
        metrics: calculateSEOMetrics(updatedConfig),
        error: null
      };
    });
  }, []);

  // Reset SEO to defaults
  const resetSEO = useCallback(() => {
    const defaultConfig: SEOConfig = {
      title: 'Natty or Juicy - Natural or Enhanced Fitness Analysis',
      description: 'Vote and analyze whether fitness influencers are natural or enhanced',
      keywords: ['natty or juicy', 'natural bodybuilding', 'fitness influencer', 'enhanced vs natural'],
      image: 'https://i.imgur.com/n0sDxaT.png',
      ogType: 'website',
      twitterCard: 'summary_large_image'
    };
    
    setState(prev => ({
      ...prev,
      config: defaultConfig,
      metrics: calculateSEOMetrics(defaultConfig),
      error: null
    }));
  }, []);

  // Generate SEO for influencer profile
  const generateInfluencerSEO = useCallback(async (input: InfluencerKeywordInput) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const seoData = generateComprehensiveSEO(input);
      
      const newConfig: SEOConfig = {
        title: seoData.recommendedTitle,
        description: seoData.recommendedDescription,
        keywords: seoData.targetKeywords,
        image: 'https://i.imgur.com/n0sDxaT.png', // Default, should be replaced with actual image
        canonicalUrl: `https://nattyorjuicy.com/influencer/${input.name.toLowerCase().replace(/\s+/g, '-')}`,
        ogType: 'profile',
        twitterCard: 'summary_large_image',
        structuredData: generatePersonSchema(input)
      };
      
      setState(prev => ({
        ...prev,
        config: newConfig,
        metrics: calculateSEOMetrics(newConfig),
        isLoading: false,
        error: null
      }));
      
      return seoData;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to generate SEO'
      }));
      throw error;
    }
  }, []);

  // Monitor SEO performance
  const monitorSEO = useCallback(() => {
    return {
      currentUrl: location.pathname,
      title: document.title,
      metaDescription: document.querySelector('meta[name="description"]')?.getAttribute('content'),
      canonicalUrl: document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
      ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute('content'),
      ogDescription: document.querySelector('meta[property="og:description"]')?.getAttribute('content'),
      ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute('content'),
      twitterCard: document.querySelector('meta[name="twitter:card"]')?.getAttribute('content'),
      structuredData: extractStructuredData()
    };
  }, [location]);

  // Validate SEO configuration
  const validateSEO = useCallback((config: SEOConfig): string[] => {
    const issues: string[] = [];
    
    if (!config.title) {
      issues.push('Title is required');
    } else if (config.title.length < 30) {
      issues.push('Title is too short (minimum 30 characters)');
    } else if (config.title.length > 60) {
      issues.push('Title is too long (maximum 60 characters)');
    }
    
    if (!config.description) {
      issues.push('Description is required');
    } else if (config.description.length < 120) {
      issues.push('Description is too short (minimum 120 characters)');
    } else if (config.description.length > 160) {
      issues.push('Description is too long (maximum 160 characters)');
    }
    
    if (!config.keywords || config.keywords.length === 0) {
      issues.push('Keywords are required');
    } else if (config.keywords.length < 3) {
      issues.push('Add more keywords (minimum 3)');
    } else if (config.keywords.length > 10) {
      issues.push('Too many keywords (maximum 10)');
    }
    
    if (!config.image) {
      issues.push('Image is required for social sharing');
    }
    
    if (!config.canonicalUrl) {
      issues.push('Canonical URL is recommended');
    }
    
    return issues;
  }, []);

  // Effect to update DOM when config changes
  useEffect(() => {
    const { config } = state;
    
    // Update document title
    if (config.title) {
      document.title = config.title;
    }
    
    // Update meta description
    updateMetaTag('name', 'description', config.description || '');
    
    // Update keywords
    if (config.keywords && config.keywords.length > 0) {
      updateMetaTag('name', 'keywords', config.keywords.join(', '));
    }
    
    // Update robots meta tag
    const robotsContent = [
      config.noindex ? 'noindex' : 'index',
      config.nofollow ? 'nofollow' : 'follow'
    ].join(', ');
    updateMetaTag('name', 'robots', robotsContent);
    
    // Update Open Graph tags
    updateMetaTag('property', 'og:title', config.title || '');
    updateMetaTag('property', 'og:description', config.description || '');
    updateMetaTag('property', 'og:type', config.ogType || 'website');
    updateMetaTag('property', 'og:image', config.image || '');
    updateMetaTag('property', 'og:url', config.canonicalUrl || window.location.href);
    
    // Update Twitter Card tags
    updateMetaTag('name', 'twitter:card', config.twitterCard || 'summary_large_image');
    updateMetaTag('name', 'twitter:title', config.title || '');
    updateMetaTag('name', 'twitter:description', config.description || '');
    updateMetaTag('name', 'twitter:image', config.image || '');
    
    // Update canonical URL
    if (config.canonicalUrl) {
      updateCanonicalUrl(config.canonicalUrl);
    }
    
    // Update alternate URLs
    if (config.alternateUrls) {
      updateAlternateUrls(config.alternateUrls);
    }
    
    // Update structured data
    if (config.structuredData) {
      updateStructuredData(config.structuredData);
    }
    
  }, [state.config]);

  // Track route changes for SEO monitoring
  useEffect(() => {
    // Reset to default SEO when route changes (unless custom config is provided)
    if (!initialConfig) {
      resetSEO();
    }
  }, [location.pathname, initialConfig, resetSEO]);

  return {
    ...state,
    updateSEO,
    resetSEO,
    generateInfluencerSEO,
    monitorSEO,
    validateSEO,
    
    // Utility functions
    generateKeywords: (input: InfluencerKeywordInput) => generateComprehensiveSEO(input).keywords,
    generateTitles: (input: InfluencerKeywordInput) => generateComprehensiveSEO(input).titles,
    generateDescriptions: (input: InfluencerKeywordInput) => generateComprehensiveSEO(input).descriptions,
    
    // Performance monitoring
    performanceMetrics: {
      titleOptimization: calculateTitleOptimization(state.config.title),
      descriptionOptimization: calculateDescriptionOptimization(state.config.description),
      keywordOptimization: calculateKeywordOptimization(state.config.keywords),
      imageOptimization: calculateImageOptimization(state.config.image),
      overallScore: state.metrics.score
    }
  };
}

// Helper functions

function calculateSEOMetrics(config: SEOConfig): SEOMetrics {
  const titleLength = config.title?.length || 0;
  const descriptionLength = config.description?.length || 0;
  const keywordsCount = config.keywords?.length || 0;
  const hasImage = !!config.image;
  const hasCanonical = !!config.canonicalUrl;
  const hasStructuredData = !!config.structuredData;
  
  // Calculate optimization score (0-100)
  let score = 0;
  
  // Title optimization (25 points)
  if (titleLength >= 30 && titleLength <= 60) score += 25;
  else if (titleLength > 0) score += 10;
  
  // Description optimization (25 points)
  if (descriptionLength >= 120 && descriptionLength <= 160) score += 25;
  else if (descriptionLength > 0) score += 10;
  
  // Keywords optimization (20 points)
  if (keywordsCount >= 3 && keywordsCount <= 10) score += 20;
  else if (keywordsCount > 0) score += 10;
  
  // Image optimization (10 points)
  if (hasImage) score += 10;
  
  // Canonical URL (10 points)
  if (hasCanonical) score += 10;
  
  // Structured data (10 points)
  if (hasStructuredData) score += 10;
  
  const isOptimized = score >= 80;
  
  const recommendations: string[] = [];
  if (titleLength < 30) recommendations.push('Expand title to 30-60 characters');
  if (descriptionLength < 120) recommendations.push('Expand description to 120-160 characters');
  if (keywordsCount < 3) recommendations.push('Add more relevant keywords');
  if (!hasImage) recommendations.push('Add social sharing image');
  if (!hasCanonical) recommendations.push('Set canonical URL');
  if (!hasStructuredData) recommendations.push('Add structured data');
  
  return {
    titleLength,
    descriptionLength,
    keywordsCount,
    hasImage,
    hasCanonical,
    hasStructuredData,
    isOptimized,
    score,
    recommendations
  };
}

function updateMetaTag(attribute: 'name' | 'property', key: string, value: string) {
  if (!value) return;
  
  let meta = document.querySelector(`meta[${attribute}="${key}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, key);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', value);
}

function updateCanonicalUrl(url: string) {
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', url);
}

function updateAlternateUrls(alternateUrls: { lang: string; url: string; }[]) {
  // Remove existing alternate URLs
  const existingAlternates = document.querySelectorAll('link[rel="alternate"]');
  existingAlternates.forEach(link => link.remove());
  
  // Add new alternate URLs
  alternateUrls.forEach(({ lang, url }) => {
    const link = document.createElement('link');
    link.setAttribute('rel', 'alternate');
    link.setAttribute('hreflang', lang);
    link.setAttribute('href', url);
    document.head.appendChild(link);
  });
}

function updateStructuredData(data: any) {
  // Remove existing structured data
  const existing = document.querySelector('script[type="application/ld+json"]');
  if (existing) {
    existing.remove();
  }
  
  // Add new structured data
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

function extractStructuredData(): any[] {
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  return Array.from(scripts).map(script => {
    try {
      return JSON.parse(script.textContent || '{}');
    } catch {
      return {};
    }
  });
}

function generatePersonSchema(input: InfluencerKeywordInput): any {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: input.name,
    description: `Fitness influencer ${input.name} - Natural vs Enhanced Analysis`,
    url: `https://nattyorjuicy.com/influencer/${input.name.toLowerCase().replace(/\s+/g, '-')}`,
    knowsAbout: [
      'Fitness',
      'Bodybuilding',
      'Strength Training',
      'Physique Development',
      ...(input.specialties || [])
    ],
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://nattyorjuicy.com/influencer/${input.name.toLowerCase().replace(/\s+/g, '-')}`,
      name: `Is ${input.name} Natural? Community Analysis`,
      description: `Community-driven analysis of whether ${input.name} is natural or enhanced`
    }
  };
}

function calculateTitleOptimization(title?: string): number {
  if (!title) return 0;
  const length = title.length;
  if (length >= 30 && length <= 60) return 100;
  if (length >= 20 && length <= 70) return 75;
  if (length > 0) return 50;
  return 0;
}

function calculateDescriptionOptimization(description?: string): number {
  if (!description) return 0;
  const length = description.length;
  if (length >= 120 && length <= 160) return 100;
  if (length >= 100 && length <= 180) return 75;
  if (length > 0) return 50;
  return 0;
}

function calculateKeywordOptimization(keywords?: string[]): number {
  if (!keywords || keywords.length === 0) return 0;
  if (keywords.length >= 3 && keywords.length <= 10) return 100;
  if (keywords.length >= 1 && keywords.length <= 15) return 75;
  return 50;
}

function calculateImageOptimization(image?: string): number {
  if (!image) return 0;
  // Could add more sophisticated image optimization checks
  return 100;
}