import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useMobileGestures } from '@/hooks/useMobileGestures';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MobileSwipeGalleryProps {
  images: Array<{
    id: string;
    src: string;
    alt: string;
    caption?: string;
  }>;
  className?: string;
  showIndicators?: boolean;
  showArrows?: boolean;
  autoplay?: boolean;
  autoplayDelay?: number;
  onImageChange?: (index: number) => void;
  onImageTap?: (index: number, image: any) => void;
}

export const MobileSwipeGallery: React.FC<MobileSwipeGalleryProps> = ({
  images,
  className,
  showIndicators = true,
  showArrows = false,
  autoplay = false,
  autoplayDelay = 3000,
  onImageChange,
  onImageTap
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  const nextImage = useCallback(() => {
    if (isTransitioning) return;
    
    const newIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(newIndex);
    onImageChange?.(newIndex);
  }, [currentIndex, images.length, isTransitioning, onImageChange]);

  const previousImage = useCallback(() => {
    if (isTransitioning) return;
    
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    onImageChange?.(newIndex);
  }, [currentIndex, images.length, isTransitioning, onImageChange]);

  const goToImage = useCallback((index: number) => {
    if (isTransitioning || index === currentIndex) return;
    
    setCurrentIndex(index);
    onImageChange?.(index);
  }, [currentIndex, isTransitioning, onImageChange]);

  // Autoplay functionality
  useEffect(() => {
    if (!autoplay) return;

    const startAutoplay = () => {
      autoplayRef.current = setInterval(nextImage, autoplayDelay);
    };

    const stopAutoplay = () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
        autoplayRef.current = null;
      }
    };

    startAutoplay();

    // Pause autoplay on user interaction
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAutoplay();
      } else {
        startAutoplay();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopAutoplay();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [autoplay, autoplayDelay, nextImage]);

  // Touch gesture handling
  const gestureHandlers = useMobileGestures({
    onSwipeLeft: nextImage,
    onSwipeRight: previousImage,
    onTap: () => {
      onImageTap?.(currentIndex, images[currentIndex]);
    },
    onPan: (deltaX) => {
      // Visual feedback during pan
      const maxTranslate = galleryRef.current?.offsetWidth || 0;
      const normalizedDelta = Math.max(-maxTranslate, Math.min(maxTranslate, deltaX));
      setTranslateX(normalizedDelta);
    },
    threshold: 50
  });

  // Handle transition end
  useEffect(() => {
    setIsTransitioning(true);
    setTranslateX(0);
    
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          previousImage();
          break;
        case 'ArrowRight':
          nextImage();
          break;
        case 'Home':
          goToImage(0);
          break;
        case 'End':
          goToImage(images.length - 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previousImage, nextImage, goToImage, images.length]);

  if (images.length === 0) {
    return (
      <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
        <span className="text-muted-foreground">No images to display</span>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        'relative w-full bg-black rounded-lg overflow-hidden',
        'select-none',
        className
      )}
      role="region"
      aria-label="Image gallery"
    >
      {/* Main gallery container */}
      <div
        ref={galleryRef}
        className="relative h-64 sm:h-80 md:h-96 overflow-hidden"
        {...gestureHandlers}
      >
        {/* Images container */}
        <div
          className={cn(
            'flex h-full transition-transform duration-300 ease-out',
            isTransitioning && 'transition-transform'
          )}
          style={{
            transform: `translateX(calc(-${currentIndex * 100}% + ${translateX}px))`,
            width: `${images.length * 100}%`
          }}
        >
          {images.map((image, index) => (
            <div
              key={image.id}
              className="relative w-full h-full flex-shrink-0"
              style={{ width: `${100 / images.length}%` }}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover"
                loading={Math.abs(index - currentIndex) <= 1 ? 'eager' : 'lazy'}
                decoding="async"
              />
              
              {/* Image overlay with caption */}
              {image.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <p className="text-white text-sm font-medium">
                    {image.caption}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Navigation arrows */}
        {showArrows && images.length > 1 && (
          <>
            <button
              onClick={previousImage}
              disabled={isTransitioning}
              className={cn(
                'absolute left-2 top-1/2 -translate-y-1/2 z-10',
                'w-10 h-10 rounded-full bg-black/50 text-white',
                'flex items-center justify-center',
                'hover:bg-black/70 transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'focus:outline-none focus:ring-2 focus:ring-white/50'
              )}
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={nextImage}
              disabled={isTransitioning}
              className={cn(
                'absolute right-2 top-1/2 -translate-y-1/2 z-10',
                'w-10 h-10 rounded-full bg-black/50 text-white',
                'flex items-center justify-center',
                'hover:bg-black/70 transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'focus:outline-none focus:ring-2 focus:ring-white/50'
              )}
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Loading indicator for current image */}
        <div 
          className={cn(
            'absolute inset-0 bg-muted animate-pulse',
            'flex items-center justify-center',
            'transition-opacity duration-300',
            'opacity-0' // Will be controlled by image load state
          )}
        >
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>

      {/* Indicators */}
      {showIndicators && images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
          <div className="flex space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                disabled={isTransitioning}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-300',
                  'focus:outline-none focus:ring-2 focus:ring-white/50',
                  index === currentIndex 
                    ? 'bg-white scale-125' 
                    : 'bg-white/50 hover:bg-white/70'
                )}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Image counter */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-black/50 text-white text-xs px-2 py-1 rounded">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Swipe instruction for first visit */}
      <div className="absolute top-4 left-4 z-10 md:hidden">
        <div className="bg-black/50 text-white text-xs px-2 py-1 rounded">
          Swipe to navigate
        </div>
      </div>
    </div>
  );
};