import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Star, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight, 
  User,
  MoreVertical,
  Edit,
  UserCheck,
  Trash2
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import { ExpertReview } from "@/types/vote";
// import { useMobileGestures } from '@/hooks/useMobileGestures'; // Disabled for better UX
import { isValidUrl } from '@/utils/urlValidator';

interface MobileExpertReviewsCarouselProps {
  reviews: ExpertReview[];
  experts: Record<string, any>;
  influencers: Record<string, any>;
  isAdmin?: boolean;
  onEdit?: (review: ExpertReview) => void;
  onDelete?: (reviewId: string, expertName: string) => void;
  onChangeInfluencer?: (reviewId: string) => void;
  className?: string;
}

export const MobileExpertReviewsCarousel: React.FC<MobileExpertReviewsCarouselProps> = ({
  reviews,
  experts,
  influencers,
  isAdmin = false,
  onEdit,
  onDelete,
  onChangeInfluencer,
  className
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  const nextReview = useCallback(() => {
    if (isTransitioning || reviews.length <= 1) return;
    
    const newIndex = (currentIndex + 1) % reviews.length;
    setCurrentIndex(newIndex);
  }, [currentIndex, reviews.length, isTransitioning]);

  const previousReview = useCallback(() => {
    if (isTransitioning || reviews.length <= 1) return;
    
    const newIndex = currentIndex === 0 ? reviews.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  }, [currentIndex, reviews.length, isTransitioning]);

  const goToReview = useCallback((index: number) => {
    if (isTransitioning || index === currentIndex || index < 0 || index >= reviews.length) return;
    
    setCurrentIndex(index);
  }, [currentIndex, isTransitioning, reviews.length]);

  // Touch gesture handling disabled - using buttons for better UX
  // const gestureHandlers = useMobileGestures({
  //   onSwipeLeft: nextReview,
  //   onSwipeRight: previousReview,
  //   onPan: (deltaX) => {
  //     // Visual feedback during pan
  //     const maxTranslate = carouselRef.current?.offsetWidth || 0;
  //     const normalizedDelta = Math.max(-maxTranslate, Math.min(maxTranslate, deltaX));
  //     setTranslateX(normalizedDelta);
  //   },
  //   threshold: 50
  // });

  // Handle transition animations
  useEffect(() => {
    setIsTransitioning(true);
    
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          previousReview();
          break;
        case 'ArrowRight':
          nextReview();
          break;
        case 'Home':
          goToReview(0);
          break;
        case 'End':
          goToReview(reviews.length - 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previousReview, nextReview, goToReview, reviews.length]);

  if (reviews.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <Star className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No expert reviews yet.</p>
        </CardContent>
      </Card>
    );
  }

  // Single review - enhanced design
  if (reviews.length === 1) {
    const review = reviews[0];
    const expert = review.expert_id ? experts[review.expert_id] : null;
    const influencer = influencers[review.influencer_id];
    const expertName = expert?.name || review.author || 'Unknown Expert';
    const influencerName = influencer?.name || 'Unknown Influencer';
    const isNatty = (review.rating ?? 0) >= 4 || (review.natty_or_not?.toLowerCase() === 'natty');

    return (
      <Card className={cn('relative overflow-hidden border-2', className)}>
        <CardContent className="p-0">
          {/* Header */}
          <div className="px-6 py-3 bg-gradient-to-r from-black/10 via-transparent to-black/10 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-2">
              <Star className="h-5 w-5 text-yellow-400" />
              <span className="font-bold text-white drop-shadow-lg">Expert Analysis</span>
            </div>
          </div>
          
          {/* Single Review Content */}
          <div 
            className="expert-reviews-carousel-slide expert-review-enter"
            style={{ 
              background: isNatty 
                ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 100%)'
                : 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(236, 72, 153, 0.05) 100%)'
            }}
          >
            <ExpertReviewCard 
              review={review}
              expert={expert}
              influencer={influencer}
              expertName={expertName}
              influencerName={influencerName}
              isNatty={isNatty}
              isAdmin={isAdmin}
              onEdit={onEdit}
              onDelete={onDelete}
              onChangeInfluencer={onChangeInfluencer}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <CardContent className="p-0">
        {/* Minimal Header */}
        <div className="px-6 py-3 bg-gradient-to-r from-black/10 via-transparent to-black/10 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2">
            <Star className="h-5 w-5 text-yellow-400" />
            <span className="font-bold text-white drop-shadow-lg">Expert Analysis</span>
          </div>
        </div>

        {/* Carousel Container - Dynamic Height */}
        <div
          ref={carouselRef}
          className="relative overflow-hidden"
          role="region"
          aria-label="Expert reviews carousel"
          style={{ minHeight: 'auto' }}
        >
          {/* Reviews Container */}
          <div
            className={cn(
              'flex transition-transform duration-300 ease-out',
              isTransitioning && 'transition-transform'
            )}
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
              width: `${reviews.length * 100}%`
            }}
          >
            {reviews.map((review, index) => {
              const expert = review.expert_id ? experts[review.expert_id] : null;
              const influencer = influencers[review.influencer_id];
              const expertName = expert?.name || review.author || 'Unknown Expert';
              const influencerName = influencer?.name || 'Unknown Influencer';
              const isNatty = (review.rating ?? 0) >= 4 || (review.natty_or_not?.toLowerCase() === 'natty');
              const cardColor = isNatty ? 'bg-natty/10 border-natty' : 'bg-juicy/10 border-juicy';

              return (
                <div
                  key={review.id}
                  className="w-full flex-shrink-0 expert-reviews-carousel-slide expert-review-enter"
                  style={{ 
                    width: '100%',
                    background: isNatty 
                      ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 100%)'
                      : 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(236, 72, 153, 0.05) 100%)'
                  }}
                >
                  <ExpertReviewCard 
                    review={review}
                    expert={expert}
                    influencer={influencer}
                    expertName={expertName}
                    influencerName={influencerName}
                    isNatty={isNatty}
                    isAdmin={isAdmin}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onChangeInfluencer={onChangeInfluencer}
                  />
                </div>
              );
            })}
          </div>

          {/* Navigation Arrows - Enhanced Mobile Touch Targets */}
          {reviews.length > 1 && (
            <>
              <button
                onClick={previousReview}
                disabled={isTransitioning}
                className={cn(
                  'absolute left-3 top-1/2 -translate-y-1/2 z-30',
                  'w-12 h-12 rounded-full bg-black/80 text-white',
                  'flex items-center justify-center',
                  'hover:bg-black/90 active:scale-95 transition-all duration-200',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'focus:outline-none focus:ring-2 focus:ring-white/50',
                  'expert-review-navigation-button expert-review-interactive',
                  'backdrop-blur-sm border border-white/10'
                )}
                aria-label="Previous expert review"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>

              <button
                onClick={nextReview}
                disabled={isTransitioning}
                className={cn(
                  'absolute right-3 top-1/2 -translate-y-1/2 z-30',
                  'w-12 h-12 rounded-full bg-black/80 text-white',
                  'flex items-center justify-center',
                  'hover:bg-black/90 active:scale-95 transition-all duration-200',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'focus:outline-none focus:ring-2 focus:ring-white/50',
                  'expert-review-navigation-button expert-review-interactive',
                  'backdrop-blur-sm border border-white/10'
                )}
                aria-label="Next expert review"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            </>
          )}
        </div>

        {/* Enhanced Indicators */}
        {reviews.length > 1 && (
          <div className="p-6 bg-gradient-to-r from-black/20 via-black/10 to-black/20 backdrop-blur-sm">
            <div className="flex justify-center items-center space-x-3">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToReview(index)}
                  disabled={isTransitioning}
                  className={cn(
                    'rounded-full transition-all duration-300 expert-review-dot expert-review-interactive',
                    'focus:outline-none focus:ring-2 focus:ring-white/50',
                    'border border-white/20',
                    index === currentIndex 
                      ? 'w-4 h-4 bg-primary scale-110 shadow-lg shadow-primary/30' 
                      : 'w-3 h-3 bg-white/40 hover:bg-white/60 hover:scale-105'
                  )}
                  aria-label={`Go to expert review ${index + 1}`}
                />
              ))}
            </div>
            <div className="text-center mt-2 text-white/70 text-sm font-medium">
              {currentIndex + 1} of {reviews.length}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Individual Expert Review Card Component
interface ExpertReviewCardProps {
  review: ExpertReview;
  expert: any;
  influencer: any;
  expertName: string;
  influencerName: string;
  isNatty: boolean;
  isAdmin: boolean;
  onEdit?: (review: ExpertReview) => void;
  onDelete?: (reviewId: string, expertName: string) => void;
  onChangeInfluencer?: (reviewId: string) => void;
}

const ExpertReviewCard: React.FC<ExpertReviewCardProps> = ({
  review,
  expert,
  influencer,
  expertName,
  influencerName,
  isNatty,
  isAdmin,
  onEdit,
  onDelete,
  onChangeInfluencer
}) => {
  return (
    <div className="relative p-6 min-h-[200px] flex flex-col items-center justify-center">
      {/* Admin Actions - Floating */}
      {isAdmin && (
        <div className="absolute top-4 right-4 z-20">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0 hover:bg-white/20 backdrop-blur-sm bg-black/30 rounded-full">
                <MoreVertical className="h-5 w-5 text-white" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem 
                onClick={() => onEdit?.(review)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Edit className="h-4 w-4 text-blue-600" />
                <span>Edit Review</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onChangeInfluencer?.(review.id)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <UserCheck className="h-4 w-4 text-green-600" />
                <span>Change Influencer</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete?.(review.id, expertName)}
                className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Review</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Centered Expert Profile */}
      <div className="flex flex-col items-center gap-4 text-center">
        {/* Profile Picture */}
        <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold overflow-hidden border-3 border-white/30 shadow-lg">
          {expert?.profile_picture_url ? (
            <img src={expert.profile_picture_url} alt={expertName} className="w-full h-full object-cover rounded-full" />
          ) : (
            expertName[0] || <User className="w-10 h-10" />
          )}
        </div>
        
        {/* Expert Name - Clickable */}
        <div className="space-y-1">
          {expert?.id ? (
            <a href={`/experts/${expert.id}`} className="font-bold text-xl text-white drop-shadow-lg hover:underline block">
              {expertName}
            </a>
          ) : (
            <span className="font-bold text-xl text-white drop-shadow-lg">{expertName}</span>
          )}
          
          {/* Verdict Badge */}
          <div className={cn(
            'px-4 py-2 rounded-full font-bold text-sm shadow-md',
            isNatty 
              ? 'bg-natty text-black' 
              : 'bg-juicy text-white'
          )}>
            {isNatty ? '💪 NATTY' : '💉 JUICY'}
          </div>
        </div>
      </div>
    </div>
  );
};