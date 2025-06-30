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
import { OptimizedImage } from "./OptimizedImage";

export interface InfluencerCardProps {
  influencer: {
    id: string;
    name: string;
    image: string;
    claimed_status: string;
    controversial?: boolean;
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
      <Card className={`group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden
        ${!isLoading && voteStats && totalVotes > 0 && juicyPercentage > 50 ? 'hover:bg-juicy/20' : ''}
        ${!isLoading && voteStats && totalVotes > 0 && nattyPercentage > 50 ? 'hover:bg-natty/20' : ''}
        cursor-pointer select-none relative
        hover:shadow-2xl hover:shadow-black/10
        active:scale-[0.98] active:shadow-md
      `}
      onMouseEnter={() => {
        // Subtle haptic feedback on card hover
        if ('vibrate' in navigator) {
          navigator.vibrate(3);
        }
      }}
      >
        {/* Subtle glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        
        <CardHeader className="p-0 relative z-10">
          <div className="aspect-square relative">
            <OptimizedImage
              src={mainImage}
              alt={influencer.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              priority={false}
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
            {influencer.claimed_status === 'claimed' && (
              <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                Claimed
              </div>
            )}
            {influencer.controversial && (
              <div className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
                🔥 Controversial
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
                    transition-all duration-300 hover:scale-105
                    ${nattyPercentage > 50 
                      ? 'bg-gradient-to-r from-natty to-natty/90 hover:shadow-lg hover:shadow-natty/30 hover:brightness-110' 
                      : 'bg-gradient-to-r from-juicy to-juicy/90 hover:shadow-lg hover:shadow-juicy/30 hover:brightness-110'
                    }
                    cursor-pointer select-none
                    relative overflow-hidden
                  `}
                  onMouseEnter={(e) => {
                    // Add subtle haptic feedback on mobile
                    if ('vibrate' in navigator) {
                      navigator.vibrate(5);
                    }
                  }}
                >
                  {/* Subtle shimmer effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  
                  <span className="relative z-10">
                    {nattyPercentage > 50 ? "Natty" : "Juicy"} 
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
