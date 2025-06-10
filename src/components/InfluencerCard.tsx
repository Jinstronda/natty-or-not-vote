import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { VoteButton } from "./VoteButton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { useVoteStats } from "@/hooks/api/useVoteStats";

export interface InfluencerCardProps {
  influencer: {
    id: string;
    name: string;
    image: string;
    claimed_status: string;
  };
  isAuthenticated?: boolean;
}

const InfluencerCard = ({ influencer, isAuthenticated = false }: InfluencerCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: voteStats, isLoading } = useVoteStats(influencer.id);

  const handleClaim = () => {
    navigate(`/claim/${influencer.id}`);
  };

  return (
    <Link to={`/influencer/${influencer.id}`}>
      <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
        <CardHeader className="p-0">
          <div className="aspect-square relative">
            <img
              src={influencer.image}
              alt={influencer.name}
              className="w-full h-full object-cover"
            />
            {influencer.claimed_status === 'claimed' && (
              <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                Claimed
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 text-center group-hover:text-primary transition-colors">
            {influencer.name}
          </h3>
          
          {influencer.claimed_status && (
            <div className="flex justify-center mb-3">
              <Badge variant="outline" className="text-xs">
                Claims: {influencer.claimed_status}
              </Badge>
            </div>
          )}
          
          {isLoading ? (
            <div className="text-center py-2">
              <span className="text-sm text-muted-foreground">Loading votes...</span>
            </div>
          ) : voteStats && voteStats.total_votes > 0 ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-natty font-medium">🏆 {voteStats.natty_percentage}%</span>
                <span className="text-juicy font-medium">💉 {voteStats.juicy_percentage}%</span>
              </div>
              
              <div className="relative">
                <Progress 
                  value={voteStats.natty_percentage} 
                  className="h-2"
                />
              </div>
              
              <div className="text-center text-xs text-muted-foreground">
                {voteStats.total_votes.toLocaleString()} votes
              </div>
            </div>
          ) : (
            <div className="text-center py-2">
              <span className="text-sm text-muted-foreground">No votes yet</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-center gap-2">
          {isAuthenticated ? (
            <>
              <VoteButton influencerId={influencer.id} voteType="natty" />
              <VoteButton influencerId={influencer.id} voteType="not_natty" />
              {!user && influencer.claimed_status !== 'claimed' && (
                <Button variant="outline" onClick={handleClaim}>
                  Claim
                </Button>
              )}
            </>
          ) : (
            <Button variant="outline" onClick={() => navigate('/login')}>
              Login to Vote
            </Button>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
};

export default InfluencerCard;
