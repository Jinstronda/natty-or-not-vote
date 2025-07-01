// SEO Performance Monitor - Track Core Web Vitals and SEO metrics using Google's web-vitals library
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';

export interface PerformanceMetrics {
  LCP?: number; // Largest Contentful Paint
  INP?: number; // Interaction to Next Paint (replaced FID)
  CLS?: number; // Cumulative Layout Shift
  TTFB?: number; // Time to First Byte
  FCP?: number; // First Contentful Paint
}

export class SEOPerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    // Using Google's official web-vitals library for accurate Core Web Vitals tracking
    if (typeof window !== 'undefined') {
      // Largest Contentful Paint
      onLCP((metric) => {
        this.metrics.LCP = metric.value;
        this.reportMetric('LCP', metric.value, metric.rating);
      });

      // Interaction to Next Paint (replaces FID)
      onINP((metric) => {
        this.metrics.INP = metric.value;
        this.reportMetric('INP', metric.value, metric.rating);
      });

      // Cumulative Layout Shift
      onCLS((metric) => {
        this.metrics.CLS = metric.value;
        this.reportMetric('CLS', metric.value, metric.rating);
      });

      // First Contentful Paint
      onFCP((metric) => {
        this.metrics.FCP = metric.value;
        this.reportMetric('FCP', metric.value, metric.rating);
      });

      // Time to First Byte
      onTTFB((metric) => {
        this.metrics.TTFB = metric.value;
        this.reportMetric('TTFB', metric.value, metric.rating);
      });
    }

    // Navigation timing metrics
    this.measureNavigationMetrics();
  }

  private measureNavigationMetrics() {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        this.metrics.TTFB = navigation.responseStart - navigation.fetchStart;
        this.metrics.FCP = navigation.loadEventEnd - navigation.fetchStart;
        
        this.reportMetric('TTFB', this.metrics.TTFB);
        this.reportMetric('FCP', this.metrics.FCP);
      }
    }
  }

  private reportMetric(name: string, value: number, rating?: string) {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      const unit = name === 'CLS' ? '' : 'ms';
      console.log(`[SEO Performance] ${name}: ${value.toFixed(2)}${unit} (${rating || 'unknown'})`);
    }

    // In production, send to analytics
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(name, value, rating);
    }
  }

  private sendToAnalytics(metric: string, value: number, rating?: string) {
    // Google Analytics 4 Event
    if (typeof gtag !== 'undefined') {
      gtag('event', 'web_vitals', {
        metric_name: metric,
        metric_value: value,
        metric_rating: rating || this.getRating(metric, value)
      });
    }

    // Custom analytics endpoint (if you have one)
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/metrics', JSON.stringify({
        metric,
        value,
        rating: rating || this.getRating(metric, value),
        timestamp: Date.now(),
        url: window.location.href
      }));
    }
  }

  private getRating(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      TTFB: { good: 800, poor: 1800 },
      FCP: { good: 1800, poor: 3000 }
    };

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// SEO Health Check
export const runSEOHealthCheck = () => {
  const issues: string[] = [];
  
  // Check meta description
  const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content');
  if (!metaDescription || metaDescription.length < 120 || metaDescription.length > 160) {
    issues.push('Meta description should be 120-160 characters');
  }
  
  // Check title length
  if (document.title.length < 30 || document.title.length > 60) {
    issues.push('Page title should be 30-60 characters');
  }
  
  // Check H1 tags
  const h1Tags = document.querySelectorAll('h1');
  if (h1Tags.length === 0) {
    issues.push('Page missing H1 tag');
  } else if (h1Tags.length > 1) {
    issues.push('Multiple H1 tags found');
  }
  
  // Check images without alt text
  const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
  if (imagesWithoutAlt.length > 0) {
    issues.push(`${imagesWithoutAlt.length} images missing alt text`);
  }
  
  // Check canonical URL
  const canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    issues.push('Missing canonical URL');
  }

  return {
    score: Math.max(0, 100 - (issues.length * 10)),
    issues,
    timestamp: new Date().toISOString()
  };
};

// Initialize performance monitoring
export const initializeSEOMonitoring = () => {
  if (typeof window !== 'undefined') {
    const monitor = new SEOPerformanceMonitor();
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      monitor.destroy();
    });

    return monitor;
  }
  return null;
};

// Export types for TypeScript
declare global {
  function gtag(...args: any[]): void;
} 