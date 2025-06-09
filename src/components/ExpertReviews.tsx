
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, ExternalLink, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import ExpertReviewForm from "@/components/ExpertReviewForm";
import { useSupabaseExpertReviews } from '@/hooks/useSupabaseExpertReviews';
import { useAuth } from '@/contexts/AuthContext';

interface ExpertReviewsProps {
  influencerId: string;
}

const ExpertReviews = ({ influencerId }: ExpertReviewsProps) => {
  const { user } = useAuth();
  const { getInfluencerExpertReviews } = useSupabaseExpertReviews();
  const expertReviews = getInfluencerExpertReviews(influencerId);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Expert Reviews
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {user?.role === 'admin' && (
          <ExpertReviewForm influencerId={influencerId} />
        )}
        
        {expertReviews.map((review) => (
          <div key={review.id} className="border-2 border-yellow-200 bg-yellow-50/50 rounded-lg p-4 relative">
            <div className="absolute top-2 right-2">
              <div className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                EXPERT
              </div>
            </div>
            <div className="flex items-start justify-between mb-2 pr-16">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg">{review.author}</span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`} 
                    />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-muted-foreground mb-3 text-base leading-relaxed">{review.content}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ThumbsUp className="h-4 w-4" />
                <span>{review.likes}</span>
              </div>
              {review.link_url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={review.link_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Read Full Review
                  </a>
                </Button>
              )}
            </div>
          </div>
        ))}
        
        {expertReviews.length === 0 && (
          <p className="text-center text-muted-foreground py-4">
            No expert reviews yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpertReviews;
