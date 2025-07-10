/**
 * Core Web Vitals Monitoring Utility
 * 
 * Tracks and reports Core Web Vitals metrics for SEO optimization:
 * - LCP (Largest Contentful Paint)
 * - INP (Interaction to Next Paint) 
 * - CLS (Cumulative Layout Shift)
 * - FCP (First Contentful Paint)
 * - TTFB (Time to First Byte)
 * 
 * Features:
 * - Real-time performance monitoring
 * - Automated SEO score calculation
 * - Performance budget alerts
 * - Analytics integration ready
 * - Debug mode for development
 */

import React from 'react';
import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';

export interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  entries: PerformanceEntry[];
  timestamp: number;
}

export interface WebVitalsReport {
  lcp: WebVitalsMetric | null;
  inp: WebVitalsMetric | null;
  cls: WebVitalsMetric | null;
  fcp: WebVitalsMetric | null;
  ttfb: WebVitalsMetric | null;
  seoScore: number;
  overallRating: 'good' | 'needs-improvement' | 'poor';
  recommendations: string[];
  timestamp: number;
}

export interface PerformanceBudget {
  lcp: number;    // Good: < 2.5s
  inp: number;    // Good: < 200ms
  cls: number;    // Good: < 0.1
  fcp: number;    // Good: < 1.8s
  ttfb: number;   // Good: < 800ms
}

// Default performance budgets based on Google's recommendations
export const DEFAULT_PERFORMANCE_BUDGET: PerformanceBudget = {
  lcp: 2500,   // 2.5 seconds
  inp: 200,    // 200 milliseconds
  cls: 0.1,    // 0.1 shift score
  fcp: 1800,   // 1.8 seconds
  ttfb: 800,   // 800 milliseconds
};

// Thresholds for rating calculations
const THRESHOLDS = {
  lcp: { good: 2500, poor: 4000 },
  inp: { good: 200, poor: 500 },
  cls: { good: 0.1, poor: 0.25 },
  fcp: { good: 1800, poor: 3000 },
  ttfb: { good: 800, poor: 1800 },
};

class WebVitalsMonitor {
  private metrics: Map<string, WebVitalsMetric> = new Map();
  private listeners: ((report: WebVitalsReport) => void)[] = [];
  private budget: PerformanceBudget = DEFAULT_PERFORMANCE_BUDGET;
  private debug: boolean = false;
  private initialized: boolean = false;

  constructor(budget?: Partial<PerformanceBudget>, debug?: boolean) {
    if (budget) {
      this.budget = { ...DEFAULT_PERFORMANCE_BUDGET, ...budget };
    }
    this.debug = debug || process.env.NODE_ENV === 'development';
    this.init();
  }

  private init() {
    if (this.initialized || typeof window === 'undefined') return;
    
    this.initialized = true;
    
    // Initialize Core Web Vitals monitoring
    this.initializeCoreWebVitals();
    
    // Initialize custom performance observers
    this.initializeCustomObservers();
    
    // Log initialization in debug mode
    if (this.debug) {
      console.log('🚀 WebVitals monitoring initialized', {
        budget: this.budget,
        url: window.location.href,
        timestamp: Date.now()
      });
    }
  }

  private initializeCoreWebVitals() {
    // Largest Contentful Paint (LCP)
    onLCP((metric) => {
      this.handleMetric('lcp', metric);
    });

    // Cumulative Layout Shift (CLS)
    onCLS((metric) => {
      this.handleMetric('cls', metric);
    });

    // First Contentful Paint (FCP)
    onFCP((metric) => {
      this.handleMetric('fcp', metric);
    });

    // Time to First Byte (TTFB)
    onTTFB((metric) => {
      this.handleMetric('ttfb', metric);
    });

    // Interaction to Next Paint (INP)
    onINP((metric) => {
      this.handleMetric('inp', metric);
    });
  }

  private initializeINP() {
    // INP tracking using Performance Observer
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        let maxDelay = 0;
        
        entries.forEach((entry) => {
          if (entry.entryType === 'event') {
            const eventEntry = entry as PerformanceEventTiming;
            const delay = eventEntry.processingStart - eventEntry.startTime;
            maxDelay = Math.max(maxDelay, delay);
          }
        });

        if (maxDelay > 0) {
          this.handleMetric('inp', {
            name: 'INP',
            value: maxDelay,
            delta: maxDelay,
            id: 'inp-' + Math.random().toString(36).substr(2, 9),
            entries: entries,
          });
        }
      });

      try {
        observer.observe({ type: 'event', buffered: true });
      } catch (error) {
        console.warn('INP monitoring not supported:', error);
      }
    }
  }

  private initializeCustomObservers() {
    // Resource timing observer for additional insights
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            
            // Track slow resources
            if (resourceEntry.duration > 1000) {
              this.logSlowResource(resourceEntry);
            }
          }
        });
      });

      try {
        resourceObserver.observe({ type: 'resource', buffered: true });
      } catch (error) {
        console.warn('Resource timing monitoring not supported:', error);
      }
    }
  }

  private handleMetric(name: string, metric: any) {
    const rating = this.calculateRating(name, metric.value);
    
    const webVitalsMetric: WebVitalsMetric = {
      name: name.toUpperCase(),
      value: metric.value,
      rating,
      delta: metric.delta || 0,
      id: metric.id,
      entries: metric.entries || [],
      timestamp: Date.now(),
    };

    this.metrics.set(name, webVitalsMetric);
    
    // Log metric in debug mode
    if (this.debug) {
      console.log(`📊 ${name.toUpperCase()}: ${metric.value.toFixed(2)} (${rating})`, {
        metric: webVitalsMetric,
        budget: this.budget[name as keyof PerformanceBudget],
        exceedsBudget: metric.value > this.budget[name as keyof PerformanceBudget]
      });
    }

    // Check performance budget
    this.checkPerformanceBudget(name, metric.value);
    
    // Notify listeners
    this.notifyListeners();
  }

  private calculateRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
    if (!threshold) return 'good';
    
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  private checkPerformanceBudget(name: string, value: number) {
    const budget = this.budget[name as keyof PerformanceBudget];
    if (value > budget) {
      const message = `⚠️ Performance budget exceeded: ${name.toUpperCase()} = ${value.toFixed(2)} (budget: ${budget})`;
      
      if (this.debug) {
        console.warn(message);
      }
      
      // Trigger budget alert
      this.triggerBudgetAlert(name, value, budget);
    }
  }

  private triggerBudgetAlert(metricName: string, value: number, budget: number) {
    const event = new CustomEvent('webvitals:budget-exceeded', {
      detail: {
        metric: metricName,
        value,
        budget,
        exceedBy: value - budget,
        timestamp: Date.now()
      }
    });
    
    window.dispatchEvent(event);
  }

  private logSlowResource(resource: PerformanceResourceTiming) {
    if (this.debug) {
      console.warn('🐌 Slow resource detected:', {
        name: resource.name,
        duration: resource.duration,
        size: resource.transferSize,
        type: resource.initiatorType
      });
    }
  }

  private calculateSEOScore(): number {
    const metrics = Array.from(this.metrics.values());
    if (metrics.length === 0) return 0;
    
    const weights = {
      lcp: 0.25,  // 25% weight
      inp: 0.25,  // 25% weight  
      cls: 0.25,  // 25% weight
      fcp: 0.15,  // 15% weight
      ttfb: 0.10, // 10% weight
    };
    
    let totalScore = 0;
    let totalWeight = 0;
    
    metrics.forEach(metric => {
      const weight = weights[metric.name.toLowerCase() as keyof typeof weights] || 0;
      const score = metric.rating === 'good' ? 100 : 
                   metric.rating === 'needs-improvement' ? 50 : 0;
      
      totalScore += score * weight;
      totalWeight += weight;
    });
    
    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    this.metrics.forEach((metric, name) => {
      if (metric.rating === 'poor') {
        switch (name) {
          case 'lcp':
            recommendations.push(
              'Optimize LCP by reducing server response times, optimizing images, and eliminating render-blocking resources'
            );
            break;
          case 'inp':
            recommendations.push(
              'Improve INP by optimizing JavaScript execution, reducing main thread work, and minimizing input delays'
            );
            break;
          case 'cls':
            recommendations.push(
              'Reduce CLS by setting size attributes on images, reserving space for ads, and avoiding dynamic content insertion'
            );
            break;
          case 'fcp':
            recommendations.push(
              'Optimize FCP by reducing server response times, eliminating render-blocking resources, and optimizing CSS delivery'
            );
            break;
          case 'ttfb':
            recommendations.push(
              'Improve TTFB by optimizing server performance, using CDN, and enabling compression'
            );
            break;
        }
      }
    });
    
    return recommendations;
  }

  private notifyListeners() {
    const report = this.generateReport();
    this.listeners.forEach(listener => listener(report));
  }

  public generateReport(): WebVitalsReport {
    const seoScore = this.calculateSEOScore();
    const recommendations = this.generateRecommendations();
    
    // Calculate overall rating
    const ratings = Array.from(this.metrics.values()).map(m => m.rating);
    const overallRating = ratings.includes('poor') ? 'poor' :
                         ratings.includes('needs-improvement') ? 'needs-improvement' : 'good';
    
    return {
      lcp: this.metrics.get('lcp') || null,
      inp: this.metrics.get('inp') || null,
      cls: this.metrics.get('cls') || null,
      fcp: this.metrics.get('fcp') || null,
      ttfb: this.metrics.get('ttfb') || null,
      seoScore,
      overallRating,
      recommendations,
      timestamp: Date.now()
    };
  }

  public onReport(callback: (report: WebVitalsReport) => void) {
    this.listeners.push(callback);
  }

  public removeListener(callback: (report: WebVitalsReport) => void) {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  public getMetric(name: string): WebVitalsMetric | undefined {
    return this.metrics.get(name);
  }

  public getAllMetrics(): Map<string, WebVitalsMetric> {
    return new Map(this.metrics);
  }

  public setBudget(budget: Partial<PerformanceBudget>) {
    this.budget = { ...this.budget, ...budget };
  }

  public getBudget(): PerformanceBudget {
    return { ...this.budget };
  }

  public clearMetrics() {
    this.metrics.clear();
  }

  public destroy() {
    this.listeners = [];
    this.metrics.clear();
    this.initialized = false;
  }
}

// Singleton instance
let webVitalsMonitor: WebVitalsMonitor | null = null;

export function getWebVitalsMonitor(budget?: Partial<PerformanceBudget>, debug?: boolean): WebVitalsMonitor {
  if (!webVitalsMonitor) {
    webVitalsMonitor = new WebVitalsMonitor(budget, debug);
  }
  return webVitalsMonitor;
}

// Convenience function for quick setup
export function reportWebVitals(
  onReport: (report: WebVitalsReport) => void,
  budget?: Partial<PerformanceBudget>
) {
  const monitor = getWebVitalsMonitor(budget);
  monitor.onReport(onReport);
  return monitor;
}

// Export for external analytics services
export function sendToAnalytics(report: WebVitalsReport) {
  // Example integration with Google Analytics
  if (typeof gtag !== 'undefined') {
    Object.entries(report).forEach(([key, value]) => {
      if (value && typeof value === 'object' && 'value' in value) {
        gtag('event', key, {
          event_category: 'Web Vitals',
          event_label: key.toUpperCase(),
          value: Math.round(value.value),
          custom_map: { metric_rating: value.rating }
        });
      }
    });
  }
  
  // Example integration with custom analytics
  if (typeof window !== 'undefined' && window.customAnalytics) {
    window.customAnalytics.track('web_vitals', report);
  }
}

// React Hook for Web Vitals monitoring
export function useWebVitals(budget?: Partial<PerformanceBudget>) {
  const [report, setReport] = React.useState<WebVitalsReport | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    const monitor = getWebVitalsMonitor(budget);
    
    const handleReport = (newReport: WebVitalsReport) => {
      setReport(newReport);
      setIsLoading(false);
    };
    
    monitor.onReport(handleReport);
    
    return () => {
      monitor.removeListener(handleReport);
    };
  }, [budget]);
  
  return { report, isLoading };
}

// Global declarations
declare global {
  interface Window {
    customAnalytics?: {
      track: (event: string, data: any) => void;
    };
  }
  
  var gtag: (
    command: string,
    targetId: string,
    config?: any
  ) => void;
}