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
import { useMobileGestures } from '@/hooks/useMobileGestures';
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
  const [translateX, setTranslateX] = useState(0);
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

  // Touch gesture handling for swipe navigation
  const gestureHandlers = useMobileGestures({
    onSwipeLeft: nextReview,
    onSwipeRight: previousReview,
    onPan: (deltaX) => {
      // Visual feedback during pan
      const maxTranslate = carouselRef.current?.offsetWidth || 0;
      const normalizedDelta = Math.max(-maxTranslate, Math.min(maxTranslate, deltaX));
      setTranslateX(normalizedDelta);
    },
    threshold: 50
  });

  // Handle transition animations
  useEffect(() => {
    setIsTransitioning(true);
    setTranslateX(0);
    
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

  // Single review - no carousel needed
  if (reviews.length === 1) {
    const review = reviews[0];
    const expert = review.expert_id ? experts[review.expert_id] : null;
    const influencer = influencers[review.influencer_id];
    const expertName = expert?.name || review.author || 'Unknown Expert';
    const influencerName = influencer?.name || 'Unknown Influencer';
    const isNatty = (review.rating ?? 0) >= 4 || (review.natty_or_not?.toLowerCase() === 'natty');
    const cardColor = isNatty ? 'bg-natty/10 border-natty' : 'bg-juicy/10 border-juicy';

    return (
      <Card className={cn('border-2', cardColor, className)}>
        <CardContent className="p-4">
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
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="font-semibold">Expert Reviews</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {currentIndex + 1} of {reviews.length}
            </div>
          </div>
        </div>

        {/* Carousel Container */}
        <div
          ref={carouselRef}
          className="relative overflow-hidden"
          {...gestureHandlers}
          role="region"
          aria-label="Expert reviews carousel"
        >
          {/* Reviews Container */}
          <div
            className={cn(
              'flex transition-transform duration-300 ease-out',
              isTransitioning && 'transition-transform'
            )}
            style={{
              transform: `translateX(calc(-${currentIndex * 100}% + ${translateX}px))`,
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
                  className={cn('w-full flex-shrink-0 p-4', cardColor)}
                  style={{ width: `${100 / reviews.length}%` }}
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

          {/* Navigation Arrows */}
          {reviews.length > 1 && (
            <>
              <button
                onClick={previousReview}
                disabled={isTransitioning}
                className={cn(
                  'absolute left-2 top-1/2 -translate-y-1/2 z-10',
                  'w-10 h-10 rounded-full bg-black/50 text-white',
                  'flex items-center justify-center',
                  'hover:bg-black/70 transition-colors',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'focus:outline-none focus:ring-2 focus:ring-white/50'
                )}
                aria-label="Previous expert review"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={nextReview}
                disabled={isTransitioning}
                className={cn(
                  'absolute right-2 top-1/2 -translate-y-1/2 z-10',
                  'w-10 h-10 rounded-full bg-black/50 text-white',
                  'flex items-center justify-center',
                  'hover:bg-black/70 transition-colors',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'focus:outline-none focus:ring-2 focus:ring-white/50'
                )}
                aria-label="Next expert review"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        {/* Indicators */}
        {reviews.length > 1 && (
          <div className="p-4 bg-gradient-to-r from-muted/20 to-muted/30">
            <div className="flex justify-center space-x-2">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToReview(index)}
                  disabled={isTransitioning}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all duration-300',
                    'focus:outline-none focus:ring-2 focus:ring-primary/50',
                    index === currentIndex 
                      ? 'bg-primary scale-125' 
                      : 'bg-primary/30 hover:bg-primary/50'
                  )}
                  aria-label={`Go to expert review ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Swipe instruction for mobile */}
        {reviews.length > 1 && (
          <div className="absolute top-20 left-4 z-10 md:hidden">
            <div className="bg-black/50 text-white text-xs px-2 py-1 rounded">
              Swipe to navigate
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
    <div className="relative">
      {/* Admin Actions */}
      {isAdmin && (
        <div className="absolute top-0 right-0 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-white/20">
                <MoreVertical className="h-4 w-4" />
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

      {/* Expert Info */}
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold overflow-hidden">
          {expert?.profile_picture_url ? (
            <img src={expert.profile_picture_url} alt={expertName} className="w-full h-full object-cover rounded-full" />
          ) : (
            expertName[0] || <User className="w-6 h-6" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1 mb-2">
            {expert?.id ? (
              <a href={`/experts/${expert.id}`} className="font-semibold text-white drop-shadow hover:underline">
                {expertName}
              </a>
            ) : (
              <span className="font-semibold text-white drop-shadow">{expertName}</span>
            )}
            <span className="text-muted-foreground text-sm">said about</span>
            <a href={`/influencer/${review.influencer_id}`} className="font-semibold text-white drop-shadow hover:underline bg-white/10 px-2 py-1 rounded text-sm">
              {influencerName}
            </a>
          </div>
          
          {/* External Link */}
          {review.link_url && isValidUrl(review.link_url) && (
            <div className="mb-2">
              <a 
                href={review.link_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-400 hover:underline text-sm font-medium inline-flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" /> Read Full Review
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Review Content */}
      <div className="text-sm mb-3 break-words whitespace-pre-line text-white drop-shadow">
        {review.content}
      </div>
      
      {/* Verdict */}
      <div className="flex items-center gap-2">
        <span className="font-semibold text-xs text-muted-foreground">VERDICT:</span>
        <span className={cn('font-bold text-sm', isNatty ? 'text-natty' : 'text-juicy')}>
          {isNatty ? 'Natty' : 'Juicy'}
        </span>
      </div>
    </div>
  );
};