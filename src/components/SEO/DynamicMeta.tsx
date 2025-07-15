import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface DynamicMetaProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
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
  type = 'website'
}) => {
  const location = useLocation();
  const fullUrl = url || `https://nattyorjuicy.com${location.pathname}`;

  useEffect(() => {
    // Update page title
    document.title = title;

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }

    // Update Open Graph tags
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

    // Update Twitter Card
    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (twitterImage) {
      twitterImage.setAttribute('content', image);
    }

    // Add canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', fullUrl);

  }, [title, description, image, fullUrl, type]);

  return null; // This component doesn't render anything
};

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