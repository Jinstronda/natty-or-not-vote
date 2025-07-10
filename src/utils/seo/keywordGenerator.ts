/**
 * SEO Keyword Generator for Fitness Influencer Content
 * Generates search-optimized keywords targeting "natty or not" search intent
 * Based on research into fitness influencer search patterns
 */

export interface KeywordAnalysis {
  primary: string[];
  secondary: string[];
  longTail: string[];
  questions: string[];
  localVariations: string[];
  density: number;
  searchIntent: 'informational' | 'transactional' | 'navigational';
}

export interface InfluencerKeywordInput {
  name: string;
  firstName?: string;
  lastName?: string;
  totalVotes?: number;
  nattyPercentage?: number;
  claimedStatus?: string;
  specialties?: string[];
  location?: string;
}

/**
 * Generate comprehensive keywords for an influencer profile
 * Targets exact search queries like "Is [name] natural"
 */
export function generateInfluencerKeywords(input: InfluencerKeywordInput): KeywordAnalysis {
  const { name, firstName, lastName, totalVotes, nattyPercentage, claimedStatus } = input;
  const nameVariations = generateNameVariations(name, firstName, lastName);
  
  // Primary keywords - highest search volume
  const primary = [
    `${name} natural`,
    `${name} natty`,
    `${name} enhanced`,
    `${name} juicy`,
    `${name} natty or juicy`,
    `${name} natural or enhanced`,
    `${name} steroid`,
    `${name} transformation`
  ];

  // Secondary keywords - medium search volume
  const secondary = [
    `${name} natural bodybuilder`,
    `${name} physique analysis`,
    `${name} fake natty`,
    `${name} natural claim`,
    `${name} bodybuilding`,
    `${name} fitness influencer`,
    `${name} workout routine`,
    `${name} diet plan`
  ];

  // Long-tail keywords - lower volume but higher intent
  const longTail = [
    `is ${name} natural bodybuilder`,
    `${name} natty or not analysis`,
    `${name} steroid use evidence`,
    `${name} natural vs enhanced`,
    `${name} physique achievable naturally`,
    `${name} training without steroids`,
    `${name} natural transformation timeline`,
    `${name} honest about steroids`
  ];

  // Question-based keywords - voice search optimization
  const questions = [
    `is ${name} natural`,
    `is ${name} natty`,
    `is ${name} on steroids`,
    `is ${name} enhanced`,
    `does ${name} use steroids`,
    `how did ${name} get so big`,
    `what does ${name} take`,
    `is ${name} natural or fake`
  ];

  // Add variations with first name only
  if (firstName) {
    primary.push(`${firstName} natural`, `${firstName} natty`);
    questions.push(`is ${firstName} natural`, `is ${firstName} natty`);
  }

  // Add location-based variations if available
  const localVariations = input.location ? [
    `${name} ${input.location}`,
    `${name} bodybuilder ${input.location}`,
    `natural bodybuilder ${input.location}`
  ] : [];

  // Add specialty-based keywords
  if (input.specialties?.length) {
    input.specialties.forEach(specialty => {
      secondary.push(`${name} ${specialty}`);
      longTail.push(`${name} ${specialty} natural`);
    });
  }

  // Add status-based keywords
  if (claimedStatus) {
    secondary.push(`${name} claims ${claimedStatus}`);
    longTail.push(`${name} ${claimedStatus} analysis`);
  }

  // Add vote-based keywords if available
  if (totalVotes && totalVotes > 10) {
    const percentage = Math.round(nattyPercentage || 0);
    longTail.push(`${name} ${percentage}% natural votes`);
    secondary.push(`${name} community analysis`);
  }

  return {
    primary: [...new Set(primary)],
    secondary: [...new Set(secondary)],
    longTail: [...new Set(longTail)],
    questions: [...new Set(questions)],
    localVariations: [...new Set(localVariations)],
    density: calculateKeywordDensity(primary, secondary, longTail),
    searchIntent: determineSearchIntent(primary, questions)
  };
}

/**
 * Generate name variations for keyword targeting
 */
function generateNameVariations(name: string, firstName?: string, lastName?: string): string[] {
  const variations = [name];
  
  if (firstName && lastName) {
    variations.push(firstName, lastName, `${firstName} ${lastName}`);
  } else {
    const nameParts = name.split(' ');
    if (nameParts.length >= 2) {
      variations.push(nameParts[0], nameParts[nameParts.length - 1]);
    }
  }
  
  return [...new Set(variations)];
}

/**
 * Calculate keyword density score (0-100)
 */
function calculateKeywordDensity(primary: string[], secondary: string[], longTail: string[]): number {
  const totalKeywords = primary.length + secondary.length + longTail.length;
  const uniqueKeywords = new Set([...primary, ...secondary, ...longTail]).size;
  
  // Higher density = more keyword variations
  return Math.round((uniqueKeywords / totalKeywords) * 100);
}

/**
 * Determine search intent based on keyword patterns
 */
function determineSearchIntent(primary: string[], questions: string[]): 'informational' | 'transactional' | 'navigational' {
  const informationalIndicators = ['natural', 'analysis', 'review', 'opinion'];
  const transactionalIndicators = ['buy', 'program', 'course', 'supplement'];
  
  const hasInformational = primary.some(keyword => 
    informationalIndicators.some(indicator => keyword.includes(indicator))
  );
  
  const hasTransactional = primary.some(keyword => 
    transactionalIndicators.some(indicator => keyword.includes(indicator))
  );
  
  if (hasTransactional) return 'transactional';
  if (hasInformational || questions.length > 0) return 'informational';
  return 'navigational';
}

/**
 * Generate SEO-optimized title variations
 */
export function generateSEOTitles(input: InfluencerKeywordInput): string[] {
  const { name, totalVotes, nattyPercentage } = input;
  
  const titles = [
    `Is ${name} Natural? Expert Analysis & Community Votes`,
    `${name} Natty or Juicy? Complete Analysis & Reviews`,
    `${name} Natural or Enhanced? Community Analysis`,
    `Is ${name} Natural? Physique Analysis & Expert Reviews`
  ];
  
  // Add vote-based titles if available
  if (totalVotes && totalVotes > 10) {
    const percentage = Math.round(nattyPercentage || 0);
    titles.push(`Is ${name} Natural? ${percentage}% Say Yes | ${totalVotes} Votes`);
    titles.push(`${name} Natural Analysis: ${percentage}% Community Rating`);
  }
  
  return titles;
}

/**
 * Generate SEO-optimized descriptions
 */
export function generateSEODescriptions(input: InfluencerKeywordInput): string[] {
  const { name, totalVotes, nattyPercentage, claimedStatus } = input;
  
  const descriptions = [
    `Find out if ${name} is natural or enhanced. See community analysis, expert reviews, and detailed physique breakdown.`,
    `Is ${name} natty or juicy? Comprehensive analysis with community votes, expert opinions, and evidence-based review.`,
    `${name} natural vs enhanced analysis. Community-driven evaluation with expert insights and detailed assessment.`
  ];
  
  // Add vote-based descriptions
  if (totalVotes && totalVotes > 10) {
    const percentage = Math.round(nattyPercentage || 0);
    descriptions.push(`${name} analysis: ${percentage}% of ${totalVotes} community votes say natural. Expert reviews and detailed breakdown.`);
  }
  
  // Add status-based descriptions
  if (claimedStatus) {
    descriptions.push(`${name} claims to be ${claimedStatus}. Community analysis and expert evaluation of natural vs enhanced status.`);
  }
  
  return descriptions.map(desc => desc.substring(0, 160)); // Google's limit
}

/**
 * Analyze keyword competition and difficulty
 */
export function analyzeKeywordDifficulty(keywords: string[]): { [key: string]: number } {
  const difficulty: { [key: string]: number } = {};
  
  keywords.forEach(keyword => {
    // Estimate difficulty based on keyword characteristics
    let score = 50; // Base difficulty
    
    // Long-tail keywords are easier
    if (keyword.split(' ').length >= 4) score -= 20;
    
    // Questions are easier for voice search
    if (keyword.startsWith('is ') || keyword.startsWith('does ')) score -= 15;
    
    // Generic fitness terms are harder
    if (keyword.includes('bodybuilding') || keyword.includes('fitness')) score += 10;
    
    // Ensure score is between 0-100
    difficulty[keyword] = Math.max(0, Math.min(100, score));
  });
  
  return difficulty;
}

/**
 * Generate content outline based on keywords
 */
export function generateContentOutline(keywords: KeywordAnalysis): string[] {
  const outline = [
    'Introduction: Who is this influencer?',
    'Physical Assessment and Analysis',
    'Training History and Timeline',
    'Claims vs Reality',
    'Community Votes and Analysis',
    'Expert Reviews and Opinions',
    'Evidence-Based Conclusion'
  ];
  
  // Add keyword-specific sections
  if (keywords.questions.length > 0) {
    outline.push('Frequently Asked Questions');
  }
  
  if (keywords.localVariations.length > 0) {
    outline.push('Background and Origin');
  }
  
  return outline;
}

/**
 * Export utility for generating all SEO content at once
 */
export function generateComprehensiveSEO(input: InfluencerKeywordInput) {
  const keywords = generateInfluencerKeywords(input);
  const titles = generateSEOTitles(input);
  const descriptions = generateSEODescriptions(input);
  const difficulty = analyzeKeywordDifficulty([...keywords.primary, ...keywords.secondary]);
  const outline = generateContentOutline(keywords);
  
  return {
    keywords,
    titles,
    descriptions,
    difficulty,
    outline,
    recommendedTitle: titles[0],
    recommendedDescription: descriptions[0],
    targetKeywords: keywords.primary.slice(0, 5), // Top 5 primary keywords
    longTailOpportunities: keywords.longTail.slice(0, 10) // Top 10 long-tail opportunities
  };
}