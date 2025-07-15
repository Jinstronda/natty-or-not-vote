/**
 * Content Optimizer Utility
 * 
 * Advanced content strategy and optimization tool for SEO and user engagement:
 * - Content quality analysis
 * - SEO content optimization
 * - Readability scoring
 * - Keyword density analysis
 * - Content performance tracking
 * - A/B testing support
 * - Content gap analysis
 * - Automated content suggestions
 */

import React from 'react';

export interface ContentAnalysis {
  score: number;
  readability: number;
  seoScore: number;
  engagement: number;
  wordCount: number;
  keywordDensity: Record<string, number>;
  sentenceCount: number;
  paragraphCount: number;
  headingStructure: HeadingStructure;
  recommendations: ContentRecommendation[];
  strengths: string[];
  weaknesses: string[];
  timeToRead: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface HeadingStructure {
  h1: number;
  h2: number;
  h3: number;
  h4: number;
  h5: number;
  h6: number;
  hierarchy: boolean;
}

export interface ContentRecommendation {
  type: 'critical' | 'important' | 'suggestion';
  category: 'seo' | 'readability' | 'engagement' | 'structure' | 'keywords';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  priority: number;
  action: string;
  example?: string;
}

export interface KeywordStrategy {
  primary: string[];
  secondary: string[];
  longTail: string[];
  questions: string[];
  semantic: string[];
  trending: string[];
  difficulty: Record<string, number>;
  volume: Record<string, number>;
  competition: Record<string, number>;
}

export interface ContentPerformance {
  views: number;
  timeOnPage: number;
  bounceRate: number;
  shareRate: number;
  engagement: number;
  conversions: number;
  searchRanking: Record<string, number>;
  socialShares: number;
  backlinks: number;
  clickThroughRate: number;
}

export interface ContentOptimizationOptions {
  targetAudience: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  contentType: 'blog' | 'profile' | 'review' | 'guide' | 'comparison' | 'news';
  primaryKeywords: string[];
  targetLength: number;
  seoFocus: boolean;
  readabilityFocus: boolean;
  engagementFocus: boolean;
}

export interface ContentSuggestion {
  type: 'headline' | 'paragraph' | 'keyword' | 'structure' | 'cta';
  original: string;
  optimized: string;
  reasoning: string;
  impact: number;
  confidence: number;
}

class ContentOptimizer {
  private static instance: ContentOptimizer;
  private stopWords: Set<string>;
  private fitnessKeywords: string[];
  private nattySynonyms: string[];
  private juicySynonyms: string[];

  private constructor() {
    this.stopWords = new Set([
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'from', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
      'a', 'an', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him',
      'her', 'us', 'them', 'my', 'your', 'his', 'their', 'our'
    ]);

    this.fitnessKeywords = [
      'fitness', 'bodybuilding', 'muscle', 'training', 'workout', 'exercise',
      'gym', 'strength', 'physique', 'natural', 'enhanced', 'steroid', 'peds',
      'transformation', 'gains', 'lean', 'bulk', 'cut', 'diet', 'nutrition',
      'supplement', 'protein', 'creatine', 'testosterone', 'hormone', 'recovery'
    ];

    this.nattySynonyms = [
      'natural', 'natty', 'clean', 'drug-free', 'enhanced-free', 'pure',
      'organic', 'authentic', 'genuine', 'legitimate', 'honest', 'real'
    ];

    this.juicySynonyms = [
      'juicy', 'enhanced', 'gear', 'juice', 'assisted', 'boosted', 'artificial',
      'synthetic', 'chemical', 'steroid', 'ped', 'performance-enhanced'
    ];
  }

  public static getInstance(): ContentOptimizer {
    if (!ContentOptimizer.instance) {
      ContentOptimizer.instance = new ContentOptimizer();
    }
    return ContentOptimizer.instance;
  }

  /**
   * Analyze content comprehensively
   */
  public analyzeContent(content: string, options: ContentOptimizationOptions): ContentAnalysis {
    const words = this.extractWords(content);
    const sentences = this.extractSentences(content);
    const paragraphs = this.extractParagraphs(content);
    const headings = this.analyzeHeadingStructure(content);
    const keywordDensity = this.calculateKeywordDensity(words);
    
    const readabilityScore = this.calculateReadabilityScore(words, sentences);
    const seoScore = this.calculateSEOScore(content, options);
    const engagementScore = this.calculateEngagementScore(content, options);
    
    const overallScore = (readabilityScore + seoScore + engagementScore) / 3;
    
    const recommendations = this.generateRecommendations(content, options, {
      readability: readabilityScore,
      seo: seoScore,
      engagement: engagementScore,
      headings,
      keywordDensity
    });

    const strengths = this.identifyStrengths(content, options);
    const weaknesses = this.identifyWeaknesses(content, options);

    return {
      score: Math.round(overallScore),
      readability: Math.round(readabilityScore),
      seoScore: Math.round(seoScore),
      engagement: Math.round(engagementScore),
      wordCount: words.length,
      keywordDensity,
      sentenceCount: sentences.length,
      paragraphCount: paragraphs.length,
      headingStructure: headings,
      recommendations,
      strengths,
      weaknesses,
      timeToRead: Math.ceil(words.length / 200), // Average reading speed
      difficulty: this.calculateDifficulty(readabilityScore),
    };
  }

  /**
   * Generate keyword strategy
   */
  public generateKeywordStrategy(topic: string, competitorAnalysis?: string[]): KeywordStrategy {
    const baseKeywords = this.extractKeywordVariations(topic);
    const fitnessRelated = this.fitnessKeywords.filter(kw => 
      topic.toLowerCase().includes(kw) || baseKeywords.some(bk => bk.includes(kw))
    );
    
    const nattyRelated = this.nattySynonyms.filter(syn => 
      topic.toLowerCase().includes(syn) || baseKeywords.some(bk => bk.includes(syn))
    );
    
    const juicyRelated = this.juicySynonyms.filter(syn => 
      topic.toLowerCase().includes(syn) || baseKeywords.some(bk => bk.includes(syn))
    );

    const primary = [
      ...baseKeywords.slice(0, 5),
      ...fitnessRelated.slice(0, 3),
      ...nattyRelated.slice(0, 2),
      ...juicyRelated.slice(0, 2)
    ];

    const secondary = [
      ...baseKeywords.slice(5, 10),
      ...fitnessRelated.slice(3, 6),
      `${topic} natural`,
      `${topic} enhanced`,
      `${topic} review`,
      `${topic} analysis`
    ];

    const longTail = [
      `is ${topic} natural or enhanced`,
      `${topic} natty or juicy`,
      `${topic} steroid usage`,
      `${topic} physique analysis`,
      `${topic} transformation timeline`,
      `${topic} training method`,
      `${topic} diet and nutrition`,
      `${topic} supplement stack`
    ];

    const questions = [
      `Is ${topic} natural?`,
      `What does ${topic} use?`,
      `How did ${topic} build muscle?`,
      `Is ${topic} on steroids?`,
      `What is ${topic}'s routine?`,
      `How long has ${topic} been training?`
    ];

    const semantic = [
      'muscle building',
      'physique development',
      'strength training',
      'athletic performance',
      'body composition',
      'fitness transformation',
      'workout intensity',
      'recovery methods'
    ];

    const trending = [
      'natural bodybuilding',
      'fitness authenticity',
      'performance enhancement',
      'steroid detection',
      'muscle growth',
      'training natty',
      'enhanced physique',
      'fitness influencer'
    ];

    // Mock difficulty, volume, and competition scores
    const difficulty: Record<string, number> = {};
    const volume: Record<string, number> = {};
    const competition: Record<string, number> = {};

    [...primary, ...secondary, ...longTail].forEach(keyword => {
      difficulty[keyword] = Math.floor(Math.random() * 100);
      volume[keyword] = Math.floor(Math.random() * 10000) + 100;
      competition[keyword] = Math.floor(Math.random() * 100);
    });

    return {
      primary,
      secondary,
      longTail,
      questions,
      semantic,
      trending,
      difficulty,
      volume,
      competition
    };
  }

  /**
   * Generate content suggestions
   */
  public generateContentSuggestions(content: string, options: ContentOptimizationOptions): ContentSuggestion[] {
    const suggestions: ContentSuggestion[] = [];
    
    // Headline optimization
    const headlines = this.extractHeadlines(content);
    headlines.forEach(headline => {
      const optimized = this.optimizeHeadline(headline, options);
      if (optimized !== headline) {
        suggestions.push({
          type: 'headline',
          original: headline,
          optimized,
          reasoning: 'Optimized for better SEO and engagement',
          impact: 8,
          confidence: 85
        });
      }
    });

    // Keyword optimization
    const keywordOpportunities = this.findKeywordOpportunities(content, options);
    keywordOpportunities.forEach(opportunity => {
      suggestions.push({
        type: 'keyword',
        original: opportunity.sentence,
        optimized: opportunity.optimized,
        reasoning: `Add primary keyword "${opportunity.keyword}" for better SEO`,
        impact: 6,
        confidence: 75
      });
    });

    // Structure improvements
    const structureIssues = this.analyzeStructureIssues(content);
    structureIssues.forEach(issue => {
      suggestions.push({
        type: 'structure',
        original: issue.section,
        optimized: issue.improvement,
        reasoning: issue.reason,
        impact: 7,
        confidence: 80
      });
    });

    // CTA optimization
    const ctaOpportunities = this.findCTAOpportunities(content);
    ctaOpportunities.forEach(cta => {
      suggestions.push({
        type: 'cta',
        original: cta.original,
        optimized: cta.optimized,
        reasoning: 'Improve call-to-action for better engagement',
        impact: 9,
        confidence: 90
      });
    });

    return suggestions.sort((a, b) => b.impact - a.impact);
  }

  /**
   * A/B test content variations
   */
  public generateABTestVariations(content: string, options: ContentOptimizationOptions): {
    original: string;
    variations: Array<{
      id: string;
      content: string;
      hypothesis: string;
      expectedImprovement: string;
      confidence: number;
    }>;
  } {
    const variations = [];

    // Variation 1: Keyword-focused
    const keywordFocused = this.optimizeForKeywords(content, options);
    variations.push({
      id: 'keyword-focused',
      content: keywordFocused,
      hypothesis: 'Higher keyword density will improve SEO rankings',
      expectedImprovement: '15-25% increase in organic traffic',
      confidence: 75
    });

    // Variation 2: Engagement-focused
    const engagementFocused = this.optimizeForEngagement(content, options);
    variations.push({
      id: 'engagement-focused',
      content: engagementFocused,
      hypothesis: 'More engaging content will increase time on page',
      expectedImprovement: '20-30% increase in time on page',
      confidence: 80
    });

    // Variation 3: Readability-focused
    const readabilityFocused = this.optimizeForReadability(content, options);
    variations.push({
      id: 'readability-focused',
      content: readabilityFocused,
      hypothesis: 'Better readability will reduce bounce rate',
      expectedImprovement: '10-20% decrease in bounce rate',
      confidence: 85
    });

    return {
      original: content,
      variations
    };
  }

  /**
   * Track content performance
   */
  public trackContentPerformance(contentId: string, performance: ContentPerformance): {
    score: number;
    insights: string[];
    recommendations: string[];
  } {
    const score = this.calculatePerformanceScore(performance);
    const insights = this.generatePerformanceInsights(performance);
    const recommendations = this.generatePerformanceRecommendations(performance);

    return {
      score,
      insights,
      recommendations
    };
  }

  // Private helper methods

  private extractWords(content: string): string[] {
    return content
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !this.stopWords.has(word));
  }

  private extractSentences(content: string): string[] {
    return content
      .split(/[.!?]+/)
      .filter(sentence => sentence.trim().length > 0);
  }

  private extractParagraphs(content: string): string[] {
    return content
      .split(/\n\s*\n/)
      .filter(paragraph => paragraph.trim().length > 0);
  }

  private analyzeHeadingStructure(content: string): HeadingStructure {
    const headings = {
      h1: (content.match(/<h1[^>]*>.*?<\/h1>/gi) || []).length,
      h2: (content.match(/<h2[^>]*>.*?<\/h2>/gi) || []).length,
      h3: (content.match(/<h3[^>]*>.*?<\/h3>/gi) || []).length,
      h4: (content.match(/<h4[^>]*>.*?<\/h4>/gi) || []).length,
      h5: (content.match(/<h5[^>]*>.*?<\/h5>/gi) || []).length,
      h6: (content.match(/<h6[^>]*>.*?<\/h6>/gi) || []).length,
      hierarchy: true // Simplified check
    };

    return headings;
  }

  private calculateKeywordDensity(words: string[]): Record<string, number> {
    const density: Record<string, number> = {};
    const totalWords = words.length;

    words.forEach(word => {
      density[word] = (density[word] || 0) + 1;
    });

    Object.keys(density).forEach(word => {
      density[word] = (density[word] / totalWords) * 100;
    });

    return density;
  }

  private calculateReadabilityScore(words: string[], sentences: string[]): number {
    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = this.calculateAvgSyllables(words);
    
    // Simplified Flesch Reading Ease
    const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
    return Math.max(0, Math.min(100, score));
  }

  private calculateSEOScore(content: string, options: ContentOptimizationOptions): number {
    let score = 100;
    
    // Check keyword presence
    const keywordPresence = options.primaryKeywords.some(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())
    );
    if (!keywordPresence) score -= 30;

    // Check content length
    const wordCount = this.extractWords(content).length;
    if (wordCount < options.targetLength * 0.8) score -= 20;
    if (wordCount > options.targetLength * 1.5) score -= 10;

    // Check heading structure
    const hasH1 = content.includes('<h1');
    const hasH2 = content.includes('<h2');
    if (!hasH1) score -= 15;
    if (!hasH2) score -= 10;

    return Math.max(0, score);
  }

  private calculateEngagementScore(content: string, options: ContentOptimizationOptions): number {
    let score = 100;
    
    // Check for questions
    const questionCount = (content.match(/\?/g) || []).length;
    if (questionCount === 0) score -= 15;

    // Check for calls to action
    const ctaWords = ['click', 'read', 'learn', 'discover', 'find out', 'vote', 'share'];
    const hasCTA = ctaWords.some(word => content.toLowerCase().includes(word));
    if (!hasCTA) score -= 20;

    // Check for emotional words
    const emotionalWords = ['amazing', 'incredible', 'shocking', 'surprising', 'impressive'];
    const hasEmotional = emotionalWords.some(word => content.toLowerCase().includes(word));
    if (!hasEmotional) score -= 10;

    return Math.max(0, score);
  }

  private calculateAvgSyllables(words: string[]): number {
    const syllableCounts = words.map(word => this.countSyllables(word));
    return syllableCounts.reduce((sum, count) => sum + count, 0) / words.length;
  }

  private countSyllables(word: string): number {
    const vowels = 'aeiouy';
    let count = 0;
    let prevWasVowel = false;
    
    for (let i = 0; i < word.length; i++) {
      const isVowel = vowels.includes(word[i].toLowerCase());
      if (isVowel && !prevWasVowel) {
        count++;
      }
      prevWasVowel = isVowel;
    }
    
    // Adjust for silent 'e'
    if (word.endsWith('e') && count > 1) {
      count--;
    }
    
    return Math.max(1, count);
  }

  private generateRecommendations(content: string, options: ContentOptimizationOptions, analysis: any): ContentRecommendation[] {
    const recommendations: ContentRecommendation[] = [];

    // SEO recommendations
    if (analysis.seo < 70) {
      recommendations.push({
        type: 'critical',
        category: 'seo',
        title: 'Improve SEO Optimization',
        description: 'Content needs better keyword integration and structure',
        impact: 'high',
        effort: 'medium',
        priority: 1,
        action: 'Add primary keywords, improve heading structure, optimize meta tags'
      });
    }

    // Readability recommendations
    if (analysis.readability < 60) {
      recommendations.push({
        type: 'important',
        category: 'readability',
        title: 'Improve Readability',
        description: 'Content is too complex for target audience',
        impact: 'medium',
        effort: 'low',
        priority: 2,
        action: 'Use shorter sentences, simpler words, and better paragraph structure'
      });
    }

    // Engagement recommendations
    if (analysis.engagement < 70) {
      recommendations.push({
        type: 'suggestion',
        category: 'engagement',
        title: 'Increase Engagement',
        description: 'Content lacks engaging elements',
        impact: 'medium',
        effort: 'medium',
        priority: 3,
        action: 'Add questions, calls to action, and emotional language'
      });
    }

    return recommendations.sort((a, b) => a.priority - b.priority);
  }

  private identifyStrengths(content: string, options: ContentOptimizationOptions): string[] {
    const strengths: string[] = [];
    
    if (content.length > 500) {
      strengths.push('Comprehensive content length');
    }
    
    if (content.includes('?')) {
      strengths.push('Engaging questions included');
    }
    
    if (options.primaryKeywords.some(kw => content.toLowerCase().includes(kw.toLowerCase()))) {
      strengths.push('Primary keywords present');
    }
    
    return strengths;
  }

  private identifyWeaknesses(content: string, options: ContentOptimizationOptions): string[] {
    const weaknesses: string[] = [];
    
    if (content.length < 300) {
      weaknesses.push('Content too short');
    }
    
    if (!content.includes('<h')) {
      weaknesses.push('No heading structure');
    }
    
    if (!content.includes('?')) {
      weaknesses.push('No engaging questions');
    }
    
    return weaknesses;
  }

  private calculateDifficulty(readabilityScore: number): 'easy' | 'medium' | 'hard' {
    if (readabilityScore >= 70) return 'easy';
    if (readabilityScore >= 50) return 'medium';
    return 'hard';
  }

  private extractKeywordVariations(topic: string): string[] {
    const variations = [
      topic,
      `${topic} natural`,
      `${topic} enhanced`,
      `${topic} natty`,
      `${topic} juicy`,
      `${topic} analysis`,
      `${topic} review`,
      `${topic} verdict`,
      `${topic} physique`,
      `${topic} transformation`
    ];
    
    return variations;
  }

  private extractHeadlines(content: string): string[] {
    const headlines = [];
    const h1Matches = content.match(/<h1[^>]*>(.*?)<\/h1>/gi);
    const h2Matches = content.match(/<h2[^>]*>(.*?)<\/h2>/gi);
    
    if (h1Matches) headlines.push(...h1Matches);
    if (h2Matches) headlines.push(...h2Matches);
    
    return headlines.map(h => h.replace(/<[^>]*>/g, ''));
  }

  private optimizeHeadline(headline: string, options: ContentOptimizationOptions): string {
    const keywords = options.primaryKeywords;
    const keyword = keywords[0];
    
    if (keyword && !headline.toLowerCase().includes(keyword.toLowerCase())) {
      return `${headline} - ${keyword}`;
    }
    
    return headline;
  }

  private findKeywordOpportunities(content: string, options: ContentOptimizationOptions): Array<{
    sentence: string;
    optimized: string;
    keyword: string;
  }> {
    const opportunities = [];
    const sentences = this.extractSentences(content);
    
    sentences.forEach(sentence => {
      options.primaryKeywords.forEach(keyword => {
        if (!sentence.toLowerCase().includes(keyword.toLowerCase())) {
          opportunities.push({
            sentence,
            optimized: sentence + ` This relates to ${keyword}.`,
            keyword
          });
        }
      });
    });
    
    return opportunities.slice(0, 3); // Return top 3 opportunities
  }

  private analyzeStructureIssues(content: string): Array<{
    section: string;
    improvement: string;
    reason: string;
  }> {
    const issues = [];
    
    if (!content.includes('<h1')) {
      issues.push({
        section: 'Document',
        improvement: 'Add main heading with <h1> tag',
        reason: 'Every page needs a primary heading for SEO and structure'
      });
    }
    
    if (!content.includes('<h2')) {
      issues.push({
        section: 'Document',
        improvement: 'Add section headings with <h2> tags',
        reason: 'Subheadings improve readability and SEO'
      });
    }
    
    return issues;
  }

  private findCTAOpportunities(content: string): Array<{
    original: string;
    optimized: string;
  }> {
    const opportunities = [];
    
    if (!content.toLowerCase().includes('vote')) {
      opportunities.push({
        original: 'End of content',
        optimized: 'Vote now to share your opinion on this analysis!'
      });
    }
    
    if (!content.toLowerCase().includes('share')) {
      opportunities.push({
        original: 'End of content',
        optimized: 'Share this analysis with your fitness community!'
      });
    }
    
    return opportunities;
  }

  private optimizeForKeywords(content: string, options: ContentOptimizationOptions): string {
    let optimized = content;
    const keyword = options.primaryKeywords[0];
    
    if (keyword && !optimized.toLowerCase().includes(keyword.toLowerCase())) {
      optimized = `${keyword} - ${optimized}`;
    }
    
    return optimized;
  }

  private optimizeForEngagement(content: string, options: ContentOptimizationOptions): string {
    let optimized = content;
    
    // Add questions
    if (!optimized.includes('?')) {
      optimized += "\n\nWhat do you think about this analysis?";
    }
    
    // Add emotional words
    optimized = optimized.replace(/good/gi, 'amazing');
    optimized = optimized.replace(/bad/gi, 'terrible');
    
    return optimized;
  }

  private optimizeForReadability(content: string, options: ContentOptimizationOptions): string {
    let optimized = content;
    
    // Break long sentences
    optimized = optimized.replace(/,\s+and\s+/g, '. ');
    optimized = optimized.replace(/;\s+/g, '. ');
    
    // Add transitions
    optimized = optimized.replace(/\n\n/g, '\n\nMoreover, ');
    
    return optimized;
  }

  private calculatePerformanceScore(performance: ContentPerformance): number {
    let score = 0;
    
    // Views weight: 25%
    score += Math.min(25, (performance.views / 1000) * 25);
    
    // Time on page weight: 20%
    score += Math.min(20, (performance.timeOnPage / 300) * 20);
    
    // Bounce rate weight: 15% (inverted)
    score += Math.min(15, (1 - performance.bounceRate) * 15);
    
    // Engagement weight: 20%
    score += Math.min(20, performance.engagement * 20);
    
    // Social shares weight: 10%
    score += Math.min(10, (performance.socialShares / 100) * 10);
    
    // CTR weight: 10%
    score += Math.min(10, performance.clickThroughRate * 100);
    
    return Math.round(score);
  }

  private generatePerformanceInsights(performance: ContentPerformance): string[] {
    const insights = [];
    
    if (performance.timeOnPage > 180) {
      insights.push('High engagement: Users are spending significant time reading');
    }
    
    if (performance.bounceRate < 0.4) {
      insights.push('Low bounce rate: Content is successfully engaging visitors');
    }
    
    if (performance.socialShares > 50) {
      insights.push('High social engagement: Content is being shared frequently');
    }
    
    return insights;
  }

  private generatePerformanceRecommendations(performance: ContentPerformance): string[] {
    const recommendations = [];
    
    if (performance.bounceRate > 0.7) {
      recommendations.push('Improve content engagement to reduce bounce rate');
    }
    
    if (performance.timeOnPage < 60) {
      recommendations.push('Make content more compelling to increase time on page');
    }
    
    if (performance.socialShares < 10) {
      recommendations.push('Add social sharing buttons and improve shareability');
    }
    
    return recommendations;
  }
}

// Export singleton instance
export const contentOptimizer = ContentOptimizer.getInstance();

// Export utility functions
export const analyzeContent = (content: string, options: ContentOptimizationOptions) => {
  return contentOptimizer.analyzeContent(content, options);
};

export const generateKeywordStrategy = (topic: string, competitors?: string[]) => {
  return contentOptimizer.generateKeywordStrategy(topic, competitors);
};

export const generateContentSuggestions = (content: string, options: ContentOptimizationOptions) => {
  return contentOptimizer.generateContentSuggestions(content, options);
};

export const generateABTestVariations = (content: string, options: ContentOptimizationOptions) => {
  return contentOptimizer.generateABTestVariations(content, options);
};

export const trackContentPerformance = (contentId: string, performance: ContentPerformance) => {
  return contentOptimizer.trackContentPerformance(contentId, performance);
};

// React hook for content optimization
export function useContentOptimization(content: string, options: ContentOptimizationOptions) {
  const [analysis, setAnalysis] = React.useState<ContentAnalysis | null>(null);
  const [suggestions, setSuggestions] = React.useState<ContentSuggestion[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const analyze = async () => {
      setLoading(true);
      try {
        const contentAnalysis = contentOptimizer.analyzeContent(content, options);
        const contentSuggestions = contentOptimizer.generateContentSuggestions(content, options);
        
        setAnalysis(contentAnalysis);
        setSuggestions(contentSuggestions);
      } catch (error) {
        console.error('Content optimization error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (content) {
      analyze();
    }
  }, [content, options]);

  return {
    analysis,
    suggestions,
    loading,
    optimize: (newContent: string) => {
      return contentOptimizer.analyzeContent(newContent, options);
    }
  };
}