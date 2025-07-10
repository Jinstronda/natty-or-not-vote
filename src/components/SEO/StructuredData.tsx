import { useEffect } from 'react';

/**
 * Structured Data (JSON-LD) for SEO
 * Helps Google understand your content better
 */

interface StructuredDataProps {
  data: any;
  id?: string;
}

export const StructuredData: React.FC<StructuredDataProps> = ({ data, id }) => {
  useEffect(() => {
    const scriptId = id || 'structured-data';
    
    // Remove existing script if it exists
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data script
    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);

    // Cleanup on unmount
    return () => {
      const scriptToRemove = document.getElementById(scriptId);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [data, id]);

  return null;
};

/**
 * Person schema for influencer profiles
 */
export const InfluencerSchema: React.FC<{
  influencer: {
    id: string;
    name: string;
    image?: string;
    description?: string;
    social_links?: {
      instagram?: string;
      youtube?: string;
      twitter?: string;
      website?: string;
    };
  };
}> = ({ influencer }) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: influencer.name,
    description: influencer.description || `Fitness influencer profile for ${influencer.name}`,
    image: influencer.image,
    url: `https://nattyorjuicy.com/influencer/${influencer.id}`,
    sameAs: [
      influencer.social_links?.instagram,
      influencer.social_links?.youtube,
      influencer.social_links?.twitter,
      influencer.social_links?.website,
    ].filter(Boolean),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://nattyorjuicy.com/influencer/${influencer.id}`
    }
  };

  return <StructuredData data={schema} id={`influencer-${influencer.id}`} />;
};

/**
 * Expert/Person schema for expert profiles
 */
export const ExpertSchema: React.FC<{
  expert: {
    id: string;
    name: string;
    bio?: string;
    profile_picture_url?: string;
  };
}> = ({ expert }) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: expert.name,
    description: expert.bio || `Fitness expert and reviewer ${expert.name}`,
    image: expert.profile_picture_url,
    url: `https://nattyorjuicy.com/experts/${expert.id}`,
    jobTitle: 'Fitness Expert',
    knowsAbout: ['Fitness', 'Bodybuilding', 'Nutrition', 'Exercise Science'],
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://nattyorjuicy.com/experts/${expert.id}`
    }
  };

  return <StructuredData data={schema} id={`expert-${expert.id}`} />;
};

/**
 * Review schema for expert reviews
 */
export const ReviewSchema: React.FC<{
  review: {
    id: string;
    author: string;
    content: string;
    rating?: number;
    created_at: string;
  };
  subject: {
    name: string;
    id: string;
  };
}> = ({ review, subject }) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: review.author
    },
    datePublished: review.created_at,
    reviewBody: review.content,
    reviewRating: review.rating ? {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: 5
    } : undefined,
    itemReviewed: {
      '@type': 'Person',
      name: subject.name,
      url: `https://nattyorjuicy.com/influencer/${subject.id}`
    }
  };

  return <StructuredData data={schema} id={`review-${review.id}`} />;
};

/**
 * Organization schema for the website
 */
export const OrganizationSchema: React.FC = () => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Natty or Juicy',
    url: 'https://nattyorjuicy.com',
    logo: 'https://i.imgur.com/6NBB7Z9.png',
    description: 'Community-driven platform for analyzing whether fitness influencers are natural or enhanced',
    sameAs: [
      'https://twitter.com/nattyorjuicy'
    ]
  };

  return <StructuredData data={schema} id="organization" />;
};

/**
 * Website schema for the homepage
 */
export const WebsiteSchema: React.FC = () => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Natty or Juicy',
    url: 'https://nattyorjuicy.com',
    description: 'Vote and analyze whether fitness influencers are natural or enhanced',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://nattyorjuicy.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };

  return <StructuredData data={schema} id="website" />;
};

/**
 * FAQ schema for "Is [name] natural?" questions
 * Optimized for Google's People Also Ask feature
 */
export const InfluencerFAQSchema: React.FC<{
  influencer: {
    id: string;
    name: string;
    claimed_status?: string;
  };
  voteData?: {
    totalVotes: number;
    nattyPercentage: number;
  };
  expertReviews?: Array<{
    author: string;
    content: string;
    natty_or_not?: string;
  }>;
}> = ({ influencer, voteData, expertReviews }) => {
  const { name } = influencer;
  const nattyPercent = voteData?.nattyPercentage || 0;
  const totalVotes = voteData?.totalVotes || 0;
  
  const generateAnswer = () => {
    let answer = `Based on community analysis, `;
    
    if (totalVotes > 10) {
      answer += `${nattyPercent.toFixed(0)}% of ${totalVotes} voters believe ${name} is natural (natty), `;
      answer += `while ${(100 - nattyPercent).toFixed(0)}% believe he is enhanced (juicy). `;
    } else {
      answer += `${name} is being analyzed by the fitness community for natural vs enhanced status. `;
    }
    
    if (expertReviews?.length > 0) {
      answer += `Expert reviews and analysis are available. `;
    }
    
    answer += `The assessment considers physique development, training timeline, and other factors.`;
    
    return answer;
  };

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Is ${name} natural?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: generateAnswer()
        }
      },
      {
        '@type': 'Question',
        name: `Is ${name} natty or juicy?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${name} is analyzed by the fitness community to determine if he is natural (natty) or enhanced (juicy). Community votes and expert reviews provide insights into his natural vs enhanced status.`
        }
      },
      {
        '@type': 'Question',
        name: `Is ${name} a natural bodybuilder?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${name}'s natural bodybuilding status is evaluated through community voting, expert analysis, and physique assessment. View the full analysis for detailed insights.`
        }
      },
      {
        '@type': 'Question',
        name: `What percentage of people think ${name} is natural?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: totalVotes > 0 
            ? `${nattyPercent.toFixed(0)}% of ${totalVotes} community members believe ${name} is natural based on current voting data.`
            : `Community voting is ongoing to determine ${name}'s natural vs enhanced status. Join the analysis to contribute your vote.`
        }
      }
    ]
  };

  return <StructuredData data={schema} id={`faq-${influencer.id}`} />;
};

/**
 * Enhanced Person schema with fitness-specific properties
 */
export const EnhancedInfluencerSchema: React.FC<{
  influencer: {
    id: string;
    name: string;
    image?: string;
    description?: string;
    claimed_status?: string;
    height?: string;
    weight?: string;
    years_training?: string;
    social_links?: {
      instagram?: string;
      youtube?: string;
      twitter?: string;
      website?: string;
    };
  };
  voteData?: {
    totalVotes: number;
    nattyPercentage: number;
  };
}> = ({ influencer, voteData }) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: influencer.name,
    description: influencer.description || `Fitness influencer ${influencer.name} - Natural vs Enhanced Analysis`,
    image: influencer.image,
    url: `https://nattyorjuicy.com/influencer/${influencer.id}`,
    
    // Physical attributes
    height: influencer.height,
    weight: influencer.weight,
    
    // Professional info
    jobTitle: 'Fitness Influencer',
    knowsAbout: [
      'Fitness',
      'Bodybuilding', 
      'Strength Training',
      'Physique Development',
      'Natural Bodybuilding',
      'Enhanced Training'
    ],
    
    // Social media presence
    sameAs: [
      influencer.social_links?.instagram,
      influencer.social_links?.youtube,
      influencer.social_links?.twitter,
      influencer.social_links?.website,
    ].filter(Boolean),
    
    // Additional fitness-specific properties
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Training Experience',
        value: influencer.years_training || 'Not specified'
      },
      {
        '@type': 'PropertyValue',
        name: 'Claimed Status',
        value: influencer.claimed_status || 'Not specified'
      },
      voteData?.totalVotes > 0 ? {
        '@type': 'PropertyValue',
        name: 'Community Assessment',
        value: `${voteData.nattyPercentage.toFixed(0)}% natural rating from ${voteData.totalVotes} votes`
      } : null
    ].filter(Boolean),
    
    // Main entity reference
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://nattyorjuicy.com/influencer/${influencer.id}`,
      name: `Is ${influencer.name} Natural? Community Analysis`,
      description: `Community-driven analysis of whether ${influencer.name} is natural or enhanced`,
      about: {
        '@type': 'Thing',
        name: 'Natural vs Enhanced Fitness Analysis',
        description: 'Community analysis of fitness influencer authenticity'
      }
    },
    
    // Audience and category
    audience: {
      '@type': 'Audience',
      audienceType: 'Fitness Enthusiasts',
      geographicArea: 'Global'
    },
    
    // Organization affiliation
    affiliation: {
      '@type': 'Organization',
      name: 'Natty or Juicy',
      url: 'https://nattyorjuicy.com'
    }
  };

  return <StructuredData data={schema} id={`enhanced-person-${influencer.id}`} />;
};

/**
 * Review aggregation schema for multiple expert reviews
 */
export const ReviewAggregationSchema: React.FC<{
  influencer: {
    id: string;
    name: string;
    image?: string;
  };
  reviews: Array<{
    id: string;
    author: string;
    content: string;
    rating?: number;
    created_at: string;
    natty_or_not?: string;
  }>;
}> = ({ influencer, reviews }) => {
  const validReviews = reviews.filter(review => review.rating !== undefined);
  const averageRating = validReviews.length > 0 
    ? validReviews.reduce((sum, review) => sum + (review.rating || 0), 0) / validReviews.length
    : undefined;
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product', // Using Product schema as it supports aggregateRating
    name: `${influencer.name} - Natural vs Enhanced Analysis`,
    description: `Expert analysis and community assessment of ${influencer.name}'s natural vs enhanced status`,
    image: influencer.image,
    url: `https://nattyorjuicy.com/influencer/${influencer.id}`,
    
    // Category and brand
    category: 'Fitness Analysis',
    brand: {
      '@type': 'Brand',
      name: 'Natty or Juicy'
    },
    
    // Aggregate rating from expert reviews
    aggregateRating: averageRating ? {
      '@type': 'AggregateRating',
      ratingValue: averageRating.toFixed(1),
      bestRating: 5,
      worstRating: 1,
      ratingCount: validReviews.length,
      reviewCount: reviews.length
    } : undefined,
    
    // Individual reviews
    review: reviews.map(review => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.author
      },
      datePublished: review.created_at,
      reviewBody: review.content,
      reviewRating: review.rating ? {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: 5
      } : undefined,
      additionalProperty: review.natty_or_not ? {
        '@type': 'PropertyValue',
        name: 'Expert Assessment',
        value: review.natty_or_not
      } : undefined
    }))
  };

  return <StructuredData data={schema} id={`review-aggregation-${influencer.id}`} />;
};

/**
 * Breadcrumb navigation schema
 */
export const BreadcrumbSchema: React.FC<{
  breadcrumbs: Array<{
    name: string;
    url: string;
    position: number;
  }>;
}> = ({ breadcrumbs }) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map(crumb => ({
      '@type': 'ListItem',
      position: crumb.position,
      name: crumb.name,
      item: crumb.url
    }))
  };

  return <StructuredData data={schema} id="breadcrumb" />;
};

/**
 * Article schema for blog posts and detailed analyses
 */
export const ArticleSchema: React.FC<{
  article: {
    title: string;
    description: string;
    author: string;
    datePublished: string;
    dateModified?: string;
    image?: string;
    url: string;
    wordCount?: number;
  };
  organization?: {
    name: string;
    logo: string;
    url: string;
  };
}> = ({ article, organization }) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    author: {
      '@type': 'Person',
      name: article.author
    },
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    image: article.image,
    url: article.url,
    wordCount: article.wordCount,
    
    // Publisher information
    publisher: organization ? {
      '@type': 'Organization',
      name: organization.name,
      logo: {
        '@type': 'ImageObject',
        url: organization.logo
      },
      url: organization.url
    } : {
      '@type': 'Organization',
      name: 'Natty or Juicy',
      logo: {
        '@type': 'ImageObject',
        url: 'https://i.imgur.com/6NBB7Z9.png'
      },
      url: 'https://nattyorjuicy.com'
    },
    
    // Main entity
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url
    },
    
    // Article section
    articleSection: 'Fitness Analysis',
    
    // Keywords
    keywords: [
      'fitness analysis',
      'natural bodybuilding',
      'enhanced training',
      'natty or juicy',
      'fitness influencer'
    ]
  };

  return <StructuredData data={schema} id={`article-${article.url.split('/').pop()}`} />;
};

/**
 * Local Business schema for fitness-related businesses
 */
export const LocalBusinessSchema: React.FC<{
  business: {
    name: string;
    description: string;
    address: {
      streetAddress: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    phone?: string;
    email?: string;
    website: string;
    hours?: string[];
    priceRange?: string;
  };
}> = ({ business }) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.name,
    description: business.description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address.streetAddress,
      addressLocality: business.address.city,
      addressRegion: business.address.state,
      postalCode: business.address.postalCode,
      addressCountry: business.address.country
    },
    telephone: business.phone,
    email: business.email,
    url: business.website,
    openingHours: business.hours,
    priceRange: business.priceRange,
    
    // Business category
    '@id': business.website,
    additionalType: 'https://schema.org/SportsActivityLocation',
    
    // Service area
    areaServed: {
      '@type': 'Country',
      name: business.address.country
    }
  };

  return <StructuredData data={schema} id="local-business" />;
};