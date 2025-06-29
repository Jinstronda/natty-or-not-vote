import React, { useState, useEffect, useRef } from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  priority = false,
  sizes = '100vw',
  quality = 85,
  onError,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const [isInView, setIsInView] = useState(priority);

  // Generate optimized source URLs
  const generateOptimizedSrc = (originalSrc: string, format?: 'webp' | 'avif') => {
    if (!originalSrc || originalSrc.includes('placeholder.svg') || originalSrc.startsWith('data:')) {
      return originalSrc;
    }

    // For external URLs or already optimized images, return as-is
    if (originalSrc.startsWith('http') || originalSrc.includes('.webp') || originalSrc.includes('.avif')) {
      return originalSrc;
    }

    // For internal images, you could add format conversion logic here
    return originalSrc;
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { 
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [priority]);

  // Load image when in view
  useEffect(() => {
    if (!isInView) return;

    const img = new Image();
    
    // Try modern formats first, fallback to original
    const webpSrc = generateOptimizedSrc(src, 'webp');
    const avifSrc = generateOptimizedSrc(src, 'avif');
    
    const loadImage = (srcToLoad: string) => {
      // Add null check for img element
      if (!img) return;
      
      img.src = srcToLoad;
      
      img.onload = () => {
        setCurrentSrc(srcToLoad);
        setIsLoading(false);
        setIsError(false);
      };
      
      img.onerror = (errorEvent) => {
        console.warn(`Failed to load image: ${srcToLoad}`);
        if (srcToLoad !== src) {
          // Fallback to original if optimized version fails
          loadImage(src);
        } else {
          setIsError(true);
          setIsLoading(false);
          // Safely call onError with proper event handling
          if (onError && errorEvent) {
            onError(errorEvent as any);
          }
        }
      };
    };

    // Start with AVIF, fallback to WebP, then original
    if (avifSrc !== src) {
      loadImage(avifSrc);
    } else if (webpSrc !== src) {
      loadImage(webpSrc);
    } else {
      loadImage(src);
    }

    return () => {
      // Clean up event handlers to prevent memory leaks
      if (img) {
        img.onload = null;
        img.onerror = null;
      }
    };
  }, [isInView, src, onError]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.warn(`Image error for src: ${currentSrc}`);
    if (currentSrc !== '/placeholder.svg') {
      setCurrentSrc('/placeholder.svg');
      setIsError(true);
    }
    // Safely call onError
    if (onError) {
      onError(e);
    }
  };

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {/* Placeholder/skeleton while loading */}
      {isLoading && isInView && (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"
          style={{ aspectRatio: props.style?.aspectRatio || 'auto' }}
        />
      )}
      
      {/* Actual image */}
      {(isInView || priority) && (
        <img
          {...props}
          src={currentSrc || '/placeholder.svg'}
          alt={alt}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      )}
      
      {/* Progressive enhancement: Add subtle loading shimmer */}
      {isLoading && isInView && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
      )}
    </div>
  );
}; 