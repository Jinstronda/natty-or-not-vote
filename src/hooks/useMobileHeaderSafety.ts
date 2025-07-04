import { useEffect, useRef } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileHeaderSafetyOptions {
  preventBackdropBlurConflicts?: boolean;
  ensureHeaderVisibility?: boolean;
  fixTouchTargets?: boolean;
  monitorZIndexStacking?: boolean;
}

/**
 * Mobile header safety hook to prevent common mobile header issues
 * Specifically designed to prevent backdrop-blur conflicts and ensure header accessibility
 */
export const useMobileHeaderSafety = (options: MobileHeaderSafetyOptions = {}) => {
  const {
    preventBackdropBlurConflicts = true,
    ensureHeaderVisibility = true,
    fixTouchTargets = true,
    monitorZIndexStacking = true
  } = options;

  const isMobile = useIsMobile();
  const headerRef = useRef<HTMLElement | null>(null);
  const safetyCheckInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isMobile) return;

    // Find the header element
    headerRef.current = document.querySelector('header');
    
    if (!headerRef.current) {
      console.warn('Mobile Header Safety: Header element not found');
      return;
    }

    const runSafetyChecks = () => {
      if (!headerRef.current) return;

      // Check 1: Prevent backdrop blur conflicts
      if (preventBackdropBlurConflicts) {
        checkBackdropBlurConflicts();
      }

      // Check 2: Ensure header visibility
      if (ensureHeaderVisibility) {
        ensureHeaderIsVisible();
      }

      // Check 3: Fix touch targets
      if (fixTouchTargets) {
        fixMobileTouchTargets();
      }

      // Check 4: Monitor z-index stacking
      if (monitorZIndexStacking) {
        monitorZIndexIssues();
      }
    };

    // Run initial checks
    runSafetyChecks();

    // Set up periodic safety checks (every 5 seconds)
    safetyCheckInterval.current = setInterval(runSafetyChecks, 5000);

    // Listen for layout changes that might affect the header
    const observer = new MutationObserver((mutations) => {
      let shouldCheck = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' || 
            (mutation.type === 'attributes' && 
             ['class', 'style'].includes(mutation.attributeName || ''))) {
          shouldCheck = true;
        }
      });

      if (shouldCheck) {
        setTimeout(runSafetyChecks, 100); // Debounce checks
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });

    return () => {
      if (safetyCheckInterval.current) {
        clearInterval(safetyCheckInterval.current);
      }
      observer.disconnect();
    };
  }, [isMobile, preventBackdropBlurConflicts, ensureHeaderVisibility, fixTouchTargets, monitorZIndexStacking]);

  const checkBackdropBlurConflicts = () => {
    if (!headerRef.current) return;

    // Find elements with backdrop-blur that might interfere
    const elementsWithBackdropBlur = Array.from(document.querySelectorAll('*')).filter(el => {
      const styles = window.getComputedStyle(el);
      return styles.backdropFilter && styles.backdropFilter !== 'none';
    });

    const headerRect = headerRef.current.getBoundingClientRect();
    
    elementsWithBackdropBlur.forEach(element => {
      const elementRect = element.getBoundingClientRect();
      const elementStyles = window.getComputedStyle(element);
      
      // Check if element overlaps or is positioned above header
      const overlapsHeader = !(
        elementRect.bottom < headerRect.top ||
        elementRect.top > headerRect.bottom ||
        elementRect.right < headerRect.left ||
        elementRect.left > headerRect.right
      );

      const isAboveHeader = elementRect.bottom >= headerRect.top && 
                           parseInt(elementStyles.zIndex || '0') >= 
                           parseInt(window.getComputedStyle(headerRef.current!).zIndex || '0');

      if (overlapsHeader || isAboveHeader) {
        console.warn('Mobile Header Safety: Potential backdrop-blur conflict detected', {
          element: element.className,
          backdropFilter: elementStyles.backdropFilter,
          position: elementStyles.position,
          zIndex: elementStyles.zIndex
        });

        // Apply mobile-safe fallback for iOS
        if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
          (element as HTMLElement).style.backdropFilter = 'none';
          (element as HTMLElement).style.background = elementStyles.background.replace(/rgba?\([^)]+,\s*[\d.]+\)/, 
            elementStyles.background.replace(/[\d.]+\)$/, '0.95)'));
        }
      }
    });
  };

  const ensureHeaderIsVisible = () => {
    if (!headerRef.current) return;

    const headerStyles = window.getComputedStyle(headerRef.current);
    const headerRect = headerRef.current.getBoundingClientRect();

    // Check if header is actually visible
    const isVisible = headerRect.height > 0 && 
                     headerStyles.display !== 'none' && 
                     headerStyles.visibility !== 'hidden' &&
                     parseFloat(headerStyles.opacity) > 0;

    if (!isVisible) {
      console.warn('Mobile Header Safety: Header visibility issue detected', {
        height: headerRect.height,
        display: headerStyles.display,
        visibility: headerStyles.visibility,
        opacity: headerStyles.opacity
      });

      // Apply emergency visibility fix
      headerRef.current.style.display = 'block';
      headerRef.current.style.visibility = 'visible';
      headerRef.current.style.opacity = '1';
    }

    // Ensure proper z-index
    const currentZIndex = parseInt(headerStyles.zIndex || '0');
    if (currentZIndex < 50) {
      console.warn('Mobile Header Safety: Header z-index too low, adjusting');
      headerRef.current.style.zIndex = '50';
    }
  };

  const fixMobileTouchTargets = () => {
    if (!headerRef.current) return;

    // Find clickable elements in header that might be too small
    const clickableElements = headerRef.current.querySelectorAll(
      'button, a, [role="button"], [tabindex="0"]'
    ) as NodeListOf<HTMLElement>;

    clickableElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const styles = window.getComputedStyle(element);

      // Check if touch target is too small (< 44px)
      if (rect.width < 44 || rect.height < 44) {
        console.warn('Mobile Header Safety: Touch target too small, fixing', {
          element: element.className,
          size: `${rect.width}x${rect.height}`
        });

        // Apply minimum touch target size
        element.style.minWidth = '44px';
        element.style.minHeight = '44px';
        element.style.display = 'inline-flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
        
        // Add padding if needed
        const currentPadding = parseInt(styles.padding) || 0;
        if (currentPadding < 8) {
          element.style.padding = '8px';
        }
      }
    });
  };

  const monitorZIndexIssues = () => {
    if (!headerRef.current) return;

    const headerZIndex = parseInt(window.getComputedStyle(headerRef.current).zIndex || '0');
    const headerRect = headerRef.current.getBoundingClientRect();

    // Find elements that might be covering the header
    const potentialOverlays = Array.from(document.querySelectorAll('*')).filter(el => {
      const styles = window.getComputedStyle(el);
      const zIndex = parseInt(styles.zIndex || '0');
      const position = styles.position;
      
      return (position === 'fixed' || position === 'absolute' || position === 'sticky') &&
             zIndex > headerZIndex;
    });

    potentialOverlays.forEach(overlay => {
      const overlayRect = overlay.getBoundingClientRect();
      const overlayStyles = window.getComputedStyle(overlay);
      
      // Check if overlay covers header area
      const coversHeader = overlayRect.top <= headerRect.bottom && 
                          overlayRect.bottom >= headerRect.top &&
                          overlayRect.left <= headerRect.right &&
                          overlayRect.right >= headerRect.left;

      if (coversHeader) {
        console.warn('Mobile Header Safety: Element covering header detected', {
          element: overlay.className,
          zIndex: overlayStyles.zIndex,
          position: overlayStyles.position
        });
      }
    });
  };

  // Public API for manual safety checks
  const runManualSafetyCheck = () => {
    if (!isMobile || !headerRef.current) return;

    checkBackdropBlurConflicts();
    ensureHeaderIsVisible();
    fixMobileTouchTargets();
    monitorZIndexIssues();
  };

  const getHeaderStatus = () => {
    if (!headerRef.current) return null;

    const styles = window.getComputedStyle(headerRef.current);
    const rect = headerRef.current.getBoundingClientRect();

    return {
      visible: rect.height > 0 && styles.display !== 'none',
      zIndex: styles.zIndex,
      position: styles.position,
      backdropFilter: styles.backdropFilter,
      bounds: rect
    };
  };

  return {
    runManualSafetyCheck,
    getHeaderStatus,
    headerElement: headerRef.current
  };
};