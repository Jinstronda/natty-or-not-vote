
import * as React from "react"

const MOBILE_BREAKPOINT = 1024 // Changed from 768 to 1024 to match header breakpoint

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const checkMobile = () => {
      // More aggressive mobile detection for iPhone
      const userAgent = navigator.userAgent.toLowerCase();
      const isIOS = /iphone|ipad|ipod/.test(userAgent);
      const isSmallScreen = window.innerWidth < MOBILE_BREAKPOINT;
      const isTouchDevice = 'ontouchstart' in window;
      
      // Force mobile if it's iOS or small screen or touch device
      const shouldBeMobile = isIOS || isSmallScreen || (isTouchDevice && window.innerWidth < 1200);
      
      setIsMobile(shouldBeMobile);
    };

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    mql.addEventListener("change", checkMobile)
    checkMobile(); // Check immediately
    
    return () => mql.removeEventListener("change", checkMobile)
  }, [])

  return !!isMobile
}
