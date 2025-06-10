
import { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import InfluencerCard from "./InfluencerCard";
import { useInfluencers } from "@/hooks/api/useInfluencers";
import { useAuth } from "@/contexts/AuthContext";
import { useLoadingWatchdog } from "@/utils/loadingWatchdog";
import { toast } from "@/hooks/use-toast";
import { quickConnectionTest } from "@/utils/diagnostics";

interface InfluencerGridProps {
  searchTerm?: string;
}

const InfluencerGrid = ({ searchTerm }: InfluencerGridProps) => {
  const { loading: authLoading } = useAuth();
  
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
  } = useInfluencers(searchTerm, !authLoading); // Only run query when auth is ready

  const loadMoreRef = useRef<HTMLDivElement>(null);

  // More robust loading state detection - prevent infinite loading
  const hasAnyData = data?.pages?.length > 0 || (data && Object.keys(data).length > 0);
  const actuallyLoading = (isPending || isLoading) && !hasAnyData;
  
  // 🔧 COMPREHENSIVE STATE DEBUGGING
  console.log('[InfluencerGrid] 🚨 CRITICAL DEBUG - React Query State Analysis:', {
    // Primary states
    isPending,
    isLoading,
    isFetching,
    isFetchingNextPage,
    isError,
    isSuccess,
    
    // Status indicators
    status, // 'pending' | 'error' | 'success'
    fetchStatus, // 'fetching' | 'paused' | 'idle'
    
    // Data analysis
    dataExists: !!data,
    dataStructure: data ? Object.keys(data) : 'NO_DATA',
    pagesArray: data?.pages,
    pagesLength: data?.pages?.length,
    firstPageExists: !!data?.pages?.[0],
    firstPageData: data?.pages?.[0]?.data,
    firstPageLength: data?.pages?.[0]?.data?.length,
    
    // Loading logic
    hasAnyData,
    actuallyLoading,
    
    // Auth state
    authLoading,
    queryEnabled: !authLoading,
    
    // Error info
    error: error?.message,
    errorStack: error?.stack,
    
    // Timestamp
    timestamp: new Date().toISOString()
  });
  
  // 🎯 HYPOTHESIS TEST: Check if React Query is stuck in pending state
  if (status === 'pending' && !authLoading) {
    console.error('🚨 [InfluencerGrid] HYPOTHESIS: React Query stuck in pending state despite auth ready!', {
      status,
      isPending,
      isLoading,
      authLoading,
      queryEnabled: !authLoading,
      timeSinceLastRender: performance.now()
    });
  }
  
  // 🎯 HYPOTHESIS TEST: Check if data exists but component thinks it's loading
  if (data?.pages?.[0]?.data?.length > 0 && actuallyLoading) {
    console.error('🚨 [InfluencerGrid] HYPOTHESIS: Data exists but component shows loading!', {
      dataLength: data.pages[0].data.length,
      actuallyLoading,
      isPending,
      isLoading,
      hasAnyData,
      data: data.pages[0].data
    });
  }
  
  // Remove emergency timeout since data is loading successfully

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
  
  if (actuallyLoading && !hasValidData) {
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

  // Emergency override removed - data is loading successfully

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
