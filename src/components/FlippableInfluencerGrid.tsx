import { useEffect, useRef, useMemo, startTransition } from 'react';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useInfluencers } from "@/hooks/api/useInfluencers";
import { useAuth } from "@/contexts/AuthContext";
import FlippableInfluencerCard from "./FlippableInfluencerCard";

interface FlippableInfluencerGridProps {
  searchTerm?: string;
}

const FlippableInfluencerGrid = ({ searchTerm }: FlippableInfluencerGridProps) => {
  const { user, loading: authLoading } = useAuth();
  
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

  // Loading state is now purely based on the query state
  const hasData = data?.pages && data.pages.length > 0;
  const isInitialLoading = (isPending || isLoading) && !hasData;

  // Memoized influencers array
  const allInfluencers = useMemo(() => {
    return hasData ? data.pages.flatMap(page => page.data) : [];
  }, [data?.pages, hasData]);

  // Intersection observer for infinite scroll
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

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-4 min-h-[400px]">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4 mx-auto" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Loading state
  if (isInitialLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-4 min-h-[400px]">
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
  if (allInfluencers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          {searchTerm ? `No influencers found for "${searchTerm}"` : 'No influencers found'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 3D Flip Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {allInfluencers.map((influencer) => (
          <div key={influencer.id} className="min-h-[400px]">
            <FlippableInfluencerCard influencer={influencer} />
          </div>
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
        
        {!hasNextPage && allInfluencers.length > 0 && (
          <p className="text-muted-foreground text-sm">
            You've reached the end! 🎉 ({allInfluencers.length} influencers total)
          </p>
        )}
      </div>
    </div>
  );
};

export default FlippableInfluencerGrid; 