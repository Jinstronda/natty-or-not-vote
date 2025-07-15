import { DynamicMeta } from './DynamicMeta';
import { StructuredData } from './StructuredData';

interface InfluencerVoteData {
  totalVotes: number;
  nattyPercentage: number;
  juicyPercentage: number;
}

interface InfluencerSEOProps {
  influencer: {
    id: string;
    name: string;
    image?: string;
    description?: string;
    claimed_status?: string;
    height?: string;
    weight?: string;
    years_training?: string;
  };
  voteData?: InfluencerVoteData;
  expertReviews?: Array<{
    author: string;
    content: string;
    rating?: number;
    natty_or_not?: string;
  }>;
}

/**
 * SAFE ENHANCED SEO: Influencer-Specific SEO Optimization
 * Targets exact search queries like "Is Geoffrey Verity natural"
 * Uses sequential thinking to optimize for real search patterns
 */
export const InfluencerSpecificSEO: React.FC<InfluencerSEOProps> = ({
  influencer,
  voteData,
  expertReviews
}) => {
  // UNDERSTAND: Generate search-optimized title variations
  const generateOptimizedTitle = () => {
    const name = influencer.name;
    const status = voteData?.nattyPercentage > 60 ? 'Natural' : 'Enhanced';
    
    // Target exact search queries
    const titleVariations = [
      `Is ${name} Natural? ${status} Analysis & Community Votes`,
      `${name} Natty or Juicy? ${voteData?.nattyPercentage.toFixed(0)}% Say Natural`,
      `Is ${name} Natural or Enhanced? Expert Reviews & Analysis`,
      `${name} Natural Bodybuilder? Community Analysis & Votes`
    ];
    
    // Use most relevant based on vote data
    if (voteData?.totalVotes > 10) {
      return titleVariations[1]; // Use percentage if enough votes
    } else if (expertReviews?.length > 0) {
      return titleVariations[2]; // Use expert reviews
    }
    return titleVariations[0]; // Default question format
  };

  // HYPOTHESIZE: Create compelling meta description
  const generateOptimizedDescription = () => {
    const name = influencer.name;
    const totalVotes = voteData?.totalVotes || 0;
    const nattyPercent = voteData?.nattyPercentage || 0;
    const expertCount = expertReviews?.length || 0;
    
    // Base description with stats
    let description = `Find out if ${name} is natural or enhanced. `;
    
    // Add vote statistics if available
    if (totalVotes > 0) {
      description += `${totalVotes} community votes - ${nattyPercent.toFixed(0)}% say natural. `;
    }
    
    // Add expert reviews if available
    if (expertCount > 0) {
      description += `${expertCount} expert reviews. `;
    }
    
    // Add physical stats if available
    if (influencer.height && influencer.weight) {
      description += `${influencer.height}, ${influencer.weight}. `;
    }
    
    // Add training experience
    if (influencer.years_training) {
      description += `${influencer.years_training} years training. `;
    }
    
    // Call to action
    description += `See analysis, votes, and expert opinions.`;
    
    return description.substring(0, 160); // Google's limit
  };

  // TEST: Generate keyword-rich content
  const generateKeywords = () => {
    const name = influencer.name;
    return [
      `${name} natural`,
      `${name} natty`,
      `${name} enhanced`,
      `${name} juicy`,
      `is ${name} natural`,
      `${name} natty or juicy`,
      `${name} natural bodybuilder`,
      `${name} steroid use`,
      `${name} transformation`,
      `${name} physique analysis`
    ].join(', ');
  };

  return (
    <>
      {/* SAFE: Dynamic Meta Tags */}
      <DynamicMeta
        title={generateOptimizedTitle()}
        description={generateOptimizedDescription()}
        canonical={`https://nattyorjuicy.com/influencer/${influencer.id}`}
        openGraph={{
          title: generateOptimizedTitle(),
          description: generateOptimizedDescription(),
          image: influencer.image,
          url: `https://nattyorjuicy.com/influencer/${influencer.id}`,
          type: 'profile'
        }}
        twitter={{
          card: 'summary_large_image',
          title: generateOptimizedTitle(),
          description: generateOptimizedDescription(),
          image: influencer.image
        }}
      />
      
      {/* SAFE: Add keywords meta tag */}
      <meta name="keywords" content={generateKeywords()} />
      
      {/* SAFE: Q&A Structured Data */}
      <InfluencerQASchema 
        influencer={influencer}
        voteData={voteData}
        expertReviews={expertReviews}
      />
      
      {/* SAFE: Person Schema with Enhanced Data */}
      <EnhancedPersonSchema 
        influencer={influencer}
        voteData={voteData}
      />
    </>
  );
};

/**
 * SAFE ENHANCEMENT: Q&A Structured Data for Google's People Also Ask
 * Targets "Is [name] natural" questions directly
 */
const InfluencerQASchema: React.FC<{
  influencer: InfluencerSEOProps['influencer'];
  voteData?: InfluencerVoteData;
  expertReviews?: InfluencerSEOProps['expertReviews'];
}> = ({ influencer, voteData, expertReviews }) => {
  const name = influencer.name;
  const nattyPercent = voteData?.nattyPercentage || 0;
  const totalVotes = voteData?.totalVotes || 0;
  
  // Generate answer based on community data
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

  const qaSchema = {
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
      }
    ]
  };

  return <StructuredData type="FAQPage" data={qaSchema} id={`qa-${influencer.id}`} />;
};

/**
 * SAFE ENHANCEMENT: Enhanced Person Schema with Vote Data
 * Provides rich information about the influencer
 */
const EnhancedPersonSchema: React.FC<{
  influencer: InfluencerSEOProps['influencer'];
  voteData?: InfluencerVoteData;
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
      'Physique Development'
    ],
    
    // Additional properties
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Training Experience',
        value: influencer.years_training
      },
      {
        '@type': 'PropertyValue',
        name: 'Claimed Status',
        value: influencer.claimed_status
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
      description: `Community-driven analysis of whether ${influencer.name} is natural or enhanced`
    }
  };

  return <StructuredData type="Person" data={schema} id={`person-enhanced-${influencer.id}`} />;
};

/**
 * SAFE UTILITY: SEO Keywords Generator
 * Generates relevant keywords for the influencer
 */
export const generateInfluencerKeywords = (influencer: InfluencerSEOProps['influencer']) => {
  const name = influencer.name;
  const firstName = name.split(' ')[0];
  const lastName = name.split(' ').slice(1).join(' ');
  
  return [
    // Primary question keywords
    `is ${name} natural`,
    `is ${name} natty`,
    `${name} natty or juicy`,
    `${name} natural or enhanced`,
    `${name} natural bodybuilder`,
    
    // Variations with first name
    `is ${firstName} natural`,
    `${firstName} natty or juicy`,
    
    // Analysis keywords
    `${name} physique analysis`,
    `${name} transformation`,
    `${name} steroid use`,
    `${name} enhanced`,
    
    // Community keywords
    `${name} community votes`,
    `${name} expert review`,
    `${name} fitness analysis`
  ];
};