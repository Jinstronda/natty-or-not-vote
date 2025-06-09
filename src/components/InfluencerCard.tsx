
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { useVoteStats } from "@/hooks/api/useVoteStats";

interface InfluencerCardProps {
  influencer: {
    id: string;
    name: string;
    image: string | null;
    claimed_status: string | null;
  };
}

const InfluencerCard = ({ influencer }: InfluencerCardProps) => {
  const { data: voteStats, isLoading } = useVoteStats(influencer.id);

  return (
    <Link to={`/influencer/${influencer.id}`}>
      <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
        <div className="aspect-square overflow-hidden">
          <img
            src={influencer.image || '/placeholder.svg'}
            alt={influencer.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
        </div>
        
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
      </Card>
    </Link>
  );
};

export default InfluencerCard;
