
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useVoteStore } from "@/stores/VoteStore";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface VotingSectionProps {
  influencerId: string;
  nattyVotes: number;
  juicyVotes: number;
}

const VotingSection = ({ influencerId }: VotingSectionProps) => {
  const { user } = useAuth();
  const { submitVote, getUserVote, getInfluencerVotes, submitReview } = useVoteStore();
  const [reviewText, setReviewText] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  // Get current vote counts and user's existing vote
  const currentVotes = getInfluencerVotes(influencerId);
  const userVote = user ? getUserVote(user.id, influencerId) : null;
  
  const totalVotes = currentVotes.natty + currentVotes.juicy;
  const nattyPercentage = totalVotes > 0 ? Math.round((currentVotes.natty / totalVotes) * 100) : 0;
  const juicyPercentage = totalVotes > 0 ? Math.round((currentVotes.juicy / totalVotes) * 100) : 0;

  const handleVote = (vote: 'natty' | 'juicy') => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to vote.",
        variant: "destructive",
      });
      return;
    }

    submitVote(user.id, influencerId, vote);
    setShowReviewForm(true);
    
    const voteText = userVote ? "Vote updated!" : "Vote submitted!";
    toast({
      title: voteText,
      description: `You voted ${vote === 'natty' ? 'Natty 🏆' : 'Juicy 💉'}`,
    });
  };

  const handleReviewSubmit = () => {
    if (!user || !userVote) return;

    if (!reviewText.trim()) {
      toast({
        title: "Review required",
        description: "Please write a review before submitting.",
        variant: "destructive",
      });
      return;
    }

    submitReview(user.id, user.username, influencerId, userVote.vote, reviewText.trim());
    setReviewText("");
    setShowReviewForm(false);
    
    toast({
      title: "Review submitted!",
      description: "Your review has been added.",
    });
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

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="font-heading font-bold text-2xl mb-6 text-center">
        What do you think?
      </h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Button
          size="lg"
          onClick={() => handleVote('natty')}
          className={`h-16 text-lg font-semibold transition-all ${
            userVote?.vote === 'natty' 
              ? 'bg-natty hover:bg-natty/90 text-white' 
              : 'bg-natty/10 border border-natty text-natty hover:bg-natty hover:text-white'
          }`}
        >
          🏆 Natty
        </Button>
        
        <Button
          size="lg"
          onClick={() => handleVote('juicy')}
          className={`h-16 text-lg font-semibold transition-all ${
            userVote?.vote === 'juicy' 
              ? 'bg-juicy hover:bg-juicy/90 text-white' 
              : 'bg-juicy/10 border border-juicy text-juicy hover:bg-juicy hover:text-white'
          }`}
        >
          💉 Juicy
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

      {showReviewForm && userVote && (
        <div className="mb-6 border border-border rounded-lg p-4">
          <div className="mb-3">
            <Badge className={userVote.vote === 'natty' ? 'bg-natty' : 'bg-juicy'}>
              Your vote: {userVote.vote === 'natty' ? '🏆 Natty' : '💉 Juicy'}
            </Badge>
          </div>
          <Textarea
            placeholder="Share your thoughts on this influencer's natural status..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            className="mb-3"
          />
          <div className="flex gap-2">
            <Button onClick={handleReviewSubmit} disabled={!reviewText.trim()}>
              Submit Review
            </Button>
            <Button variant="outline" onClick={() => setShowReviewForm(false)}>
              Skip
            </Button>
          </div>
        </div>
      )}
      
      {totalVotes > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-natty font-semibold">Natty: {nattyPercentage}%</span>
            <span className="text-juicy font-semibold">Juicy: {juicyPercentage}%</span>
          </div>
          
          <div className="relative">
            <div className="w-full bg-secondary rounded-full h-4 overflow-hidden">
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
    </div>
  );
};

export default VotingSection;
