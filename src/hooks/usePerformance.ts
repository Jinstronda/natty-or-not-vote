/**
 * usePerformance Hook
 * 
 * Comprehensive performance monitoring and analytics hook for SEO optimization:
 * - Real-time performance metrics tracking
 * - Resource loading analysis
 * - User experience monitoring
 * - Core Web Vitals integration
 * - Performance budget tracking
 * - Automated optimization recommendations
 * - Analytics integration
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getWebVitalsMonitor } from '@/utils/webVitals';

export interface PerformanceMetrics {
  // Core Web Vitals
  lcp: number | null;
  inp: number | null;
  cls: number | null;
  fcp: number | null;
  ttfb: number | null;
  
  // Navigation Timing
  domContentLoaded: number;
  loadComplete: number;
  domInteractive: number;
  
  // Resource Metrics
  totalResources: number;
  imageResources: number;
  scriptResources: number;
  stylesheetResources: number;
  largestResourceSize: number;
  slowestResourceTime: number;
  
  // Performance Scores
  performanceScore: number;
  seoScore: number;
  accessibilityScore: number;
  
  // User Experience
  interactionDelay: number;
  scrollPerformance: number;
  renderingPerformance: number;
  
  // Network
  effectiveConnectionType: string;
  downlink: number;
  rtt: number;
  
  // Memory (if available)
  memoryUsage: number | null;
  memoryLimit: number | null;
  
  // Timestamps
  timestamp: number;
  pageLoadTime: number;
}

export interface PerformanceRecommendation {
  type: 'critical' | 'warning' | 'info';
  category: 'loading' | 'rendering' | 'interactivity' | 'resources' | 'seo';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  complexity: 'easy' | 'medium' | 'hard';
  action: string;
  estimatedImprovement: string;
  priority: number;
}

export interface PerformanceBudget {
  lcp: number;
  inp: number;
  cls: number;
  fcp: number;
  ttfb: number;
  totalPageSize: number;
  imageSize: number;
  scriptSize: number;
  stylesheetSize: number;
  requests: number;
}

export interface PerformanceAlert {
  id: string;
  type: 'budget_exceeded' | 'performance_degraded' | 'resource_slow' | 'vitals_poor';
  severity: 'high' | 'medium' | 'low';
  message: string;
  metric: string;
  value: number;
  threshold: number;
  timestamp: number;
  dismissed: boolean;
}

export interface UsePerformanceOptions {
  enableContinuousMonitoring?: boolean;
  budget?: Partial<PerformanceBudget>;
  samplingRate?: number;
  enableResourceMonitoring?: boolean;
  enableUserExperienceTracking?: boolean;
  enableAlerts?: boolean;
  onAlert?: (alert: PerformanceAlert) => void;
  onBudgetExceeded?: (metric: string, value: number, budget: number) => void;
  onRecommendation?: (recommendation: PerformanceRecommendation) => void;
}

const DEFAULT_BUDGET: PerformanceBudget = {
  lcp: 2500,
  inp: 200,
  cls: 0.1,
  fcp: 1800,
  ttfb: 800,
  totalPageSize: 3000000, // 3MB
  imageSize: 1500000,     // 1.5MB
  scriptSize: 1000000,    // 1MB
  stylesheetSize: 500000, // 500KB
  requests: 100,
};

export function usePerformance(options: UsePerformanceOptions = {}) {
  const {
    enableContinuousMonitoring = true,
    budget = {},
    samplingRate = 1.0,
    enableResourceMonitoring = true,
    enableUserExperienceTracking = true,
    enableAlerts = true,
    onAlert,
    onBudgetExceeded,
    onRecommendation,
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [recommendations, setRecommendations] = useState<PerformanceRecommendation[]>([]);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [monitoring, setMonitoring] = useState(false);
  
  const performanceBudget = { ...DEFAULT_BUDGET, ...budget };
  const metricsHistoryRef = useRef<PerformanceMetrics[]>([]);
  const alertIdRef = useRef(0);

  // Initialize Web Vitals monitoring
  const webVitalsMonitor = getWebVitalsMonitor();

  // Get navigation timing metrics
  const getNavigationMetrics = useCallback(() => {
    if (!window.performance || !window.performance.timing) {
      return {
        domContentLoaded: 0,
        loadComplete: 0,
        domInteractive: 0,
        pageLoadTime: 0,
      };
    }

    const timing = window.performance.timing;
    const navigation = window.performance.navigation;
    
    return {
      domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
      loadComplete: timing.loadEventEnd - timing.navigationStart,
      domInteractive: timing.domInteractive - timing.navigationStart,
      pageLoadTime: timing.loadEventEnd - timing.navigationStart,
    };
  }, []);

  // Get resource metrics
  const getResourceMetrics = useCallback(() => {
    if (!enableResourceMonitoring || !window.performance.getEntriesByType) {
      return {
        totalResources: 0,
        imageResources: 0,
        scriptResources: 0,
        stylesheetResources: 0,
        largestResourceSize: 0,
        slowestResourceTime: 0,
      };
    }

    const resources = window.performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    let imageCount = 0;
    let scriptCount = 0;
    let stylesheetCount = 0;
    let largestSize = 0;
    let slowestTime = 0;

    resources.forEach((resource) => {
      // Count by type
      if (resource.initiatorType === 'img') imageCount++;
      else if (resource.initiatorType === 'script') scriptCount++;
      else if (resource.initiatorType === 'link') stylesheetCount++;

      // Find largest resource
      if (resource.transferSize > largestSize) {
        largestSize = resource.transferSize;
      }

      // Find slowest resource
      if (resource.duration > slowestTime) {
        slowestTime = resource.duration;
      }
    });

    return {
      totalResources: resources.length,
      imageResources: imageCount,
      scriptResources: scriptCount,
      stylesheetResources: stylesheetCount,
      largestResourceSize: largestSize,
      slowestResourceTime: slowestTime,
    };
  }, [enableResourceMonitoring]);

  // Get network information
  const getNetworkInfo = useCallback(() => {
    // @ts-ignore - navigator.connection is not fully supported
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (!connection) {
      return {
        effectiveConnectionType: 'unknown',
        downlink: 0,
        rtt: 0,
      };
    }

    return {
      effectiveConnectionType: connection.effectiveType || 'unknown',
      downlink: connection.downlink || 0,
      rtt: connection.rtt || 0,
    };
  }, []);

  // Get memory information
  const getMemoryInfo = useCallback(() => {
    // @ts-ignore - performance.memory is not fully supported
    const memory = (performance as any).memory;
    
    if (!memory) {
      return {
        memoryUsage: null,
        memoryLimit: null,
      };
    }

    return {
      memoryUsage: memory.usedJSHeapSize || null,
      memoryLimit: memory.jsHeapSizeLimit || null,
    };
  }, []);

  // Calculate performance scores
  const calculatePerformanceScores = useCallback((metrics: Partial<PerformanceMetrics>) => {
    // Simplified scoring algorithm
    let performanceScore = 100;
    let seoScore = 100;
    let accessibilityScore = 100;

    // Performance score based on Core Web Vitals
    if (metrics.lcp && metrics.lcp > 2500) performanceScore -= 20;
    if (metrics.inp && metrics.inp > 200) performanceScore -= 15;
    if (metrics.cls && metrics.cls > 0.1) performanceScore -= 15;
    if (metrics.fcp && metrics.fcp > 1800) performanceScore -= 10;
    if (metrics.ttfb && metrics.ttfb > 800) performanceScore -= 10;

    // Additional penalties for poor performance
    if (metrics.pageLoadTime && metrics.pageLoadTime > 3000) performanceScore -= 15;
    if (metrics.totalResources && metrics.totalResources > 100) performanceScore -= 10;
    if (metrics.slowestResourceTime && metrics.slowestResourceTime > 2000) performanceScore -= 5;

    // SEO score factors
    seoScore = performanceScore; // Base on performance
    if (metrics.totalResources && metrics.totalResources > 150) seoScore -= 5;
    if (metrics.largestResourceSize && metrics.largestResourceSize > 5000000) seoScore -= 10;

    // Accessibility score (simplified)
    accessibilityScore = Math.max(90, performanceScore * 0.9);

    return {
      performanceScore: Math.max(0, performanceScore),
      seoScore: Math.max(0, seoScore),
      accessibilityScore: Math.max(0, accessibilityScore),
    };
  }, []);

  // Generate performance recommendations
  const generateRecommendations = useCallback((metrics: PerformanceMetrics): PerformanceRecommendation[] => {
    const recommendations: PerformanceRecommendation[] = [];

    // LCP recommendations
    if (metrics.lcp && metrics.lcp > 2500) {
      recommendations.push({
        type: 'critical',
        category: 'loading',
        title: 'Improve Largest Contentful Paint',
        description: 'Your LCP is slower than recommended. This affects user experience and SEO rankings.',
        impact: 'high',
        complexity: 'medium',
        action: 'Optimize images, preload critical resources, improve server response times',
        estimatedImprovement: '30-50% faster loading',
        priority: 1,
      });
    }

    // INP recommendations
    if (metrics.inp && metrics.inp > 200) {
      recommendations.push({
        type: 'warning',
        category: 'interactivity',
        title: 'Reduce Interaction to Next Paint',
        description: 'Page interactions are taking too long to respond.',
        impact: 'high',
        complexity: 'hard',
        action: 'Optimize JavaScript execution, reduce main thread work, use web workers',
        estimatedImprovement: '20-40% faster interactions',
        priority: 2,
      });
    }

    // CLS recommendations
    if (metrics.cls && metrics.cls > 0.1) {
      recommendations.push({
        type: 'warning',
        category: 'rendering',
        title: 'Reduce Cumulative Layout Shift',
        description: 'Elements are shifting during page load, affecting user experience.',
        impact: 'medium',
        complexity: 'easy',
        action: 'Set size attributes on images, reserve space for ads, avoid dynamic content insertion',
        estimatedImprovement: '50-80% reduction in layout shifts',
        priority: 3,
      });
    }

    // Resource recommendations
    if (metrics.totalResources > 100) {
      recommendations.push({
        type: 'info',
        category: 'resources',
        title: 'Optimize Resource Loading',
        description: 'Page is loading too many resources, which can slow down performance.',
        impact: 'medium',
        complexity: 'medium',
        action: 'Bundle resources, use lazy loading, implement resource hints',
        estimatedImprovement: '15-25% faster loading',
        priority: 4,
      });
    }

    // TTFB recommendations
    if (metrics.ttfb && metrics.ttfb > 800) {
      recommendations.push({
        type: 'warning',
        category: 'loading',
        title: 'Improve Time to First Byte',
        description: 'Server response time is slower than optimal.',
        impact: 'medium',
        complexity: 'hard',
        action: 'Optimize server performance, use CDN, implement caching',
        estimatedImprovement: '20-30% faster initial response',
        priority: 5,
      });
    }

    return recommendations.sort((a, b) => a.priority - b.priority);
  }, []);

  // Check performance budget
  const checkPerformanceBudget = useCallback((metrics: PerformanceMetrics) => {
    const violations: PerformanceAlert[] = [];
    
    const checkMetric = (key: keyof PerformanceBudget, value: number | null, name: string) => {
      if (value === null) return;
      
      const budgetValue = performanceBudget[key];
      if (value > budgetValue) {
        const alert: PerformanceAlert = {
          id: `budget-${alertIdRef.current++}`,
          type: 'budget_exceeded',
          severity: 'high',
          message: `${name} exceeded budget: ${Math.round(value)} > ${budgetValue}`,
          metric: name,
          value,
          threshold: budgetValue,
          timestamp: Date.now(),
          dismissed: false,
        };
        
        violations.push(alert);
        onBudgetExceeded?.(name, value, budgetValue);
      }
    };

    checkMetric('lcp', metrics.lcp, 'LCP');
    checkMetric('inp', metrics.inp, 'INP');
    checkMetric('cls', metrics.cls, 'CLS');
    checkMetric('fcp', metrics.fcp, 'FCP');
    checkMetric('ttfb', metrics.ttfb, 'TTFB');

    return violations;
  }, [performanceBudget, onBudgetExceeded]);

  // Collect performance metrics
  const collectMetrics = useCallback(async (): Promise<PerformanceMetrics> => {
    const navigationMetrics = getNavigationMetrics();
    const resourceMetrics = getResourceMetrics();
    const networkInfo = getNetworkInfo();
    const memoryInfo = getMemoryInfo();
    
    // Get Web Vitals from monitor
    const webVitalsData = webVitalsMonitor.generateReport();
    
    const baseMetrics = {
      // Core Web Vitals
      lcp: webVitalsData.lcp?.value || null,
      inp: webVitalsData.inp?.value || null,
      cls: webVitalsData.cls?.value || null,
      fcp: webVitalsData.fcp?.value || null,
      ttfb: webVitalsData.ttfb?.value || null,
      
      // Navigation Timing
      ...navigationMetrics,
      
      // Resource Metrics
      ...resourceMetrics,
      
      // User Experience (simplified)
      interactionDelay: webVitalsData.inp?.value || 0,
      scrollPerformance: 95, // Mock value
      renderingPerformance: 90, // Mock value
      
      // Network
      ...networkInfo,
      
      // Memory
      ...memoryInfo,
      
      // Timestamps
      timestamp: Date.now(),
    };

    // Calculate performance scores
    const scores = calculatePerformanceScores(baseMetrics);
    
    return {
      ...baseMetrics,
      ...scores,
    } as PerformanceMetrics;
  }, [
    getNavigationMetrics,
    getResourceMetrics,
    getNetworkInfo,
    getMemoryInfo,
    webVitalsMonitor,
    calculatePerformanceScores,
  ]);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    if (!enableContinuousMonitoring || monitoring) return;
    
    setMonitoring(true);
    
    const interval = setInterval(async () => {
      try {
        const newMetrics = await collectMetrics();
        setMetrics(newMetrics);
        
        // Update history
        metricsHistoryRef.current.push(newMetrics);
        if (metricsHistoryRef.current.length > 100) {
          metricsHistoryRef.current.shift();
        }
        
        // Generate recommendations
        const newRecommendations = generateRecommendations(newMetrics);
        setRecommendations(newRecommendations);
        
        // Check performance budget
        if (enableAlerts) {
          const budgetViolations = checkPerformanceBudget(newMetrics);
          if (budgetViolations.length > 0) {
            setAlerts(prev => [...prev, ...budgetViolations]);
            budgetViolations.forEach(alert => onAlert?.(alert));
          }
        }
        
        // Notify about recommendations
        newRecommendations.forEach(rec => onRecommendation?.(rec));
        
      } catch (error) {
        console.error('Error collecting performance metrics:', error);
      }
    }, 5000); // Collect every 5 seconds
    
    return () => {
      clearInterval(interval);
      setMonitoring(false);
    };
  }, [
    enableContinuousMonitoring,
    monitoring,
    collectMetrics,
    generateRecommendations,
    checkPerformanceBudget,
    enableAlerts,
    onAlert,
    onRecommendation,
  ]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setMonitoring(false);
  }, []);

  // Dismiss alert
  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, dismissed: true } : alert
    ));
  }, []);

  // Get metrics history
  const getMetricsHistory = useCallback(() => {
    return metricsHistoryRef.current;
  }, []);

  // Get average metrics
  const getAverageMetrics = useCallback(() => {
    const history = metricsHistoryRef.current;
    if (history.length === 0) return null;
    
    const avg = history.reduce((acc, metrics) => ({
      lcp: acc.lcp + (metrics.lcp || 0),
      inp: acc.inp + (metrics.inp || 0),
      cls: acc.cls + (metrics.cls || 0),
      fcp: acc.fcp + (metrics.fcp || 0),
      ttfb: acc.ttfb + (metrics.ttfb || 0),
      pageLoadTime: acc.pageLoadTime + metrics.pageLoadTime,
      performanceScore: acc.performanceScore + metrics.performanceScore,
    }), {
      lcp: 0, inp: 0, cls: 0, fcp: 0, ttfb: 0,
      pageLoadTime: 0, performanceScore: 0,
    });
    
    const count = history.length;
    return {
      lcp: avg.lcp / count,
      inp: avg.inp / count,
      cls: avg.cls / count,
      fcp: avg.fcp / count,
      ttfb: avg.ttfb / count,
      pageLoadTime: avg.pageLoadTime / count,
      performanceScore: avg.performanceScore / count,
    };
  }, []);

  // Initialize
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        // Collect initial metrics
        const initialMetrics = await collectMetrics();
        setMetrics(initialMetrics);
        
        // Generate initial recommendations
        const initialRecommendations = generateRecommendations(initialMetrics);
        setRecommendations(initialRecommendations);
        
        // Start monitoring if enabled
        if (enableContinuousMonitoring) {
          startMonitoring();
        }
      } catch (error) {
        console.error('Error initializing performance monitoring:', error);
      } finally {
        setLoading(false);
      }
    };
    
    init();
  }, [collectMetrics, generateRecommendations, enableContinuousMonitoring, startMonitoring]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, [stopMonitoring]);

  return {
    metrics,
    recommendations,
    alerts: alerts.filter(alert => !alert.dismissed),
    loading,
    monitoring,
    
    // Actions
    startMonitoring,
    stopMonitoring,
    dismissAlert,
    collectMetrics,
    
    // History
    getMetricsHistory,
    getAverageMetrics,
    
    // Configuration
    performanceBudget,
    samplingRate,
  };
}