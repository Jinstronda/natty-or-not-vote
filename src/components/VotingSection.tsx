
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
    const userReviews = getUserReviews(user.id);
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
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Button
          size="lg"
          onClick={() => handleVote('natty')}
          disabled={isVoting}
          className={`h-16 text-lg font-semibold transition-all ${
            userVote?.vote === 'natty' 
              ? 'bg-natty hover:bg-natty/90 text-white' 
              : 'bg-natty/10 border border-natty text-natty hover:bg-natty hover:text-white'
          }`}
        >
          {isVoting ? '...' : '🏆 Natty'}
        </Button>
        
        <Button
          size="lg"
          onClick={() => handleVote('juicy')}
          disabled={isVoting}
          className={`h-16 text-lg font-semibold transition-all ${
            userVote?.vote === 'juicy' 
              ? 'bg-juicy hover:bg-juicy/90 text-white' 
              : 'bg-juicy/10 border border-juicy text-juicy hover:bg-juicy hover:text-white'
          }`}
        >
          {isVoting ? '...' : '💉 Juicy'}
        </Button>
      </div>
      
      {userVote && (
        <div className="mb-4 text-center text-sm text-muted-foreground">
          You voted: <span className={`font-semibold ${userVote.vote === 'natty' ? 'text-natty' : 'text-juicy'}`}>
            {userVote.vote === 'natty' ? '🏆 Natty' : '💉 Juicy'}
          </span>
          <span className="text-xs block">You can change your vote anytime</span>
        </div>
      )}

      {voteStats && voteStats.total_votes > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-natty font-semibold">Natty: {voteStats.natty_percentage}%</span>
            <span className="text-juicy font-semibold">Juicy: {voteStats.juicy_percentage}%</span>
          </div>
          
          <div className="relative">
            <div className="w-full bg-secondary rounded-full h-4 overflow-hidden">
              <div 
                className="h-full bg-natty transition-all duration-500"
                style={{ width: `${voteStats.natty_percentage}%` }}
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
