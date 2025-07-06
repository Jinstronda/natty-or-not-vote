import React, { Suspense, useState, useEffect, useMemo, startTransition, useDeferredValue, useCallback } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import StateOfTheArtInfluencerCard from "./StateOfTheArtInfluencerCard";
import { EnhancedSkeletonGrid } from "./ImprovedLoadingSkeletons";
import { useInfluencers } from "@/hooks/api/useInfluencers";
import { useAuth } from "@/contexts/AuthContext";
import { usePerformanceMonitor } from "@/utils/performanceMonitor";

interface SuspenseInfluencerGridProps {
  searchTerm?: string;
}

// Advanced loading skeleton with staggered animations
const GridLoadingSkeleton = React.memo(({ count = 8 }: { count?: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, index) => (
      <Card 
        key={index} 
        className="aspect-square animate-pulse"
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <CardContent className="p-0 h-full bg-gradient-to-br from-muted via-muted-foreground/10 to-muted relative overflow-hidden">
          {/* Advanced shimmer effect */}
          <div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer-enhanced"
            style={{ animationDelay: `${index * 150}ms` }}
          />
          
          {/* Content skeleton */}
          <div className="absolute bottom-4 left-4 right-4 space-y-2">
            <div className="h-4 bg-muted-foreground/20 rounded animate-pulse" />
            <div className="h-2 bg-muted-foreground/20 rounded animate-pulse" style={{ width: '70%' }} />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
));

GridLoadingSkeleton.displayName = 'GridLoadingSkeleton';

// Error fallback component with retry functionality
const GridErrorFallback = React.memo(({ 
  error, 
  resetErrorBoundary 
}: { 
  error: Error; 
  resetErrorBoundary: () => void; 
}) => (
  <div className="text-center py-16 space-y-4">
    <div className="text-6xl mb-4">😵</div>
    <h3 className="text-xl font-semibold text-destructive">Oops! Something went wrong</h3>
    <p className="text-muted-foreground max-w-md mx-auto">
      {error.message?.includes('timed out') 
        ? 'The request timed out. Please check your connection and try again.'
        : 'An unexpected error occurred while loading the influencers.'
      }
    </p>
    <div className="space-y-2">
      <Button onClick={resetErrorBoundary} variant="outline" className="mx-2">
        Try Again
      </Button>
      <Button 
        onClick={() => window.location.reload()} 
        variant="ghost" 
        className="mx-2"
      >
        Refresh Page
      </Button>
    </div>
    {process.env.NODE_ENV === 'development' && (
      <details className="mt-4 text-left max-w-lg mx-auto">
        <summary className="cursor-pointer text-sm text-muted-foreground">
          Technical Details
        </summary>
        <pre className="mt-2 p-4 bg-muted rounded text-xs overflow-auto">
          {error.stack}
        </pre>
      </details>
    )}
  </div>
));

GridErrorFallback.displayName = 'GridErrorFallback';

// Lazy-loaded influencer card with error boundary
const LazyInfluencerCard = React.memo(({ 
  influencer, 
  index,
  onLoadComplete 
}: { 
  influencer: any; 
  index: number;
  onLoadComplete?: (metrics: any) => void;
}) => (
  <ErrorBoundary
    FallbackComponent={({ error, resetErrorBoundary }) => (
      <Card className="aspect-square flex items-center justify-center border-destructive/20">
        <CardContent className="text-center p-4">
          <div className="text-2xl mb-2">⚠️</div>
          <p className="text-sm text-muted-foreground">Card failed to load</p>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={resetErrorBoundary}
            className="mt-2"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    )}
    onError={(error) => {
      console.error(`Card ${influencer.id} failed to load:`, error);
    }}
  >
    <Suspense fallback={
      <Card className="aspect-square animate-pulse">
        <CardContent className="p-0 h-full bg-gradient-to-br from-muted via-muted-foreground/10 to-muted" />
      </Card>
    }>
      <StateOfTheArtInfluencerCard 
        influencer={influencer} 
        index={index}
        onLoadComplete={onLoadComplete}
      />
    </Suspense>
  </ErrorBoundary>
));

LazyInfluencerCard.displayName = 'LazyInfluencerCard';

const SuspenseInfluencerGrid = ({ searchTerm }: SuspenseInfluencerGridProps) => {
  const { user, loading: authLoading } = useAuth();
  const { recordMetric, getPerformanceSummary } = usePerformanceMonitor();
  
  // Performance tracking state
  const [loadMetrics, setLoadMetrics] = useState<{
    cardsLoaded: number;
    totalLoadTime: number;
    averageLoadTime: number;
  }>({
    cardsLoaded: 0,
    totalLoadTime: 0,
    averageLoadTime: 0
  });

  // Use deferred value for search to prevent blocking
  const deferredSearchTerm = useDeferredValue(searchTerm || '');
  
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isPending,
    error,
    isError
  } = useInfluencers(deferredSearchTerm, true);

  // Memoized influencers with intelligent batching
  const allInfluencers = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap(page => page.data);
  }, [data?.pages]);

  // Performance monitoring
  const handleCardLoadComplete = useCallback((metrics: any) => {
    setLoadMetrics(prev => {
      const newCardsLoaded = prev.cardsLoaded + 1;
      const newTotalTime = prev.totalLoadTime + metrics.totalTime;
      const newAverageTime = newTotalTime / newCardsLoaded;
      
      return {
        cardsLoaded: newCardsLoaded,
        totalLoadTime: newTotalTime,
        averageLoadTime: newAverageTime
      };
    });
    
    recordMetric('Grid:CardLoadComplete', metrics.totalTime);
  }, [recordMetric]);

  // Log performance summary when grid is complete
  useEffect(() => {
    if (allInfluencers.length > 0 && loadMetrics.cardsLoaded >= Math.min(allInfluencers.length, 8)) {
      const summary = getPerformanceSummary();
      console.log('Grid Performance Summary:', {
        ...summary,
        cardsLoaded: loadMetrics.cardsLoaded,
        averageCardLoadTime: loadMetrics.averageLoadTime
      });
    }
  }, [allInfluencers.length, loadMetrics, getPerformanceSummary]);

  // Infinite scroll with React 19 concurrent features
  const loadMoreRef = React.useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          startTransition(() => {
            fetchNextPage();
          });
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Loading states with enhanced UX
  const isInitialLoading = (isPending || isLoading) && allInfluencers.length === 0;
  const isSearching = deferredSearchTerm !== searchTerm;

  if (authLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Authenticating...
          </div>
        </div>
        <GridLoadingSkeleton count={8} />
      </div>
    );
  }

  return (
    <ErrorBoundary
      FallbackComponent={GridErrorFallback}
      onError={(error) => {
        recordMetric('Grid:Error', 1);
        console.error('Grid Error:', error);
      }}
    >
      <div className="space-y-8">
        {/* Search status indicator */}
        {isSearching && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-primary">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Searching for "{searchTerm}"...
            </div>
          </div>
        )}

        {/* Performance metrics (dev mode) */}
        {process.env.NODE_ENV === 'development' && loadMetrics.cardsLoaded > 0 && (
          <div className="text-center text-xs text-muted-foreground space-x-4">
            <span>Cards: {loadMetrics.cardsLoaded}</span>
            <span>Avg Load: {Math.round(loadMetrics.averageLoadTime)}ms</span>
            <span>Total: {Math.round(loadMetrics.totalLoadTime)}ms</span>
          </div>
        )}

        {/* Main grid with Suspense */}
        <Suspense fallback={<GridLoadingSkeleton count={8} />}>
          {isInitialLoading ? (
            <GridLoadingSkeleton count={8} />
          ) : isError ? (
            <GridErrorFallback 
              error={error as Error} 
              resetErrorBoundary={() => window.location.reload()} 
            />
          ) : allInfluencers.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold">
                {searchTerm ? `No results for "${searchTerm}"` : 'No influencers found'}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? 'Try a different search term or check the spelling.' 
                  : 'Check back later for new content.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {allInfluencers.map((influencer, index) => (
                <LazyInfluencerCard
                  key={influencer.id}
                  influencer={influencer}
                  index={index}
                  onLoadComplete={handleCardLoadComplete}
                />
              ))}
            </div>
          )}
        </Suspense>

        {/* Infinite scroll trigger */}
        <div ref={loadMoreRef} className="flex justify-center">
          {isFetchingNextPage && (
            <div className="flex items-center space-x-3 py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-muted-foreground">Loading more influencers...</span>
            </div>
          )}
          
          {hasNextPage && !isFetchingNextPage && allInfluencers.length > 0 && (
            <Button 
              variant="outline" 
              onClick={() => startTransition(() => fetchNextPage())}
              className="mt-4"
            >
              Load More
            </Button>
          )}
          
          {!hasNextPage && allInfluencers.length > 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">
                🎉 You've seen all {allInfluencers.length} influencers!
              </p>
              {loadMetrics.cardsLoaded > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Average load time: {Math.round(loadMetrics.averageLoadTime)}ms
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default SuspenseInfluencerGrid;