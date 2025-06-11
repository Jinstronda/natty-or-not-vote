import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
      <div className="bg-card border border-border rounded-lg p-6 text-center">
        <h2 className="font-heading font-bold text-2xl mb-4">
          What do you think?
        </h2>
        <p className="text-muted-foreground mb-4">
          Please login to vote and see results
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild variant="outline">
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link to="/signup">Sign Up</Link>
          </Button>
        </div>
      </div>
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

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="font-heading font-bold text-2xl mb-6 text-center">
        What do you think?
      </h2>
      
      {/* Dynamic Percentage Button */}
      {voteStats && voteStats.total_votes > 0 && (
        <div className="mb-6 flex justify-center">
          <DynamicPercentageButton
            nattyPercentage={voteStats.natty_percentage}
            juicyPercentage={voteStats.not_natty_percentage}
            totalVotes={voteStats.total_votes}
            className="px-6 py-3 text-base"
          />
        </div>
      )}
      
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
                 border-natty text-natty 
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
          className={`
            relative overflow-hidden h-16 text-lg font-semibold
            transition-all duration-300 ease-out
            hover:scale-105 active:scale-95
            hover:-translate-y-1
            border-2
            ${userVote === 'juicy' 
              ? `bg-gradient-to-r from-juicy via-juicy/90 to-juicy 
                 shadow-lg shadow-juicy/40
                 border-juicy text-white` 
              : `bg-gradient-to-r from-juicy/10 via-juicy/5 to-juicy/10
                 border-juicy text-juicy 
                 hover:from-juicy hover:to-juicy/90 hover:text-white
                 hover:shadow-lg hover:shadow-juicy/30
                 shadow-md shadow-juicy/10`
            }
            ${isVoting ? 'animate-pulse cursor-not-allowed' : 'group cursor-pointer'}
          `}
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

      {voteStats && voteStats.total_votes > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-natty font-semibold">Natty: {voteStats.natty_percentage}%</span>
            <span className="text-juicy font-semibold">Juicy: {voteStats.not_natty_percentage}%</span>
          </div>
          
          <div className="relative">
            <div className="w-full bg-secondary rounded-full h-4 overflow-hidden flex">
              <div
                className="h-full bg-gradient-to-r from-natty to-natty/80 transition-all duration-500"
                style={{ width: `${voteStats.natty_percentage}%` }}
              />
              <div
                className="h-full bg-gradient-to-r from-juicy to-juicy/80 transition-all duration-500"
                style={{ width: `${voteStats.not_natty_percentage}%` }}
              />
            </div>
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            {voteStats.total_votes.toLocaleString()} total votes
          </div>
        </div>
      )}

      {(!voteStats || voteStats.total_votes === 0) && (
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
