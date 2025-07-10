import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface TwitterMeta {
  card?: 'summary' | 'summary_large_image' | 'app' | 'player';
  site?: string;
  creator?: string;
  title?: string;
  description?: string;
  image?: string;
}

interface FacebookMeta {
  appId?: string;
  title?: string;
  description?: string;
  image?: string;
  type?: string;
}

interface LinkedInMeta {
  title?: string;
  description?: string;
  image?: string;
}

interface SocialMeta {
  twitter?: TwitterMeta;
  facebook?: FacebookMeta;
  linkedin?: LinkedInMeta;
}

interface AlternateUrl {
  lang: string;
  url: string;
}

interface DynamicMetaProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  keywords?: string[];
  canonicalUrl?: string;
  alternateUrls?: AlternateUrl[];
  socialMeta?: SocialMeta;
}

/**
 * Dynamic SEO Meta Tags Component
 * Updates page title, description, and Open Graph tags dynamically
 */
export const DynamicMeta: React.FC<DynamicMetaProps> = ({
  title = 'Natty or Juicy - Natural or Enhanced Fitness Analysis',
  description = 'Vote and analyze whether fitness influencers are natural or enhanced',
  image = 'https://i.imgur.com/n0sDxaT.png',
  url,
  type = 'website',
  keywords = [],
  canonicalUrl,
  alternateUrls = [],
  socialMeta
}) => {
  const location = useLocation();
  const fullUrl = url || `https://nattyorjuicy.com${location.pathname}`;
  const finalCanonicalUrl = canonicalUrl || fullUrl;

  useEffect(() => {
    // Update page title
    document.title = title;

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }

    // Update keywords meta tag
    updateKeywordsMeta(keywords);

    // Update Open Graph tags
    updateBasicOpenGraphTags(title, description, image, fullUrl, type);

    // Update enhanced social media meta tags
    updateSocialMetaTags(socialMeta, title, description, image);

    // Update canonical URL
    updateCanonicalUrl(finalCanonicalUrl);

    // Update alternate URLs
    updateAlternateUrls(alternateUrls);

  }, [title, description, image, fullUrl, type, keywords, finalCanonicalUrl, alternateUrls, socialMeta]);

  return null; // This component doesn't render anything
};

// Helper function to update keywords meta tag
function updateKeywordsMeta(keywords: string[]) {
  if (keywords.length > 0) {
    let keywordsMeta = document.querySelector('meta[name="keywords"]');
    if (!keywordsMeta) {
      keywordsMeta = document.createElement('meta');
      keywordsMeta.setAttribute('name', 'keywords');
      document.head.appendChild(keywordsMeta);
    }
    keywordsMeta.setAttribute('content', keywords.join(', '));
  }
}

// Helper function to update basic Open Graph tags
function updateBasicOpenGraphTags(title: string, description: string, image: string, fullUrl: string, type: string) {
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) {
    ogTitle.setAttribute('content', title);
  }

  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription) {
    ogDescription.setAttribute('content', description);
  }

  const ogImage = document.querySelector('meta[property="og:image"]');
  if (ogImage) {
    ogImage.setAttribute('content', image);
  }

  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) {
    ogUrl.setAttribute('content', fullUrl);
  } else {
    // Create og:url if it doesn't exist
    const meta = document.createElement('meta');
    meta.setAttribute('property', 'og:url');
    meta.setAttribute('content', fullUrl);
    document.head.appendChild(meta);
  }

  const ogType = document.querySelector('meta[property="og:type"]');
  if (ogType) {
    ogType.setAttribute('content', type);
  }
}

// Helper function to update enhanced social media meta tags
function updateSocialMetaTags(socialMeta: SocialMeta | undefined, defaultTitle: string, defaultDescription: string, defaultImage: string) {
  // Update Twitter Card meta tags
  if (socialMeta?.twitter) {
    const twitter = socialMeta.twitter;
    updateOrCreateMeta('name', 'twitter:card', twitter.card || 'summary_large_image');
    updateOrCreateMeta('name', 'twitter:site', twitter.site || '@nattyorjuicy');
    updateOrCreateMeta('name', 'twitter:creator', twitter.creator || '@nattyorjuicy');
    updateOrCreateMeta('name', 'twitter:title', twitter.title || defaultTitle);
    updateOrCreateMeta('name', 'twitter:description', twitter.description || defaultDescription);
    updateOrCreateMeta('name', 'twitter:image', twitter.image || defaultImage);
  } else {
    // Set default Twitter meta tags
    updateOrCreateMeta('name', 'twitter:card', 'summary_large_image');
    updateOrCreateMeta('name', 'twitter:site', '@nattyorjuicy');
    updateOrCreateMeta('name', 'twitter:title', defaultTitle);
    updateOrCreateMeta('name', 'twitter:description', defaultDescription);
    updateOrCreateMeta('name', 'twitter:image', defaultImage);
  }

  // Update Facebook/Open Graph meta tags
  if (socialMeta?.facebook) {
    const facebook = socialMeta.facebook;
    if (facebook.appId) {
      updateOrCreateMeta('property', 'fb:app_id', facebook.appId);
    }
    updateOrCreateMeta('property', 'og:title', facebook.title || defaultTitle);
    updateOrCreateMeta('property', 'og:description', facebook.description || defaultDescription);
    updateOrCreateMeta('property', 'og:image', facebook.image || defaultImage);
    updateOrCreateMeta('property', 'og:type', facebook.type || 'website');
  }

  // Update LinkedIn meta tags (uses Open Graph tags)
  if (socialMeta?.linkedin) {
    const linkedin = socialMeta.linkedin;
    updateOrCreateMeta('property', 'og:title', linkedin.title || defaultTitle);
    updateOrCreateMeta('property', 'og:description', linkedin.description || defaultDescription);
    updateOrCreateMeta('property', 'og:image', linkedin.image || defaultImage);
  }
}

// Helper function to update or create meta tags
function updateOrCreateMeta(attribute: 'name' | 'property', key: string, value: string) {
  let meta = document.querySelector(`meta[${attribute}="${key}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, key);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', value);
}

// Helper function to update canonical URL
function updateCanonicalUrl(canonicalUrl: string) {
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', canonicalUrl);
}

// Helper function to update alternate URLs
function updateAlternateUrls(alternateUrls: AlternateUrl[]) {
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

/**
 * ENHANCED SEO: Search-Optimized meta tags for influencer profiles
 * Targets exact search queries like "Is Geoffrey Verity natural"
 */
export const InfluencerMeta: React.FC<{
  influencer: {
    id: string;
    name: string;
    image?: string;
    claimed_status?: string;
    description?: string;
  };
  voteData?: {
    totalVotes: number;
    nattyPercentage: number;
  };
}> = ({ influencer, voteData }) => {
  // SEQUENTIAL THINKING: Generate search-optimized titles
  const generateSearchOptimizedTitle = () => {
    const name = influencer.name;
    
    // Target exact search queries people actually use
    if (voteData?.totalVotes > 10) {
      const nattyPercent = voteData.nattyPercentage.toFixed(0);
      return `Is ${name} Natural? ${nattyPercent}% Say Natural | Community Analysis`;
    }
    
    // Fallback to question format for new profiles
    return `Is ${name} Natural or Enhanced? Natty or Juicy Analysis`;
  };

  const generateSearchOptimizedDescription = () => {
    const name = influencer.name;
    let description = `Find out if ${name} is natural or enhanced. `;
    
    // Add vote statistics if available
    if (voteData?.totalVotes > 0) {
      description += `${voteData.totalVotes} community votes - ${voteData.nattyPercentage.toFixed(0)}% say natural. `;
    }
    
    // Add call to action
    description += `See community votes, expert reviews, and detailed analysis.`;
    
    return description.substring(0, 160);
  };
  
  return (
    <DynamicMeta
      title={generateSearchOptimizedTitle()}
      description={generateSearchOptimizedDescription()}
      image={influencer.image || 'https://i.imgur.com/n0sDxaT.png'}
      url={`https://nattyorjuicy.com/influencer/${influencer.id}`}
      type="profile"
    />
  );
};

/**
 * SEO-optimized meta tags for expert profiles
 */
export const ExpertMeta: React.FC<{
  expert: {
    id: string;
    name: string;
    bio?: string;
    profile_picture_url?: string;
  };
}> = ({ expert }) => {
  const title = `${expert.name} - Fitness Expert Reviews | Natty or Juicy`;
  const description = expert.bio 
    ? `${expert.bio.substring(0, 150)}...`
    : `Read expert reviews and analysis from ${expert.name} on fitness influencers. Professional insights on natural vs enhanced physiques.`;
  
  return (
    <DynamicMeta
      title={title}
      description={description}
      image={expert.profile_picture_url || 'https://i.imgur.com/n0sDxaT.png'}
      url={`https://nattyorjuicy.com/experts/${expert.id}`}
      type="profile"
    />
  );
};