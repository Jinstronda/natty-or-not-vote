import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { VoteButton } from "./VoteButton";
import { Badge } from "@/components/ui/badge";
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

  // Calculate proper percentages that add up to 100%
  const totalVotes = voteStats?.total_votes || 0;
  const nattyCount = voteStats?.natty_count || 0;
  const juicyCount = totalVotes - nattyCount;
  
  const nattyPercentage = totalVotes > 0 ? Math.round((nattyCount / totalVotes) * 100) : 0;
  const juicyPercentage = totalVotes > 0 ? (100 - nattyPercentage) : 0;

  return (
    <Link to={`/influencer/${influencer.id}`}>
      <Card className={`group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden
        ${!isLoading && voteStats && totalVotes > 0 && juicyPercentage > 50 ? 'hover:bg-juicy/20' : ''}
        ${!isLoading && voteStats && totalVotes > 0 && nattyPercentage > 50 ? 'hover:bg-natty/20' : ''}
      `}>
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
          <h3
            className={`font-semibold text-lg mb-2 text-center transition-colors
              group-hover:text-primary group-hover:text-juicy group-hover:text-natty
              ${!isLoading && voteStats && totalVotes > 0
                ? juicyPercentage > 50
                  ? 'group-hover:text-juicy'
                  : nattyPercentage > 50
                    ? 'group-hover:text-natty'
                    : 'group-hover:text-primary'
                : ''
              }
            `}
          >
            {influencer.name}
          </h3>
          
          {/* Vote Statistics */}
          {!isLoading && voteStats && totalVotes > 0 && (
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
                    transition-all duration-300 hover:scale-105
                    ${nattyPercentage > 50 
                      ? 'bg-gradient-to-r from-natty to-natty/90 hover:shadow-lg hover:shadow-natty/30' 
                      : 'bg-gradient-to-r from-juicy to-juicy/90 hover:shadow-lg hover:shadow-juicy/30'
                    }
                  `}
                >
                  {nattyPercentage > 50 ? "Natty" : "Juicy"} 
                  ({nattyPercentage > 50 ? nattyPercentage : juicyPercentage}%)
                </Badge>
              </div>
            </div>
          )}

          {!isLoading && voteStats && totalVotes === 0 && (
            <div className="text-center text-sm text-muted-foreground">
              No votes yet
            </div>
          )}
        </CardContent>
        
        <CardFooter className="p-4 pt-0 flex justify-center gap-2">
          {/* Removed VoteButton and Claim button as per new requirements. Only show the bar/statistics above. */}
        </CardFooter>
      </Card>
    </Link>
  );
};

export default InfluencerCard;
