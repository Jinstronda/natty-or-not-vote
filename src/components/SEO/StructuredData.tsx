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