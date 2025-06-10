
import { useEffect, useRef, useState } from 'react';
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

  // More robust loading state detection - prevent infinite loading
  const hasAnyData = data?.pages?.length > 0 || (data && Object.keys(data).length > 0);
  const actuallyLoading = (isPending || isLoading) && !hasAnyData;
  
  // Debug logging to identify the issue
  console.log('[InfluencerGrid] Debug State:', {
    isPending,
    isLoading,
    dataPages: data?.pages?.length,
    actuallyLoading,
    hasData: !!data,
    hasAnyData,
    firstPageData: data?.pages?.[0]?.data?.length,
    rawDataKeys: data ? Object.keys(data) : 'no data'
  });
  
  // EMERGENCY: Force stop loading after 10 seconds regardless of state
  const [forceShowData, setForceShowData] = useState(false);
  useEffect(() => {
    if (actuallyLoading) {
      const timeout = setTimeout(() => {
        console.error('[InfluencerGrid] FORCE STOPPING INFINITE LOAD - showing emergency state');
        setForceShowData(true);
      }, 10000);
      return () => clearTimeout(timeout);
    }
  }, [actuallyLoading]);

  // Loading watchdog protection for influencer grid
  useLoadingWatchdog({
    component: 'InfluencerGrid',
    isLoading: actuallyLoading,
    timeout: 20000, // Increased to 20 seconds for production resilience
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

  const allInfluencers = data?.pages?.flatMap(page => page.data) || [];
  
  // Additional debug logging for data structure
  console.log('[InfluencerGrid] Data structure debug:', {
    allInfluencersCount: allInfluencers.length,
    rawData: data,
    pages: data?.pages,
    firstPage: data?.pages?.[0]
  });

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

  // Add a failsafe - if we have data but still think we're loading, show the data
  const hasValidData = data?.pages?.length > 0 && data.pages[0]?.data?.length > 0;
  
  if (actuallyLoading && !hasValidData && !forceShowData) {
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

  // EMERGENCY OVERRIDE: Show error message if force triggered
  if (forceShowData) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 text-lg font-semibold mb-4">
          ⚠️ Loading Error Detected
        </p>
        <p className="text-muted-foreground mb-4">
          The influencer data failed to load properly. This indicates a technical issue.
        </p>
        <p className="text-sm text-muted-foreground">
          Debug info: isPending={isPending.toString()}, isLoading={isLoading.toString()}, hasData={hasAnyData.toString()}
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

  if (allInfluencers.length === 0) {
    // Emergency: If we're stuck loading but have data in the first page, try to render it
    const emergencyData = data?.pages?.[0]?.data;
    if (emergencyData && emergencyData.length > 0) {
      console.warn('[InfluencerGrid] Emergency fallback: using first page data directly');
      return (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {emergencyData.map((influencer) => (
              <InfluencerCard key={influencer.id} influencer={influencer} />
            ))}
          </div>
        </div>
      );
    }
    
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
