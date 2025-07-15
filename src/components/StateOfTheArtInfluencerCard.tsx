import React, { memo, useState, useEffect, useRef, Suspense, startTransition, useDeferredValue } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useVoteStats } from "@/hooks/api/useVoteStats";
import { useSupabaseExpertReviews } from "@/hooks/useSupabaseExpertReviews";
import { OptimizedImage } from "./OptimizedImage";
import { userInteractionTracker } from "@/utils/userInteractionHelper";
import { usePrefetchInfluencer } from "@/hooks/api/usePrefetchInfluencer";
import { useAdvancedLoading } from "@/hooks/useAdvancedLoading";
import { usePerformanceMonitor } from "@/utils/performanceMonitor";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export interface InfluencerCardProps {
  influencer: {
    id: string;
    name: string;
    image: string;
    claimed_status: string;
    controversial?: boolean;
    photos?: { image_url: string }[];
  };
  index?: number; // For staggered animations
  onLoadComplete?: (metrics: any) => void;
}

// Advanced skeleton with morphing capabilities
const MorphingSkeleton = memo(({ phase, progress }: { phase: string; progress: number }) => (
  <div className={`
    absolute inset-0 transition-all duration-300 ease-out
    ${phase === 'morphing' ? 'opacity-50 scale-105' : 'opacity-100 scale-100'}
  `}>
    {/* Dynamic shimmer based on loading progress */}
    <div 
      className="h-full bg-gradient-to-r from-muted via-muted-foreground/30 to-muted animate-pulse"
      style={{ 
        background: `linear-gradient(90deg, 
          hsl(var(--muted)) 0%, 
          hsl(var(--muted-foreground) / ${0.2 + progress * 0.001}) ${progress}%, 
          hsl(var(--muted)) 100%)`
      }}
    />
    
    {/* Progress indicator */}
    <div className="absolute bottom-2 left-2 right-2">
      <div className="w-full bg-background/20 rounded-full h-1 overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  </div>
));

MorphingSkeleton.displayName = 'MorphingSkeleton';

// Lazy-loaded voting section for better performance
const LazyVotingSection = React.lazy(() => import('./VotingSection'));

const StateOfTheArtInfluencerCard = memo(({ 
  influencer, 
  index = 0, 
  onLoadComplete 
}: InfluencerCardProps) => {
  const { user } = useAuth();
  const cardRef = useRef<HTMLDivElement>(null);
  const { recordMetric, measureComponent } = usePerformanceMonitor();
  
  // Advanced loading system
  const {
    loadingState,
    startLoading,
    initializePrefetching,
    getEnhancementClass,
    performanceMetrics,
    isLoading,
    isComplete
  } = useAdvancedLoading(influencer.id, {
    enablePrefetch: true,
    enableWebWorker: true,
    enableProgressiveEnhancement: true,
    enableMetrics: true,
    prefetchDistance: 300,
    morphingDuration: 400
  });

  // Deferred values for smooth animations
  const deferredLoadingPhase = useDeferredValue(loadingState.phase);
  
  // State management
  const [imageLoaded, setImageLoaded] = useState(false);
  const [intersectionRatio, setIntersectionRatio] = useState(0);
  const [hoverMetrics, setHoverMetrics] = useState({ hoverCount: 0, totalHoverTime: 0 });
  
  // Data hooks with intelligent caching
  const { data: voteStats, isLoading: voteLoading } = useVoteStats(influencer.id);
  const { getInfluencerExpertReviews, loading: expertLoading } = useSupabaseExpertReviews();
  const { prefetchInfluencerData } = usePrefetchInfluencer();

  // Expert reviews calculation
  const expertReviews = getInfluencerExpertReviews(influencer.id);
  const expertNattyCount = expertReviews.filter(review => 
    (review.rating ?? 0) >= 4 || (review.natty_or_not?.toLowerCase() === 'natty')
  ).length;
  const expertJuicyCount = expertReviews.length - expertNattyCount;

  // Combined statistics
  const userNattyCount = voteStats?.natty_count || 0;
  const userTotalVotes = voteStats?.total_votes || 0;
  const userJuicyCount = userTotalVotes - userNattyCount;
  
  const totalVotes = userTotalVotes + expertReviews.length;
  const nattyCount = userNattyCount + expertNattyCount;
  const juicyCount = userJuicyCount + expertJuicyCount;
  
  const nattyPercentage = totalVotes > 0 ? Math.round((nattyCount / totalVotes) * 100) : 0;
  const juicyPercentage = totalVotes > 0 ? (100 - nattyPercentage) : 0;

  const isDataLoading = voteLoading || expertLoading;
  
  // Initialize intersection observer for advanced prefetching
  useEffect(() => {
    if (cardRef.current) {
      initializePrefetching(cardRef.current);
      
      // Advanced intersection observer for micro-interactions
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            setIntersectionRatio(entry.intersectionRatio);
            
            if (entry.intersectionRatio > 0.5 && !isLoading && !isComplete) {
              startTransition(() => {
                startLoading();
              });
            }
          });
        },
        { threshold: [0, 0.25, 0.5, 0.75, 1] }
      );
      
      observer.observe(cardRef.current);
      
      return () => observer.disconnect();
    }
  }, [initializePrefetching, startLoading, isLoading, isComplete]);

  // Performance monitoring
  useEffect(() => {
    if (isComplete && performanceMetrics && onLoadComplete) {
      onLoadComplete(performanceMetrics);
      recordMetric(`InfluencerCard:${influencer.id}:LoadComplete`, performanceMetrics.totalTime);
    }
  }, [isComplete, performanceMetrics, onLoadComplete, recordMetric, influencer.id]);

  // Advanced hover tracking with Web Worker optimization
  const handleMouseEnter = React.useCallback(() => {
    const hoverStartTime = performance.now();
    
    // Haptic feedback with intensity based on intersection ratio
    userInteractionTracker.safeVibrate(Math.round(2 + intersectionRatio * 3));
    
    // Intelligent prefetching based on hover intent
    if (intersectionRatio > 0.7) {
      prefetchInfluencerData(influencer.id);
    }
    
    // Web Worker optimization for hover analytics
    if (window.Worker && performanceMetrics) {
      const worker = new Worker('/worker.js');
      worker.postMessage({
        type: 'processHoverData',
        data: { influencerId: influencer.id, intersectionRatio, timestamp: hoverStartTime }
      });
    }
    
    // Update hover metrics
    setHoverMetrics(prev => ({
      hoverCount: prev.hoverCount + 1,
      totalHoverTime: prev.totalHoverTime
    }));
    
    return () => {
      const hoverEndTime = performance.now();
      const hoverDuration = hoverEndTime - hoverStartTime;
      
      setHoverMetrics(prev => ({
        ...prev,
        totalHoverTime: prev.totalHoverTime + hoverDuration
      }));
      
      recordMetric(`InfluencerCard:${influencer.id}:HoverDuration`, hoverDuration);
    };
  }, [intersectionRatio, prefetchInfluencerData, influencer.id, recordMetric]);

  const mainImage = influencer.photos && influencer.photos.length > 0
    ? influencer.photos[0].image_url
    : influencer.image;

  // Staggered animation delay
  const animationDelay = index * 100;

  return (
    <div
      ref={cardRef}
      className="relative"
      style={{ 
        animationDelay: `${animationDelay}ms`,
        transform: `scale(${0.95 + intersectionRatio * 0.05})`,
        transition: 'transform 0.3s ease-out'
      }}
    >
      <Link to={`/influencer/${influencer.id}`}>
        <Card className={`
          group relative overflow-hidden cursor-pointer select-none
          transition-all duration-500 ease-out
          hover:shadow-2xl hover:shadow-black/20 hover:-translate-y-2
          ${getEnhancementClass}
          ${!isDataLoading && totalVotes > 0 && juicyPercentage > 50 ? 'hover:bg-juicy/10' : ''}
          ${!isDataLoading && totalVotes > 0 && nattyPercentage > 50 ? 'hover:bg-natty/10' : ''}
          active:scale-[0.97] active:shadow-lg
          will-change-transform
        `}
        onMouseEnter={handleMouseEnter}
        >
          {/* Advanced glow effect based on voting results */}
          <div className={`
            absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none
            ${totalVotes > 0 && nattyPercentage > 50 
              ? 'bg-gradient-to-br from-natty/10 via-transparent to-natty/5' 
              : 'bg-gradient-to-br from-juicy/10 via-transparent to-juicy/5'
            }
          `} />
          
          <CardHeader className="p-0 relative z-10">
            <div className="aspect-square relative overflow-hidden">
              {/* Advanced image loading with morphing skeleton */}
              <div className="relative w-full h-full">
                {(!imageLoaded || isLoading) && (
                  <MorphingSkeleton 
                    phase={deferredLoadingPhase} 
                    progress={loadingState.progress} 
                  />
                )}
                
                <OptimizedImage
                  src={mainImage}
                  alt={influencer.name}
                  className={`
                    w-full h-full object-cover transition-all duration-700 ease-out
                    ${imageLoaded && isComplete 
                      ? 'opacity-100 group-hover:scale-110 brightness-100' 
                      : 'opacity-0 scale-95 brightness-90'
                    }
                  `}
                  priority={index < 4} // Prioritize first 4 cards
                  onLoad={() => {
                    setImageLoaded(true);
                    recordMetric(`InfluencerCard:${influencer.id}:ImageLoad`, performance.now());
                  }}
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                    setImageLoaded(true);
                  }}
                />
              </div>
              
              {/* Enhanced badges with animation */}
              {imageLoaded && influencer.claimed_status === 'claimed' && (
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs animate-fadeIn shadow-lg">
                  ✓ Claimed
                </div>
              )}
              {imageLoaded && influencer.controversial && (
                <div className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg animate-fadeIn">
                  🔥 Controversial
                </div>
              )}
              
              {/* Performance metrics indicator (dev mode) */}
              {process.env.NODE_ENV === 'development' && performanceMetrics && (
                <div className="absolute bottom-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                  {Math.round(performanceMetrics.efficiency)}%
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="p-4">
            {/* Name with micro-animation */}
            <h3 className={`
              font-semibold text-lg mb-3 text-center transition-all duration-500 text-white
              ${imageLoaded && isComplete 
                ? 'opacity-100 translate-y-0 scale-100' 
                : 'opacity-70 translate-y-2 scale-95'
              }
            `}>
              {influencer.name}
            </h3>
            
            {/* Advanced voting visualization */}
            {user && isComplete && !isDataLoading && totalVotes > 0 && (
              <Suspense fallback={
                <div className="space-y-2 animate-pulse">
                  <div className="flex justify-between">
                    <div className="w-16 h-3 bg-muted rounded" />
                    <div className="w-16 h-3 bg-muted rounded" />
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full" />
                </div>
              }>
                <LazyVotingSection 
                  nattyPercentage={nattyPercentage}
                  juicyPercentage={juicyPercentage}
                  totalVotes={totalVotes}
                  isAnimated={isComplete}
                />
              </Suspense>
            )}

            {/* Non-user state with enhanced UX */}
            {!user && isComplete && !isDataLoading && voteStats && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="space-y-2 select-none cursor-pointer transform transition-transform hover:scale-105">
                    <div className="flex justify-between items-center text-xs text-muted-foreground opacity-60">
                      <span>💉 Juicy</span>
                      <span>🏆 Natty</span>
                    </div>
                    <div className="relative overflow-hidden rounded-full">
                      <div className="w-full h-2 bg-gradient-to-r from-juicy/30 to-natty/30 blur-sm" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs text-muted-foreground font-medium drop-shadow-lg">
                          Sign in to see verdicts
                        </span>
                      </div>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <p>Sign in to see verdicts and vote!</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {totalVotes} votes • {hoverMetrics.hoverCount} interactions
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Empty state with call-to-action */}
            {isComplete && !isDataLoading && totalVotes === 0 && (
              <div className="text-center text-sm text-muted-foreground space-y-2">
                <p>No votes yet</p>
                <div className="text-xs opacity-60">Be the first to vote!</div>
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    </div>
  );
});

StateOfTheArtInfluencerCard.displayName = 'StateOfTheArtInfluencerCard';

// Lazy component for the voting section
const VotingSection = ({ nattyPercentage, juicyPercentage, totalVotes, isAnimated }: {
  nattyPercentage: number;
  juicyPercentage: number;
  totalVotes: number;
  isAnimated: boolean;
}) => {
  const [animatedNatty, setAnimatedNatty] = useState(0);
  const [animatedJuicy, setAnimatedJuicy] = useState(0);
  
  useEffect(() => {
    if (isAnimated) {
      const duration = 1000;
      const steps = 60;
      const stepTime = duration / steps;
      
      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        setAnimatedNatty(Math.round(nattyPercentage * easeOut));
        setAnimatedJuicy(Math.round(juicyPercentage * easeOut));
        
        if (currentStep >= steps) {
          clearInterval(interval);
          setAnimatedNatty(nattyPercentage);
          setAnimatedJuicy(juicyPercentage);
        }
      }, stepTime);
      
      return () => clearInterval(interval);
    }
  }, [nattyPercentage, juicyPercentage, isAnimated]);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <span className="transition-all duration-300">💉 Juicy: {animatedJuicy}%</span>
        <span className="transition-all duration-300">🏆 Natty: {animatedNatty}%</span>
      </div>
      
      <div className="relative overflow-hidden">
        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden flex">
          <div
            className="h-full bg-juicy transition-all duration-700 ease-out"
            style={{ width: `${animatedJuicy}%` }}
          />
          <div
            className="h-full bg-natty transition-all duration-700 ease-out"
            style={{ width: `${animatedNatty}%` }}
          />
        </div>
        
        {/* Particle effect for high engagement */}
        {totalVotes > 100 && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
        )}
      </div>
      
      <div className="text-center">
        <Badge className={`
          transition-all duration-500 hover:scale-110 transform cursor-pointer
          ${animatedNatty > 50 
            ? 'bg-gradient-to-r from-natty to-natty/90 hover:shadow-lg hover:shadow-natty/30' 
            : 'bg-gradient-to-r from-juicy to-juicy/90 hover:shadow-lg hover:shadow-juicy/30'
          }
          relative overflow-hidden
        `}>
          <span className="relative z-10">
            {animatedNatty > 50 ? "Natty" : "Juicy"} 
            ({animatedNatty > 50 ? animatedNatty : animatedJuicy}%)
          </span>
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </Badge>
      </div>
    </div>
  );
};

export default StateOfTheArtInfluencerCard;
export { VotingSection };