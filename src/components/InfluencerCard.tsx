import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { VoteButton } from "./VoteButton";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useVoteStats } from "@/hooks/api/useVoteStats";
import { Lock } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import OptimizedImage from "./OptimizedImage";

export interface InfluencerCardProps {
  influencer: {
    id: string;
    name: string;
    image: string;
    claimed_status: string;
    photos?: { image_url: string }[];
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

  const mainImage = influencer.photos && influencer.photos.length > 0
    ? influencer.photos[0].image_url
    : influencer.image;

  return (
    <Link to={`/influencer/${influencer.id}`}>
      <Card className={`
        group relative overflow-hidden cursor-pointer
        transition-all duration-500 ease-out
        hover:shadow-2xl hover:shadow-black/20 hover:-translate-y-2 hover:scale-[1.02]
        hover:ring-2 hover:ring-primary/20
        ${!isLoading && voteStats && totalVotes > 0 && juicyPercentage > 50 ? 'hover:bg-juicy/10 hover:ring-juicy/30' : ''}
        ${!isLoading && voteStats && totalVotes > 0 && nattyPercentage > 50 ? 'hover:bg-natty/10 hover:ring-natty/30' : ''}
        before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100
      `}>
        <CardHeader className="p-0">
          <div className="aspect-square relative overflow-hidden rounded-t-lg">
            <OptimizedImage
              src={mainImage}
              alt={influencer.name}
              className="w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-110 group-hover:brightness-105"
              priority={false}
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
            className="font-semibold text-lg mb-2 text-center transition-colors text-white"
          >
            {influencer.name}
          </h3>
          
          {/* Vote Statistics */}
          {user && !isLoading && voteStats && totalVotes > 0 && (
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
                    relative overflow-hidden
                    transition-all duration-500 ease-out 
                    hover:scale-110 hover:-translate-y-1 
                    active:scale-95 active:translate-y-0
                    hover:shadow-xl hover:shadow-current/30
                    ${nattyPercentage > 50 
                      ? 'bg-gradient-to-r from-natty via-natty/95 to-natty/90 hover:from-natty/90 hover:to-natty text-white' 
                      : 'bg-gradient-to-r from-juicy via-juicy/95 to-juicy/90 hover:from-juicy/90 hover:to-juicy text-white'
                    }
                    before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent 
                    before:translate-x-[-100%] before:skew-x-12 before:transition-transform before:duration-700 
                    hover:before:translate-x-[100%]
                  `}
                >
                  <span className="relative z-10 font-semibold">
                    {nattyPercentage > 50 ? "🏆 Natty" : "💉 Juicy"} 
                    ({nattyPercentage > 50 ? nattyPercentage : juicyPercentage}%)
                  </span>
                </Badge>
              </div>
            </div>
          )}

          {!user && !isLoading && voteStats && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="space-y-2 select-none cursor-pointer">
                  <div className="flex justify-between items-center text-xs text-muted-foreground opacity-60">
                    <span>💉 Juicy</span>
                    <span>🏆 Natty</span>
                  </div>
                  <div className="relative">
                    <div className="w-full rounded-full h-2 overflow-hidden flex blur-sm opacity-80">
                      <div className="h-full bg-juicy transition-all duration-500" style={{ width: '50%' }} />
                      <div className="h-full bg-natty transition-all duration-500" style={{ width: '50%' }} />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-xs text-muted-foreground font-semibold drop-shadow-md select-none" style={{zIndex:0}}>Sign in to see verdicts</span>
                    </div>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>Sign in to see verdicts and vote!</TooltipContent>
            </Tooltip>
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
