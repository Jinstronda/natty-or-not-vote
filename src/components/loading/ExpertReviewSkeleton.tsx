import React from 'react';
import { cn } from '@/lib/utils';
import { UnifiedSkeleton } from './UnifiedSkeleton';

/**
 * SAFE SKELETON: Expert Review Skeleton matching exact layout
 * Follows the existing UnifiedSkeleton pattern
 * Matches ExpertReviews.tsx layout perfectly
 */
export const ExpertReviewSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('relative flex items-start gap-4 border-2 border-muted rounded-xl p-4 shadow-sm', className)}>
    {/* Avatar skeleton - matches line 213-219 in ExpertReviews */}
    <div className="flex-shrink-0 w-14 h-14 rounded-full bg-muted animate-pulse" />
    
    {/* Content skeleton - matches line 222-281 in ExpertReviews */}
    <div className="flex-1 min-w-0 pr-8 space-y-2">
      {/* Author and influencer line - matches line 223-236 */}
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <UnifiedSkeleton variant="text" width={120} height={18} />
        <UnifiedSkeleton variant="text" width={60} height={16} />
        <UnifiedSkeleton variant="rounded" width={100} height={24} />
      </div>
      
      {/* External link skeleton - matches line 265-271 */}
      <UnifiedSkeleton variant="text" width={140} height={16} />
      
      {/* Review content skeleton - matches line 273 */}
      <div className="space-y-1 mb-2">
        <UnifiedSkeleton variant="text" width="100%" height={16} />
        <UnifiedSkeleton variant="text" width="85%" height={16} />
        <UnifiedSkeleton variant="text" width="70%" height={16} />
      </div>
      
      {/* Verdict skeleton - matches line 275-280 */}
      <div className="flex items-center gap-2">
        <UnifiedSkeleton variant="text" width={60} height={12} />
        <UnifiedSkeleton variant="text" width={50} height={14} />
      </div>
    </div>
    
    {/* Admin actions skeleton - matches line 178-210 */}
    <div className="absolute top-3 right-3">
      <UnifiedSkeleton variant="circle" width={32} height={32} />
    </div>
  </div>
);

/**
 * SAFE SKELETON: Progressive Expert Reviews Loading
 * Uses same staggered pattern as ProgressiveReviewSkeleton
 * Matches ExpertReviews.tsx structure
 */
interface ProgressiveExpertReviewsSkeletonProps {
  count?: number;
  showHeader?: boolean;
  staggerDelay?: number;
  className?: string;
}

export const ProgressiveExpertReviewsSkeleton: React.FC<ProgressiveExpertReviewsSkeletonProps> = ({
  count = 3,
  showHeader = true,
  staggerDelay = 150,
  className
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Header skeleton - matches CardHeader in ExpertReviews */}
      {showHeader && (
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-2">
            <UnifiedSkeleton variant="circle" width={20} height={20} />
            <UnifiedSkeleton variant="text" width={140} height={24} />
          </div>
        </div>
      )}
      
      {/* Staggered expert review skeletons */}
      <div className="space-y-6 px-6">
        {Array.from({ length: count }, (_, i) => (
          <ExpertReviewSkeleton
            key={i}
            className={cn(
              'animate-fade-in',
              `animation-delay-${i * staggerDelay}ms`
            )}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * SAFE SKELETON: Mobile Expert Reviews Carousel Skeleton
 * Matches MobileExpertReviewsCarousel layout
 */
export const MobileExpertReviewsCarouselSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('space-y-4', className)}>
    {/* Carousel indicators skeleton */}
    <div className="flex justify-center gap-2 pb-2">
      {[1, 2, 3].map((_, i) => (
        <UnifiedSkeleton key={i} variant="circle" width={8} height={8} />
      ))}
    </div>
    
    {/* Carousel content skeleton */}
    <div className="px-4">
      <ExpertReviewSkeleton />
    </div>
    
    {/* Navigation arrows skeleton */}
    <div className="flex justify-between px-4">
      <UnifiedSkeleton variant="circle" width={40} height={40} />
      <UnifiedSkeleton variant="circle" width={40} height={40} />
    </div>
  </div>
);

/**
 * SAFE SKELETON: Expert Reviews Form Skeleton
 * Matches ExpertReviewForm layout for admin users
 */
export const ExpertReviewFormSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('space-y-4 p-4 border border-muted rounded-lg bg-muted/20', className)}>
    {/* Form header */}
    <UnifiedSkeleton variant="text" width={180} height={20} />
    
    {/* Form fields */}
    <div className="space-y-3">
      <UnifiedSkeleton variant="rounded" width="100%" height={40} />
      <UnifiedSkeleton variant="rounded" width="100%" height={80} />
      <UnifiedSkeleton variant="rounded" width={200} height={40} />
    </div>
    
    {/* Submit button */}
    <div className="flex justify-end">
      <UnifiedSkeleton variant="rounded" width={120} height={36} />
    </div>
  </div>
);