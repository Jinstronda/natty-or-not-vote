
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useVotes } from "@/hooks/useVotes";
import { useRealTimeVotes } from "@/hooks/useRealTime";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface VotingSectionProps {
  influencerId: string;
}

const VotingSection = ({ influencerId }: VotingSectionProps) => {
  const { user } = useAuth();
  const { 
    userVote, 
    userReview,
    castVote, 
    submitReview,
    isCasting, 
    isSubmittingReview,
    isLoading, 
    getVotePercentages 
  } = useVotes(influencerId);
  
  useRealTimeVotes(influencerId);
  
  const [reviewText, setReviewText] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  const { natty, juicy, total } = getVotePercentages();

  const handleVote = async (vote: 'natty' | 'juicy') => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to vote.",
        variant: "destructive",
      });
      return;
    }

    try {
      await castVote({ vote });
      // Show review form only if user hasn't already submitted a review
      if (!userReview) {
        setShowReviewForm(true);
      }
    } catch (error) {
      console.error('Vote error:', error);
    }
  };

  const handleReviewSubmit = async () => {
    if (!reviewText.trim()) {
      toast({
        title: "Review required",
        description: "Please write a review before submitting.",
        variant: "destructive",
      });
      return;
    }

    try {
      await submitReview({ content: reviewText.trim() });
      setReviewText("");
      setShowReviewForm(false);
    } catch (error) {
      console.error('Review submission error:', error);
    }
  };

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

  if (isLoading) {
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
          disabled={isCasting}
          className={`h-16 text-lg font-semibold transition-all ${
            userVote?.vote === 'natty' 
              ? 'bg-natty hover:bg-natty/90 text-white' 
              : 'bg-natty/10 border border-natty text-natty hover:bg-natty hover:text-white'
          }`}
        >
          {isCasting ? '...' : '🏆 Natty'}
        </Button>
        
        <Button
          size="lg"
          onClick={() => handleVote('juicy')}
          disabled={isCasting}
          className={`h-16 text-lg font-semibold transition-all ${
            userVote?.vote === 'juicy' 
              ? 'bg-juicy hover:bg-juicy/90 text-white' 
              : 'bg-juicy/10 border border-juicy text-juicy hover:bg-juicy hover:text-white'
          }`}
        >
          {isCasting ? '...' : '💉 Juicy'}
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

      {/* Show existing review if user has one */}
      {userReview && (
        <div className="mb-6 border border-border rounded-lg p-4 bg-muted/50">
          <div className="mb-3">
            <Badge className={userReview.vote === 'natty' ? 'bg-natty' : 'bg-juicy'}>
              Your review: {userReview.vote === 'natty' ? '🏆 Natty' : '💉 Juicy'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground italic">"{userReview.content}"</p>
          <p className="text-xs text-muted-foreground mt-2">
            Note: You can only submit one review per influencer
          </p>
        </div>
      )}

      {/* Show review form only if user voted but hasn't submitted a review yet */}
      {showReviewForm && userVote && !userReview && (
        <div className="mb-6 border border-border rounded-lg p-4">
          <div className="mb-3">
            <Badge className={userVote.vote === 'natty' ? 'bg-natty' : 'bg-juicy'}>
              Your vote: {userVote.vote === 'natty' ? '🏆 Natty' : '💉 Juicy'}
            </Badge>
          </div>
          <Textarea
            placeholder="Share your thoughts on this influencer's natural status... (Optional - you can only submit one review)"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            className="mb-3"
          />
          <div className="flex gap-2">
            <Button 
              onClick={handleReviewSubmit} 
              disabled={!reviewText.trim() || isSubmittingReview}
            >
              {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
            </Button>
            <Button variant="outline" onClick={() => setShowReviewForm(false)}>
              Skip Review
            </Button>
          </div>
        </div>
      )}
      
      {total > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-natty font-semibold">Natty: {natty}%</span>
            <span className="text-juicy font-semibold">Juicy: {juicy}%</span>
          </div>
          
          <div className="relative">
            <div className="w-full bg-secondary rounded-full h-4 overflow-hidden">
              <div 
                className="h-full bg-natty transition-all duration-500"
                style={{ width: `${natty}%` }}
              />
            </div>
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            {total.toLocaleString()} total votes • Live updates
          </div>
        </div>
      )}
    </div>
  );
};

export default VotingSection;
