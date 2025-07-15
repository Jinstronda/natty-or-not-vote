import { useEffect } from 'react';

export interface OpenGraphData {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile' | 'product';
  siteName?: string;
}

export interface TwitterData {
  card?: 'summary' | 'summary_large_image' | 'app' | 'player';
  title?: string;
  description?: string;
  image?: string;
  creator?: string;
  site?: string;
}

export interface DynamicMetaProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  robots?: string;
  openGraph?: OpenGraphData;
  twitter?: TwitterData;
  structuredData?: any;
}

export const DynamicMeta = ({
  title,
  description,
  keywords = [],
  canonical,
  robots = 'index, follow',
  openGraph,
  twitter,
  structuredData
}: DynamicMetaProps) => {
  
  useEffect(() => {
    // Update document title
    if (title) {
      document.title = title;
    }
    
    // Update meta description
    updateMetaTag('name', 'description', description || '');
    
    // Update keywords
    if (keywords.length > 0) {
      updateMetaTag('name', 'keywords', keywords.join(', '));
    }
    
    // Update robots
    updateMetaTag('name', 'robots', robots);
    
    // Update canonical URL
    if (canonical) {
      updateCanonicalUrl(canonical);
    }
    
    // Update Open Graph tags
    if (openGraph) {
      updateMetaTag('property', 'og:title', openGraph.title || title || '');
      updateMetaTag('property', 'og:description', openGraph.description || description || '');
      updateMetaTag('property', 'og:image', openGraph.image || '');
      updateMetaTag('property', 'og:url', openGraph.url || canonical || '');
      updateMetaTag('property', 'og:type', openGraph.type || 'website');
      updateMetaTag('property', 'og:site_name', openGraph.siteName || 'Natty or Juicy');
    }
    
    // Update Twitter Card tags
    if (twitter) {
      updateMetaTag('name', 'twitter:card', twitter.card || 'summary_large_image');
      updateMetaTag('name', 'twitter:title', twitter.title || title || '');
      updateMetaTag('name', 'twitter:description', twitter.description || description || '');
      updateMetaTag('name', 'twitter:image', twitter.image || '');
      if (twitter.creator) updateMetaTag('name', 'twitter:creator', twitter.creator);
      if (twitter.site) updateMetaTag('name', 'twitter:site', twitter.site);
    }
    
    // Update structured data
    if (structuredData) {
      updateStructuredData(structuredData);
    }
    
  }, [title, description, keywords, canonical, robots, openGraph, twitter, structuredData]);

  return null; // This component doesn't render anything visible
};

// Helper functions
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

function updateStructuredData(data: any) {
  // Remove existing structured data script for this component
  const existingScript = document.querySelector('script[data-dynamic-meta="true"]');
  if (existingScript) {
    existingScript.remove();
  }

  // Add new structured data
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-dynamic-meta', 'true');
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}