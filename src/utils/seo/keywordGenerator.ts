export interface InfluencerKeywordInput {
  name: string;
  description?: string;
  stats?: {
    totalVotes: number;
    nattyPercentage: number;
    juicyPercentage: number;
  };
  physicalStats?: {
    height?: string;
    weight?: string;
    yearsTraining?: string;
  };
  claimedStatus?: string;
  socialFollowing?: number;
  trending?: boolean;
  controversial?: boolean;
  specialties?: string[];
}

export interface SEOKeywordData {
  primary: string[];
  secondary: string[];
  longTail: string[];
  targetKeywords: string[];
  titles: string[];
  descriptions: string[];
  recommendedTitle: string;
  recommendedDescription: string;
  keywords: {
    primary: string[];
    secondary: string[];
    longTail: string[];
  };
}

export function generateInfluencerKeywords(input: InfluencerKeywordInput): SEOKeywordData {
  const { name, stats, physicalStats, trending, controversial } = input;
  
  // Base keywords
  const baseKeywords = [
    'natty or juicy',
    'natural or enhanced',
    'fitness influencer analysis',
    'bodybuilding natural test',
    'steroid detection',
    'natural bodybuilding',
    'enhanced athlete',
    'fitness authenticity'
  ];

  // Name-based keywords - optimized for "is [name] juicy" searches
  const nameKeywords = [
    `is ${name} juicy`,
    `is ${name} natural`,
    `${name} natty or juicy`,
    `${name} natural or enhanced`,
    `is ${name} natty`,
    `is ${name} on steroids`,
    `${name} steroid use`,
    `${name} natural bodybuilding`,
    `${name} fitness analysis`,
    `${name} community verdict`,
    `${name} natty or not`,
    `${name} enhanced or natural`,
    `${name} juicy or natty`,
    `${name} peds`,
    `${name} fake natty`
  ];

  // Stats-based keywords
  const statsKeywords = stats ? [
    `${name} ${stats.nattyPercentage}% natty`,
    `${name} ${stats.juicyPercentage}% enhanced`,
    `${name} community votes ${stats.totalVotes}`,
    `${name} natty percentage`,
    `${name} juicy percentage`
  ] : [];

  // Long-tail keywords - targeting specific search patterns
  const longTailKeywords = [
    `is ${name} natural bodybuilder or enhanced`,
    `is ${name} juicy or natty community verdict`,
    `${name} steroid use community analysis`,
    `${name} natural vs enhanced debate`,
    `${name} fitness transformation natural`,
    `${name} bodybuilding natural claims`,
    `${name} enhanced athlete discussion`,
    `${name} natty or not community verdict`,
    `${name} natural bodybuilding authenticity`,
    `${name} fake natty accusations`,
    `${name} peds usage analysis`,
    `${name} natural genetics vs steroids`,
    `${name} lifetime natural claims`,
    `${name} juicy evidence discussion`,
    `${name} enhanced physique analysis`
  ];

  // Combine all keywords
  const primary = [...baseKeywords, ...nameKeywords.slice(0, 5)];
  const secondary = [...statsKeywords];
  const longTail = longTailKeywords;
  const targetKeywords = [...primary, ...secondary.slice(0, 5), ...longTail.slice(0, 3)];

  // Generate titles
  const titles = generateTitles(input);
  
  // Generate descriptions
  const descriptions = generateDescriptions(input);

  return {
    primary,
    secondary,
    longTail,
    targetKeywords,
    titles,
    descriptions,
    recommendedTitle: titles[0] || `${name} - Natty or Juicy? Community Verdict`,
    recommendedDescription: descriptions[0] || `Find out if ${name} is natural or enhanced. Community analysis and expert opinions.`,
    keywords: {
      primary,
      secondary,
      longTail
    }
  };
}

function generateTitles(input: InfluencerKeywordInput): string[] {
  const { name, stats, trending, controversial } = input;
  
  const titles = [
    `Is ${name} Juicy? ${stats?.nattyPercentage || 0}% Natty | Community Verdict`,
    `${name} - Natty or Juicy? Community Analysis`,
    `Is ${name} Natural? Expert Analysis & Community Votes`,
    `${name} Natural vs Enhanced - Complete Analysis`,
    `${name} Steroid Use Analysis | Natty or Juicy`,
    `${name} - Natural Bodybuilder or Enhanced Athlete?`,
    `${name} Natty or Not? ${stats?.totalVotes || 0} Votes Cast`,
    `Is ${name} Enhanced? Community Verdict & Analysis`
  ];

  if (stats) {
    titles.unshift(`${name} - ${stats.nattyPercentage}% Natty | Community Analysis`);
  }

  if (trending) {
    titles.unshift(`${name} - Trending Fitness Analysis | Natty or Juicy`);
  }

  if (controversial) {
    titles.unshift(`${name} - Controversial Natural vs Enhanced Debate`);
  }

  return titles;
}

function generateDescriptions(input: InfluencerKeywordInput): string[] {
  const { name, stats, physicalStats, claimedStatus } = input;
  
  const descriptions = [];

  // Primary description with stats
  if (stats) {
    descriptions.push(
      `Find out if ${name} is natural or enhanced. Community votes: ${stats.nattyPercentage}% natty, ${stats.juicyPercentage}% juicy. Expert reviews, analysis, and detailed breakdown of ${name}'s physique and claims.`
    );
  }

  // Physical stats description
  if (physicalStats && physicalStats.height && physicalStats.weight) {
    descriptions.push(
      `${name} (${physicalStats.height}, ${physicalStats.weight}) - Natural or enhanced analysis. Community-driven platform to determine if this fitness influencer is natty or juicy based on physique, performance, and expert opinions.`
    );
  }

  // Fallback descriptions
  descriptions.push(
    `Comprehensive analysis of ${name} - Is this fitness influencer natural or enhanced? Community votes, expert reviews, and detailed breakdown of physique and training claims.`,
    `${name} natty or juicy analysis. Community-driven platform to determine if fitness influencers are natural or enhanced. Expert opinions and user reviews.`,
    `Vote on ${name} - Natural bodybuilder or enhanced athlete? Community analysis of fitness influencer authenticity with expert reviews and user opinions.`
  );

  return descriptions;
}

export function generateComprehensiveSEO(input: InfluencerKeywordInput): SEOKeywordData {
  return generateInfluencerKeywords(input);
}