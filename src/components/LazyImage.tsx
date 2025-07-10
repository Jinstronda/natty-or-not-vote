/**
 * LazyImage Component - Advanced SEO-Optimized Image Loading
 * 
 * Features:
 * - Progressive loading with blur effect
 * - Responsive images with srcset generation
 * - Core Web Vitals optimization (LCP, CLS)
 * - SEO-friendly attributes
 * - Advanced intersection observer with performance monitoring
 * - Placeholder with aspect ratio preservation
 * - Memory leak prevention
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface LazyImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'loading' | 'decoding'> {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty' | string;
  blurDataURL?: string;
  aspectRatio?: string;
  responsive?: boolean;
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  onError?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  onStartLoad?: () => void;
  onComplete?: () => void;
  // SEO optimization props
  fetchPriority?: 'high' | 'low' | 'auto';
  preload?: boolean;
  critical?: boolean;
}

interface ImageMetrics {
  loadTime: number;
  size: number;
  format: string;
  renderTime: number;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  priority = false,
  sizes = '100vw',
  quality = 85,
  placeholder = 'blur',
  blurDataURL,
  aspectRatio = '16/9',
  responsive = true,
  onLoad,
  onError,
  onStartLoad,
  onComplete,
  fetchPriority = 'auto',
  preload = false,
  critical = false,
  style,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [imageMetrics, setImageMetrics] = useState<ImageMetrics | null>(null);
  const [isInView, setIsInView] = useState(priority || critical);
  const [loadStartTime, setLoadStartTime] = useState<number>(0);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Generate responsive srcset for different screen sizes
  const generateResponsiveSrcSet = useCallback((originalSrc: string): string => {
    if (!responsive || !originalSrc || originalSrc.includes('placeholder.svg') || originalSrc.startsWith('data:')) {
      return originalSrc;
    }

    // For external URLs, return as-is (could be enhanced with image service integration)
    if (originalSrc.startsWith('http')) {
      return originalSrc;
    }

    // Generate srcset for different screen sizes
    const widths = [400, 800, 1200, 1600, 2000];
    const srcset = widths.map(width => {
      const optimizedSrc = generateOptimizedSrc(originalSrc, undefined, width);
      return `${optimizedSrc} ${width}w`;
    }).join(', ');

    return srcset;
  }, [responsive]);

  // Generate optimized source URLs with format and size support
  const generateOptimizedSrc = useCallback((originalSrc: string, format?: 'webp' | 'avif', width?: number) => {
    if (!originalSrc || originalSrc.includes('placeholder.svg') || originalSrc.startsWith('data:')) {
      return originalSrc;
    }

    // For external URLs or already optimized images, return as-is
    if (originalSrc.startsWith('http') || originalSrc.includes('.webp') || originalSrc.includes('.avif')) {
      return originalSrc;
    }

    // For internal images, add format and size parameters
    let optimizedSrc = originalSrc;
    
    if (format) {
      const extension = optimizedSrc.split('.').pop();
      optimizedSrc = optimizedSrc.replace(`.${extension}`, `.${format}`);
    }
    
    if (width) {
      optimizedSrc += `?w=${width}&q=${quality}`;
    }

    return optimizedSrc;
  }, [quality]);

  // Generate blur placeholder
  const generateBlurPlaceholder = useCallback(() => {
    if (blurDataURL) return blurDataURL;
    
    if (placeholder === 'blur') {
      // Generate a simple blur placeholder
      return `data:image/svg+xml;base64,${btoa(`
        <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="blur">
              <feGaussianBlur stdDeviation="3"/>
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="#f3f4f6" filter="url(#blur)"/>
        </svg>
      `)}`;
    }
    
    return placeholder === 'empty' ? '' : placeholder;
  }, [blurDataURL, placeholder]);

  // Enhanced intersection observer with performance monitoring
  useEffect(() => {
    if (priority || critical || !containerRef.current) return;

    const options: IntersectionObserverInit = {
      rootMargin: '50px',
      threshold: [0, 0.1, 0.5, 1],
    };

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          
          // Track when image enters viewport for performance monitoring
          const renderTime = performance.now();
          setImageMetrics(prev => ({ ...prev, renderTime } as ImageMetrics));
          
          observerRef.current?.disconnect();
        }
      },
      options
    );

    observerRef.current.observe(containerRef.current);
    
    return () => observerRef.current?.disconnect();
  }, [priority, critical]);

  // Preload critical images
  useEffect(() => {
    if (!preload && !critical && !priority) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    if (responsive) {
      link.imageSizes = sizes;
      link.imageSrcset = generateResponsiveSrcSet(src);
    }
    
    document.head.appendChild(link);
    
    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, [src, sizes, responsive, preload, critical, priority, generateResponsiveSrcSet]);

  // Load image when in view with performance monitoring
  useEffect(() => {
    if (!isInView) return;

    const img = new Image();
    const startTime = performance.now();
    setLoadStartTime(startTime);
    
    onStartLoad?.();
    
    // Set up performance monitoring
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name === src) {
          setImageMetrics(prev => ({
            ...prev,
            loadTime: entry.duration,
            size: (entry as any).transferSize || 0,
            format: src.split('.').pop() || 'unknown'
          } as ImageMetrics));
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
    
    // Try modern formats first, fallback to original
    const webpSrc = generateOptimizedSrc(src, 'webp');
    const avifSrc = generateOptimizedSrc(src, 'avif');
    
    const loadImage = (srcToLoad: string) => {
      if (!img) return;
      
      img.src = srcToLoad;
      
      // Set responsive attributes
      if (responsive) {
        img.srcset = generateResponsiveSrcSet(srcToLoad);
        img.sizes = sizes;
      }
      
      img.onload = (event) => {
        const loadTime = performance.now() - startTime;
        setCurrentSrc(srcToLoad);
        setIsLoading(false);
        setIsError(false);
        
        // Update performance metrics
        setImageMetrics(prev => ({
          ...prev,
          loadTime,
          size: 0, // Will be updated by PerformanceObserver
          format: srcToLoad.split('.').pop() || 'unknown'
        } as ImageMetrics));
        
        onLoad?.(event as any);
        onComplete?.();
      };
      
      img.onerror = (errorEvent) => {
        console.warn(`Failed to load image: ${srcToLoad}`);
        if (srcToLoad !== src) {
          // Fallback to original if optimized version fails
          loadImage(src);
        } else {
          setIsError(true);
          setIsLoading(false);
          onError?.(errorEvent as any);
          onComplete?.();
        }
      };
    };

    // Progressive enhancement: AVIF > WebP > Original
    if (avifSrc !== src) {
      loadImage(avifSrc);
    } else if (webpSrc !== src) {
      loadImage(webpSrc);
    } else {
      loadImage(src);
    }

    return () => {
      observer.disconnect();
      if (img) {
        img.onload = null;
        img.onerror = null;
      }
    };
  }, [isInView, src, sizes, responsive, onLoad, onError, onStartLoad, onComplete, generateOptimizedSrc, generateResponsiveSrcSet]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.warn(`Image error for src: ${currentSrc}`);
    if (currentSrc !== '/placeholder.svg') {
      setCurrentSrc('/placeholder.svg');
      setIsError(true);
    }
    onError?.(e);
  };

  const containerStyle: React.CSSProperties = {
    aspectRatio,
    position: 'relative',
    overflow: 'hidden',
    ...style,
  };

  const placeholderSrc = generateBlurPlaceholder();

  return (
    <div 
      ref={containerRef} 
      className={`relative ${className}`}
      style={containerStyle}
    >
      {/* Blur placeholder - always visible until image loads */}
      {placeholderSrc && (
        <img
          src={placeholderSrc}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ filter: placeholder === 'blur' ? 'blur(10px)' : 'none' }}
          aria-hidden="true"
        />
      )}
      
      {/* Loading skeleton for empty placeholder */}
      {placeholder === 'empty' && isLoading && isInView && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
        </div>
      )}
      
      {/* Actual image */}
      {(isInView || priority || critical) && (
        <img
          {...props}
          ref={imgRef}
          src={currentSrc || '/placeholder.svg'}
          srcSet={responsive ? generateResponsiveSrcSet(currentSrc || src) : undefined}
          sizes={responsive ? sizes : undefined}
          alt={alt}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onError={handleError}
          loading={priority || critical ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={fetchPriority}
          style={{
            // Prevent layout shift
            maxWidth: '100%',
            height: 'auto',
            ...props.style,
          }}
        />
      )}
      
      {/* Error state */}
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
          <div className="text-center">
            <div className="mb-2">⚠️</div>
            <div>Image unavailable</div>
          </div>
        </div>
      )}
      
      {/* Performance debug info (only in development) */}
      {process.env.NODE_ENV === 'development' && imageMetrics && (
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs p-1 rounded">
          {imageMetrics.loadTime.toFixed(0)}ms | {imageMetrics.format}
        </div>
      )}
    </div>
  );
};

export default LazyImage;