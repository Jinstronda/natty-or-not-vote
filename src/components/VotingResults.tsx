import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
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
              <Skeleton className="h-8 w-full" />
            </div>
            <div>
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-8 w-full mb-3" />
              <Skeleton className="h-8 w-full" />
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
              {/* Natty Bar */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-natty font-semibold">🏆 Natty</span>
                  <span className="text-natty font-bold text-lg">{expertNattyPercentage}%</span>
                </div>
                <Progress 
                  value={expertNattyPercentage} 
                  className="h-3 [&>div]:bg-natty"
                  style={{
                    background: 'hsl(var(--muted))',
                  }}
                />
              </div>
              
              {/* Juicy Bar */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-juicy font-semibold">💉 Juicy</span>
                  <span className="text-juicy font-bold text-lg">{expertJuicyPercentage}%</span>
                </div>
                <Progress 
                  value={expertJuicyPercentage} 
                  className="h-3 [&>div]:bg-juicy"
                  style={{
                    background: 'hsl(var(--muted))',
                  }}
                />
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
              {/* Natty Bar */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-natty font-semibold">🏆 Natty</span>
                  <span className="text-natty font-bold text-lg">{communityResults.natty}%</span>
                </div>
                <Progress 
                  value={communityResults.natty} 
                  className="h-3 [&>div]:bg-natty"
                  style={{
                    background: 'hsl(var(--muted))',
                  }}
                />
              </div>
              
              {/* Juicy Bar */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-juicy font-semibold">💉 Juicy</span>
                  <span className="text-juicy font-bold text-lg">{communityResults.juicy}%</span>
                </div>
                <Progress 
                  value={communityResults.juicy} 
                  className="h-3 [&>div]:bg-juicy"
                  style={{
                    background: 'hsl(var(--muted))',
                  }}
                />
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
