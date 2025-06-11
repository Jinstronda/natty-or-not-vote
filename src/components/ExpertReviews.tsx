import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, ExternalLink, ThumbsUp, Trash2, Edit, User } from "lucide-react";
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
  const [experts, setExperts] = useState<Record<string, any>>({});
  const [editingReview, setEditingReview] = useState<ExpertReview | null>(null);

  useEffect(() => {
    const fetchExperts = async () => {
      const ids = Array.from(new Set(expertReviews.map(r => r.expert_id).filter(Boolean)));
      if (ids.length === 0) return;
      const { data } = await supabase.from('experts').select('*').in('id', ids);
      if (data) {
        const map: Record<string, any> = {};
        data.forEach((e: any) => { map[e.id] = e; });
        setExperts(map);
      }
    };
    fetchExperts();
  }, [expertReviews]);

  const handleDeleteExpertReview = async (reviewId: string) => {
    if (user?.role !== 'admin') return;

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

  if (expertReviews.length === 0) {
    return <p className="text-center text-muted-foreground py-4">No expert reviews yet.</p>;
  }

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
        
        <div className="space-y-6">
          {expertReviews.map((review) => {
            const expert = review.expert_id ? experts[review.expert_id] : null;
            const isNatty = (review.rating ?? 0) >= 4 || (review.natty_or_not?.toLowerCase() === 'natty');
            const cardColor = isNatty ? 'bg-green-100 border-green-400' : 'bg-purple-100 border-purple-400';
            return (
              <div
                key={review.id}
                className={`flex items-start gap-4 border-2 ${cardColor} rounded-xl p-4 shadow-sm`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold overflow-hidden">
                  {expert?.profile_picture_url ? (
                    <img src={expert.profile_picture_url} alt={expert.name} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    (expert?.name?.[0] || review.author?.[0] || <User className="w-8 h-8" />)
                  )}
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {review.expert_id ? (
                      <a href={`/experts/${review.expert_id}`} className="font-semibold text-lg text-primary hover:underline">
                        {expert?.name || review.author}
                      </a>
                    ) : (
                      <span className="font-semibold text-lg text-primary">{expert?.name || review.author}</span>
                    )}
                    <span className="text-muted-foreground text-base">said:</span>
                  </div>
                  <div className="text-base mb-2 break-words whitespace-pre-line text-gray-900">{review.content}</div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-xs text-muted-foreground">VEREDICT:</span>
                    <span className={`font-bold text-sm ${isNatty ? 'text-green-700' : 'text-purple-700'}`}>{isNatty ? 'Natty' : 'Juicy'}</span>
                  </div>
                  {review.link_url && (
                    <div className="mb-1">
                      <a href={review.link_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-blue-600 hover:underline text-sm font-medium">
                        <ExternalLink className="h-4 w-4" /> Link
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {user?.role === 'admin' && (
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingReview(expertReviews[0])}
              className="text-blue-600 hover:text-blue-700"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteExpertReview(expertReviews[0].id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
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
