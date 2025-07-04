// Advanced Mobile Performance Optimization Utilities
import { useState, useEffect } from 'react';

interface NetworkInfo {
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

interface PerformanceMetrics {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte
}

interface MobileOptimization {
  imageQuality: 'low' | 'medium' | 'high';
  preloadStrategy: 'aggressive' | 'conservative' | 'minimal';
  animationsEnabled: boolean;
  adaptiveLoading: boolean;
}

class MobilePerformanceManager {
  private networkInfo: NetworkInfo | null = null;
  private performanceMetrics: Partial<PerformanceMetrics> = {};
  private optimization: MobileOptimization;
  private observer: PerformanceObserver | null = null;

  constructor() {
    this.optimization = this.getOptimalSettings();
    this.initNetworkDetection();
    this.initPerformanceMonitoring();
    this.initAdaptiveLoading();
  }

  // Detect network conditions and device capabilities
  private getOptimalSettings(): MobileOptimization {
    const nav = navigator as any;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
    
    if (connection) {
      this.networkInfo = {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      };
    }

    // Detect device performance tier
    const isLowEndDevice = this.isLowEndDevice();
    const isSlowNetwork = this.isSlowNetwork();
    const hasReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    return {
      imageQuality: isSlowNetwork || isLowEndDevice ? 'low' : 'high',
      preloadStrategy: isSlowNetwork ? 'minimal' : 'conservative',
      animationsEnabled: !hasReducedMotion && !isLowEndDevice,
      adaptiveLoading: true
    };
  }

  private isLowEndDevice(): boolean {
    // Check memory, cores, and device pixel ratio
    const nav = navigator as any;
    const memory = nav.deviceMemory || 4; // Default to 4GB if unknown
    const cores = nav.hardwareConcurrency || 2; // Default to 2 cores
    const pixelRatio = window.devicePixelRatio || 1;

    return memory <= 2 || cores <= 2 || pixelRatio <= 1;
  }

  private isSlowNetwork(): boolean {
    if (!this.networkInfo) return false;
    
    return (
      this.networkInfo.effectiveType === 'slow-2g' ||
      this.networkInfo.effectiveType === '2g' ||
      this.networkInfo.downlink < 1.5 ||
      this.networkInfo.rtt > 300 ||
      this.networkInfo.saveData
    );
  }

  private initNetworkDetection(): void {
    const nav = navigator as any;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

    if (connection) {
      const updateNetworkInfo = () => {
        this.networkInfo = {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData
        };
        
        // Dynamically adjust optimization settings
        this.optimization = this.getOptimalSettings();
        this.notifyNetworkChange();
      };

      connection.addEventListener('change', updateNetworkInfo);
    }
  }

  private notifyNetworkChange(): void {
    // Dispatch custom event for components to react to network changes
    window.dispatchEvent(new CustomEvent('mobile-network-change', {
      detail: { 
        networkInfo: this.networkInfo,
        optimization: this.optimization
      }
    }));
  }

  private initPerformanceMonitoring(): void {
    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.handlePerformanceEntry(entry as any);
        }
      });

      try {
        this.observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift', 'paint', 'navigation'] });
      } catch (error) {
        console.warn('Performance monitoring not supported:', error);
      }
    }

    // Monitor resource loading
    this.monitorResourceLoading();
  }

  private handlePerformanceEntry(entry: any): void {
    switch (entry.entryType) {
      case 'largest-contentful-paint':
        this.performanceMetrics.lcp = entry.startTime;
        break;
      case 'first-input':
        this.performanceMetrics.fid = entry.processingStart - entry.startTime;
        break;
      case 'layout-shift':
        if (!entry.hadRecentInput) {
          this.performanceMetrics.cls = (this.performanceMetrics.cls || 0) + entry.value;
        }
        break;
      case 'paint':
        if (entry.name === 'first-contentful-paint') {
          this.performanceMetrics.fcp = entry.startTime;
        }
        break;
      case 'navigation':
        this.performanceMetrics.ttfb = entry.responseStart - entry.requestStart;
        break;
    }

    // Check for performance issues
    this.checkPerformanceThresholds();
  }

  private checkPerformanceThresholds(): void {
    const { lcp, fid, cls } = this.performanceMetrics;

    // Adjust optimization based on performance
    if (lcp && lcp > 2500) { // Poor LCP
      this.optimization.imageQuality = 'low';
      this.optimization.preloadStrategy = 'minimal';
    }

    if (fid && fid > 100) { // Poor FID
      this.optimization.animationsEnabled = false;
    }

    if (cls && cls > 0.1) { // Poor CLS
      this.optimization.adaptiveLoading = false;
    }
  }

  private monitorResourceLoading(): void {
    const resourceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 1000) { // Slow resource
          console.warn(`Slow resource detected: ${entry.name} took ${entry.duration}ms`);
        }
      }
    });

    try {
      resourceObserver.observe({ entryTypes: ['resource'] });
    } catch (error) {
      console.warn('Resource monitoring not supported:', error);
    }
  }

  private initAdaptiveLoading(): void {
    // Implement adaptive loading based on network and device conditions
    this.setupImageOptimization();
    this.setupPrefetching();
    this.setupCriticalResourceHints();
  }

  private setupImageOptimization(): void {
    // Create optimized image loading strategy
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          this.loadOptimizedImage(img);
          imageObserver.unobserve(img);
        }
      });
    }, {
      rootMargin: this.isSlowNetwork() ? '50px' : '200px' // Smaller margin for slow networks
    });

    images.forEach(img => imageObserver.observe(img));
  }

  private loadOptimizedImage(img: HTMLImageElement): void {
    const src = img.dataset.src;
    if (!src) return;

    // Add quality and format parameters based on device/network
    const optimizedSrc = this.getOptimizedImageUrl(src);
    
    img.src = optimizedSrc;
    img.classList.add('fade-in');
  }

  private getOptimizedImageUrl(originalSrc: string): string {
    const url = new URL(originalSrc, window.location.origin);
    
    // Add optimization parameters
    url.searchParams.set('quality', this.getImageQuality());
    url.searchParams.set('format', this.getSupportedFormat());
    
    if (this.isSlowNetwork()) {
      url.searchParams.set('progressive', 'true');
    }

    return url.toString();
  }

  private getImageQuality(): string {
    switch (this.optimization.imageQuality) {
      case 'low': return '60';
      case 'medium': return '80';
      case 'high': return '95';
      default: return '80';
    }
  }

  private getSupportedFormat(): string {
    // Check for WebP and AVIF support
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (ctx && canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
      return 'webp';
    }
    
    return 'jpeg';
  }

  private setupPrefetching(): void {
    if (this.optimization.preloadStrategy === 'minimal') return;

    // Prefetch critical resources based on user behavior
    const prefetchCandidates = document.querySelectorAll('a[href]');
    
    const prefetchObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          const link = entry.target as HTMLAnchorElement;
          this.prefetchPage(link.href);
        }
      });
    });

    if (this.optimization.preloadStrategy === 'aggressive') {
      prefetchCandidates.forEach(link => prefetchObserver.observe(link));
    }
  }

  private prefetchPage(url: string): void {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    link.as = 'document';
    document.head.appendChild(link);
  }

  private setupCriticalResourceHints(): void {
    // Add resource hints for critical resources
    const criticalResources = [
      { href: '/api/influencers', as: 'fetch' },
      { href: 'https://fonts.googleapis.com', rel: 'preconnect' },
      { href: 'https://images.unsplash.com', rel: 'preconnect' }
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = resource.rel || 'preload';
      link.href = resource.href;
      if (resource.as) link.as = resource.as;
      if (resource.rel === 'preconnect') link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }

  // Public API
  public getOptimization(): MobileOptimization {
    return { ...this.optimization };
  }

  public getNetworkInfo(): NetworkInfo | null {
    return this.networkInfo;
  }

  public getPerformanceMetrics(): Partial<PerformanceMetrics> {
    return { ...this.performanceMetrics };
  }

  public updateOptimization(updates: Partial<MobileOptimization>): void {
    this.optimization = { ...this.optimization, ...updates };
    this.notifyNetworkChange();
  }

  public preloadResource(url: string, type: 'image' | 'script' | 'style' | 'font'): void {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = type;
    if (type === 'font') {
      link.crossOrigin = 'anonymous';
    }
    document.head.appendChild(link);
  }

  public measurePerformance(name: string, fn: () => Promise<any>): Promise<any> {
    const startTime = performance.now();
    
    return fn().finally(() => {
      const duration = performance.now() - startTime;
      console.log(`${name} took ${duration.toFixed(2)}ms`);
      
      // Mark custom performance metric
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
    });
  }

  public dispose(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Create singleton instance
export const mobilePerformanceManager = new MobilePerformanceManager();

// React Hook for mobile performance optimization
export const useMobilePerformance = () => {
  const [optimization, setOptimization] = useState(mobilePerformanceManager.getOptimization());
  const [networkInfo, setNetworkInfo] = useState(mobilePerformanceManager.getNetworkInfo());

  useEffect(() => {
    const handleNetworkChange = (event: CustomEvent) => {
      setOptimization(event.detail.optimization);
      setNetworkInfo(event.detail.networkInfo);
    };

    window.addEventListener('mobile-network-change', handleNetworkChange as EventListener);
    
    return () => {
      window.removeEventListener('mobile-network-change', handleNetworkChange as EventListener);
    };
  }, []);

  return {
    optimization,
    networkInfo,
    isSlowNetwork: networkInfo?.effectiveType === 'slow-2g' || networkInfo?.effectiveType === '2g',
    isSaveDataMode: networkInfo?.saveData || false,
    performanceMetrics: mobilePerformanceManager.getPerformanceMetrics(),
    preloadResource: mobilePerformanceManager.preloadResource.bind(mobilePerformanceManager),
    measurePerformance: mobilePerformanceManager.measurePerformance.bind(mobilePerformanceManager)
  };
};

export default MobilePerformanceManager;