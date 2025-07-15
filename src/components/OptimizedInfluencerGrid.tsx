import React, { memo, useEffect, useRef, useMemo, startTransition, useState } from 'react';
import { Button } from "@/components/ui/button";
import ProgressiveInfluencerCard from "./ProgressiveInfluencerCard";
import { EnhancedSkeletonGrid, ProgressiveLoadingSkeleton } from "./ImprovedLoadingSkeletons";
import { useInfluencers } from "@/hooks/api/useInfluencers";
import { useBatchInfluencerData } from "@/hooks/api/useBatchInfluencerData";
import { useAuth } from "@/contexts/AuthContext";

interface OptimizedInfluencerGridProps {
  searchTerm?: string;
}

// Memoized individual card wrapper for performance
const MemoizedCardWrapper = memo(({ influencer, index }: { influencer: any; index: number }) => {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Intersection observer for progressive loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );
    
    if (cardRef.current) {
      observer.observe(cardRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  return (
    <div ref={cardRef} className="w-full">
      <ProgressiveLoadingSkeleton 
        stage={isVisible ? 'complete' : 'initial'}
      >
        {isVisible && <ProgressiveInfluencerCard influencer={influencer} />}
      </ProgressiveLoadingSkeleton>
    </div>
  );
});

MemoizedCardWrapper.displayName = 'MemoizedCardWrapper';

const OptimizedInfluencerGrid = memo(({ searchTerm }: OptimizedInfluencerGridProps) => {
  const { user, loading: authLoading } = useAuth();
  const [visibleRange, setVisibleRange] = useState<[number, number]>([0, 12]);
  
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isPending,
    error,
    isFetching
  } = useInfluencers(searchTerm, true);

  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Optimized data processing
  const allInfluencers = useMemo(() => {
    return data?.pages ? data.pages.flatMap(page => page.data) : [];
  }, [data?.pages]);

  // Get visible influencer IDs for batch loading
  const visibleInfluencerIds = useMemo(() => {
    const [start, end] = visibleRange;
    return allInfluencers.slice(start, end).map(inf => inf.id);
  }, [allInfluencers, visibleRange]);

  // Batch load data for visible influencers
  const { 
    data: batchData, 
    isLoading: batchLoading 
  } = useBatchInfluencerData(visibleInfluencerIds);

  // Create a map for quick lookup
  const influencerDataMap = useMemo(() => {
    return batchData?.reduce((acc, inf) => {
      acc[inf.id] = inf;
      return acc;
    }, {} as Record<string, any>) || {};
  }, [batchData]);

  // Enhanced intersection observer for progressive loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Load more data when approaching the end
            if (hasNextPage && !isFetchingNextPage) {
              startTransition(() => {
                fetchNextPage();
              });
            }
            
            // Expand visible range for batch loading
            const currentEnd = visibleRange[1];
            if (currentEnd < allInfluencers.length) {
              setVisibleRange([visibleRange[0], Math.min(currentEnd + 8, allInfluencers.length)]);
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: '300px' }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, visibleRange, allInfluencers.length]);

  // Loading states with better UX
  const hasData = allInfluencers.length > 0;
  const isInitialLoading = (isPending || isLoading) && !hasData;
  const isRefreshing = isFetching && hasData;

  // Authentication loading with optimized skeletons
  if (authLoading) {
    return (
      <div className="space-y-6">
        <EnhancedSkeletonGrid count={8} />
      </div>
    );
  }

  // Initial loading with staggered animations
  if (isInitialLoading) {
    return (
      <div className="space-y-6">
        <EnhancedSkeletonGrid count={12} />
        <div className="text-center text-muted-foreground text-sm animate-pulse">
          Loading amazing content...
        </div>
      </div>
    );
  }

  // Enhanced error state
  if (error) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="text-6xl opacity-20">😕</div>
        <p className="text-muted-foreground text-lg">
          {error.message?.includes('timed out') 
            ? 'Loading timed out. Please check your connection and try again.'
            : 'Something went wrong loading the influencers.'
          }
        </p>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
          className="mt-4 hover:scale-105 transition-transform"
        >
          Try Again
        </Button>
      </div>
    );
  }

  // Empty state with better messaging
  if (allInfluencers.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="text-6xl opacity-30">🔍</div>
        <h3 className="text-xl font-semibold">
          {searchTerm ? `No results for "${searchTerm}"` : 'No influencers found'}
        </h3>
        <p className="text-muted-foreground">
          {searchTerm ? 'Try a different search term' : 'Check back later for new content'}
        </p>
      </div>
    );
  }

  // Optimized grid with progressive enhancement
  return (
    <div className="space-y-8">
      {/* Progress indicator for data loading */}
      {isRefreshing && (
        <div className="text-center py-2">
          <div className="inline-flex items-center space-x-2 text-sm text-muted-foreground">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span>Refreshing content...</span>
          </div>
        </div>
      )}

      {/* Optimized CSS Grid with performance improvements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 will-change-contents">
        {allInfluencers.map((influencer, index) => {
          // Use batch data if available, fallback to original
          const enhancedInfluencer = influencerDataMap[influencer.id] || influencer;
          
          return (
            <MemoizedCardWrapper
              key={influencer.id}
              influencer={enhancedInfluencer}
              index={index}
            />
          );
        })}
      </div>

      {/* Enhanced load more section */}
      <div ref={loadMoreRef} className="flex flex-col items-center space-y-4 py-8">
        {isFetchingNextPage && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-muted-foreground font-medium">
              Loading more amazing content...
            </span>
          </div>
        )}
        
        {hasNextPage && !isFetchingNextPage && (
          <Button 
            variant="outline" 
            onClick={() => fetchNextPage()}
            className="hover:scale-105 transition-all duration-200 hover:shadow-lg"
          >
            Load More Influencers
          </Button>
        )}
        
        {!hasNextPage && allInfluencers.length > 0 && (
          <div className="text-center space-y-2">
            <div className="text-2xl opacity-50">🎉</div>
            <p className="text-muted-foreground text-sm font-medium">
              You've seen all {allInfluencers.length} influencers!
            </p>
            <p className="text-muted-foreground text-xs">
              Check back later for new additions
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

OptimizedInfluencerGrid.displayName = 'OptimizedInfluencerGrid';

export default OptimizedInfluencerGrid;