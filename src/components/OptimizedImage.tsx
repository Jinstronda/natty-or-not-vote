import React, { useState, useRef, useEffect } from 'react';

interface OptimizedImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean;
  placeholder?: string;
}

// Generate WebP and AVIF URLs from original image URL
const generateOptimizedUrls = (src: string | null | undefined) => {
  // Early validation - fail fast on null/undefined/empty values
  if (!src || typeof src !== 'string' || src.trim() === '') {
    const fallback = '/placeholder.svg';
    return { avif: fallback, webp: fallback, original: fallback };
  }
  
  if (src.includes('placeholder.svg') || src.startsWith('data:')) {
    return { avif: src, webp: src, original: src };
  }
  
  // For Supabase storage URLs, we can request different formats
  if (src.includes('supabase')) {
    const baseUrl = src.split('?')[0];
    return {
      avif: `${baseUrl}?format=avif&quality=85`,
      webp: `${baseUrl}?format=webp&quality=85`,
      original: src
    };
  }
  
  // For other URLs, assume they support query parameters for format
  const separator = src.includes('?') ? '&' : '?';
  return {
    avif: `${src}${separator}format=avif&quality=85`,
    webp: `${src}${separator}format=webp&quality=85`,
    original: src
  };
};

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  onLoad,
  onError,
  priority = false,
  placeholder = '/placeholder.svg'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const [isInView, setIsInView] = useState(priority);

  const { avif, webp, original } = generateOptimizedUrls(src);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) return; // Skip lazy loading for priority images

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '200px', // Start loading 200px before the image comes into view
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  // Progressive image loading: try AVIF -> WebP -> Original
  useEffect(() => {
    if (!isInView) return;

    const loadImage = async () => {
      // First try AVIF
      try {
        await checkImageFormat(avif);
        setCurrentSrc(avif);
        return;
      } catch {
        // AVIF failed, try WebP
        try {
          await checkImageFormat(webp);
          setCurrentSrc(webp);
          return;
        } catch {
          // WebP failed, use original
          try {
            await checkImageFormat(original);
            setCurrentSrc(original);
          } catch {
            // All formats failed
            setHasError(true);
            setCurrentSrc(placeholder);
          }
        }
      }
    };

    loadImage();
  }, [isInView, avif, webp, original, placeholder]);

  // Helper function to check if image format loads successfully
  const checkImageFormat = (url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject();
      img.src = url;
    });
  };

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setCurrentSrc(placeholder);
    }
    onError?.();
  };

  const baseStyles = `
    transition-all duration-500 ease-out
    ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}
    ${hasError ? 'filter grayscale(20%)' : ''}
  `;

  return (
    <div className="relative overflow-hidden bg-muted">
      {/* Blur placeholder while loading */}
      {!isLoaded && isInView && (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50 animate-pulse"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3e%3cfilter id='blur'%3e%3cfeGaussianBlur stdDeviation='2'/%3e%3c/filter%3e%3crect width='100%25' height='100%25' fill='%23f1f5f9' filter='url(%23blur)'/%3e%3c/svg%3e")`,
            backgroundSize: 'cover'
          }}
        />
      )}
      
      {/* Actual image */}
      <img
        ref={imgRef}
        src={isInView ? currentSrc : undefined}
        alt={alt}
        className={`${baseStyles} ${className}`}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        style={{
          aspectRatio: width && height ? `${width}/${height}` : undefined
        }}
      />
      
      {/* Loading indicator */}
      {!isLoaded && isInView && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin opacity-50" />
        </div>
      )}
      
      {/* Shimmer effect while loading */}
      {!isLoaded && isInView && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer" />
      )}
    </div>
  );
};

export default OptimizedImage; 