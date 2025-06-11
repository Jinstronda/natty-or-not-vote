
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useVotes } from "@/hooks/useVotes";
import { useSupabaseExpertReviews } from "@/hooks/useSupabaseExpertReviews";
import { useRealTime } from "@/hooks/useRealTime";

interface VotingResultsProps {
  influencerId: string;
}

const VotingResults = ({ influencerId }: VotingResultsProps) => {
  const { getVotePercentages, isLoading } = useVotes(influencerId);
  const { getInfluencerExpertReviews } = useSupabaseExpertReviews();
  
  // Enable real-time updates
  useRealTime(influencerId, 'results');
  
  const communityResults = getVotePercentages();
  const expertReviews = getInfluencerExpertReviews(influencerId);
  
  // Calculate expert percentages based on ratings (assuming 4+ stars = natty, 3 or less = juicy)
  const expertNattyCount = expertReviews.filter(review => review.rating >= 4).length;
  const expertJuicyCount = expertReviews.filter(review => review.rating < 4).length;
  const totalExpertReviews = expertReviews.length;
  
  const expertNattyPercentage = totalExpertReviews > 0 ? Math.round((expertNattyCount / totalExpertReviews) * 100) : 0;
  const expertJuicyPercentage = totalExpertReviews > 0 ? Math.round((expertJuicyCount / totalExpertReviews) * 100) : 0;

  if (isLoading) {
    return (
      <Card className="mb-8">
        <CardContent className="p-8">
          <Skeleton className="h-8 w-48 mx-auto mb-8" />
          <div className="space-y-8">
            <div>
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-8 w-full mb-3" />
            </div>
            <div>
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-8 w-full mb-3" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardContent className="p-8">
        <h2 className="text-3xl font-heading font-bold text-center mb-8">
          Verdict Results
        </h2>
        
        {/* Expert Results */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Expert Verdict</h3>
            <span className="text-sm text-muted-foreground">
              {totalExpertReviews} expert{totalExpertReviews !== 1 ? 's' : ''}
            </span>
          </div>
          
          {totalExpertReviews > 0 ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-juicy font-semibold">💉 Juicy: {expertJuicyPercentage}%</span>
                <span className="text-natty font-semibold">🏆 Natty: {expertNattyPercentage}%</span>
              </div>
              
              <div className="relative">
                <div className="w-full bg-secondary rounded-full h-4 overflow-hidden flex">
                  <div
                    className="h-full bg-juicy transition-all duration-500"
                    style={{ width: `${expertJuicyPercentage}%` }}
                  />
                  <div
                    className="h-full bg-natty transition-all duration-500"
                    style={{ width: `${expertNattyPercentage}%` }}
                  />
                </div>
              </div>
              
              <div className="text-center mt-2">
                <span className="font-bold text-lg">
                  {expertNattyPercentage > 50 ? (
                    <span className="text-natty">{expertNattyPercentage}% Natty</span>
                  ) : expertJuicyPercentage > 50 ? (
                    <span className="text-juicy">{expertJuicyPercentage}% Juicy</span>
                  ) : (
                    <span className="text-muted-foreground">Tied</span>
                  )}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No expert reviews yet
            </div>
          )}
        </div>
        
        {/* Community Results */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Community Verdict</h3>
            <span className="text-sm text-muted-foreground">
              {communityResults.total} vote{communityResults.total !== 1 ? 's' : ''} • Live updates
            </span>
          </div>
          
          {communityResults.total > 0 ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-juicy font-semibold">💉 Juicy: {communityResults.juicy}%</span>
                <span className="text-natty font-semibold">🏆 Natty: {communityResults.natty}%</span>
              </div>
              
              <div className="relative">
                <div className="w-full bg-secondary rounded-full h-4 overflow-hidden flex">
                  <div
                    className="h-full bg-juicy transition-all duration-500"
                    style={{ width: `${communityResults.juicy}%` }}
                  />
                  <div
                    className="h-full bg-natty transition-all duration-500"
                    style={{ width: `${communityResults.natty}%` }}
                  />
                </div>
              </div>
              
              <div className="text-center mt-2">
                <span className="font-bold text-lg">
                  {communityResults.natty > 50 ? (
                    <span className="text-natty">{communityResults.natty}% Natty</span>
                  ) : communityResults.juicy > 50 ? (
                    <span className="text-juicy">{communityResults.juicy}% Juicy</span>
                  ) : (
                    <span className="text-muted-foreground">Tied</span>
                  )}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No community votes yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VotingResults;
