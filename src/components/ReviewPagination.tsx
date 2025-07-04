import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Loader2, MoreHorizontal } from "lucide-react";

interface ReviewPaginationProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  loadedCount: number;
  totalCount: number;
  className?: string;
}

// Modern "Load More" pagination component
export const ReviewPagination = ({
  hasMore,
  isLoading,
  onLoadMore,
  loadedCount,
  totalCount,
  className = ""
}: ReviewPaginationProps) => {
  if (totalCount === 0) return null;

  const remainingCount = totalCount - loadedCount;
  const showProgress = totalCount > 0;

  return (
    <div className={`space-y-4 ${className}`}>
      
      {/* Progress indicator */}
      {showProgress && (
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>Loaded {loadedCount} of {totalCount} reviews</span>
            <span>{Math.round((loadedCount / totalCount) * 100)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min((loadedCount / totalCount) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Load More Button */}
      <div className="flex flex-col items-center gap-3">
        {hasMore ? (
          <Button
            onClick={onLoadMore}
            disabled={isLoading}
            variant="outline"
            className="w-full sm:w-auto hover:scale-105 transition-all duration-200"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading reviews...
              </>
            ) : (
              <>
                <ChevronDown className="mr-2 h-4 w-4" />
                Load {remainingCount > 10 ? '10 more' : `${remainingCount} more`} reviews
              </>
            )}
          </Button>
        ) : (
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <MoreHorizontal className="h-4 w-4" />
              <span className="text-sm">You've seen all reviews</span>
            </div>
            {loadedCount > 20 && (
              <Button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                variant="ghost"
                size="sm"
                className="text-xs"
              >
                Back to top
              </Button>
            )}
          </div>
        )}

        {/* Stats badge */}
        {loadedCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            {loadedCount === totalCount 
              ? `All ${totalCount} reviews loaded`
              : `${loadedCount}/${totalCount} loaded`
            }
          </Badge>
        )}
      </div>
    </div>
  );
};

// Loading skeleton for pagination
export const ReviewPaginationSkeleton = () => (
  <div className="space-y-4">
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
        <div className="h-4 w-8 bg-muted animate-pulse rounded" />
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div className="bg-muted-foreground h-2 rounded-full w-3/4 animate-pulse" />
      </div>
    </div>
    <div className="flex justify-center">
      <div className="h-10 w-40 bg-muted animate-pulse rounded-lg" />
    </div>
  </div>
);

// Utility component for empty state
export const EmptyReviewsState = ({ 
  sortBy, 
  onSortChange 
}: { 
  sortBy: 'recent' | 'likes'; 
  onSortChange?: (sort: 'recent' | 'likes') => void;
}) => (
  <div className="text-center py-12 space-y-4">
    <div className="text-6xl opacity-20">💬</div>
    <h3 className="text-lg font-semibold">No reviews yet</h3>
    <p className="text-muted-foreground max-w-md mx-auto">
      Be the first to share your thoughts! Vote on this influencer and leave a review.
    </p>
    {sortBy === 'likes' && onSortChange && (
      <Button
        onClick={() => onSortChange('recent')}
        variant="outline"
        size="sm"
        className="mt-4"
      >
        View by most recent instead
      </Button>
    )}
  </div>
);