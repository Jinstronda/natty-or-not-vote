/**
 * SAFE EXAMPLES: How to use the new SEO components
 * Sequential thinking implementation examples
 */

import { InfluencerSpecificSEO } from './InfluencerSpecificSEO';
import { DynamicMeta } from './DynamicMeta';

/**
 * EXAMPLE 1: Basic Implementation in Influencer Page
 * Replace existing meta tags with this enhanced version
 */
export const ExampleInfluencerPageSEO = () => {
  // Example: Geoffrey Verity data
  const influencer = {
    id: '1',
    name: 'Geoffrey Verity',
    image: 'https://example.com/geoffrey.jpg',
    description: 'Fitness influencer and natural bodybuilder',
    height: '6\'0"',
    weight: '180 lbs',
    years_training: '8 years',
    claimed_status: 'natural'
  };

  // Example vote data from your database
  const voteData = {
    totalVotes: 234,
    nattyPercentage: 67.5,
    juicyPercentage: 32.5
  };

  // Example expert reviews
  const expertReviews = [
    {
      author: 'Dr. Fitness Expert',
      content: 'Based on his progression timeline and physique, Geoffrey appears to be natural.',
      rating: 4,
      natty_or_not: 'natty'
    }
  ];

  return (
    <InfluencerSpecificSEO
      influencer={influencer}
      voteData={voteData}
      expertReviews={expertReviews}
    />
  );
};

/**
 * EXAMPLE 2: What the SEO will generate
 * This shows the exact output for Geoffrey Verity
 */
export const GeoffreyVerityExampleSEO = () => {
  /*
  Generated SEO for Geoffrey Verity:
  
  TITLE: "Is Geoffrey Verity Natural? 68% Say Natural | Community Analysis"
  
  DESCRIPTION: "Find out if Geoffrey Verity is natural or enhanced. 234 community votes - 68% say natural. 1 expert reviews. 6'0", 180 lbs. 8 years training. See analysis, votes, and expert opinions."
  
  KEYWORDS: "Geoffrey Verity natural, Geoffrey Verity natty, is Geoffrey Verity natural, Geoffrey Verity natty or juicy, Geoffrey Verity natural bodybuilder"
  
  STRUCTURED DATA:
  {
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is Geoffrey Verity natural?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Based on community analysis, 68% of 234 voters believe Geoffrey Verity is natural (natty), while 32% believe he is enhanced (juicy). Expert reviews and analysis are available."
        }
      }
    ]
  }
  */
  
  return null; // This is just documentation
};

/**
 * EXAMPLE 3: Search Results Preview
 * How it will appear in Google search results
 */
export const SearchResultsPreview = () => {
  /*
  GOOGLE SEARCH RESULTS:
  
  🔍 Search: "is geoffrey verity natural"
  
  📍 Result:
  Is Geoffrey Verity Natural? 68% Say Natural | Community Analysis
  https://nattyorjuicy.com/influencer/geoffrey-verity
  Find out if Geoffrey Verity is natural or enhanced. 234 community votes - 68% say natural. 1 expert reviews. 6'0", 180 lbs. 8 years training...
  
  🔍 Search: "geoffrey verity natty or juicy"
  
  📍 Result:
  Geoffrey Verity Natty or Juicy? 68% Say Natural | Community Votes
  https://nattyorjuicy.com/influencer/geoffrey-verity
  Community analysis of Geoffrey Verity's natural vs enhanced status. See 234 votes, expert reviews, and detailed physique analysis...
  
  📍 People Also Ask:
  ▼ Is Geoffrey Verity natural?
  ▼ Is Geoffrey Verity a natural bodybuilder?
  ▼ Geoffrey Verity transformation - natural or enhanced?
  */
  
  return null; // This is just documentation
};

/**
 * EXAMPLE 4: How to integrate with existing components
 * Safe integration without breaking existing functionality
 */
export const IntegrationExample = () => {
  /*
  STEP 1: In your existing InfluencerProfile component
  
  // OLD WAY (still works):
  import { InfluencerMeta } from '@/components/SEO/DynamicMeta';
  
  function InfluencerProfile({ influencer }) {
    return (
      <>
        <InfluencerMeta influencer={influencer} />
        {rest of component}
      </>
    );
  }
  
  // NEW WAY (enhanced SEO):
  import { InfluencerSpecificSEO } from '@/components/SEO/InfluencerSpecificSEO';
  
  function InfluencerProfile({ influencer, voteData, expertReviews }) {
    return (
      <>
        <InfluencerSpecificSEO 
          influencer={influencer}
          voteData={voteData}
          expertReviews={expertReviews}
        />
        {rest of component}
      </>
    );
  }
  
  STEP 2: Pass additional data
  
  // Get vote data from your existing hooks
  const voteData = useVoteStats(influencer.id);
  const expertReviews = useExpertReviews(influencer.id);
  
  // Pass to SEO component
  <InfluencerSpecificSEO 
    influencer={influencer}
    voteData={voteData}
    expertReviews={expertReviews}
  />
  */
  
  return null; // This is just documentation
};

/**
 * EXAMPLE 5: Target Keywords for Different Influencers
 * Shows what keywords each influencer will target
 */
export const TargetKeywordExamples = () => {
  /*
  DAVID LAID:
  - "is david laid natural"
  - "david laid natty or juicy"
  - "david laid natural bodybuilder"
  - "david laid transformation"
  
  JEFF SEID:
  - "is jeff seid natural"
  - "jeff seid natty or juicy"
  - "jeff seid natural bodybuilder"
  - "jeff seid steroid use"
  
  ZYZZ:
  - "is zyzz natural"
  - "zyzz natty or juicy"
  - "zyzz natural bodybuilder"
  - "zyzz transformation"
  
  CHRIS BUMSTEAD:
  - "is chris bumstead natural"
  - "chris bumstead natty or juicy"
  - "cbum natural bodybuilder"
  - "chris bumstead enhanced"
  */
  
  return null; // This is just documentation
};