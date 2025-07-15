import { useState, useEffect, useCallback, useRef } from 'react';

interface AccessibilityPreferences {
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  darkMode: boolean;
  screenReader: boolean;
  touchAccommodations: boolean;
}

interface TouchTarget {
  element: HTMLElement;
  rect: DOMRect;
  isCompliant: boolean;
  suggestedSize: { width: number; height: number };
}

// Mobile accessibility preferences detection and management
export const useMobileAccessibility = () => {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>({
    reducedMotion: false,
    highContrast: false,
    largeText: false,
    darkMode: false,
    screenReader: false,
    touchAccommodations: false
  });

  const updatePreferences = useCallback(() => {
    const mediaQueries = {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      highContrast: window.matchMedia('(prefers-contrast: high)').matches,
      largeText: window.matchMedia('(min-resolution: 1.5dppx)').matches,
      darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches
    };

    // Detect screen reader
    const screenReader = !!(
      navigator.userAgent.match(/NVDA|JAWS|SAPI|VoiceOver|TalkBack/i) ||
      window.speechSynthesis ||
      document.querySelector('[aria-hidden]')
    );

    // Detect if user might need touch accommodations
    const touchAccommodations = !!(
      'ontouchstart' in window &&
      window.DeviceMotionEvent &&
      window.innerWidth < 768
    );

    setPreferences({
      ...mediaQueries,
      screenReader,
      touchAccommodations
    });
  }, []);

  useEffect(() => {
    updatePreferences();

    // Listen for preference changes
    const mediaQueries = [
      '(prefers-reduced-motion: reduce)',
      '(prefers-contrast: high)',
      '(min-resolution: 1.5dppx)',
      '(prefers-color-scheme: dark)'
    ].map(query => window.matchMedia(query));

    const handleChange = () => updatePreferences();

    mediaQueries.forEach(mq => {
      mq.addEventListener('change', handleChange);
    });

    return () => {
      mediaQueries.forEach(mq => {
        mq.removeEventListener('change', handleChange);
      });
    };
  }, [updatePreferences]);

  return preferences;
};

// Touch target compliance checker
export const useTouchTargetCompliance = () => {
  const [nonCompliantTargets, setNonCompliantTargets] = useState<TouchTarget[]>([]);

  const checkTouchTargets = useCallback(() => {
    const MINIMUM_SIZE = 44; // 44px minimum per WCAG guidelines
    const selectors = 'button, a, input, select, textarea, [role="button"], [tabindex="0"]';
    const elements = document.querySelectorAll(selectors) as NodeListOf<HTMLElement>;
    
    const results: TouchTarget[] = [];

    elements.forEach(element => {
      // Skip hidden elements
      if (element.offsetParent === null) return;

      const rect = element.getBoundingClientRect();
      const isCompliant = rect.width >= MINIMUM_SIZE && rect.height >= MINIMUM_SIZE;

      if (!isCompliant) {
        results.push({
          element,
          rect,
          isCompliant,
          suggestedSize: {
            width: Math.max(MINIMUM_SIZE, rect.width),
            height: Math.max(MINIMUM_SIZE, rect.height)
          }
        });
      }
    });

    setNonCompliantTargets(results);
    return results;
  }, []);

  const fixTouchTarget = useCallback((target: TouchTarget) => {
    const { element, suggestedSize } = target;
    
    // Apply minimum touch target size
    element.style.minWidth = `${suggestedSize.width}px`;
    element.style.minHeight = `${suggestedSize.height}px`;
    element.style.display = element.style.display || 'inline-flex';
    element.style.alignItems = 'center';
    element.style.justifyContent = 'center';
    
    // Add touch-friendly padding if needed
    const computedStyle = window.getComputedStyle(element);
    const currentPadding = parseInt(computedStyle.padding) || 0;
    if (currentPadding < 8) {
      element.style.padding = '8px';
    }
  }, []);

  const fixAllTouchTargets = useCallback(() => {
    nonCompliantTargets.forEach(fixTouchTarget);
    // Re-check after fixes
    setTimeout(checkTouchTargets, 100);
  }, [nonCompliantTargets, fixTouchTarget, checkTouchTargets]);

  return {
    nonCompliantTargets,
    checkTouchTargets,
    fixTouchTarget,
    fixAllTouchTargets
  };
};

// Screen reader announcements
export const useScreenReaderAnnouncements = () => {
  const announcementRef = useRef<HTMLDivElement | null>(null);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announcementRef.current) {
      // Create announcement element if it doesn't exist
      const element = document.createElement('div');
      element.setAttribute('aria-live', priority);
      element.setAttribute('aria-atomic', 'true');
      element.className = 'sr-only';
      element.style.cssText = `
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      `;
      document.body.appendChild(element);
      announcementRef.current = element;
    }

    // Clear previous message and announce new one
    announcementRef.current.textContent = '';
    setTimeout(() => {
      if (announcementRef.current) {
        announcementRef.current.textContent = message;
      }
    }, 100);
  }, []);

  const announceRouteChange = useCallback((routeName: string) => {
    announce(`Navigated to ${routeName}`, 'polite');
  }, [announce]);

  const announceLoadingState = useCallback((isLoading: boolean, context: string = '') => {
    if (isLoading) {
      announce(`Loading ${context}`, 'polite');
    } else {
      announce(`${context} loaded`, 'polite');
    }
  }, [announce]);

  const announceError = useCallback((error: string) => {
    announce(`Error: ${error}`, 'assertive');
  }, [announce]);

  return {
    announce,
    announceRouteChange,
    announceLoadingState,
    announceError
  };
};

// Focus management for mobile
export const useMobileFocusManagement = () => {
  const focusStack = useRef<HTMLElement[]>([]);

  const trapFocus = useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, []);

  const pushFocus = useCallback((element: HTMLElement) => {
    const currentActive = document.activeElement as HTMLElement;
    if (currentActive) {
      focusStack.current.push(currentActive);
    }
    element.focus();
  }, []);

  const popFocus = useCallback(() => {
    const previousElement = focusStack.current.pop();
    if (previousElement) {
      previousElement.focus();
    }
  }, []);

  const skipToContent = useCallback(() => {
    const mainContent = document.querySelector('main') as HTMLElement ||
                       document.querySelector('[role="main"]') as HTMLElement ||
                       document.querySelector('#main-content') as HTMLElement;
    
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return {
    trapFocus,
    pushFocus,
    popFocus,
    skipToContent
  };
};

// High contrast mode detection and utilities
export const useHighContrastMode = () => {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    const checkHighContrast = () => {
      // Multiple methods to detect high contrast mode
      const mediaQuery = window.matchMedia('(prefers-contrast: high)').matches;
      
      // Windows high contrast detection
      const testDiv = document.createElement('div');
      testDiv.style.cssText = `
        position: absolute;
        top: -999px;
        background-color: rgb(31, 32, 33);
        color: rgb(255, 255, 255);
      `;
      document.body.appendChild(testDiv);
      
      const computedStyle = window.getComputedStyle(testDiv);
      const isWindowsHighContrast = 
        computedStyle.backgroundColor !== 'rgb(31, 32, 33)' ||
        computedStyle.color !== 'rgb(255, 255, 255)';
      
      document.body.removeChild(testDiv);
      
      setIsHighContrast(mediaQuery || isWindowsHighContrast);
    };

    checkHighContrast();

    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    mediaQuery.addEventListener('change', checkHighContrast);

    return () => {
      mediaQuery.removeEventListener('change', checkHighContrast);
    };
  }, []);

  const getHighContrastStyles = useCallback(() => {
    if (!isHighContrast) return {};

    return {
      backgroundColor: 'Canvas',
      color: 'CanvasText',
      borderColor: 'ButtonText',
      outline: '2px solid ButtonText',
      outlineOffset: '2px'
    };
  }, [isHighContrast]);

  return {
    isHighContrast,
    getHighContrastStyles
  };
};

// Voice control and speech recognition support
export const useVoiceControl = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
    }
  }, []);

  const startListening = useCallback((
    onResult: (transcript: string, confidence: number) => void,
    onError?: (error: any) => void
  ) => {
    if (!recognitionRef.current || isListening) return;

    recognitionRef.current.onresult = (event: any) => {
      const lastResult = event.results[event.results.length - 1];
      if (lastResult.isFinal) {
        onResult(lastResult[0].transcript, lastResult[0].confidence);
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      onError?.(event.error);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.start();
    setIsListening(true);
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const handleVoiceCommand = useCallback((
    transcript: string,
    commands: Record<string, () => void>
  ) => {
    const normalizedTranscript = transcript.toLowerCase().trim();
    
    for (const [command, action] of Object.entries(commands)) {
      if (normalizedTranscript.includes(command.toLowerCase())) {
        action();
        break;
      }
    }
  }, []);

  return {
    isSupported,
    isListening,
    startListening,
    stopListening,
    handleVoiceCommand
  };
};