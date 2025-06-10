
import { useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import InfluencerCard from "./InfluencerCard";
import { useInfluencers } from "@/hooks/api/useInfluencers";
import { useLoadingWatchdog } from "@/utils/loadingWatchdog";
import { toast } from "@/hooks/use-toast";
import { quickConnectionTest } from "@/utils/diagnostics";

interface InfluencerGridProps {
  searchTerm?: string;
}

const InfluencerGrid = ({ searchTerm }: InfluencerGridProps) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isPending,
    error
  } = useInfluencers(searchTerm);

  const loadMoreRef = useRef<HTMLDivElement>(null);

  // More accurate loading state detection
  const actuallyLoading = isPending && !data?.pages?.length;

  // Loading watchdog protection for influencer grid
  useLoadingWatchdog({
    component: 'InfluencerGrid',
    isLoading: actuallyLoading,
    timeout: 10000, // Reduced to 10 seconds to match query timeout
    onTimeout: async () => {
      console.error('[InfluencerGrid] Loading timeout - running diagnostics');
      
      // Run quick connection test
      const connectionOk = await quickConnectionTest();
      
      toast({
        title: "Loading Timeout",
        description: connectionOk 
          ? "Database query timed out. The page will refresh automatically."
          : "Connection issues detected. Please check your internet.",
        variant: "destructive",
      });
      
      // Auto-refresh after timeout to recover
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    }
  });

  // Intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const allInfluencers = data?.pages.flatMap(page => page.data) || [];

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

  if (actuallyLoading) {
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {allInfluencers.map((influencer) => (
          <InfluencerCard key={influencer.id} influencer={influencer} />
        ))}
      </div>

      <div ref={loadMoreRef} className="flex justify-center">
        {isFetchingNextPage && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4 mx-auto" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
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
            You've reached the end! 🎉
          </p>
        )}
      </div>
    </div>
  );
};

export default InfluencerGrid;
