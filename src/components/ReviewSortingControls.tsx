import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Heart, TrendingUp, Users } from "lucide-react";

export type ReviewSortOption = 'recent' | 'likes';

interface ReviewSortingControlsProps {
  currentSort: ReviewSortOption;
  onSortChange: (sort: ReviewSortOption) => void;
  totalCount: number;
  loadedCount: number;
  isLoading?: boolean;
}

// Modern sorting controls with good UX
export const ReviewSortingControls = ({
  currentSort,
  onSortChange,
  totalCount,
  loadedCount,
  isLoading = false
}: ReviewSortingControlsProps) => {
  return (
    <div className="bg-gradient-to-r from-muted/20 to-muted/30 rounded-xl border border-border/50 backdrop-blur-sm shadow-sm">
      {/* Mobile-first design */}
      <div className="p-4 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
        
        {/* Stats Section - Full width on mobile */}
        <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-start">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {totalCount === 0 ? 'No reviews yet' : 
               totalCount === 1 ? '1 review' : 
               `${totalCount.toLocaleString()} reviews`}
            </span>
          </div>
          
          {loadedCount < totalCount && (
            <Badge variant="secondary" className="text-xs px-2 py-1 rounded-full">
              Showing {loadedCount} of {totalCount}
            </Badge>
          )}

          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground" data-testid="loading-spinner">
              <div className="h-3 w-3 border border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">Loading...</span>
            </div>
          )}
        </div>

        {/* Sort Controls - Enhanced for mobile */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <span className="text-sm text-muted-foreground font-medium hidden sm:inline">Sort by:</span>
          
          <Tabs 
            value={currentSort} 
            onValueChange={(value) => onSortChange(value as ReviewSortOption)}
            className="w-full sm:w-auto"
            data-testid="sorting-controls"
          >
            <TabsList className="grid w-full grid-cols-2 h-10 bg-background/50 rounded-lg p-1 border border-border/30">
              <TabsTrigger 
                value="recent" 
                className={`
                  flex items-center justify-center gap-2 text-xs font-medium
                  transition-all duration-200 rounded-md
                  data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
                  data-[state=active]:shadow-sm data-[state=active]:scale-[0.98]
                  hover:bg-muted/50 active:scale-95
                  disabled:opacity-50 disabled:pointer-events-none
                  min-h-[32px] px-3
                `}
                disabled={isLoading}
                data-testid="sort-recent"
              >
                <Clock className="h-3 w-3 flex-shrink-0" />
                <span>Recent</span>
              </TabsTrigger>
              <TabsTrigger 
                value="likes" 
                className={`
                  flex items-center justify-center gap-2 text-xs font-medium
                  transition-all duration-200 rounded-md
                  data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
                  data-[state=active]:shadow-sm data-[state=active]:scale-[0.98]
                  hover:bg-muted/50 active:scale-95
                  disabled:opacity-50 disabled:pointer-events-none
                  min-h-[32px] px-3
                `}
                disabled={isLoading}
                data-testid="sort-popular"
              >
                <Heart className="h-3 w-3 flex-shrink-0" />
                <span>Popular</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Mobile Sort Indicator - Shows current sort prominently */}
      <div className="px-4 pb-3 sm:hidden">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <TrendingUp className="h-3 w-3" />
          <span>
            Sorted by {currentSort === 'recent' ? 'newest first' : 'most liked first'}
          </span>
        </div>
      </div>
    </div>
  );
};

// Loading skeleton for sorting controls
export const ReviewSortingControlsSkeleton = () => (
  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
    <div className="flex items-center gap-3">
      <div className="h-4 w-4 bg-muted animate-pulse rounded" />
      <div className="h-4 w-24 bg-muted animate-pulse rounded" />
    </div>
    <div className="flex items-center gap-3">
      <div className="h-4 w-16 bg-muted animate-pulse rounded" />
      <div className="h-8 w-32 bg-muted animate-pulse rounded" />
    </div>
  </div>
);

// Sort option info tooltips
export const getSortOptionInfo = (option: ReviewSortOption) => {
  switch (option) {
    case 'recent':
      return {
        title: 'Most Recent',
        description: 'Shows newest reviews first',
        icon: Clock
      };
    case 'likes':
      return {
        title: 'Most Popular',
        description: 'Shows reviews with most likes first',
        icon: Heart
      };
    default:
      return {
        title: 'Sort Reviews',
        description: 'Choose how to sort reviews',
        icon: TrendingUp
      };
  }
};