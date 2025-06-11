import { useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import InfluencerCard from "./InfluencerCard";
import { useInfluencers, type InfluencerPage } from "@/hooks/api/useInfluencers";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface InfluencerGridProps {
  searchTerm?: string;
}

// Utility: fetch vote counts for a list of influencer IDs
const useInfluencerVoteCounts = (influencerIds: string[]) => {
  return useQuery({
    queryKey: ['influencer-vote-counts', influencerIds],
    queryFn: async () => {
      if (influencerIds.length === 0) return {};
      // Use the materialized view for performance
      const { data, error } = await supabase
        .from('influencer_vote_counts')
        .select('influencer_id, total_votes')
        .in('influencer_id', influencerIds);
      if (error) throw error;
      const map: Record<string, number> = {};
      data?.forEach((row: any) => {
        map[row.influencer_id] = row.total_votes;
      });
      return map;
    },
    enabled: influencerIds.length > 0,
    staleTime: 30000,
  });
};

const InfluencerGrid = ({ searchTerm }: InfluencerGridProps) => {
  const { user, loading: authLoading } = useAuth();
  
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

  // Loading state is now purely based on the query state
  const hasData = data?.pages && data.pages.length > 0;
  const isInitialLoading = (isPending || isLoading) && !hasData;
  const isRefreshing = isFetching && hasData;

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

  const allInfluencers = hasData ? data.pages.flatMap(page => page.data) : [];
  
  // Sort influencers by most voted (descending)
  const influencerIds = allInfluencers.map(i => i.id);
  const { data: voteCounts, isLoading: voteCountsLoading } = useInfluencerVoteCounts(influencerIds);
  let sortedInfluencers = allInfluencers;
  if (voteCounts && influencerIds.length > 0) {
    sortedInfluencers = [...allInfluencers].sort((a, b) => {
      const votesA = voteCounts[a.id] || 0;
      const votesB = voteCounts[b.id] || 0;
      return votesB - votesA;
    });
  }

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
  if (allInfluencers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          {searchTerm ? `No influencers found for "${searchTerm}"` : 'No influencers found'}
        </p>
      </div>
    );
  }

  // Success state
  return (
    <div className="space-y-8">
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
        {sortedInfluencers.map((influencer) => (
          <div key={influencer.id} className="mb-6 break-inside-avoid">
            <InfluencerCard influencer={influencer} />
          </div>
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
