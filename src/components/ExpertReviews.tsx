import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, ExternalLink, ThumbsUp, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import ExpertReviewForm from "@/components/ExpertReviewForm";
import EditExpertReviewDialog from "@/components/EditExpertReviewDialog";
import { useSupabaseExpertReviews } from '@/hooks/useSupabaseExpertReviews';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ExpertReview } from "@/types/vote";

interface ExpertReviewsProps {
  influencerId: string;
}

const ExpertReviews = ({ influencerId }: ExpertReviewsProps) => {
  const { user } = useAuth();
  const { getInfluencerExpertReviews, refetch } = useSupabaseExpertReviews();
  const expertReviews = getInfluencerExpertReviews(influencerId);
  const [editingReview, setEditingReview] = useState<ExpertReview | null>(null);

  const handleDeleteExpertReview = async (reviewId: string) => {
    if (user?.profile?.role !== 'admin') return;

    try {
      const { error } = await supabase
        .from('expert_reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;

      toast({
        title: "Expert review deleted",
        description: "The expert review has been successfully deleted.",
      });

      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete expert review. Please try again.",
        variant: "destructive",
      });
    }
  };

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
        {user?.profile?.role === 'admin' && (
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
              <div className="flex items-center gap-2">
                {review.link_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={review.link_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Read Full Review
                    </a>
                  </Button>
                )}
                {user?.profile?.role === 'admin' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingReview(review)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteExpertReview(review.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {expertReviews.length === 0 && (
          <p className="text-center text-muted-foreground py-4">
            No expert reviews yet.
          </p>
        )}

        {editingReview && (
          <EditExpertReviewDialog
            isOpen={!!editingReview}
            onClose={() => setEditingReview(null)}
            review={editingReview}
            onSuccess={refetch}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ExpertReviews;
