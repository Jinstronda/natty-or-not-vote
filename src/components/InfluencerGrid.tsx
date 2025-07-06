import { useEffect, useRef, useMemo, startTransition, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import InfluencerCard from "./InfluencerCard";
import { useInfluencers, type InfluencerPage } from "@/hooks/api/useInfluencers";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchState } from "@/hooks/useSearchState";

interface InfluencerGridProps {
  searchTerm?: string;
  onLoadingChange?: (isLoading: boolean) => void; // Notify parent about loading state
}

const InfluencerGrid = ({ searchTerm, onLoadingChange }: InfluencerGridProps) => {
  const { user, loading: authLoading } = useAuth();
  
  // Get search state management for instant feedback
  const { handleSearchResults, handleSearchStart } = useSearchState();
  
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isPending,
    error,
    status,
    fetchStatus,
    isError,
    isSuccess,
    isFetching
  } = useInfluencers(searchTerm, true); // Always enable query for everyone

  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Enhanced loading states with instant feedback
  const hasData = data?.pages && data.pages.length > 0;
  const isInitialLoading = (isPending || isLoading) && !hasData;
  const isRefreshing = isFetching && hasData;
  const isSearchLoading = isLoading || isPending || isFetching;

  // Memoized influencers array with optimized sorting
  const allInfluencers = useMemo(() => {
    return hasData ? data.pages.flatMap(page => page.data) : [];
  }, [data?.pages, hasData]);

  // Notify search state when results change - INSTANT FEEDBACK
  useEffect(() => {
    if (!isSearchLoading && searchTerm) {
      handleSearchResults(allInfluencers, hasData);
    }
  }, [allInfluencers, hasData, searchTerm, isSearchLoading, handleSearchResults]);

  // Notify search state when search starts - INSTANT FEEDBACK
  useEffect(() => {
    if (isSearchLoading && searchTerm) {
      handleSearchStart();
    }
  }, [isSearchLoading, searchTerm, handleSearchStart]);

  // Notify parent component about loading state changes
  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(isSearchLoading);
    }
  }, [isSearchLoading, onLoadingChange]);
  
  // Use the database view's ordering (controversial first, then by votes, then by creation date)
  // No frontend sorting needed since the database view handles this correctly
  const sortedInfluencers = allInfluencers;

  // Intersection observer for infinite scroll with better performance
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          // Use startTransition for better UX
          startTransition(() => {
            fetchNextPage();
          });
        }
      },
      { threshold: 0.1, rootMargin: '200px' } // Start loading earlier
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4 mx-auto" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Loading state for authenticated users
  if (isInitialLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4 mx-auto" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          {error.message?.includes('timed out') 
            ? 'Loading timed out. Please check your connection and try again.'
            : 'Error loading influencers. Please try again later.'
          }
        </p>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          Refresh Page
        </Button>
      </div>
    );
  }

  // Empty state
  if (sortedInfluencers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          {searchTerm ? `No influencers found for "${searchTerm}"` : 'No influencers found'}
        </p>
      </div>
    );
  }

  // Optimized grid rendering with preserved database ordering
  return (
    <div className="space-y-8">
      {/* CSS Grid layout that preserves database order (controversial first) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {sortedInfluencers.map((influencer) => (
          <InfluencerCard key={influencer.id} influencer={influencer} />
        ))}
      </div>

      <div ref={loadMoreRef} className="flex justify-center">
        {isFetchingNextPage && (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="text-muted-foreground">Loading more influencers...</span>
          </div>
        )}
        
        {hasNextPage && !isFetchingNextPage && (
          <Button 
            variant="outline" 
            onClick={() => fetchNextPage()}
            className="mt-4"
          >
            Load More
          </Button>
        )}
        
        {!hasNextPage && sortedInfluencers.length > 0 && (
          <p className="text-muted-foreground text-sm">
            You've reached the end! 🎉 ({sortedInfluencers.length} influencers total)
          </p>
        )}
      </div>
    </div>
  );
};

export default InfluencerGrid;
