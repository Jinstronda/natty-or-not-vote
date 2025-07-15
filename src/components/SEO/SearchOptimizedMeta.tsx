/**
 * Search-Optimized Meta Tags Component
 * Specifically targets "is [name] natural" and "is [name] on steroids" searches
 */

import React from 'react';
import { DynamicMeta } from './DynamicMeta';
import { StructuredData } from './StructuredData';

interface SearchOptimizedMetaProps {
  influencerName: string;
  influencerId: string;
  stats?: {
    nattyPercentage: number;
    juicyPercentage: number;
    totalVotes: number;
  };
  expertReviews?: Array<{
    id: string;
    author: string;
    content: string;
    rating: number;
  }>;
  image?: string;
  lastUpdated?: string;
}

/**
 * Generate SEO-friendly slug
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

/**
 * Generate search-optimized title targeting specific queries
 */
function generateSearchOptimizedTitle(
  name: string,
  stats?: SearchOptimizedMetaProps['stats']
): string {
  if (stats) {
    const verdict = stats.nattyPercentage > 50 ? 'Natural' : 'Enhanced';
    const percentage = stats.nattyPercentage > 50 ? stats.nattyPercentage : stats.juicyPercentage;
    return `Is ${name} Natural? ${percentage.toFixed(1)}% Say ${verdict} | Community Verdict`;
  }
  
  return `Is ${name} Natural or Enhanced? Community Analysis | Natty or Juicy`;
}

/**
 * Generate search-optimized description
 */
function generateSearchOptimizedDescription(
  name: string,
  stats?: SearchOptimizedMetaProps['stats']
): string {
  if (stats) {
    const verdict = stats.nattyPercentage > 50 ? 'natural' : 'enhanced';
    const confidence = Math.abs(stats.nattyPercentage - 50);
    const confidenceLevel = confidence > 30 ? 'strong' : confidence > 15 ? 'moderate' : 'split';
    
    return `Is ${name} natural or on steroids? ${stats.nattyPercentage.toFixed(1)}% say natural, ${stats.juicyPercentage.toFixed(1)}% say enhanced. ${confidenceLevel} community verdict with ${stats.totalVotes} votes. Expert analysis of ${name}'s physique, training, and natural vs enhanced status.`;
  }
  
  return `Is ${name} natural or enhanced? Community analysis and expert reviews to determine if ${name} is natty or juicy. Vote and discover the truth about ${name}'s natural bodybuilding status.`;
}

/**
 * Generate search-optimized keywords
 */
function generateSearchKeywords(name: string): string {
  const firstName = name.split(' ')[0].toLowerCase();
  const slug = generateSlug(name);
  
  const keywords = [
    `is ${name.toLowerCase()} natural`,
    `is ${name.toLowerCase()} on steroids`,
    `${name.toLowerCase()} natty or juice`,
    `${name.toLowerCase()} natural bodybuilding`,
    `${name.toLowerCase()} enhanced`,
    `${firstName} natural`,
    `${firstName} steroids`,
    `${slug} natty`,
    `natty or juicy ${name.toLowerCase()}`,
    `${name.toLowerCase()} community verdict`,
    `${name.toLowerCase()} fitness analysis`,
    `natural vs enhanced ${name.toLowerCase()}`,
    `${name.toLowerCase()} steroid use`,
    `${name.toLowerCase()} natty or not`,
    `${name.toLowerCase()} peds`,
    `${name.toLowerCase()} bodybuilding`,
    `${name.toLowerCase()} fitness`,
    `${name.toLowerCase()} training`,
    `${name.toLowerCase()} physique analysis`,
    `${name.toLowerCase()} expert review`
  ];
  
  return keywords.join(', ');
}

/**
 * Generate FAQ structured data for People Also Ask
 */
function generateFAQStructuredData(name: string, stats?: SearchOptimizedMetaProps['stats']) {
  const verdict = stats && stats.nattyPercentage > 50 ? 'natural' : 'enhanced';
  const confidence = stats ? Math.abs(stats.nattyPercentage - 50) : 0;
  const confidenceLevel = confidence > 30 ? 'strong' : confidence > 15 ? 'moderate' : 'split';
  
  return {
    "mainEntity": [
      {
        "@type": "Question",
        "name": `Is ${name} natural?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": stats 
            ? `Based on community analysis, ${stats.nattyPercentage.toFixed(1)}% of ${stats.totalVotes} votes consider ${name} to be natural, while ${stats.juicyPercentage.toFixed(1)}% believe they are enhanced. This represents a ${confidenceLevel} community verdict.`
            : `${name} is analyzed by our community to determine if they are natural or enhanced. Vote and see expert reviews to form your own opinion.`
        }
      },
      {
        "@type": "Question",
        "name": `Is ${name} on steroids?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": stats
            ? `Community analysis shows ${stats.juicyPercentage.toFixed(1)}% of voters believe ${name} is enhanced, while ${stats.nattyPercentage.toFixed(1)}% consider them natural. The verdict is based on ${stats.totalVotes} community votes.`
            : `Join our community discussion to analyze if ${name} is on steroids or natural. Expert reviews and community votes help determine the truth.`
        }
      },
      {
        "@type": "Question",
        "name": `What is ${name}'s natty or juicy verdict?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": stats
            ? `The current community verdict for ${name} is ${verdict} with ${stats.nattyPercentage.toFixed(1)}% voting natural and ${stats.juicyPercentage.toFixed(1)}% voting enhanced out of ${stats.totalVotes} total votes.`
            : `${name}'s natty or juicy verdict is determined by community voting and expert analysis. Join the discussion to see the current results.`
        }
      },
      {
        "@type": "Question",
        "name": `How is ${name} analyzed for steroid use?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `${name} is analyzed through community voting, expert reviews, and evidence-based assessment. Factors include physique development, training history, and timeline of gains.`
        }
      }
    ]
  };
}

/**
 * Generate Person structured data with fitness focus
 */
function generatePersonStructuredData(
  name: string,
  influencerId: string,
  stats?: SearchOptimizedMetaProps['stats'],
  image?: string
) {
  const slug = generateSlug(name);
  
  return {
    "name": name,
    "url": `https://nattyorjuicy.com/influencer/${slug}`,
    "sameAs": `https://nattyorjuicy.com/influencer/${influencerId}`,
    "image": image || "https://nattyorjuicy.com/LOGO.png",
    "description": stats
      ? `${name} - Community analysis shows ${stats.nattyPercentage.toFixed(1)}% natural, ${stats.juicyPercentage.toFixed(1)}% enhanced (${stats.totalVotes} votes)`
      : `${name} - Natural vs enhanced analysis and community verdict`,
    "knowsAbout": [
      "Bodybuilding",
      "Fitness",
      "Natural bodybuilding",
      "Training",
      "Nutrition"
    ],
    "memberOf": {
      "@type": "Organization",
      "name": "Natty or Juicy Community",
      "url": "https://nattyorjuicy.com"
    }
  };
}

/**
 * Generate Article structured data for rich snippets
 */
function generateArticleStructuredData(
  name: string,
  stats?: SearchOptimizedMetaProps['stats'],
  lastUpdated?: string
) {
  const slug = generateSlug(name);
  
  return {
    "headline": `Is ${name} Natural? Community Analysis and Expert Reviews`,
    "description": generateSearchOptimizedDescription(name, stats),
    "author": {
      "@type": "Organization",
      "name": "Natty or Juicy Community"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Natty or Juicy",
      "logo": {
        "@type": "ImageObject",
        "url": "https://nattyorjuicy.com/LOGO.png"
      }
    },
    "datePublished": lastUpdated || new Date().toISOString(),
    "dateModified": lastUpdated || new Date().toISOString(),
    "url": `https://nattyorjuicy.com/influencer/${slug}`,
    "image": "https://nattyorjuicy.com/LOGO.png",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://nattyorjuicy.com/influencer/${slug}`
    },
    "about": {
      "@type": "Thing",
      "name": `${name} Natural vs Enhanced Analysis`,
      "description": `Community analysis of ${name}'s natural or enhanced status`
    }
  };
}

/**
 * Main SearchOptimizedMeta component
 */
export const SearchOptimizedMeta: React.FC<SearchOptimizedMetaProps> = ({
  influencerName,
  influencerId,
  stats,
  expertReviews,
  image,
  lastUpdated
}) => {
  const slug = generateSlug(influencerName);
  const title = generateSearchOptimizedTitle(influencerName, stats);
  const description = generateSearchOptimizedDescription(influencerName, stats);
  const keywordsString = generateSearchKeywords(influencerName);
  const keywords = keywordsString.split(', ');
  const canonicalUrl = `https://nattyorjuicy.com/influencer/${slug}`;
  
  // Structured data
  const faqData = generateFAQStructuredData(influencerName, stats);
  const personData = generatePersonStructuredData(influencerName, influencerId, stats, image);
  const articleData = generateArticleStructuredData(influencerName, stats, lastUpdated);
  
  return (
    <>
      <DynamicMeta
        title={title}
        description={description}
        keywords={keywords}
        canonical={canonicalUrl}
        robots="index, follow"
        openGraph={{
          title: title,
          description: description,
          url: canonicalUrl,
          type: 'article',
          image: image || 'https://nattyorjuicy.com/LOGO.png',
          siteName: 'Natty or Juicy'
        }}
        twitter={{
          card: 'summary_large_image',
          site: '@nattyorjuicy',
          title: title,
          description: description,
          image: image || 'https://nattyorjuicy.com/LOGO.png'
        }}
      />
      
      {/* FAQ Schema for People Also Ask */}
      <StructuredData type="FAQPage" data={faqData} />
      
      {/* Person Schema */}
      <StructuredData type="Person" data={personData} />
      
      {/* Article Schema */}
      <StructuredData type="Article" data={articleData} />
      
      {/* Additional meta tags for search optimization */}
      <meta name="author" content="Natty or Juicy Community" />
      <meta name="publisher" content="Natty or Juicy" />
      <meta name="topic" content={`${influencerName} natural vs enhanced analysis`} />
      <meta name="subject" content="Natural bodybuilding analysis" />
      <meta name="classification" content="Fitness, Bodybuilding, Natural vs Enhanced" />
      <meta name="target" content="fitness enthusiasts, bodybuilding community" />
      <meta name="audience" content="fitness enthusiasts, bodybuilding fans" />
      <meta name="coverage" content="Worldwide" />
      <meta name="distribution" content="Global" />
      <meta name="rating" content="General" />
      <meta name="revisit-after" content="7 days" />
      
      {/* Additional Open Graph tags */}
      <meta property="og:locale" content="en_US" />
      <meta property="og:updated_time" content={lastUpdated || new Date().toISOString()} />
      <meta property="article:author" content="Natty or Juicy Community" />
      <meta property="article:publisher" content="Natty or Juicy" />
      <meta property="article:section" content="Fitness Analysis" />
      <meta property="article:tag" content="natural bodybuilding" />
      <meta property="article:tag" content="enhanced athletes" />
      <meta property="article:tag" content="steroid detection" />
      <meta property="article:tag" content="fitness community" />
      
      {/* Twitter Card additional tags */}
      <meta name="twitter:domain" content="nattyorjuicy.com" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:label1" content="Community Verdict" />
      <meta name="twitter:data1" content={stats ? `${stats.nattyPercentage.toFixed(1)}% Natural` : 'Analyzing...'} />
      <meta name="twitter:label2" content="Total Votes" />
      <meta name="twitter:data2" content={stats ? stats.totalVotes.toString() : '0'} />
    </>
  );
};

export default SearchOptimizedMeta;