// Advanced Mobile Analytics and Monitoring System
import { useState, useEffect, useCallback } from 'react';

interface MobileDeviceInfo {
  userAgent: string;
  platform: string;
  screenWidth: number;
  screenHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  devicePixelRatio: number;
  orientation: 'portrait' | 'landscape';
  touchSupport: boolean;
  connectionType: string;
  memorySize?: number;
  cores?: number;
  battery?: {
    level: number;
    charging: boolean;
  };
}

interface MobileInteractionEvent {
  type: 'tap' | 'swipe' | 'pinch' | 'scroll' | 'keyboard' | 'orientation';
  timestamp: number;
  target?: string;
  coordinates?: { x: number; y: number };
  velocity?: number;
  duration?: number;
  direction?: string;
  metadata?: Record<string, any>;
}

interface MobilePerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  context: string;
}

interface MobileSessionData {
  sessionId: string;
  startTime: number;
  endTime?: number;
  deviceInfo: MobileDeviceInfo;
  interactions: MobileInteractionEvent[];
  performanceMetrics: MobilePerformanceMetric[];
  errors: Array<{ message: string; stack?: string; timestamp: number }>;
  pageViews: Array<{ path: string; timestamp: number; duration?: number }>;
}

class MobileAnalyticsEngine {
  private sessionData: MobileSessionData;
  private isTracking: boolean = false;
  private performanceObserver?: PerformanceObserver;
  private intersectionObserver?: IntersectionObserver;
  private mutationObserver?: MutationObserver;
  private eventListeners: Array<() => void> = [];

  constructor() {
    this.sessionData = this.initializeSession();
    this.setupPerformanceMonitoring();
    this.setupInteractionTracking();
    this.setupErrorTracking();
    this.setupVisibilityTracking();
  }

  private initializeSession(): MobileSessionData {
    return {
      sessionId: this.generateSessionId(),
      startTime: Date.now(),
      deviceInfo: this.collectDeviceInfo(),
      interactions: [],
      performanceMetrics: [],
      errors: [],
      pageViews: []
    };
  }

  private generateSessionId(): string {
    return `mobile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private collectDeviceInfo(): MobileDeviceInfo {
    const nav = navigator as any;
    const screen = window.screen;

    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      screenWidth: screen.width,
      screenHeight: screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio || 1,
      orientation: screen.width > screen.height ? 'landscape' : 'portrait',
      touchSupport: 'ontouchstart' in window,
      connectionType: nav.connection?.effectiveType || 'unknown',
      memorySize: nav.deviceMemory,
      cores: nav.hardwareConcurrency,
      battery: this.getBatteryInfo()
    };
  }

  private async getBatteryInfo(): Promise<{ level: number; charging: boolean } | undefined> {
    try {
      const nav = navigator as any;
      if ('getBattery' in nav) {
        const battery = await nav.getBattery();
        return {
          level: battery.level,
          charging: battery.charging
        };
      }
    } catch (error) {
      console.warn('Battery API not available:', error);
    }
    return undefined;
  }

  private setupPerformanceMonitoring(): void {
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          this.recordPerformanceMetric({
            name: entry.name,
            value: entry.duration || entry.startTime,
            timestamp: Date.now(),
            context: entry.entryType
          });
        });
      });

      try {
        this.performanceObserver.observe({
          entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift', 'resource', 'navigation']
        });
      } catch (error) {
        console.warn('Performance monitoring setup failed:', error);
      }
    }

    // Monitor Core Web Vitals
    this.monitorCoreWebVitals();
  }

  private monitorCoreWebVitals(): void {
    // LCP (Largest Contentful Paint)
    this.observePerformanceEntry('largest-contentful-paint', (entry) => {
      this.recordPerformanceMetric({
        name: 'LCP',
        value: entry.startTime,
        timestamp: Date.now(),
        context: 'core-web-vitals'
      });
    });

    // FID (First Input Delay)
    this.observePerformanceEntry('first-input', (entry) => {
      this.recordPerformanceMetric({
        name: 'FID',
        value: entry.processingStart - entry.startTime,
        timestamp: Date.now(),
        context: 'core-web-vitals'
      });
    });

    // CLS (Cumulative Layout Shift)
    let clsValue = 0;
    this.observePerformanceEntry('layout-shift', (entry) => {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
        this.recordPerformanceMetric({
          name: 'CLS',
          value: clsValue,
          timestamp: Date.now(),
          context: 'core-web-vitals'
        });
      }
    });
  }

  private observePerformanceEntry(entryType: string, callback: (entry: any) => void): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(callback);
      });

      try {
        observer.observe({ entryTypes: [entryType] });
      } catch (error) {
        console.warn(`Failed to observe ${entryType}:`, error);
      }
    }
  }

  private setupInteractionTracking(): void {
    // Touch events
    const touchHandler = (e: TouchEvent) => {
      this.recordInteraction({
        type: 'tap',
        timestamp: Date.now(),
        target: this.getElementSelector(e.target as Element),
        coordinates: e.touches[0] ? {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        } : undefined
      });
    };

    // Gesture tracking
    let touchStart: { x: number; y: number; time: number } | null = null;

    const touchStartHandler = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStart = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          time: Date.now()
        };
      }
    };

    const touchEndHandler = (e: TouchEvent) => {
      if (touchStart && e.changedTouches.length === 1) {
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - touchStart.x;
        const deltaY = touch.clientY - touchStart.y;
        const duration = Date.now() - touchStart.time;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (distance > 30 && duration < 500) {
          // It's a swipe
          const direction = Math.abs(deltaX) > Math.abs(deltaY)
            ? (deltaX > 0 ? 'right' : 'left')
            : (deltaY > 0 ? 'down' : 'up');

          this.recordInteraction({
            type: 'swipe',
            timestamp: Date.now(),
            direction,
            velocity: distance / duration,
            duration,
            coordinates: { x: touch.clientX, y: touch.clientY }
          });
        }

        touchStart = null;
      }
    };

    // Scroll tracking
    let scrollTimeout: NodeJS.Timeout;
    let lastScrollY = window.pageYOffset;

    const scrollHandler = () => {
      const currentScrollY = window.pageYOffset;
      const velocity = Math.abs(currentScrollY - lastScrollY);
      
      this.recordInteraction({
        type: 'scroll',
        timestamp: Date.now(),
        direction: currentScrollY > lastScrollY ? 'down' : 'up',
        velocity,
        coordinates: { x: 0, y: currentScrollY }
      });

      lastScrollY = currentScrollY;
    };

    // Orientation change
    const orientationHandler = () => {
      this.recordInteraction({
        type: 'orientation',
        timestamp: Date.now(),
        metadata: {
          orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
          width: window.innerWidth,
          height: window.innerHeight
        }
      });
    };

    // Add event listeners
    document.addEventListener('touchstart', touchStartHandler, { passive: true });
    document.addEventListener('touchend', touchEndHandler, { passive: true });
    document.addEventListener('scroll', scrollHandler, { passive: true });
    window.addEventListener('orientationchange', orientationHandler);

    // Store cleanup functions
    this.eventListeners.push(
      () => document.removeEventListener('touchstart', touchStartHandler),
      () => document.removeEventListener('touchend', touchEndHandler),
      () => document.removeEventListener('scroll', scrollHandler),
      () => window.removeEventListener('orientationchange', orientationHandler)
    );
  }

  private setupErrorTracking(): void {
    const errorHandler = (event: ErrorEvent) => {
      this.sessionData.errors.push({
        message: event.message,
        stack: event.error?.stack,
        timestamp: Date.now()
      });
    };

    const rejectionHandler = (event: PromiseRejectionEvent) => {
      this.sessionData.errors.push({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        timestamp: Date.now()
      });
    };

    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', rejectionHandler);

    this.eventListeners.push(
      () => window.removeEventListener('error', errorHandler),
      () => window.removeEventListener('unhandledrejection', rejectionHandler)
    );
  }

  private setupVisibilityTracking(): void {
    let pageStartTime = Date.now();

    const visibilityHandler = () => {
      if (document.hidden) {
        // Page became hidden, record page view duration
        const currentPageView = this.sessionData.pageViews[this.sessionData.pageViews.length - 1];
        if (currentPageView && !currentPageView.duration) {
          currentPageView.duration = Date.now() - pageStartTime;
        }
      } else {
        // Page became visible
        pageStartTime = Date.now();
      }
    };

    const beforeUnloadHandler = () => {
      this.endSession();
    };

    document.addEventListener('visibilitychange', visibilityHandler);
    window.addEventListener('beforeunload', beforeUnloadHandler);

    this.eventListeners.push(
      () => document.removeEventListener('visibilitychange', visibilityHandler),
      () => window.removeEventListener('beforeunload', beforeUnloadHandler)
    );
  }

  private getElementSelector(element: Element): string {
    if (!element) return 'unknown';

    // Try to get a meaningful selector
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ')[0]}`;
    return element.tagName.toLowerCase();
  }

  public startTracking(): void {
    this.isTracking = true;
    this.recordPageView(window.location.pathname);
  }

  public stopTracking(): void {
    this.isTracking = false;
  }

  public recordInteraction(interaction: MobileInteractionEvent): void {
    if (!this.isTracking) return;
    this.sessionData.interactions.push(interaction);
  }

  public recordPerformanceMetric(metric: MobilePerformanceMetric): void {
    if (!this.isTracking) return;
    this.sessionData.performanceMetrics.push(metric);
  }

  public recordPageView(path: string): void {
    if (!this.isTracking) return;
    
    // End previous page view
    const lastPageView = this.sessionData.pageViews[this.sessionData.pageViews.length - 1];
    if (lastPageView && !lastPageView.duration) {
      lastPageView.duration = Date.now() - lastPageView.timestamp;
    }

    // Start new page view
    this.sessionData.pageViews.push({
      path,
      timestamp: Date.now()
    });
  }

  public endSession(): void {
    this.sessionData.endTime = Date.now();
    this.sendAnalytics();
    this.cleanup();
  }

  private async sendAnalytics(): Promise<void> {
    try {
      // Send analytics data to your backend
      const data = {
        ...this.sessionData,
        summary: this.generateSessionSummary()
      };

      // Use navigator.sendBeacon for reliable delivery
      if ('sendBeacon' in navigator) {
        navigator.sendBeacon('/api/mobile-analytics', JSON.stringify(data));
      } else {
        // Fallback to fetch
        fetch('/api/mobile-analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }).catch(error => {
          console.warn('Failed to send analytics:', error);
        });
      }
    } catch (error) {
      console.warn('Error sending analytics:', error);
    }
  }

  private generateSessionSummary() {
    const duration = (this.sessionData.endTime || Date.now()) - this.sessionData.startTime;
    const interactions = this.sessionData.interactions;
    const performanceMetrics = this.sessionData.performanceMetrics;

    return {
      duration,
      totalInteractions: interactions.length,
      interactionTypes: this.countByType(interactions, 'type'),
      avgPerformance: this.calculateAverageMetrics(performanceMetrics),
      errorCount: this.sessionData.errors.length,
      pageViewCount: this.sessionData.pageViews.length,
      deviceType: this.classifyDevice()
    };
  }

  private countByType<T>(items: T[], key: keyof T): Record<string, number> {
    return items.reduce((acc, item) => {
      const value = String(item[key]);
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private calculateAverageMetrics(metrics: MobilePerformanceMetric[]) {
    const grouped = metrics.reduce((acc, metric) => {
      if (!acc[metric.name]) acc[metric.name] = [];
      acc[metric.name].push(metric.value);
      return acc;
    }, {} as Record<string, number[]>);

    return Object.entries(grouped).reduce((acc, [name, values]) => {
      acc[name] = values.reduce((sum, val) => sum + val, 0) / values.length;
      return acc;
    }, {} as Record<string, number>);
  }

  private classifyDevice(): string {
    const { screenWidth, screenHeight, touchSupport, userAgent } = this.sessionData.deviceInfo;
    
    if (/iPhone|iPod/.test(userAgent)) return 'iPhone';
    if (/iPad/.test(userAgent)) return 'iPad';
    if (/Android/.test(userAgent)) {
      return screenWidth < 768 ? 'Android Phone' : 'Android Tablet';
    }
    
    if (touchSupport) {
      return screenWidth < 768 ? 'Mobile' : 'Tablet';
    }
    
    return 'Desktop';
  }

  private cleanup(): void {
    this.eventListeners.forEach(cleanup => cleanup());
    this.performanceObserver?.disconnect();
    this.intersectionObserver?.disconnect();
    this.mutationObserver?.disconnect();
  }

  public getSessionData(): MobileSessionData {
    return { ...this.sessionData };
  }

  public getRealtimeMetrics() {
    return {
      sessionDuration: Date.now() - this.sessionData.startTime,
      interactionCount: this.sessionData.interactions.length,
      errorCount: this.sessionData.errors.length,
      currentPage: this.sessionData.pageViews[this.sessionData.pageViews.length - 1]?.path,
      deviceInfo: this.sessionData.deviceInfo
    };
  }
}

// Create singleton instance
export const mobileAnalytics = new MobileAnalyticsEngine();

// React hooks for mobile analytics
export const useMobileAnalytics = () => {
  const [metrics, setMetrics] = useState(mobileAnalytics.getRealtimeMetrics());
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    // Start tracking
    mobileAnalytics.startTracking();
    setIsTracking(true);

    // Update metrics periodically
    const interval = setInterval(() => {
      setMetrics(mobileAnalytics.getRealtimeMetrics());
    }, 1000);

    // Cleanup on unmount
    return () => {
      clearInterval(interval);
      mobileAnalytics.endSession();
      setIsTracking(false);
    };
  }, []);

  const trackCustomEvent = useCallback((type: string, metadata?: any) => {
    mobileAnalytics.recordInteraction({
      type: type as any,
      timestamp: Date.now(),
      metadata
    });
  }, []);

  const trackPerformance = useCallback((name: string, value: number, context: string = 'custom') => {
    mobileAnalytics.recordPerformanceMetric({
      name,
      value,
      timestamp: Date.now(),
      context
    });
  }, []);

  return {
    metrics,
    isTracking,
    trackCustomEvent,
    trackPerformance,
    sessionData: mobileAnalytics.getSessionData()
  };
};

// Performance monitoring hook
export const useMobilePerformanceMonitor = () => {
  const [performanceData, setPerformanceData] = useState<{
    lcp?: number;
    fid?: number;
    cls?: number;
    fcp?: number;
  }>({});

  useEffect(() => {
    // Monitor Web Vitals
    const updatePerformanceData = () => {
      const sessionData = mobileAnalytics.getSessionData();
      const metrics = sessionData.performanceMetrics;
      
      const latest = {
        lcp: metrics.find(m => m.name === 'LCP')?.value,
        fid: metrics.find(m => m.name === 'FID')?.value,
        cls: metrics.find(m => m.name === 'CLS')?.value,
        fcp: metrics.find(m => m.name === 'FCP')?.value,
      };

      setPerformanceData(latest);
    };

    const interval = setInterval(updatePerformanceData, 2000);
    updatePerformanceData(); // Initial update

    return () => clearInterval(interval);
  }, []);

  return performanceData;
};

export default MobileAnalyticsEngine;