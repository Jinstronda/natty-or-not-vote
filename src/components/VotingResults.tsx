
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useVoteStore } from "@/stores/VoteStore";
import { useSupabaseExpertReviews } from "@/hooks/useSupabaseExpertReviews";

interface VotingResultsProps {
  influencerId: string;
}

const VotingResults = ({ influencerId }: VotingResultsProps) => {
  const { getVotePercentages } = useVoteStore();
  const { getInfluencerExpertReviews } = useSupabaseExpertReviews();
  
  const communityResults = getVotePercentages(influencerId);
  const expertReviews = getInfluencerExpertReviews(influencerId);
  
  // Calculate expert percentages based on ratings (assuming 4+ stars = natty, 3 or less = juicy)
  const expertNattyCount = expertReviews.filter(review => review.rating >= 4).length;
  const expertJuicyCount = expertReviews.filter(review => review.rating < 4).length;
  const totalExpertReviews = expertReviews.length;
  
  const expertNattyPercentage = totalExpertReviews > 0 ? Math.round((expertNattyCount / totalExpertReviews) * 100) : 0;
  const expertJuicyPercentage = totalExpertReviews > 0 ? Math.round((expertJuicyCount / totalExpertReviews) * 100) : 0;

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
            <>
              <div className="flex justify-between items-center mb-3">
                <span className="text-natty font-bold text-2xl">{expertNattyPercentage}% Natty</span>
                <span className="text-juicy font-bold text-2xl">{expertJuicyPercentage}% Juicy</span>
              </div>
              
              <div className="relative">
                <div className="w-full bg-juicy/20 rounded-full h-8 overflow-hidden">
                  <div 
                    className="h-full bg-natty transition-all duration-1000 ease-out flex items-center justify-center text-white font-bold"
                    style={{ width: `${expertNattyPercentage}%` }}
                  >
                    {expertNattyPercentage > 15 && `${expertNattyPercentage}%`}
                  </div>
                </div>
                {expertNattyPercentage <= 15 && expertNattyPercentage > 0 && (
                  <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-natty font-bold text-sm">
                    {expertNattyPercentage}%
                  </div>
                )}
                {expertJuicyPercentage <= 15 && expertJuicyPercentage > 0 && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-juicy font-bold text-sm">
                    {expertJuicyPercentage}%
                  </div>
                )}
              </div>
            </>
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
              {communityResults.total} vote{communityResults.total !== 1 ? 's' : ''}
            </span>
          </div>
          
          {communityResults.total > 0 ? (
            <>
              <div className="flex justify-between items-center mb-3">
                <span className="text-natty font-bold text-2xl">{communityResults.natty}% Natty</span>
                <span className="text-juicy font-bold text-2xl">{communityResults.juicy}% Juicy</span>
              </div>
              
              <div className="relative">
                <div className="w-full bg-juicy/20 rounded-full h-8 overflow-hidden">
                  <div 
                    className="h-full bg-natty transition-all duration-1000 ease-out flex items-center justify-center text-white font-bold"
                    style={{ width: `${communityResults.natty}%` }}
                  >
                    {communityResults.natty > 15 && `${communityResults.natty}%`}
                  </div>
                </div>
                {communityResults.natty <= 15 && communityResults.natty > 0 && (
                  <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-natty font-bold text-sm">
                    {communityResults.natty}%
                  </div>
                )}
                {communityResults.juicy <= 15 && communityResults.juicy > 0 && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-juicy font-bold text-sm">
                    {communityResults.juicy}%
                  </div>
                )}
              </div>
            </>
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
