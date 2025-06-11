import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { useVoteStats } from "@/hooks/api/useVoteStats";
import { useUserVote } from "@/hooks/api/useUserVote";
import { useVoting } from "@/hooks/api/useVoting";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import ReviewPromptDialog from "@/components/ReviewPromptDialog";
import { useSupabaseReviews } from "@/hooks/useSupabaseReviews";
import { useLoadingWatchdog } from "@/utils/loadingWatchdog";
import { DynamicPercentageButton } from "@/components/DynamicPercentageButton";

interface VotingSectionProps {
  influencerId: string;
  onReviewSubmitted?: () => void;
}

const VotingSection = ({ influencerId, onReviewSubmitted }: VotingSectionProps) => {
  const { user, loading: authLoading } = useAuth();
  const { data: voteStats, isLoading: statsLoading, refetch: refetchStats } = useVoteStats(influencerId);
  const { data: userVote, isLoading: voteLoading, refetch: refetchUserVote } = useUserVote(influencerId);
  const { mutate: castVote, isPending: isVoting } = useVoting(influencerId);
  const { getUserReviews } = useSupabaseReviews();
  const [showReviewPrompt, setShowReviewPrompt] = useState(false);
  const [lastVote, setLastVote] = useState<'natty' | 'juicy' | null>(null);
  
  // Loading watchdog protection
  useLoadingWatchdog({
    component: 'VotingSection',
    isLoading: authLoading || (user && (statsLoading || voteLoading)),
    timeout: 20000, // 20 seconds
    onTimeout: () => {
      console.error('[VotingSection] Loading timeout - forcing completion');
      toast({
        title: "Loading Timeout",
        description: "Voting section is taking too long to load. Please refresh the page.",
        variant: "destructive",
      });
    }
  });

  // Refetch data when user auth state changes
  useEffect(() => {
    if (!authLoading && user) {
      refetchStats();
      refetchUserVote();
    }
  }, [user, authLoading, refetchStats, refetchUserVote]);

  const handleVote = (vote: 'natty' | 'juicy') => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to vote.",
        variant: "destructive",
      });
      return;
    }

    // Check if user already has a review for this influencer
    const userReviews = getUserReviews(user?.id || '');
    const hasReviewForInfluencer = userReviews.some(review => review.influencerId === influencerId);

    console.log('Casting vote:', vote, 'for influencer:', influencerId);
    
    // Set the last vote for the review prompt
    setLastVote(vote);
    
    // Cast the vote with success callback
    castVote(vote, {
      onSuccess: () => {
        // Only show review prompt if user doesn't already have a review for this influencer
        if (!hasReviewForInfluencer) {
          // Small delay to let the vote register
          setTimeout(() => {
            setShowReviewPrompt(true);
          }, 500);
        }
      }
    });
  };

  // Show loading while auth is loading OR if we have a user but queries are still loading
  if (authLoading || (user && (statsLoading || voteLoading))) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <Skeleton className="h-8 w-48 mx-auto mb-6" />
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (!user) {
    return (
      <Card className="max-w-xl mx-auto border-2 border-primary/20 shadow-lg bg-background/80">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold tracking-tight">What do you think?</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <div className="flex gap-3 w-full justify-center">
            <Button asChild variant="outline" size="lg" className="w-32">
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild variant="default" size="lg" className="w-32">
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>
          <div className="w-full flex flex-col items-center gap-2 mt-2">
            <div className="grid grid-cols-2 gap-4 w-full">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="lg" disabled className="opacity-60 cursor-not-allowed w-full h-16 text-lg font-semibold border-natty bg-gradient-to-r from-natty/10 via-natty/5 to-natty/10 text-natty">
                    🏆 Natty
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Login to vote and see the verdict</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="lg" disabled className="opacity-60 cursor-not-allowed w-full h-16 text-lg font-semibold border-juicy bg-gradient-to-r from-juicy/10 via-juicy/5 to-juicy/10 text-juicy">
                    💉 Juicy
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Login to vote and see the verdict</TooltipContent>
              </Tooltip>
            </div>
            <div className="w-full text-center mt-2">
              <span className="text-muted-foreground text-base">Sign in to see the community verdict and cast your vote!</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (statsLoading || voteLoading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <Skeleton className="h-8 w-48 mx-auto mb-6" />
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  // Calculate proper percentages that add up to 100%
  const totalVotes = voteStats?.total_votes || 0;
  const nattyCount = voteStats?.natty_count || 0;
  const juicyCount = totalVotes - nattyCount;
  
  const nattyPercentage = totalVotes > 0 ? Math.round((nattyCount / totalVotes) * 100) : 0;
  const juicyPercentage = totalVotes > 0 ? (100 - nattyPercentage) : 0;

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="font-heading font-bold text-2xl mb-6 text-center">
        What do you think?
      </h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Button
          size="lg"
          onClick={() => handleVote('natty')}
          disabled={isVoting}
          className={`
            relative overflow-hidden h-16 text-lg font-semibold
            transition-all duration-300 ease-out
            hover:scale-105 active:scale-95
            hover:-translate-y-1
            border-2
            ${userVote === 'natty' 
              ? `bg-gradient-to-r from-natty via-natty/90 to-natty 
                 shadow-lg shadow-natty/40
                 border-natty text-white` 
              : `bg-gradient-to-r from-natty/10 via-natty/5 to-natty/10
                 border-natty text-white 
                 hover:from-natty hover:to-natty/90 hover:text-white
                 hover:shadow-lg hover:shadow-natty/30
                 shadow-md shadow-natty/10`
            }
            ${isVoting ? 'animate-pulse cursor-not-allowed' : 'group cursor-pointer'}
          `}
        >
          {/* Shimmer effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          
          {/* Content */}
          <div className="relative z-10 flex items-center justify-center">
            <span className={`text-2xl mr-2 transition-transform duration-200 ${isVoting ? '' : 'group-hover:scale-110'}`}>
              🏆
            </span>
            {isVoting ? (
              <span className="animate-pulse">Voting...</span>
            ) : (
              <span className="transition-all duration-200">Natty</span>
            )}
          </div>
        </Button>
        
        <Button
          size="lg"
          onClick={() => handleVote('juicy')}
          disabled={isVoting}
          className={[
            'relative overflow-hidden h-16 text-lg font-semibold',
            'transition-all duration-300 ease-out',
            'hover:scale-105 active:scale-95',
            'hover:-translate-y-1',
            'border-2',
            userVote === 'juicy'
              ? 'bg-gradient-to-r from-juicy via-juicy/90 to-juicy shadow-lg shadow-juicy/40 border-juicy text-white'
              : 'bg-gradient-to-r from-juicy to-juicy border-juicy text-white hover:from-juicy hover:to-juicy/90 hover:text-white hover:shadow-lg hover:shadow-juicy/30 shadow-md shadow-juicy/10',
            isVoting ? 'animate-pulse cursor-not-allowed' : 'group cursor-pointer',
          ].join(' ')}
        >
          {/* Shimmer effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          
          {/* Content */}
          <div className="relative z-10 flex items-center justify-center">
            <span className={`text-2xl mr-2 transition-transform duration-200 ${isVoting ? '' : 'group-hover:scale-110'}`}>
              💉
            </span>
            {isVoting ? (
              <span className="animate-pulse">Voting...</span>
            ) : (
              <span className="transition-all duration-200">Juicy</span>
            )}
          </div>
        </Button>
      </div>
      
      {userVote && (
        <div className="mb-4 text-center text-sm text-muted-foreground">
          You voted: <span className={`font-semibold ${userVote === 'natty' ? 'text-natty' : 'text-juicy'}`}>
            {userVote === 'natty' ? '🏆 Natty' : '💉 Juicy'}
          </span>
          <span className="text-xs block">You can change your vote anytime</span>
        </div>
      )}

      {totalVotes > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-juicy font-semibold">💉 Juicy: {juicyPercentage}%</span>
            <span className="text-natty font-semibold">🏆 Natty: {nattyPercentage}%</span>
          </div>
          
          <div className="relative">
            <div className="w-full bg-secondary rounded-full h-4 overflow-hidden flex">
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
          
          <div className="text-center text-sm text-muted-foreground">
            {totalVotes.toLocaleString()} total votes
          </div>
        </div>
      )}

      {totalVotes === 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Be the first to vote!
        </div>
      )}

      <ReviewPromptDialog
        isOpen={showReviewPrompt}
        onClose={() => setShowReviewPrompt(false)}
        influencerId={influencerId}
        vote={lastVote || 'natty'}
        onReviewSubmitted={onReviewSubmitted}
      />
    </div>
  );
};

export default VotingSection;
