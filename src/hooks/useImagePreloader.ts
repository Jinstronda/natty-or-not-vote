import { useEffect } from 'react';

// Safe image preloading hook that improves performance without breaking anything
export const useImagePreloader = (imageSrcs: string[]) => {
  useEffect(() => {
    if (!imageSrcs.length) return;

    // Preload images for better perceived performance
    const preloadImages = imageSrcs.filter(src => src && src !== '/placeholder.svg');
    
    const imagePromises = preloadImages.map(src => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = src;
      });
    });

    // Preload images in background (non-blocking)
    Promise.allSettled(imagePromises).then(results => {
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      console.log(`Preloaded ${successCount}/${preloadImages.length} images`);
    });

  }, [imageSrcs]);
};

// Critical resource preloader for above-the-fold content
export const usePreloadCriticalImages = (influencerId: string, images: string[]) => {
  useEffect(() => {
    if (!images.length) return;

    // Preload the first 2 images (usually above the fold)
    const criticalImages = images.slice(0, 2);
    
    criticalImages.forEach(src => {
      if (src && src !== '/placeholder.svg') {
        // Create high-priority preload link
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        link.setAttribute('data-influencer', influencerId);
        
        // Add to head for immediate loading
        document.head.appendChild(link);
        
        // Cleanup on unmount or when images change
        return () => {
          const existingLinks = document.querySelectorAll(`link[data-influencer="${influencerId}"]`);
          existingLinks.forEach(link => link.remove());
        };
      }
    });
  }, [influencerId, images]);
};