
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useVoteStats } from "@/hooks/api/useVoteStats";
import { useUserVote } from "@/hooks/api/useUserVote";
import { useVoting } from "@/hooks/api/useVoting";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface VotingSectionProps {
  influencerId: string;
}

const VotingSection = ({ influencerId }: VotingSectionProps) => {
  const { user } = useAuth();
  const { data: voteStats, isLoading: statsLoading } = useVoteStats(influencerId);
  const { data: userVote, isLoading: voteLoading } = useUserVote(influencerId);
  const { mutate: castVote, isPending: isVoting } = useVoting(influencerId);

  const handleVote = (vote: 'natty' | 'juicy') => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to vote.",
        variant: "destructive",
      });
      return;
    }

    castVote(vote);
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
    </div>
  );
};

export default VotingSection;
