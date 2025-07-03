// Advanced Mobile-First Caching and Loading Strategies
import { useState, useEffect, useRef } from 'react';

interface CacheConfig {
  maxAge: number;
  maxSize: number;
  compression: boolean;
  priority: 'low' | 'normal' | 'high';
}

interface LoadingStrategy {
  eager: string[];
  lazy: string[];
  preload: string[];
  prefetch: string[];
}

interface MobileAsset {
  url: string;
  type: 'image' | 'script' | 'style' | 'data' | 'font';
  size: number;
  priority: number;
  timestamp: number;
  compressed?: boolean;
}

class MobileCacheManager {
  private cache: Map<string, MobileAsset> = new Map();
  private loadingQueue: Map<string, Promise<any>> = new Map();
  private maxCacheSize: number = 50 * 1024 * 1024; // 50MB
  private compressionThreshold: number = 1024; // 1KB

  constructor() {
    this.initializeCache();
  }

  private async initializeCache() {
    // Load cache from IndexedDB
    try {
      const savedCache = await this.loadFromIndexedDB();
      if (savedCache) {
        this.cache = new Map(savedCache);
        this.cleanup();
      }
    } catch (error) {
      console.warn('Failed to load cache from IndexedDB:', error);
    }
  }

  private async loadFromIndexedDB(): Promise<[string, MobileAsset][] | null> {
    return new Promise((resolve) => {
      const request = indexedDB.open('MobileCache', 1);
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('assets')) {
          db.createObjectStore('assets');
        }
      };

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['assets'], 'readonly');
        const store = transaction.objectStore('assets');
        const getRequest = store.get('cache');

        getRequest.onsuccess = () => {
          resolve(getRequest.result || null);
        };

        getRequest.onerror = () => resolve(null);
      };

      request.onerror = () => resolve(null);
    });
  }

  private async saveToIndexedDB() {
    try {
      const request = indexedDB.open('MobileCache', 1);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['assets'], 'readwrite');
        const store = transaction.objectStore('assets');
        store.put(Array.from(this.cache.entries()), 'cache');
      };
    } catch (error) {
      console.warn('Failed to save cache to IndexedDB:', error);
    }
  }

  private cleanup() {
    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    
    // Remove expired items
    for (const [key, asset] of this.cache.entries()) {
      if (now - asset.timestamp > oneWeek) {
        this.cache.delete(key);
      }
    }

    // Remove oldest items if cache is too large
    const totalSize = Array.from(this.cache.values()).reduce((sum, asset) => sum + asset.size, 0);
    
    if (totalSize > this.maxCacheSize) {
      const sortedAssets = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp);
      
      let currentSize = totalSize;
      for (const [key, asset] of sortedAssets) {
        if (currentSize <= this.maxCacheSize * 0.8) break;
        
        this.cache.delete(key);
        currentSize -= asset.size;
      }
    }

    this.saveToIndexedDB();
  }

  async get(url: string): Promise<any | null> {
    const asset = this.cache.get(url);
    if (!asset) return null;

    // Update timestamp for LRU
    asset.timestamp = Date.now();
    this.cache.set(url, asset);

    return asset;
  }

  async set(url: string, data: any, type: MobileAsset['type'], priority: number = 1): Promise<void> {
    const size = this.estimateSize(data);
    
    // Don't cache if too large
    if (size > this.maxCacheSize * 0.1) return;

    const asset: MobileAsset = {
      url,
      type,
      size,
      priority,
      timestamp: Date.now()
    };

    this.cache.set(url, asset);
    this.cleanup();
  }

  private estimateSize(data: any): number {
    if (typeof data === 'string') return data.length;
    if (data instanceof Blob) return data.size;
    if (data instanceof ArrayBuffer) return data.byteLength;
    return JSON.stringify(data).length;
  }

  getCacheStats() {
    const assets = Array.from(this.cache.values());
    const totalSize = assets.reduce((sum, asset) => sum + asset.size, 0);
    const typeBreakdown = assets.reduce((breakdown, asset) => {
      breakdown[asset.type] = (breakdown[asset.type] || 0) + 1;
      return breakdown;
    }, {} as Record<string, number>);

    return {
      totalAssets: assets.length,
      totalSize: totalSize,
      typeBreakdown,
      hitRate: this.calculateHitRate()
    };
  }

  private calculateHitRate(): number {
    // This would be calculated based on actual usage metrics
    return 0.85; // Placeholder
  }
}

// Progressive Image Loading
class ProgressiveImageLoader {
  private observer: IntersectionObserver;
  private loadedImages: Set<string> = new Set();

  constructor() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage(entry.target as HTMLImageElement);
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );
  }

  private async loadImage(img: HTMLImageElement) {
    const src = img.dataset.src;
    if (!src || this.loadedImages.has(src)) return;

    this.observer.unobserve(img);
    this.loadedImages.add(src);

    // Show loading placeholder
    img.style.filter = 'blur(5px)';
    img.style.transition = 'filter 0.3s ease-out';

    try {
      // Load optimized image based on device capabilities
      const optimizedSrc = await this.getOptimizedImageUrl(src, img);
      
      const image = new Image();
      image.onload = () => {
        img.src = optimizedSrc;
        img.style.filter = 'none';
        img.classList.add('loaded');
      };
      
      image.onerror = () => {
        img.src = src; // Fallback to original
        img.style.filter = 'none';
      };
      
      image.src = optimizedSrc;
    } catch (error) {
      img.src = src; // Fallback
      img.style.filter = 'none';
    }
  }

  private async getOptimizedImageUrl(src: string, img: HTMLImageElement): Promise<string> {
    const { width, height } = this.getOptimalDimensions(img);
    const quality = this.getOptimalQuality();
    const format = this.getSupportedFormat();

    // If the source supports query parameters for optimization
    try {
      const url = new URL(src, window.location.origin);
      url.searchParams.set('w', width.toString());
      url.searchParams.set('h', height.toString());
      url.searchParams.set('q', quality.toString());
      url.searchParams.set('f', format);
      return url.toString();
    } catch {
      return src; // Return original if URL parsing fails
    }
  }

  private getOptimalDimensions(img: HTMLImageElement) {
    const rect = img.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    return {
      width: Math.ceil(rect.width * dpr),
      height: Math.ceil(rect.height * dpr)
    };
  }

  private getOptimalQuality(): number {
    const connection = (navigator as any).connection;
    if (!connection) return 80;

    switch (connection.effectiveType) {
      case 'slow-2g':
      case '2g':
        return 60;
      case '3g':
        return 75;
      default:
        return 85;
    }
  }

  private getSupportedFormat(): string {
    // Check for modern format support
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Check WebP support
      if (canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
        return 'webp';
      }
    }
    
    return 'jpeg';
  }

  observe(img: HTMLImageElement) {
    this.observer.observe(img);
  }

  disconnect() {
    this.observer.disconnect();
  }
}

// Smart Resource Preloader
class SmartResourcePreloader {
  private preloadQueue: Array<{ url: string; priority: number; type: string }> = [];
  private preloadedResources: Set<string> = new Set();
  private maxConcurrentLoads = 2;
  private currentLoads = 0;

  addToQueue(url: string, type: 'script' | 'style' | 'image' | 'fetch', priority: number = 1) {
    if (this.preloadedResources.has(url)) return;

    this.preloadQueue.push({ url, priority, type });
    this.preloadQueue.sort((a, b) => b.priority - a.priority);
    
    this.processQueue();
  }

  private async processQueue() {
    if (this.currentLoads >= this.maxConcurrentLoads || this.preloadQueue.length === 0) {
      return;
    }

    const item = this.preloadQueue.shift();
    if (!item) return;

    this.currentLoads++;
    
    try {
      await this.preloadResource(item.url, item.type);
      this.preloadedResources.add(item.url);
    } catch (error) {
      console.warn(`Failed to preload ${item.url}:`, error);
    } finally {
      this.currentLoads--;
      this.processQueue(); // Process next item
    }
  }

  private async preloadResource(url: string, type: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      
      switch (type) {
        case 'script':
          link.rel = 'preload';
          link.as = 'script';
          break;
        case 'style':
          link.rel = 'preload';
          link.as = 'style';
          break;
        case 'image':
          link.rel = 'preload';
          link.as = 'image';
          break;
        case 'fetch':
          link.rel = 'prefetch';
          break;
        default:
          link.rel = 'prefetch';
      }

      link.href = url;
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to preload ${url}`));
      
      document.head.appendChild(link);
      
      // Clean up after loading
      setTimeout(() => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      }, 1000);
    });
  }

  preloadCriticalResources(urls: string[]) {
    urls.forEach(url => {
      this.addToQueue(url, 'fetch', 10);
    });
  }

  getStats() {
    return {
      queueLength: this.preloadQueue.length,
      preloadedCount: this.preloadedResources.size,
      currentLoads: this.currentLoads
    };
  }
}

// Mobile-optimized fetch with caching
export class MobileFetch {
  private cache: MobileCacheManager;
  private preloader: SmartResourcePreloader;

  constructor() {
    this.cache = new MobileCacheManager();
    this.preloader = new SmartResourcePreloader();
  }

  async fetch(url: string, options: RequestInit = {}): Promise<Response> {
    // Check cache first
    const cached = await this.cache.get(url);
    if (cached && this.isCacheValid(cached)) {
      return new Response(JSON.stringify(cached), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    try {
      const response = await fetch(url, {
        ...options,
        // Add compression headers
        headers: {
          'Accept-Encoding': 'gzip, deflate, br',
          ...options.headers
        }
      });

      if (response.ok) {
        const data = await response.clone().json();
        await this.cache.set(url, data, 'data');
      }

      return response;
    } catch (error) {
      // Return cached version if available, even if expired
      if (cached) {
        console.warn('Using stale cache due to network error:', error);
        return new Response(JSON.stringify(cached), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      throw error;
    }
  }

  private isCacheValid(asset: MobileAsset): boolean {
    const maxAge = 5 * 60 * 1000; // 5 minutes
    return Date.now() - asset.timestamp < maxAge;
  }

  preload(urls: string[]) {
    this.preloader.preloadCriticalResources(urls);
  }

  getCacheStats() {
    return {
      cache: this.cache.getCacheStats(),
      preloader: this.preloader.getStats()
    };
  }
}

// Export singleton instances
export const mobileCache = new MobileCacheManager();
export const progressiveImageLoader = new ProgressiveImageLoader();
export const smartPreloader = new SmartResourcePreloader();
export const mobileFetch = new MobileFetch();

// React hooks for mobile caching
export const useMobileCache = () => {
  const [cacheStats, setCacheStats] = useState(mobileCache.getCacheStats());

  useEffect(() => {
    const updateStats = () => setCacheStats(mobileCache.getCacheStats());
    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, []);

  return {
    cacheStats,
    cache: mobileCache
  };
};

export const useProgressiveImage = (src: string, alt: string) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    img.dataset.src = src;
    progressiveImageLoader.observe(img);

    const handleLoad = () => setLoaded(true);
    const handleError = () => setError(true);

    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);

    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
  }, [src]);

  return {
    imgRef,
    loaded,
    error,
    imgProps: {
      ref: imgRef,
      alt,
      loading: 'lazy' as const,
      decoding: 'async' as const
    }
  };
};