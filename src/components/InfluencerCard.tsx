
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
}

const InfluencerCard = ({ influencer }: InfluencerCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: voteStats, isLoading } = useVoteStats(influencer.id);

  const handleClaim = (e: React.MouseEvent) => {
    e.preventDefault();
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
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
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
          
          {/* Vote Statistics */}
          {!isLoading && voteStats && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Natty: {voteStats.natty_count}</span>
                <span>Juicy: {voteStats.not_natty_count}</span>
              </div>
                <Progress 
                  value={voteStats.natty_percentage} 
                  colorVariant="natty"
                className="h-2 transition-all duration-300"
                />
              <div className="text-center">
                <Badge 
                  className={`
                    transition-all duration-300 hover:scale-105
                    ${voteStats.natty_percentage > 50 
                      ? 'bg-gradient-to-r from-natty to-natty/90 hover:shadow-lg hover:shadow-natty/30' 
                      : 'bg-gradient-to-r from-juicy to-juicy/90 hover:shadow-lg hover:shadow-juicy/30'
                    }
                  `}
                >
                  {voteStats.natty_percentage > 50 ? "Natty" : "Juicy"} 
                  ({voteStats.natty_percentage.toFixed(0)}%)
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="p-4 pt-0 flex justify-center gap-2">
          <VoteButton influencerId={influencer.id} voteType="natty" />
          <VoteButton influencerId={influencer.id} voteType="not_natty" />
          {influencer.claimed_status !== 'claimed' && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClaim}
              className="transition-all duration-200 hover:scale-105"
            >
              Claim
            </Button>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
};

export default InfluencerCard;
