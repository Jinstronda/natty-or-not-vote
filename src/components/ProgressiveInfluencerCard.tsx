import React, { memo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useVoteStats } from "@/hooks/api/useVoteStats";
import { useSupabaseExpertReviews } from "@/hooks/useSupabaseExpertReviews";
import { OptimizedImage } from "./OptimizedImage";
import { userInteractionTracker } from "@/utils/userInteractionHelper";
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
}

// Shimmer skeleton component for loading states
const ShimmerBar = ({ width = "100%" }: { width?: string }) => (
  <div 
    className="h-2 bg-gradient-to-r from-muted via-muted-foreground/20 to-muted rounded-full animate-pulse"
    style={{ width, animationDuration: '1.5s' }}
  />
);

// Progressive bar that fills up as data loads
const ProgressiveVoteBar = ({ 
  nattyPercentage, 
  juicyPercentage, 
  isLoading, 
  totalVotes 
}: {
  nattyPercentage: number;
  juicyPercentage: number;
  isLoading: boolean;
  totalVotes: number;
}) => {
  const [animatedNatty, setAnimatedNatty] = useState(0);
  const [animatedJuicy, setAnimatedJuicy] = useState(0);
  
  // Smooth animation to final values
  useEffect(() => {
    if (!isLoading && totalVotes > 0) {
      const duration = 800; // Animation duration
      const steps = 60; // 60fps
      const stepTime = duration / steps;
      
      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        const easeOut = 1 - Math.pow(1 - progress, 3); // Ease-out cubic
        
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
  }, [nattyPercentage, juicyPercentage, isLoading, totalVotes]);
  
  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <div className="w-12 h-3 bg-muted rounded animate-pulse" />
          <div className="w-12 h-3 bg-muted rounded animate-pulse" />
        </div>
        <ShimmerBar />
        <div className="flex justify-center">
          <div className="w-16 h-6 bg-muted rounded-full animate-pulse" />
        </div>
      </div>
    );
  }
  
  if (totalVotes === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground py-4">
        <div className="w-full bg-muted/30 rounded-full h-2 mb-2" />
        No votes yet
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <span className="transition-all duration-300">💉 Juicy: {animatedJuicy}%</span>
        <span className="transition-all duration-300">🏆 Natty: {animatedNatty}%</span>
      </div>
      
      <div className="relative overflow-hidden">
        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden flex">
          <div
            className="h-full bg-juicy transition-all duration-300 ease-out"
            style={{ width: `${animatedJuicy}%` }}
          />
          <div
            className="h-full bg-natty transition-all duration-300 ease-out"
            style={{ width: `${animatedNatty}%` }}
          />
        </div>
        
        {/* Subtle glow effect during animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse opacity-30" />
      </div>
      
      <div className="text-center">
        <Badge 
          className={`
            transition-all duration-300 hover:scale-105 transform
            ${animatedNatty > 50 
              ? 'bg-gradient-to-r from-natty to-natty/90 hover:shadow-lg hover:shadow-natty/30' 
              : 'bg-gradient-to-r from-juicy to-juicy/90 hover:shadow-lg hover:shadow-juicy/30'
            }
            cursor-pointer select-none relative overflow-hidden
          `}
        >
          <span className="relative z-10 transition-all duration-300">
            {animatedNatty > 50 ? "Natty" : "Juicy"} 
            ({animatedNatty > 50 ? animatedNatty : animatedJuicy}%)
          </span>
        </Badge>
      </div>
    </div>
  );
};

const ProgressiveInfluencerCard = memo(({ influencer }: InfluencerCardProps) => {
  const { user } = useAuth();
  const { data: voteStats, isLoading: voteLoading } = useVoteStats(influencer.id);
  const { getInfluencerExpertReviews, loading: expertLoading } = useSupabaseExpertReviews();
  
  // Progressive loading states
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showVoteData, setShowVoteData] = useState(false);
  
  // Get expert reviews
  const expertReviews = getInfluencerExpertReviews(influencer.id);
  
  // Calculate combined statistics
  const expertNattyCount = expertReviews.filter(review => 
    (review.rating ?? 0) >= 4 || (review.natty_or_not?.toLowerCase() === 'natty')
  ).length;
  const expertJuicyCount = expertReviews.length - expertNattyCount;
  
  const userNattyCount = voteStats?.natty_count || 0;
  const userTotalVotes = voteStats?.total_votes || 0;
  const userJuicyCount = userTotalVotes - userNattyCount;
  
  const totalVotes = userTotalVotes + expertReviews.length;
  const nattyCount = userNattyCount + expertNattyCount;
  const juicyCount = userJuicyCount + expertJuicyCount;
  
  const nattyPercentage = totalVotes > 0 ? Math.round((nattyCount / totalVotes) * 100) : 0;
  const juicyPercentage = totalVotes > 0 ? (100 - nattyPercentage) : 0;
  
  const isDataLoading = voteLoading || expertLoading;
  
  // Progressive disclosure: show vote data after image loads
  useEffect(() => {
    if (imageLoaded && !isDataLoading) {
      const timer = setTimeout(() => setShowVoteData(true), 200);
      return () => clearTimeout(timer);
    }
  }, [imageLoaded, isDataLoading]);
  
  const mainImage = influencer.photos && influencer.photos.length > 0
    ? influencer.photos[0].image_url
    : influencer.image;

  return (
    <Link to={`/influencer/${influencer.id}`}>
      <Card className={`
        group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 overflow-hidden
        ${!isDataLoading && totalVotes > 0 && juicyPercentage > 50 ? 'hover:bg-juicy/10' : ''}
        ${!isDataLoading && totalVotes > 0 && nattyPercentage > 50 ? 'hover:bg-natty/10' : ''}
        cursor-pointer select-none relative
        hover:shadow-xl hover:shadow-black/5
        active:scale-[0.99] active:shadow-md
        transform-gpu will-change-transform
      `}
      onMouseEnter={() => userInteractionTracker.safeVibrate(2)}
      >
        {/* Optimized glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
        
        <CardHeader className="p-0 relative z-10">
          <div className="aspect-square relative overflow-hidden">
            {/* Image with loading state */}
            <OptimizedImage
              src={mainImage}
              alt={influencer.name}
              className={`
                w-full h-full object-cover transition-all duration-300
                ${imageLoaded ? 'group-hover:scale-105 opacity-100' : 'opacity-0'}
              `}
              priority={false}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
                setImageLoaded(true);
              }}
            />
            
            {/* Image loading skeleton */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted-foreground/10 to-muted animate-pulse" />
            )}
            
            {/* Badges */}
            {imageLoaded && influencer.claimed_status === 'claimed' && (
              <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs animate-fadeIn">
                Claimed
              </div>
            )}
            {imageLoaded && influencer.controversial && (
              <div className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg animate-fadeIn">
                🔥 Controversial
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-4">
          {/* Name - Always visible */}
          <h3 className={`
            font-semibold text-lg mb-3 text-center transition-all duration-300 text-white
            ${imageLoaded ? 'opacity-100 translate-y-0' : 'opacity-70 translate-y-2'}
          `}>
            {influencer.name}
          </h3>
          
          {/* Progressive Vote Statistics */}
          {user && (
            <div className={`
              transition-all duration-300 transform
              ${showVoteData ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            `}>
              <ProgressiveVoteBar
                nattyPercentage={nattyPercentage}
                juicyPercentage={juicyPercentage}
                isLoading={isDataLoading}
                totalVotes={totalVotes}
              />
            </div>
          )}

          {/* Non-user blurred state */}
          {!user && showVoteData && !isDataLoading && voteStats && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="space-y-2 select-none cursor-pointer">
                  <div className="flex justify-between items-center text-xs text-muted-foreground opacity-60">
                    <span>💉 Juicy</span>
                    <span>🏆 Natty</span>
                  </div>
                  <div className="relative">
                    <div className="w-full rounded-full h-2 overflow-hidden flex blur-[1px] opacity-70">
                      <div className="h-full bg-juicy transition-all duration-300" style={{ width: '50%' }} />
                      <div className="h-full bg-natty transition-all duration-300" style={{ width: '50%' }} />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-xs text-muted-foreground font-medium drop-shadow-sm">
                        Sign in to see verdicts
                      </span>
                    </div>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>Sign in to see verdicts and vote!</TooltipContent>
            </Tooltip>
          )}
        </CardContent>
      </Card>
    </Link>
  );
});

ProgressiveInfluencerCard.displayName = 'ProgressiveInfluencerCard';

export default ProgressiveInfluencerCard;