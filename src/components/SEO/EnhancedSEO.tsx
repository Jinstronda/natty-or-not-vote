import { useEffect, useMemo } from 'react';
import { generateInfluencerKeywords } from '@/utils/seo/keywordGenerator';
import { InfluencerKeywordInput } from '@/utils/seo/keywordGenerator';

interface EnhancedSEOProps {
  influencer: {
    id: string;
    name: string;
    description?: string;
    height?: string;
    weight?: string;
    years_training?: string;
    claimed_status?: string;
    image?: string;
    social_links?: Record<string, string>;
    trending?: boolean;
    controversial?: boolean;
  };
  voteStats?: {
    total_votes: number;
    natty_percentage: number;
    juicy_percentage: number;
  };
}

export const EnhancedSEO = ({ influencer, voteStats }: EnhancedSEOProps) => {
  const seoData = useMemo(() => {
    const keywordInput: InfluencerKeywordInput = {
      name: influencer.name,
      description: influencer.description,
      stats: voteStats ? {
        totalVotes: voteStats.total_votes,
        nattyPercentage: voteStats.natty_percentage,
        juicyPercentage: voteStats.juicy_percentage,
      } : undefined,
      physicalStats: {
        height: influencer.height,
        weight: influencer.weight,
        yearsTraining: influencer.years_training,
      },
      claimedStatus: influencer.claimed_status,
      trending: influencer.trending,
      controversial: influencer.controversial,
    };

    return generateInfluencerKeywords(keywordInput);
  }, [influencer, voteStats]);

  useEffect(() => {
    // Enhanced title targeting "is [name] juicy" searches
    const title = `Is ${influencer.name} Juicy? ${voteStats?.natty_percentage || 0}% Natty | Community Verdict`;
    document.title = title;

    // Enhanced description for better search targeting
    const description = `Find out if ${influencer.name} is natural or juicy. ${voteStats?.natty_percentage || 0}% say natty, ${voteStats?.juicy_percentage || 0}% say juicy. Community analysis of ${influencer.name}'s physique with expert reviews and user votes.`;

    // Update meta tags with enhanced SEO
    updateMetaTag('description', description);
    updateMetaTag('keywords', seoData.targetKeywords.join(', '));
    
    // Enhanced Open Graph tags
    updateMetaTag('og:title', title, 'property');
    updateMetaTag('og:description', description, 'property');
    updateMetaTag('og:type', 'article', 'property');
    updateMetaTag('og:image', influencer.image || 'https://nattyorjuicy.com/og-image.jpg', 'property');
    updateMetaTag('og:url', `https://nattyorjuicy.com/influencer/${influencer.id}`, 'property');
    updateMetaTag('og:site_name', 'Natty or Juicy', 'property');
    
    // Enhanced Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image', 'name');
    updateMetaTag('twitter:title', title, 'name');
    updateMetaTag('twitter:description', description, 'name');
    updateMetaTag('twitter:image', influencer.image || 'https://nattyorjuicy.com/og-image.jpg', 'name');
    updateMetaTag('twitter:creator', '@nattyorjuicy', 'name');
    
    // Enhanced robots tag for better indexing
    updateMetaTag('robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    
    // Add author meta tag
    updateMetaTag('author', 'Natty or Juicy Community');
    
    // Add article tags for better categorization
    updateMetaTag('article:section', 'Fitness', 'property');
    updateMetaTag('article:tag', seoData.primary.slice(0, 5).join(', '), 'property');
    
    // Canonical URL with name-based structure
    const nameSlug = influencer.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    updateCanonicalLink(`https://nattyorjuicy.com/influencer/${nameSlug}`);
    
    // Add structured data for better search understanding
    addEnhancedStructuredData();
    
    // Add FAQ structured data for common questions
    addFAQStructuredData();
    
    // Add breadcrumb structured data
    addBreadcrumbStructuredData();
    
    return () => {
      // Cleanup if needed
    };
  }, [influencer, voteStats, seoData]);

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

  const addEnhancedStructuredData = () => {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: influencer.name,
      description: influencer.description || `${influencer.name} fitness analysis and community verdict`,
      image: influencer.image,
      url: `https://nattyorjuicy.com/influencer/${influencer.id}`,
      sameAs: Object.values(influencer.social_links || {}).filter(Boolean),
      knowsAbout: ['Fitness', 'Bodybuilding', 'Strength Training', 'Natural Training'],
      occupation: {
        '@type': 'Occupation',
        name: 'Fitness Influencer',
        occupationLocation: {
          '@type': 'Place',
          name: 'Global',
        },
      },
      aggregateRating: voteStats ? {
        '@type': 'AggregateRating',
        ratingValue: voteStats.natty_percentage,
        ratingCount: voteStats.total_votes,
        bestRating: 100,
        worstRating: 0,
        name: 'Natural vs Enhanced Rating',
      } : undefined,
      review: voteStats ? [{
        '@type': 'Review',
        name: `${influencer.name} Community Verdict`,
        reviewBody: `Community analysis shows ${voteStats.natty_percentage}% believe ${influencer.name} is natural (natty) while ${voteStats.juicy_percentage}% believe they are enhanced (juicy).`,
        author: {
          '@type': 'Organization',
          name: 'Natty or Juicy Community',
        },
        datePublished: new Date().toISOString(),
        reviewRating: {
          '@type': 'Rating',
          ratingValue: voteStats.natty_percentage,
          bestRating: 100,
          worstRating: 0,
        },
      }] : undefined,
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-enhanced-seo', 'person');
    script.textContent = JSON.stringify(structuredData);
    
    // Remove existing script if present
    const existing = document.querySelector('script[data-enhanced-seo="person"]');
    if (existing) existing.remove();
    
    document.head.appendChild(script);
  };

  const addFAQStructuredData = () => {
    const faqData = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: `Is ${influencer.name} natural?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `According to community votes, ${voteStats?.natty_percentage || 0}% believe ${influencer.name} is natural (natty), while ${voteStats?.juicy_percentage || 0}% believe they are enhanced (juicy). The community verdict is based on ${voteStats?.total_votes || 0} total votes.`,
          },
        },
        {
          '@type': 'Question',
          name: `Is ${influencer.name} juicy?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `${voteStats?.juicy_percentage || 0}% of the community believes ${influencer.name} is juicy (enhanced), while ${voteStats?.natty_percentage || 0}% believe they are natural. This is based on analysis of their physique, performance, and training claims.`,
          },
        },
        {
          '@type': 'Question',
          name: `What are ${influencer.name}'s stats?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `${influencer.name} is ${influencer.height || 'height unknown'}, weighs ${influencer.weight || 'weight unknown'}, and has been training for ${influencer.years_training || 'unknown years'}. They claim to be ${influencer.claimed_status || 'status unknown'}.`,
          },
        },
        {
          '@type': 'Question',
          name: `How many people voted on ${influencer.name}?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `${voteStats?.total_votes || 0} community members have voted on whether ${influencer.name} is natty or juicy. The platform allows users to vote and share their analysis.`,
          },
        },
      ],
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-enhanced-seo', 'faq');
    script.textContent = JSON.stringify(faqData);
    
    // Remove existing script if present
    const existing = document.querySelector('script[data-enhanced-seo="faq"]');
    if (existing) existing.remove();
    
    document.head.appendChild(script);
  };

  const addBreadcrumbStructuredData = () => {
    const breadcrumbData = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://nattyorjuicy.com',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Influencers',
          item: 'https://nattyorjuicy.com/#influencers',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: influencer.name,
          item: `https://nattyorjuicy.com/influencer/${influencer.id}`,
        },
      ],
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-enhanced-seo', 'breadcrumb');
    script.textContent = JSON.stringify(breadcrumbData);
    
    // Remove existing script if present
    const existing = document.querySelector('script[data-enhanced-seo="breadcrumb"]');
    if (existing) existing.remove();
    
    document.head.appendChild(script);
  };

  return null; // This component doesn't render anything visible
};