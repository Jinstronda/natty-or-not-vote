import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useVoteStats } from "@/hooks/api/useVoteStats";
import { useVote } from "@/hooks/api/useVote";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import OptimizedImage from "./OptimizedImage";
import { ThumbsUp, ThumbsDown, X, Sparkles } from "lucide-react";

export interface FlippableInfluencerCardProps {
  influencer: {
    id: string;
    name: string;
    image: string;
    claimed_status: string;
    photos?: { image_url: string }[];
  };
}

const FlippableInfluencerCard = ({ influencer }: FlippableInfluencerCardProps) => {
  const { user } = useAuth();
  const { data: voteStats, isLoading } = useVoteStats(influencer.id);
  const { mutate: vote, isPending } = useVote();
  const [isFlipped, setIsFlipped] = useState(false);
  const [voteEffect, setVoteEffect] = useState<'natty' | 'juicy' | null>(null);

  // Calculate proper percentages that add up to 100%
  const totalVotes = voteStats?.total_votes || 0;
  const nattyCount = voteStats?.natty_count || 0;
  const juicyCount = totalVotes - nattyCount;
  
  const nattyPercentage = totalVotes > 0 ? Math.round((nattyCount / totalVotes) * 100) : 0;
  const juicyPercentage = totalVotes > 0 ? (100 - nattyPercentage) : 0;

  const mainImage = influencer.photos && influencer.photos.length > 0
    ? influencer.photos[0].image_url
    : influencer.image;

  // Haptic feedback for mobile devices
  const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'medium') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: 30,
        medium: 50,
        heavy: 100
      };
      navigator.vibrate(patterns[type]);
    }
  };

  // Handle voting with card flip animation
  const handleVote = (voteType: "natty" | "not_natty") => {
    if (!user) return;
    
    // Trigger haptic feedback
    triggerHapticFeedback('medium');
    
    // Set vote effect
    setVoteEffect(voteType === "natty" ? "natty" : "juicy");
    
    // Perform vote
    vote({ influencerId: influencer.id, voteType });
    
    // Flip back after vote
    setTimeout(() => {
      setIsFlipped(false);
      setVoteEffect(null);
    }, 1500);
  };

  // Handle card click to flip
  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) return;
    
    triggerHapticFeedback('light');
    setIsFlipped(!isFlipped);
  };

  // Handle close flip
  const handleCloseFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(false);
  };

  return (
    <div 
      className="flip-card-container"
      style={{ 
        perspective: '1000px',
        height: '100%',
        minHeight: '400px'
      }}
    >
      <div 
        className={`flip-card relative w-full h-full transition-transform duration-700 ${
          isFlipped ? 'flip-card-flipped' : ''
        }`}
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {/* FRONT SIDE - Original Card */}
        <div 
          className="flip-card-front absolute inset-0"
          style={{
            backfaceVisibility: 'hidden',
          }}
        >
          <div onClick={user ? handleCardClick : undefined}>
            <Link to={`/influencer/${influencer.id}`} onClick={user ? (e) => e.preventDefault() : undefined}>
              <Card className={`
                group relative overflow-hidden cursor-pointer h-full
                transition-all duration-500 ease-out
                hover:shadow-2xl hover:shadow-black/20 hover:-translate-y-2 hover:scale-[1.02]
                hover:ring-2 hover:ring-primary/20
                ${!isLoading && voteStats && totalVotes > 0 && juicyPercentage > 50 ? 'hover:bg-juicy/10 hover:ring-juicy/30' : ''}
                ${!isLoading && voteStats && totalVotes > 0 && nattyPercentage > 50 ? 'hover:bg-natty/10 hover:ring-natty/30' : ''}
                before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100
                ${user ? 'hover:shadow-2xl hover:shadow-primary/20' : ''}
              `}>
                <CardHeader className="p-0">
                  <div className="aspect-square relative overflow-hidden rounded-t-lg">
                    <OptimizedImage
                      src={mainImage}
                      alt={influencer.name}
                      className="w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-110 group-hover:brightness-105"
                      priority={false}
                    />
                    {influencer.claimed_status === 'claimed' && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                        Claimed
                      </div>
                    )}
                    {user && (
                      <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Click to vote ✨
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 text-center transition-colors text-white">
                    {influencer.name}
                  </h3>
                  
                  {/* Vote Statistics */}
                  {user && !isLoading && voteStats && totalVotes > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>💉 Juicy: {juicyPercentage}%</span>
                        <span>🏆 Natty: {nattyPercentage}%</span>
                      </div>
                      
                      <div className="relative">
                        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden flex">
                          <div
                            className="h-full bg-juicy transition-all duration-500"
                            style={{ width: `${juicyPercentage}%` }}
                          />
                          <div
                            className="h-full bg-natty transition-all duration-500"
                            style={{ width: `${nattyPercentage}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <Badge 
                          className={`
                            relative overflow-hidden
                            transition-all duration-500 ease-out 
                            hover:scale-110 hover:-translate-y-1 
                            active:scale-95 active:translate-y-0
                            hover:shadow-xl hover:shadow-current/30
                            ${nattyPercentage > 50 
                              ? 'bg-gradient-to-r from-natty via-natty/95 to-natty/90 hover:from-natty/90 hover:to-natty text-white' 
                              : 'bg-gradient-to-r from-juicy via-juicy/95 to-juicy/90 hover:from-juicy/90 hover:to-juicy text-white'
                            }
                            before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent 
                            before:translate-x-[-100%] before:skew-x-12 before:transition-transform before:duration-700 
                            hover:before:translate-x-[100%]
                          `}
                        >
                          <span className="relative z-10 font-semibold">
                            {nattyPercentage > 50 ? "🏆 Natty" : "💉 Juicy"} 
                            ({nattyPercentage > 50 ? nattyPercentage : juicyPercentage}%)
                          </span>
                        </Badge>
                      </div>
                    </div>
                  )}

                  {!user && !isLoading && voteStats && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="space-y-2 select-none cursor-pointer">
                          <div className="flex justify-between items-center text-xs text-muted-foreground opacity-60">
                            <span>💉 Juicy</span>
                            <span>🏆 Natty</span>
                          </div>
                          <div className="relative">
                            <div className="w-full rounded-full h-2 overflow-hidden flex blur-sm opacity-80">
                              <div className="h-full bg-juicy transition-all duration-500" style={{ width: '50%' }} />
                              <div className="h-full bg-natty transition-all duration-500" style={{ width: '50%' }} />
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <span className="text-xs text-muted-foreground font-semibold drop-shadow-md select-none">Sign in to see verdicts</span>
                            </div>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>Sign in to see verdicts and vote!</TooltipContent>
                    </Tooltip>
                  )}

                  {!isLoading && voteStats && totalVotes === 0 && (
                    <div className="text-center text-sm text-muted-foreground">
                      No votes yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* BACK SIDE - Voting Interface */}
        <div 
          className="flip-card-back absolute inset-0"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <Card className={`
            h-full relative overflow-hidden
            ${voteEffect === 'natty' ? 'bg-gradient-to-br from-natty/20 to-natty/10 ring-2 ring-natty/30' : ''}
            ${voteEffect === 'juicy' ? 'bg-gradient-to-br from-juicy/20 to-juicy/10 ring-2 ring-juicy/30' : ''}
            ${!voteEffect ? 'bg-gradient-to-br from-card to-card/80' : ''}
          `}>
            {/* Close Button */}
            <button
              onClick={handleCloseFlip}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Vote Effect Overlay */}
            {voteEffect && (
              <div className="absolute inset-0 pointer-events-none">
                <div className={`absolute inset-0 ${voteEffect === 'natty' ? 'bg-natty' : 'bg-juicy'} opacity-20 animate-pulse`} />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <Sparkles className="w-12 h-12 text-white animate-spin" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`text-6xl font-bold ${voteEffect === 'natty' ? 'text-natty' : 'text-juicy'} animate-bounce`}>
                    {voteEffect === 'natty' ? '🏆' : '💉'}
                  </div>
                </div>
              </div>
            )}

            <CardContent className="p-6 h-full flex flex-col justify-center items-center space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-white">
                  Vote on {influencer.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  What's your verdict?
                </p>
              </div>

              <div className="flex flex-col space-y-4 w-full max-w-xs">
                {/* Natty Button */}
                <button
                  onClick={() => handleVote("natty")}
                  disabled={isPending}
                  className={`
                    group relative overflow-hidden p-6 rounded-2xl font-bold text-lg
                    transition-all duration-500 ease-out
                    hover:scale-105 active:scale-95
                    hover:-translate-y-1 hover:rotate-1
                    bg-gradient-to-r from-natty via-natty/95 to-natty/80 
                    hover:from-natty/80 hover:via-natty hover:to-natty/90
                    text-white border-2 border-natty
                    hover:shadow-2xl hover:shadow-natty/40
                    shadow-lg shadow-natty/25
                    hover:ring-4 hover:ring-natty/20
                    disabled:opacity-50 disabled:cursor-not-allowed
                    before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent
                    before:translate-x-[-100%] before:skew-x-12 before:transition-transform before:duration-700
                    hover:before:translate-x-[100%]
                  `}
                >
                  <div className="relative z-10 flex items-center justify-center space-x-3">
                    <ThumbsUp className="w-6 h-6 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300" />
                    <span>Natty</span>
                  </div>
                </button>

                {/* Juicy Button */}
                <button
                  onClick={() => handleVote("not_natty")}
                  disabled={isPending}
                  className={`
                    group relative overflow-hidden p-6 rounded-2xl font-bold text-lg
                    transition-all duration-500 ease-out
                    hover:scale-105 active:scale-95
                    hover:-translate-y-1 hover:-rotate-1
                    bg-gradient-to-r from-juicy via-juicy/95 to-juicy/80 
                    hover:from-juicy/80 hover:via-juicy hover:to-juicy/90
                    text-white border-2 border-juicy
                    hover:shadow-2xl hover:shadow-juicy/40
                    shadow-lg shadow-juicy/25
                    hover:ring-4 hover:ring-juicy/20
                    disabled:opacity-50 disabled:cursor-not-allowed
                    before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent
                    before:translate-x-[-100%] before:skew-x-12 before:transition-transform before:duration-700
                    hover:before:translate-x-[100%]
                  `}
                >
                  <div className="relative z-10 flex items-center justify-center space-x-3">
                    <ThumbsDown className="w-6 h-6 group-hover:-rotate-12 group-hover:scale-110 transition-all duration-300" />
                    <span>Juicy</span>
                  </div>
                </button>
              </div>

              {isPending && (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Casting your vote...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FlippableInfluencerCard; 