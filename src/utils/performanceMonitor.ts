import React from 'react';

// Performance monitoring utility for React 19 optimizations
export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  url: string;
  userAgent?: string;
}

export interface CoreWebVitals {
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  TTFB?: number; // Time to First Byte
  FCP?: number; // First Contentful Paint
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private vitals: CoreWebVitals = {};
  private observer?: PerformanceObserver;

  constructor() {
    this.initializeObserver();
    this.measureCoreWebVitals();
  }

  private initializeObserver() {
    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.recordMetric(entry.name, entry.duration || 0);
        });
      });

      try {
        this.observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint', 'first-input'] });
      } catch (e) {
        console.warn('Performance observer not fully supported:', e);
      }
    }
  }

  private measureCoreWebVitals() {
    // Largest Contentful Paint (LCP)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.vitals.LCP = lastEntry.startTime;
      this.recordMetric('LCP', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID)
    new PerformanceObserver((entryList) => {
      const firstInput = entryList.getEntries()[0] as any;
      if (firstInput && firstInput.processingStart) {
        this.vitals.FID = firstInput.processingStart - firstInput.startTime;
        this.recordMetric('FID', this.vitals.FID);
      }
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      this.vitals.CLS = clsValue;
      this.recordMetric('CLS', clsValue);
    }).observe({ entryTypes: ['layout-shift'] });

    // First Contentful Paint (FCP)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const fcp = entries.find(entry => entry.name === 'first-contentful-paint');
      if (fcp) {
        this.vitals.FCP = fcp.startTime;
        this.recordMetric('FCP', fcp.startTime);
      }
    }).observe({ entryTypes: ['paint'] });

    // Time to First Byte (TTFB)
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navigationEntries.length > 0) {
        const navigation = navigationEntries[0];
        this.vitals.TTFB = navigation.responseStart - navigation.requestStart;
        this.recordMetric('TTFB', this.vitals.TTFB);
      }
    }
  }

  recordMetric(name: string, value: number) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    this.metrics.push(metric);

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}: ${value.toFixed(2)}ms`);
    }

    // Send to analytics in production (you can replace with your preferred service)
    if (process.env.NODE_ENV === 'production' && this.shouldReport(name, value)) {
      this.sendToAnalytics(metric);
    }
  }

  private shouldReport(name: string, value: number): boolean {
    // Only report significant metrics to reduce noise
    const thresholds: Record<string, number> = {
      'LCP': 2500, // Report if LCP > 2.5s
      'FID': 100,  // Report if FID > 100ms
      'CLS': 0.1,  // Report if CLS > 0.1
      'TTFB': 600, // Report if TTFB > 600ms
      'FCP': 1800  // Report if FCP > 1.8s
    };

    return value > (thresholds[name] || 0);
  }

  private sendToAnalytics(metric: PerformanceMetric) {
    // Example implementation - replace with your analytics service
    if ('fetch' in window) {
      fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric)
      }).catch(err => console.warn('Failed to send metric:', err));
    }
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  getCoreWebVitals(): CoreWebVitals {
    return { ...this.vitals };
  }

  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.name === name);
  }

  // Get average value for a specific metric
  getAverageMetric(name: string): number {
    const metrics = this.getMetricsByName(name);
    if (metrics.length === 0) return 0;
    
    const sum = metrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / metrics.length;
  }

  // Report performance summary
  getPerformanceSummary() {
    return {
      coreWebVitals: this.vitals,
      metricCounts: this.metrics.reduce((acc, metric) => {
        acc[metric.name] = (acc[metric.name] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      averages: {
        LCP: this.getAverageMetric('LCP'),
        FID: this.getAverageMetric('FID'),
        CLS: this.getAverageMetric('CLS'),
        TTFB: this.getAverageMetric('TTFB'),
        FCP: this.getAverageMetric('FCP')
      }
    };
  }

  // Measure component render time
  measureComponent(componentName: string, renderFn: () => void) {
    const startTime = performance.now();
    renderFn();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    this.recordMetric(`Component:${componentName}`, duration);
    return duration;
  }

  // Measure async operation time
  async measureAsync<T>(name: string, asyncFn: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    try {
      const result = await asyncFn();
      const endTime = performance.now();
      this.recordMetric(`Async:${name}`, endTime - startTime);
      return result;
    } catch (error) {
      const endTime = performance.now();
      this.recordMetric(`AsyncError:${name}`, endTime - startTime);
      throw error;
    }
  }

  // Clean up
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.metrics = [];
    this.vitals = {};
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for using performance monitoring
export const usePerformanceMonitor = () => {
  return {
    recordMetric: (name: string, value: number) => performanceMonitor.recordMetric(name, value),
    measureComponent: (componentName: string, renderFn: () => void) => 
      performanceMonitor.measureComponent(componentName, renderFn),
    measureAsync: <T>(name: string, asyncFn: () => Promise<T>) => 
      performanceMonitor.measureAsync(name, asyncFn),
    getMetrics: () => performanceMonitor.getMetrics(),
    getCoreWebVitals: () => performanceMonitor.getCoreWebVitals(),
    getPerformanceSummary: () => performanceMonitor.getPerformanceSummary()
  };
};

// Helper function to measure React component render time
export const withPerformanceTracking = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) => {
  return (props: P) => {
    const startTime = performance.now();
    
    React.useEffect(() => {
      const endTime = performance.now();
      performanceMonitor.recordMetric(`Component:${componentName}:Mount`, endTime - startTime);
    }, []);

    return React.createElement(WrappedComponent, props);
  };
}; 