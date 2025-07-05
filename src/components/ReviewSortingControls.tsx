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
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-muted/30 rounded-lg border">
      
      {/* Left side - Stats */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {totalCount === 0 ? 'No reviews yet' : 
             totalCount === 1 ? '1 review' : 
             `${totalCount.toLocaleString()} reviews`}
          </span>
        </div>
        
        {loadedCount < totalCount && (
          <Badge variant="secondary" className="text-xs">
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

      {/* Right side - Sort Controls */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground font-medium">Sort by:</span>
        
        <Tabs 
          value={currentSort} 
          onValueChange={(value) => onSortChange(value as ReviewSortOption)}
          className="w-auto"
          data-testid="sorting-controls"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger 
              value="recent" 
              className="flex items-center gap-2 text-xs"
              disabled={isLoading}
              data-testid="sort-recent"
            >
              <Clock className="h-3 w-3" />
              Recent
            </TabsTrigger>
            <TabsTrigger 
              value="likes" 
              className="flex items-center gap-2 text-xs"
              disabled={isLoading}
              data-testid="sort-popular"
            >
              <Heart className="h-3 w-3" />
              Popular
            </TabsTrigger>
          </TabsList>
        </Tabs>
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