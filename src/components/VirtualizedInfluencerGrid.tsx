import React, { useEffect, useRef, useMemo, startTransition, useState, useCallback } from 'react';
import { VariableSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import InfiniteLoader from 'react-window-infinite-loader';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import InfluencerCard from "./InfluencerCard";
import { useInfluencers, type InfluencerPage } from "@/hooks/api/useInfluencers";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface VirtualizedInfluencerGridProps {
  searchTerm?: string;
}

// Utility: fetch vote counts for a list of influencer IDs with enhanced caching
const useInfluencerVoteCounts = (influencerIds: string[]) => {
  return useQuery({
    queryKey: ['influencer-vote-counts', influencerIds],
    queryFn: async () => {
      if (influencerIds.length === 0) return {};
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
    staleTime: 60000,
    gcTime: 5 * 60 * 1000,
  });
};

// Calculate responsive grid columns
const useGridColumns = () => {
  const [columns, setColumns] = useState(4);

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 640) setColumns(1);      // sm
      else if (width < 768) setColumns(2); // md  
      else if (width < 1024) setColumns(3); // lg
      else if (width < 1280) setColumns(4); // xl
      else setColumns(5);                   // 2xl
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  return columns;
};

const VirtualizedInfluencerGrid = ({ searchTerm }: VirtualizedInfluencerGridProps) => {
  const { user, loading: authLoading } = useAuth();
  const listRef = useRef<List>(null);
  const rowHeights = useRef<Record<number, number>>({});
  const columns = useGridColumns();
  
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isPending,
    error,
    isError,
  } = useInfluencers(searchTerm, true);

  // Loading state
  const hasData = data?.pages && data.pages.length > 0;
  const isInitialLoading = (isPending || isLoading) && !hasData;

  // Memoized influencers array with optimized sorting
  const allInfluencers = useMemo(() => {
    return hasData ? data.pages.flatMap(page => page.data) : [];
  }, [data?.pages, hasData]);
  
  // Sort influencers by most voted (descending) with memoization
  const influencerIds = useMemo(() => allInfluencers.map(i => i.id), [allInfluencers]);
  const { data: voteCounts, isLoading: voteCountsLoading } = useInfluencerVoteCounts(influencerIds);
  
  const sortedInfluencers = useMemo(() => {
    if (!voteCounts || influencerIds.length === 0) return allInfluencers;
    
    return [...allInfluencers].sort((a, b) => {
      const votesA = voteCounts[a.id] || 0;
      const votesB = voteCounts[b.id] || 0;
      return votesB - votesA;
    });
  }, [allInfluencers, voteCounts, influencerIds.length]);

  // Group influencers into rows based on columns
  const influencerRows = useMemo(() => {
    const rows: any[][] = [];
    for (let i = 0; i < sortedInfluencers.length; i += columns) {
      rows.push(sortedInfluencers.slice(i, i + columns));
    }
    return rows;
  }, [sortedInfluencers, columns]);

  // Calculate dynamic row height
  const getRowHeight = useCallback((index: number) => {
    // Return cached height if available
    if (rowHeights.current[index]) {
      return rowHeights.current[index];
    }
    
    // Default height estimate - will be updated when row renders
    const baseCardHeight = 350;
    const gap = 24;
    return baseCardHeight + gap;
  }, []);

  // Update row height when measured
  const updateRowHeight = useCallback((index: number, height: number) => {
    if (rowHeights.current[index] !== height) {
      rowHeights.current[index] = height;
      // Trigger re-render for this row and below
      if (listRef.current) {
        listRef.current.resetAfterIndex(index, false);
      }
    }
  }, []);

  // Check if item is loaded for infinite loader
  const isItemLoaded = useCallback((index: number) => {
    return index < influencerRows.length;
  }, [influencerRows.length]);

  // Load more items
  const loadMoreItems = useCallback(async () => {
    if (hasNextPage && !isFetchingNextPage) {
      await fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Row renderer
  const Row = ({ index, style, data: rowData }: any) => {
    const rowRef = useRef<HTMLDivElement>(null);
    const row = influencerRows[index];

    // Measure row height after render
    useEffect(() => {
      if (rowRef.current) {
        const height = rowRef.current.offsetHeight;
        updateRowHeight(index, height);
      }
    });

    if (!row) {
      // Loading row
      return (
        <div style={style} className="px-6">
          <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, i) => (
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

    return (
      <div ref={rowRef} style={style} className="px-6">
        <div className="grid gap-6 pb-6" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {row.map((influencer: any) => (
            <div key={influencer.id} className="flex flex-col">
              <InfluencerCard influencer={influencer} />
            </div>
          ))}
          {/* Fill empty slots if last row is incomplete */}
          {row.length < columns && 
            Array.from({ length: columns - row.length }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))
          }
        </div>
      </div>
    );
  };

  // Reset heights when columns change
  useEffect(() => {
    rowHeights.current = {};
    if (listRef.current) {
      listRef.current.resetAfterIndex(0, true);
    }
  }, [columns]);

  // Show loading while checking authentication
  if (authLoading || isInitialLoading) {
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

  const itemCount = hasNextPage ? influencerRows.length + 1 : influencerRows.length;

  return (
    <div className="h-screen">
      <AutoSizer>
        {({ height, width }) => (
          <InfiniteLoader
            isItemLoaded={isItemLoaded}
            itemCount={itemCount}
            loadMoreItems={loadMoreItems}
          >
            {({ onItemsRendered, ref }) => (
              <List
                ref={(list) => {
                  listRef.current = list;
                  ref(list);
                }}
                height={height}
                width={width}
                itemCount={itemCount}
                itemSize={getRowHeight}
                onItemsRendered={onItemsRendered}
                overscanCount={2}
                itemData={influencerRows}
              >
                {Row}
              </List>
            )}
          </InfiniteLoader>
        )}
      </AutoSizer>
      
      {/* Loading indicator at bottom */}
      {isFetchingNextPage && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-background/80 backdrop-blur-sm border rounded-full px-4 py-2 shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="text-sm text-muted-foreground">Loading more...</span>
            </div>
          </div>
        </div>
      )}
      
      {/* End of list indicator */}
      {!hasNextPage && sortedInfluencers.length > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-background/80 backdrop-blur-sm border rounded-full px-4 py-2 shadow-lg">
            <p className="text-sm text-muted-foreground">
              🎉 All {sortedInfluencers.length} influencers loaded!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualizedInfluencerGrid; 