import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'circle' | 'rounded' | 'text';
  width?: string | number;
  height?: string | number;
  animate?: boolean;
}

/**
 * Unified skeleton component following modern best practices
 * - Consistent design system
 * - Performance optimized animations
 * - Accessibility compliant
 * - Mobile-friendly
 */
export const UnifiedSkeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'default',
  width,
  height,
  animate = true,
  ...props
}) => {
  const baseClasses = cn(
    'bg-muted',
    animate && 'animate-pulse',
    variant === 'circle' && 'rounded-full',
    variant === 'rounded' && 'rounded-lg',
    variant === 'text' && 'rounded h-4',
    variant === 'default' && 'rounded-md',
    className
  );

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={baseClasses}
      style={style}
      aria-hidden="true"
      role="presentation"
      {...props}
    />
  );
};

/**
 * Review Card Skeleton - Matches actual review layout perfectly
 */
export const ReviewSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('border border-border rounded-lg p-4 space-y-3', className)}>
    {/* Header */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <UnifiedSkeleton variant="circle" width={32} height={32} />
        <UnifiedSkeleton variant="text" width={120} />
        <UnifiedSkeleton variant="rounded" width={60} height={20} />
      </div>
      <UnifiedSkeleton variant="text" width={80} />
    </div>
    
    {/* Content */}
    <div className="space-y-2">
      <UnifiedSkeleton variant="text" width="100%" />
      <UnifiedSkeleton variant="text" width="75%" />
      <UnifiedSkeleton variant="text" width="50%" />
    </div>
    
    {/* Actions */}
    <div className="flex gap-3 pt-2">
      <UnifiedSkeleton variant="rounded" width={70} height={32} />
      <UnifiedSkeleton variant="rounded" width={70} height={32} />
    </div>
    
    {/* Reply section hint */}
    <div className="mt-4 pl-4 border-l-2 border-muted">
      <UnifiedSkeleton variant="text" width={100} />
    </div>
  </div>
);

/**
 * Sorting Controls Skeleton
 */
export const SortingSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('flex items-center justify-between p-4 bg-muted/30 rounded-lg border', className)}>
    <div className="flex items-center gap-3">
      <UnifiedSkeleton width={16} height={16} />
      <UnifiedSkeleton variant="text" width={96} />
    </div>
    <div className="flex items-center gap-3">
      <UnifiedSkeleton variant="text" width={64} />
      <UnifiedSkeleton variant="rounded" width={128} height={32} />
    </div>
  </div>
);

/**
 * Progressive Review Loading - Shows content as it loads
 */
interface ProgressiveReviewSkeletonProps {
  count?: number;
  showSorting?: boolean;
  staggerDelay?: number;
  className?: string;
}

export const ProgressiveReviewSkeleton: React.FC<ProgressiveReviewSkeletonProps> = ({
  count = 3,
  showSorting = true,
  staggerDelay = 150,
  className
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Sorting controls */}
      {showSorting && <SortingSkeleton />}
      
      {/* Staggered review skeletons */}
      {Array.from({ length: count }, (_, i) => (
        <ReviewSkeleton
          key={i}
          className={cn(
            'animate-fade-in',
            `animation-delay-${i * staggerDelay}ms`
          )}
        />
      ))}
    </div>
  );
};

/**
 * Error State Component
 */
interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  onRetry,
  className
}) => (
  <div className={cn(
    'text-center py-8 px-4 border-2 border-dashed border-destructive/20 rounded-lg bg-destructive/5',
    className
  )}>
    <div className="space-y-3">
      <div className="text-destructive text-sm font-medium">
        Loading Error
      </div>
      <p className="text-muted-foreground text-sm max-w-md mx-auto">
        {error}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors text-sm font-medium"
        >
          Try Again
        </button>
      )}
    </div>
  </div>
);

/**
 * Empty State Component
 */
interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No reviews yet',
  description = 'Be the first to share your thoughts about this influencer.',
  action,
  className
}) => (
  <div className={cn(
    'text-center py-12 px-4 border-2 border-dashed border-muted-foreground/20 rounded-lg',
    className
  )}>
    <div className="space-y-3">
      <h3 className="text-muted-foreground font-medium">
        {title}
      </h3>
      <p className="text-muted-foreground/80 text-sm max-w-md mx-auto">
        {description}
      </p>
      {action && <div className="pt-2">{action}</div>}
    </div>
  </div>
);