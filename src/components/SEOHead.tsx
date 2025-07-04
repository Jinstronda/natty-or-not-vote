import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  structuredData?: any;
  keywords?: string[];
  noindex?: boolean;
}

const SEOHead = ({
  title = "Natty or Juicy - Natural or Enhanced Fitness Analysis",
  description = "Vote and analyze whether fitness influencers are natural or enhanced",
  canonicalUrl,
  ogImage = "/LOGO.png",
  ogType = "website",
  structuredData,
  keywords = [],
  noindex = false
}: SEOHeadProps) => {
  
  useEffect(() => {
    // Update document title
    document.title = title;
    
    // Update meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords.join(', '));
    
    // Update Open Graph tags
    updateMetaTag('og:title', title, 'property');
    updateMetaTag('og:description', description, 'property');
    updateMetaTag('og:image', ogImage, 'property');
    updateMetaTag('og:type', ogType, 'property');
    updateMetaTag('og:url', canonicalUrl || window.location.href, 'property');
    
    // Update Twitter tags
    updateMetaTag('twitter:title', title, 'name');
    updateMetaTag('twitter:description', description, 'name');
    updateMetaTag('twitter:image', ogImage, 'name');
    
    // Update robots tag
    const robotsContent = noindex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';
    updateMetaTag('robots', robotsContent);
    
    // Update canonical URL
    updateCanonicalLink(canonicalUrl || window.location.href);
    
    // Add structured data if provided
    if (structuredData) {
      addStructuredData(structuredData);
    }
    
    return () => {
      // Cleanup function to reset to defaults if needed
    };
  }, [title, description, canonicalUrl, ogImage, ogType, structuredData, keywords, noindex]);

  const updateMetaTag = (name: string, content: string, attribute: 'name' | 'property' = 'name') => {
    if (!content) return;
    
    let meta = document.querySelector(`meta[${attribute}="${name}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute(attribute, name);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  };

  const updateCanonicalLink = (url: string) => {
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);
  };

  const addStructuredData = (data: any) => {
    // Remove existing structured data script for this component
    const existingScript = document.querySelector('script[data-seo-component="true"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo-component', 'true');
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  };

  return null; // This component doesn't render anything visible
};

export default SEOHead; 