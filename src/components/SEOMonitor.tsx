/**
 * SEO Monitor Component
 * 
 * Real-time SEO performance monitoring dashboard with:
 * - Core Web Vitals tracking
 * - SEO health scoring
 * - Search ranking analysis
 * - Performance recommendations
 * - Analytics integration
 * - Structured data validation
 * - Competitive analysis
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Search, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  BarChart3,
  Globe,
  Zap,
  Target,
  RefreshCw,
  ExternalLink,
  Activity
} from 'lucide-react';
import { useWebVitals } from '@/utils/webVitals';

interface SEOMetrics {
  seoScore: number;
  pageSpeed: number;
  mobileScore: number;
  accessibility: number;
  bestPractices: number;
  searchVisibility: number;
  organicTraffic: number;
  keywordRankings: number;
  backlinks: number;
  indexedPages: number;
  coreWebVitals: {
    lcp: number;
    inp: number;
    cls: number;
    fcp: number;
    ttfb: number;
  };
  structuredData: {
    valid: boolean;
    errors: number;
    warnings: number;
    coverage: number;
  };
  recommendations: Array<{
    type: 'critical' | 'warning' | 'info';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'low' | 'medium' | 'high';
    action: string;
  }>;
  lastUpdated: string;
}

interface CompetitorData {
  name: string;
  domain: string;
  seoScore: number;
  ranking: number;
  traffic: number;
  backlinks: number;
}

interface KeywordData {
  keyword: string;
  position: number;
  volume: number;
  difficulty: number;
  trend: 'up' | 'down' | 'stable';
  clicks: number;
  impressions: number;
}

export const SEOMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<SEOMetrics | null>(null);
  const [competitors, setCompetitors] = useState<CompetitorData[]>([]);
  const [keywords, setKeywords] = useState<KeywordData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'vitals' | 'keywords' | 'competitors'>('overview');
  
  // Web Vitals integration
  const { report: webVitalsReport } = useWebVitals();

  // Mock data generation (in production, connect to real SEO APIs)
  const generateMockData = useCallback((): SEOMetrics => {
    const baseScore = 75 + Math.random() * 20;
    return {
      seoScore: Math.round(baseScore),
      pageSpeed: Math.round(80 + Math.random() * 15),
      mobileScore: Math.round(85 + Math.random() * 10),
      accessibility: Math.round(90 + Math.random() * 8),
      bestPractices: Math.round(88 + Math.random() * 10),
      searchVisibility: Math.round(65 + Math.random() * 25),
      organicTraffic: Math.round(1500 + Math.random() * 500),
      keywordRankings: Math.round(45 + Math.random() * 30),
      backlinks: Math.round(180 + Math.random() * 50),
      indexedPages: Math.round(150 + Math.random() * 20),
      coreWebVitals: {
        lcp: webVitalsReport?.lcp?.value || 2100 + Math.random() * 400,
        inp: webVitalsReport?.inp?.value || 180 + Math.random() * 50,
        cls: webVitalsReport?.cls?.value || 0.08 + Math.random() * 0.04,
        fcp: webVitalsReport?.fcp?.value || 1600 + Math.random() * 300,
        ttfb: webVitalsReport?.ttfb?.value || 650 + Math.random() * 200,
      },
      structuredData: {
        valid: true,
        errors: Math.floor(Math.random() * 3),
        warnings: Math.floor(Math.random() * 5),
        coverage: Math.round(85 + Math.random() * 10),
      },
      recommendations: [
        {
          type: 'critical',
          title: 'Improve Core Web Vitals',
          description: 'LCP score needs improvement for better user experience',
          impact: 'high',
          effort: 'medium',
          action: 'Optimize image loading and reduce server response time'
        },
        {
          type: 'warning',
          title: 'Add Missing Alt Text',
          description: 'Some images are missing alt text for accessibility',
          impact: 'medium',
          effort: 'low',
          action: 'Add descriptive alt text to all images'
        },
        {
          type: 'info',
          title: 'Optimize Meta Descriptions',
          description: 'Some pages have suboptimal meta descriptions',
          impact: 'medium',
          effort: 'low',
          action: 'Write compelling meta descriptions for all pages'
        }
      ],
      lastUpdated: new Date().toISOString(),
    };
  }, [webVitalsReport]);

  const generateMockCompetitors = useCallback((): CompetitorData[] => {
    return [
      {
        name: 'Fitness Authenticity Hub',
        domain: 'fitnessauth.com',
        seoScore: 82,
        ranking: 1,
        traffic: 2500,
        backlinks: 340
      },
      {
        name: 'Natural Body Check',
        domain: 'naturalbodycheck.com',
        seoScore: 78,
        ranking: 2,
        traffic: 1800,
        backlinks: 280
      },
      {
        name: 'Steroid Detector',
        domain: 'steroiddetector.net',
        seoScore: 75,
        ranking: 3,
        traffic: 1600,
        backlinks: 220
      }
    ];
  }, []);

  const generateMockKeywords = useCallback((): KeywordData[] => {
    return [
      {
        keyword: 'natty or not',
        position: 3,
        volume: 8100,
        difficulty: 65,
        trend: 'up',
        clicks: 420,
        impressions: 12000
      },
      {
        keyword: 'natural bodybuilding',
        position: 12,
        volume: 14800,
        difficulty: 78,
        trend: 'stable',
        clicks: 280,
        impressions: 8500
      },
      {
        keyword: 'fitness influencer natural',
        position: 7,
        volume: 3200,
        difficulty: 55,
        trend: 'up',
        clicks: 180,
        impressions: 4200
      },
      {
        keyword: 'enhanced vs natural',
        position: 15,
        volume: 2100,
        difficulty: 42,
        trend: 'down',
        clicks: 95,
        impressions: 2800
      }
    ];
  }, []);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setMetrics(generateMockData());
        setCompetitors(generateMockCompetitors());
        setKeywords(generateMockKeywords());
      } catch (error) {
        console.error('Error loading SEO data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [generateMockData, generateMockCompetitors, generateMockKeywords]);

  // Refresh data
  const refreshData = async () => {
    setRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setMetrics(generateMockData());
      setCompetitors(generateMockCompetitors());
      setKeywords(generateMockKeywords());
    } catch (error) {
      console.error('Error refreshing SEO data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get score background color
  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  // Get trend icon
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  // Get Web Vitals status
  const getWebVitalsStatus = (metric: string, value: number) => {
    const thresholds = {
      lcp: { good: 2500, poor: 4000 },
      inp: { good: 200, poor: 500 },
      cls: { good: 0.1, poor: 0.25 },
      fcp: { good: 1800, poor: 3000 },
      ttfb: { good: 800, poor: 1800 }
    };

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">SEO Monitor</h2>
          <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unable to load SEO metrics. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">SEO Monitor</h2>
          <p className="text-muted-foreground">
            Real-time SEO performance tracking and optimization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={refreshData} 
            disabled={refreshing}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button size="sm" variant="outline" asChild>
            <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Search Console
            </a>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {[
          { key: 'overview', label: 'Overview', icon: BarChart3 },
          { key: 'vitals', label: 'Core Web Vitals', icon: Zap },
          { key: 'keywords', label: 'Keywords', icon: Search },
          { key: 'competitors', label: 'Competitors', icon: Target }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setSelectedTab(tab.key as any)}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              selectedTab === tab.key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">SEO Score</p>
                    <p className={`text-2xl font-bold ${getScoreColor(metrics.seoScore)}`}>
                      {metrics.seoScore}
                    </p>
                  </div>
                  <div className={`p-2 rounded-full ${getScoreBgColor(metrics.seoScore)}`}>
                    <Target className="w-4 h-4" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Page Speed</p>
                    <p className={`text-2xl font-bold ${getScoreColor(metrics.pageSpeed)}`}>
                      {metrics.pageSpeed}
                    </p>
                  </div>
                  <div className={`p-2 rounded-full ${getScoreBgColor(metrics.pageSpeed)}`}>
                    <Zap className="w-4 h-4" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Organic Traffic</p>
                    <p className="text-2xl font-bold">{metrics.organicTraffic.toLocaleString()}</p>
                  </div>
                  <div className="p-2 rounded-full bg-blue-100">
                    <Eye className="w-4 h-4" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Keywords</p>
                    <p className="text-2xl font-bold">{metrics.keywordRankings}</p>
                  </div>
                  <div className="p-2 rounded-full bg-purple-100">
                    <Search className="w-4 h-4" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Backlinks</p>
                    <p className="text-2xl font-bold">{metrics.backlinks}</p>
                  </div>
                  <div className="p-2 rounded-full bg-green-100">
                    <Globe className="w-4 h-4" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Indexed Pages</p>
                    <p className="text-2xl font-bold">{metrics.indexedPages}</p>
                  </div>
                  <div className="p-2 rounded-full bg-orange-100">
                    <Globe className="w-4 h-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Scores */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Scores</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Page Speed</span>
                  <div className="flex items-center gap-2">
                    <Progress value={metrics.pageSpeed} className="w-24" />
                    <span className="text-sm font-medium">{metrics.pageSpeed}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Mobile Score</span>
                  <div className="flex items-center gap-2">
                    <Progress value={metrics.mobileScore} className="w-24" />
                    <span className="text-sm font-medium">{metrics.mobileScore}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Accessibility</span>
                  <div className="flex items-center gap-2">
                    <Progress value={metrics.accessibility} className="w-24" />
                    <span className="text-sm font-medium">{metrics.accessibility}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Best Practices</span>
                  <div className="flex items-center gap-2">
                    <Progress value={metrics.bestPractices} className="w-24" />
                    <span className="text-sm font-medium">{metrics.bestPractices}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Structured Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Status</span>
                  <Badge variant={metrics.structuredData.valid ? 'default' : 'destructive'}>
                    {metrics.structuredData.valid ? 'Valid' : 'Invalid'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Coverage</span>
                  <div className="flex items-center gap-2">
                    <Progress value={metrics.structuredData.coverage} className="w-24" />
                    <span className="text-sm font-medium">{metrics.structuredData.coverage}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Errors</span>
                  <Badge variant={metrics.structuredData.errors > 0 ? 'destructive' : 'default'}>
                    {metrics.structuredData.errors}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Warnings</span>
                  <Badge variant={metrics.structuredData.warnings > 0 ? 'secondary' : 'default'}>
                    {metrics.structuredData.warnings}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Optimization Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      {rec.type === 'critical' && <AlertCircle className="w-5 h-5 text-red-500" />}
                      {rec.type === 'warning' && <AlertCircle className="w-5 h-5 text-yellow-500" />}
                      {rec.type === 'info' && <CheckCircle className="w-5 h-5 text-blue-500" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{rec.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {rec.impact} impact
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {rec.effort} effort
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                      <p className="text-sm font-medium text-primary">{rec.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Core Web Vitals Tab */}
      {selectedTab === 'vitals' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(metrics.coreWebVitals).map(([key, value]) => {
              const status = getWebVitalsStatus(key, value);
              const displayValue = key === 'cls' ? value.toFixed(3) : Math.round(value);
              const unit = key === 'cls' ? '' : 'ms';
              
              return (
                <Card key={key}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">{key.toUpperCase()}</h3>
                      <Badge 
                        variant={status === 'good' ? 'default' : status === 'needs-improvement' ? 'secondary' : 'destructive'}
                      >
                        {status === 'good' ? 'Good' : status === 'needs-improvement' ? 'Needs Work' : 'Poor'}
                      </Badge>
                    </div>
                    <div className="text-3xl font-bold mb-2">
                      {displayValue}{unit}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {key === 'lcp' && 'Largest Contentful Paint'}
                      {key === 'inp' && 'Interaction to Next Paint'}
                      {key === 'cls' && 'Cumulative Layout Shift'}
                      {key === 'fcp' && 'First Contentful Paint'}
                      {key === 'ttfb' && 'Time to First Byte'}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Core Web Vitals Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your Core Web Vitals are being monitored in real-time. Overall performance is {webVitalsReport?.overallRating || 'good'}.
                  </AlertDescription>
                </Alert>
                
                {webVitalsReport?.recommendations && webVitalsReport.recommendations.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Performance Recommendations:</h4>
                    <ul className="space-y-1">
                      {webVitalsReport.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-muted-foreground">
                          • {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Keywords Tab */}
      {selectedTab === 'keywords' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Keyword Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {keywords.map((keyword, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{keyword.keyword}</h4>
                        {getTrendIcon(keyword.trend)}
                        <Badge variant="outline">#{keyword.position}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Volume: {keyword.volume.toLocaleString()}</span>
                        <span>Clicks: {keyword.clicks}</span>
                        <span>Impressions: {keyword.impressions.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Difficulty</div>
                      <div className="font-medium">{keyword.difficulty}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Competitors Tab */}
      {selectedTab === 'competitors' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Competitor Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {competitors.map((competitor, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{competitor.name}</h4>
                        <Badge variant="outline">#{competitor.ranking}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">{competitor.domain}</div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">SEO Score</div>
                        <div className={`font-bold ${getScoreColor(competitor.seoScore)}`}>
                          {competitor.seoScore}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Traffic</div>
                        <div className="font-medium">{competitor.traffic.toLocaleString()}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Backlinks</div>
                        <div className="font-medium">{competitor.backlinks}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Last Updated */}
      <div className="text-sm text-muted-foreground text-center">
        Last updated: {new Date(metrics.lastUpdated).toLocaleString()}
      </div>
    </div>
  );
};