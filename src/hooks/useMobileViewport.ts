import { useState, useEffect, useCallback, useRef } from 'react';

interface ViewportInfo {
  width: number;
  height: number;
  visualViewportHeight: number;
  scale: number;
  isKeyboardOpen: boolean;
  safeAreaInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

interface ScrollInfo {
  x: number;
  y: number;
  direction: 'up' | 'down' | 'left' | 'right' | 'none';
  isScrolling: boolean;
  isAtTop: boolean;
  isAtBottom: boolean;
  velocity: number;
}

// Advanced mobile viewport management
export const useMobileViewport = () => {
  const [viewportInfo, setViewportInfo] = useState<ViewportInfo>({
    width: window.innerWidth,
    height: window.innerHeight,
    visualViewportHeight: window.visualViewport?.height || window.innerHeight,
    scale: window.visualViewport?.scale || 1,
    isKeyboardOpen: false,
    safeAreaInsets: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0
    }
  });

  const updateViewportInfo = useCallback(() => {
    const visualViewport = window.visualViewport;
    const windowHeight = window.innerHeight;
    const visualHeight = visualViewport?.height || windowHeight;
    const isKeyboardOpen = visualHeight < windowHeight * 0.75;

    // Get safe area insets from CSS environment variables
    const getSafeAreaInset = (side: string): number => {
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue(`env(safe-area-inset-${side})`)
        .trim();
      return value ? parseInt(value) : 0;
    };

    setViewportInfo({
      width: window.innerWidth,
      height: windowHeight,
      visualViewportHeight: visualHeight,
      scale: visualViewport?.scale || 1,
      isKeyboardOpen,
      safeAreaInsets: {
        top: getSafeAreaInset('top'),
        bottom: getSafeAreaInset('bottom'),
        left: getSafeAreaInset('left'),
        right: getSafeAreaInset('right')
      }
    });
  }, []);

  useEffect(() => {
    updateViewportInfo();

    // Listen for viewport changes
    const handleResize = () => updateViewportInfo();
    const handleVisualViewportChange = () => updateViewportInfo();

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewportChange);
      window.visualViewport.addEventListener('scroll', handleVisualViewportChange);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleVisualViewportChange);
        window.visualViewport.removeEventListener('scroll', handleVisualViewportChange);
      }
    };
  }, [updateViewportInfo]);

  return viewportInfo;
};

// Advanced scroll tracking and optimization
export const useMobileScroll = (element?: HTMLElement | null) => {
  const [scrollInfo, setScrollInfo] = useState<ScrollInfo>({
    x: 0,
    y: 0,
    direction: 'none',
    isScrolling: false,
    isAtTop: true,
    isAtBottom: false,
    velocity: 0
  });

  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollTime = useRef<number>(Date.now());
  const lastScrollY = useRef<number>(0);
  const velocityRef = useRef<number>(0);

  const updateScrollInfo = useCallback((target: HTMLElement | Window) => {
    const isWindow = target === window;
    const scrollLeft = isWindow ? window.pageXOffset : (target as HTMLElement).scrollLeft;
    const scrollTop = isWindow ? window.pageYOffset : (target as HTMLElement).scrollTop;
    const scrollHeight = isWindow ? document.documentElement.scrollHeight : (target as HTMLElement).scrollHeight;
    const clientHeight = isWindow ? window.innerHeight : (target as HTMLElement).clientHeight;

    // Calculate scroll direction and velocity
    const currentTime = Date.now();
    const timeDelta = currentTime - lastScrollTime.current;
    const scrollDelta = scrollTop - lastScrollY.current;
    
    if (timeDelta > 0) {
      velocityRef.current = Math.abs(scrollDelta) / timeDelta;
    }

    let direction: ScrollInfo['direction'] = 'none';
    if (scrollDelta > 0) direction = 'down';
    else if (scrollDelta < 0) direction = 'up';

    const isAtTop = scrollTop <= 1;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

    setScrollInfo(prev => ({
      ...prev,
      x: scrollLeft,
      y: scrollTop,
      direction,
      isScrolling: true,
      isAtTop,
      isAtBottom,
      velocity: velocityRef.current
    }));

    lastScrollTime.current = currentTime;
    lastScrollY.current = scrollTop;

    // Clear scrolling state after no scroll events
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      setScrollInfo(prev => ({ ...prev, isScrolling: false }));
    }, 150);
  }, []);

  useEffect(() => {
    const target = element || window;
    
    const handleScroll = () => updateScrollInfo(target);
    
    // Use passive listeners for better performance
    const options: AddEventListenerOptions = { passive: true };
    
    if (target === window) {
      window.addEventListener('scroll', handleScroll, options);
    } else {
      (target as HTMLElement).addEventListener('scroll', handleScroll, options);
    }

    // Initial update
    updateScrollInfo(target);

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      if (target === window) {
        window.removeEventListener('scroll', handleScroll);
      } else {
        (target as HTMLElement).removeEventListener('scroll', handleScroll);
      }
    };
  }, [element, updateScrollInfo]);

  return scrollInfo;
};

// Smooth scroll utilities with mobile optimization
export const useSmoothScroll = () => {
  const smoothScrollTo = useCallback((
    target: number | HTMLElement,
    options?: {
      behavior?: ScrollBehavior;
      duration?: number;
      easing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
      offset?: number;
    }
  ) => {
    const {
      behavior = 'smooth',
      duration = 500,
      easing = 'ease-out',
      offset = 0
    } = options || {};

    let targetY: number;
    
    if (typeof target === 'number') {
      targetY = target;
    } else {
      const rect = target.getBoundingClientRect();
      targetY = window.pageYOffset + rect.top + offset;
    }

    // Use native smooth scrolling if supported and no custom duration
    if (behavior === 'smooth' && duration === 500) {
      window.scrollTo({
        top: targetY,
        behavior: 'smooth'
      });
      return;
    }

    // Custom smooth scrolling with easing
    const startY = window.pageYOffset;
    const distance = targetY - startY;
    const startTime = Date.now();

    const easingFunctions = {
      ease: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
      'ease-in': (t: number) => t * t,
      'ease-out': (t: number) => t * (2 - t),
      'ease-in-out': (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
      linear: (t: number) => t
    };

    const easingFunction = easingFunctions[easing];

    const scroll = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easingFunction(progress);
      
      window.scrollTo(0, startY + distance * easedProgress);
      
      if (progress < 1) {
        requestAnimationFrame(scroll);
      }
    };

    requestAnimationFrame(scroll);
  }, []);

  const scrollToTop = useCallback(() => {
    smoothScrollTo(0);
  }, [smoothScrollTo]);

  const scrollToElement = useCallback((selector: string, offset = 0) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      smoothScrollTo(element, { offset });
    }
  }, [smoothScrollTo]);

  return {
    smoothScrollTo,
    scrollToTop,
    scrollToElement
  };
};

// Pull-to-refresh functionality
export const usePullToRefresh = (
  onRefresh: () => Promise<void>,
  options?: {
    threshold?: number;
    resistance?: number;
    enabled?: boolean;
  }
) => {
  const { threshold = 80, resistance = 2.5, enabled = true } = options || {};
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  
  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled || window.pageYOffset > 0) return;
    
    startY.current = e.touches[0].clientY;
    isDragging.current = true;
  }, [enabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging.current || !enabled) return;
    
    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;
    
    if (diff > 0 && window.pageYOffset <= 0) {
      e.preventDefault();
      const distance = Math.min(diff / resistance, threshold * 1.5);
      setPullDistance(distance);
      setIsPulling(distance > threshold);
    }
  }, [enabled, threshold, resistance]);

  const handleTouchEnd = useCallback(async () => {
    if (!isDragging.current) return;
    
    isDragging.current = false;
    
    if (isPulling && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setIsPulling(false);
        setPullDistance(0);
      }
    } else {
      setIsPulling(false);
      setPullDistance(0);
    }
  }, [isPulling, isRefreshing, onRefresh]);

  useEffect(() => {
    if (!enabled) return;

    const options: AddEventListenerOptions = { passive: false };
    
    document.addEventListener('touchstart', handleTouchStart, options);
    document.addEventListener('touchmove', handleTouchMove, options);
    document.addEventListener('touchend', handleTouchEnd, options);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    isPulling,
    isRefreshing,
    pullDistance,
    shouldShowRefreshIndicator: pullDistance > 0
  };
};

// Scroll position persistence
export const useScrollPositionSaver = (key: string) => {
  const saveScrollPosition = useCallback(() => {
    const position = {
      x: window.pageXOffset,
      y: window.pageYOffset,
      timestamp: Date.now()
    };
    sessionStorage.setItem(`scroll-${key}`, JSON.stringify(position));
  }, [key]);

  const restoreScrollPosition = useCallback(() => {
    const saved = sessionStorage.getItem(`scroll-${key}`);
    if (saved) {
      try {
        const position = JSON.parse(saved);
        // Only restore if saved within last 5 minutes
        if (Date.now() - position.timestamp < 5 * 60 * 1000) {
          window.scrollTo(position.x, position.y);
        }
      } catch (error) {
        console.warn('Failed to restore scroll position:', error);
      }
    }
  }, [key]);

  useEffect(() => {
    // Restore on mount
    const timer = setTimeout(restoreScrollPosition, 100);

    // Save on unmount
    return () => {
      clearTimeout(timer);
      saveScrollPosition();
    };
  }, [saveScrollPosition, restoreScrollPosition]);

  return {
    saveScrollPosition,
    restoreScrollPosition
  };
};