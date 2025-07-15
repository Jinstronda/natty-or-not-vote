import React, { Suspense, lazy } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import EnhancedUserReviews from './EnhancedUserReviews';
import { ProgressiveReviewSkeleton, ErrorState } from './loading/UnifiedSkeleton';
import { withLoadingSafeguards, loadingCircuitBreaker, performanceMonitor } from '@/utils/loadingValidation';

// Lazy load the modern system for progressive enhancement
const ModernReviewSystem = lazy(() => 
  import('./ModernReviewSystem').then(module => ({ 
    default: module.ModernReviewSystem 
  }))
);

interface ReviewSystemIntegrationProps {
  influencerId: string;
  pageSize?: number;
  useModernSystem?: boolean;
  className?: string;
}

/**
 * Integration layer that provides:
 * 1. Backward compatibility with existing EnhancedUserReviews
 * 2. Progressive enhancement with ModernReviewSystem  
 * 3. Graceful fallback mechanisms
 * 4. Performance monitoring
 * 5. Error boundary protection
 */
export const ReviewSystemIntegration: React.FC<ReviewSystemIntegrationProps> = ({
  influencerId,
  pageSize = 10,
  useModernSystem = true,
  className
}) => {
  
  // Fallback component for when modern system fails
  const FallbackComponent = () => (
    <EnhancedUserReviews 
      influencerId={influencerId}
      pageSize={pageSize}
      defaultSort="recent"
    />
  );

  // Error fallback component
  const ErrorFallback = ({ error, resetErrorBoundary }: any) => (
    <ErrorState
      error={`Review system error: ${error?.message || 'Unknown error'}`}
      onRetry={resetErrorBoundary}
      className={className}
    />
  );

  // Loading fallback for Suspense
  const LoadingFallback = () => (
    <div className={className}>
      <ProgressiveReviewSkeleton count={3} showSorting={true} />
    </div>
  );

  // Modern system with safeguards
  const ModernSystemWithSafeguards = () => {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <ErrorBoundary 
          FallbackComponent={ErrorFallback}
          onError={(error, errorInfo) => {
            console.error('[ReviewSystemIntegration] Modern system error:', error, errorInfo);
            performanceMonitor.recordLoadTime(999999); // Record as failure
          }}
          onReset={() => {
            console.log('[ReviewSystemIntegration] Attempting to recover...');
          }}
        >
          <ModernReviewSystem
            influencerId={influencerId}
            pageSize={pageSize}
            className={className}
          />
        </ErrorBoundary>
      </Suspense>
    );
  };

  // Circuit breaker implementation
  const renderWithCircuitBreaker = async () => {
    const startTime = Date.now();
    
    try {
      const result = await loadingCircuitBreaker.execute(
        async () => {
          // Simulate the modern system load
          await new Promise(resolve => setTimeout(resolve, 100));
          return 'modern';
        },
        () => 'fallback'
      );
      
      const loadTime = Date.now() - startTime;
      performanceMonitor.recordLoadTime(loadTime);
      
      return result;
    } catch (error) {
      console.warn('[ReviewSystemIntegration] Circuit breaker triggered fallback');
      return 'fallback';
    }
  };

  // Feature flag and capability detection
  const shouldUseModernSystem = () => {
    // Check for modern browser features
    const hasIntersectionObserver = 'IntersectionObserver' in window;
    const hasRequestIdleCallback = 'requestIdleCallback' in window;
    const hasPerformanceObserver = 'PerformanceObserver' in window;
    
    // Check for sufficient performance
    const isHighPerformanceDevice = navigator.hardwareConcurrency >= 4;
    const hasGoodConnection = !('connection' in navigator) || 
      (navigator as any).connection?.effectiveType !== 'slow-2g';
    
    return useModernSystem && 
           hasIntersectionObserver && 
           (hasRequestIdleCallback || hasPerformanceObserver) &&
           (isHighPerformanceDevice || hasGoodConnection);
  };

  // Gradual rollout mechanism
  const getSystemVariant = (): 'modern' | 'enhanced' | 'basic' => {
    if (!shouldUseModernSystem()) {
      return 'enhanced'; // Use existing enhanced system
    }

    // A/B testing based on user ID hash
    const userHash = influencerId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const variant = Math.abs(userHash) % 100;
    
    if (variant < 70) { // 70% get modern system
      return 'modern';
    } else if (variant < 90) { // 20% get enhanced system
      return 'enhanced';
    } else { // 10% get basic fallback for comparison
      return 'basic';
    }
  };

  // Main render logic with progressive enhancement
  const renderReviewSystem = () => {
    const variant = getSystemVariant();
    
    console.log(`[ReviewSystemIntegration] Using variant: ${variant} for influencer: ${influencerId}`);
    
    switch (variant) {
      case 'modern':
        return (
          <div data-testid="modern-review-system">
            <ModernSystemWithSafeguards />
          </div>
        );
        
      case 'enhanced':
        return (
          <div data-testid="enhanced-review-system">
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <FallbackComponent />
            </ErrorBoundary>
          </div>
        );
        
      case 'basic':
      default:
        return (
          <div data-testid="basic-review-system">
            <FallbackComponent />
          </div>
        );
    }
  };

  return renderReviewSystem();
};

/**
 * Higher-order component for wrapping existing review components
 * with the new loading capabilities
 */
export const withModernLoading = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return React.forwardRef<any, P & { useModernLoading?: boolean }>((props, ref) => {
    const { useModernLoading = false, ...componentProps } = props;
    
    if (!useModernLoading) {
      return <Component ref={ref} {...(componentProps as P)} />;
    }
    
    return (
      <ErrorBoundary 
        FallbackComponent={({ error }) => (
          <div className="p-4 border border-destructive rounded-lg">
            <p className="text-destructive text-sm">
              Loading enhancement failed: {error?.message}
            </p>
            <Component ref={ref} {...(componentProps as P)} />
          </div>
        )}
      >
        <Suspense fallback={<ProgressiveReviewSkeleton />}>
          <Component ref={ref} {...(componentProps as P)} />
        </Suspense>
      </ErrorBoundary>
    );
  });
};

/**
 * Context provider for review system configuration
 */
interface ReviewSystemConfig {
  enableModernSystem: boolean;
  enablePerformanceMonitoring: boolean;
  enableCircuitBreaker: boolean;
  fallbackToEnhanced: boolean;
}

const defaultConfig: ReviewSystemConfig = {
  enableModernSystem: true,
  enablePerformanceMonitoring: true,
  enableCircuitBreaker: true,
  fallbackToEnhanced: true
};

export const ReviewSystemContext = React.createContext<ReviewSystemConfig>(defaultConfig);

export const ReviewSystemProvider: React.FC<{
  config?: Partial<ReviewSystemConfig>;
  children: React.ReactNode;
}> = ({ config = {}, children }) => {
  const mergedConfig = { ...defaultConfig, ...config };
  
  return (
    <ReviewSystemContext.Provider value={mergedConfig}>
      {children}
    </ReviewSystemContext.Provider>
  );
};

/**
 * Hook for accessing review system configuration
 */
export const useReviewSystemConfig = () => {
  return React.useContext(ReviewSystemContext);
};

/**
 * Performance monitoring component
 */
export const ReviewSystemMonitor: React.FC = () => {
  const [stats, setStats] = React.useState({
    averageLoadTime: 0,
    isPerformanceDegrading: false,
    totalSamples: 0
  });

  React.useEffect(() => {
    const interval = setInterval(() => {
      setStats({
        averageLoadTime: performanceMonitor.getAverageLoadTime(),
        isPerformanceDegrading: performanceMonitor.isPerformanceDegrading(),
        totalSamples: (performanceMonitor as any).samples?.length || 0
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-background border rounded-lg p-2 text-xs z-50">
      <div>Avg Load: {Math.round(stats.averageLoadTime)}ms</div>
      <div>Samples: {stats.totalSamples}</div>
      <div className={stats.isPerformanceDegrading ? 'text-destructive' : 'text-muted-foreground'}>
        {stats.isPerformanceDegrading ? '⚠️ Degrading' : '✅ Stable'}
      </div>
    </div>
  );
};

// Export types for consumers
export type { ReviewSystemIntegrationProps, ReviewSystemConfig };