
import { useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import InfluencerCard from "./InfluencerCard";
import { useInfluencers } from "@/hooks/api/useInfluencers";

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
    error
  } = useInfluencers(searchTerm);

  const loadMoreRef = useRef<HTMLDivElement>(null);

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
        <p className="text-muted-foreground">
          Error loading influencers. Please try again later.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <Skeleton className="h-4 w-3/4 mx-auto" />
            <Skeleton className="h-2 w-full" />
          </div>
        ))}
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
