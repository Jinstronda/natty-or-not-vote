import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Clock, 
  Heart, 
  TrendingUp, 
  Users, 
  Loader2,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

export type SortOption = 'recent' | 'likes';

interface ModernSortingControlsProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalCount: number;
  loadedCount: number;
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  className?: string;
}

export const ModernSortingControls = ({
  currentSort,
  onSortChange,
  totalCount,
  loadedCount,
  isLoading = false,
  error = null,
  onRefresh,
  className
}: ModernSortingControlsProps) => {
  
  const sortOptions = [
    {
      value: 'recent' as SortOption,
      label: 'Recent',
      icon: Clock,
      description: 'Newest reviews first',
      testId: 'sort-recent'
    },
    {
      value: 'likes' as SortOption, 
      label: 'Popular',
      icon: Heart,
      description: 'Most liked reviews first',
      testId: 'sort-popular'
    }
  ];

  return (
    <Card className={cn("border border-border/50 bg-card/50 backdrop-blur-sm", className)}>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          
          {/* Left Side - Stats & Status */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {totalCount === 0 ? 'No reviews yet' : 
                 totalCount === 1 ? '1 review' : 
                 `${totalCount.toLocaleString()} reviews`}
              </span>
            </div>
            
            {/* Progress Indicator */}
            {loadedCount < totalCount && !error && (
              <Badge variant="secondary" className="text-xs">
                Showing {loadedCount} of {totalCount}
              </Badge>
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" data-testid="loading-spinner" />
                <span className="text-xs">Loading...</span>
              </div>
            )}

            {/* Error Indicator */}
            {error && (
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-3 w-3" />
                <span className="text-xs">Error loading reviews</span>
                {onRefresh && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRefresh}
                    className="h-6 px-2 text-xs"
                    data-testid="retry-button"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Retry
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Right Side - Sort Controls */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground font-medium">Sort by:</span>
            
            <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1" data-testid="sorting-controls">
              {sortOptions.map((option) => {
                const Icon = option.icon;
                const isActive = currentSort === option.value;
                const isDisabled = isLoading || !!error;
                
                return (
                  <Button
                    key={option.value}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => !isDisabled && onSortChange(option.value)}
                    disabled={isDisabled}
                    className={cn(
                      "flex items-center gap-2 text-xs transition-all duration-200",
                      "hover:scale-105 active:scale-95",
                      isActive && "shadow-sm",
                      isDisabled && "opacity-50 cursor-not-allowed"
                    )}
                    title={`${option.description}${isDisabled ? ' (disabled)' : ''}`}
                    data-testid={option.testId}
                  >
                    <Icon className="h-3 w-3" />
                    {option.label}
                    
                    {/* Active indicator */}
                    {isActive && !isLoading && (
                      <div className="w-1 h-1 bg-primary-foreground rounded-full" />
                    )}
                    
                    {/* Loading indicator for active sort */}
                    {isActive && isLoading && (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    )}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Loading skeleton for the sorting controls
export const ModernSortingControlsSkeleton = () => (
  <Card className="border border-border/50 bg-card/50">
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 bg-muted animate-pulse rounded" />
          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-4 w-16 bg-muted animate-pulse rounded" />
          <div className="h-8 w-32 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Empty state when no reviews exist
export const EmptySortingState = ({ 
  onRefresh 
}: { 
  onRefresh?: () => void 
}) => (
  <Card className="border border-border/50 bg-card/50">
    <CardContent className="p-6 text-center">
      <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
      <p className="text-sm text-muted-foreground mb-3">
        No reviews available to sort
      </p>
      {onRefresh && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="text-xs"
        >
          <RefreshCw className="h-3 w-3 mr-2" />
          Check for reviews
        </Button>
      )}
    </CardContent>
  </Card>
);

// Hook for managing sort state with modern UX patterns
export const useSortingState = (
  initialSort: SortOption = 'recent',
  onSortChange?: (sort: SortOption) => Promise<void>
) => {
  const [currentSort, setCurrentSort] = React.useState<SortOption>(initialSort);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSortChange = React.useCallback(async (newSort: SortOption) => {
    if (newSort === currentSort || isLoading) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      if (onSortChange) {
        await onSortChange(newSort);
      }
      
      setCurrentSort(newSort);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change sort');
      console.error('Sort change error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentSort, isLoading, onSortChange]);

  const retry = React.useCallback(() => {
    setError(null);
    if (onSortChange) {
      handleSortChange(currentSort);
    }
  }, [currentSort, onSortChange, handleSortChange]);

  return {
    currentSort,
    isLoading,
    error,
    handleSortChange,
    retry
  };
};