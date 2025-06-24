import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, ExternalLink, ThumbsUp, Trash2, Edit, User, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ExpertReviewForm from "@/components/ExpertReviewForm";
import EditExpertReviewDialog from "@/components/EditExpertReviewDialog";
import { useSupabaseExpertReviews } from '@/hooks/useSupabaseExpertReviews';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ExpertReview } from "@/types/vote";

interface ExpertReviewsProps {
  influencerId?: string;
  expertId?: string;
}

const ExpertReviews = ({ influencerId, expertId }: ExpertReviewsProps) => {
  const { user } = useAuth();
  const { expertReviews, loading, refetch } = useSupabaseExpertReviews();
  let filteredReviews: typeof expertReviews = [];
  if (expertId) {
    filteredReviews = expertReviews.filter(r => r.expert_id === expertId);
  } else if (influencerId) {
    filteredReviews = expertReviews.filter(r => r.influencer_id === influencerId);
  }
  const [experts, setExperts] = useState<Record<string, any>>({});
  const [editingReview, setEditingReview] = useState<ExpertReview | null>(null);

  useEffect(() => {
    const fetchExperts = async () => {
      const ids = Array.from(new Set(filteredReviews.map(r => r.expert_id).filter(Boolean)));
      if (ids.length === 0) return;
      const { data } = await supabase.from('experts').select('*').in('id', ids);
      if (data) {
        const map: Record<string, any> = {};
        data.forEach((e: any) => { map[e.id] = e; });
        setExperts(map);
      }
    };
    fetchExperts();
  }, [filteredReviews]);

  const handleDeleteExpertReview = async (reviewId: string, expertName: string) => {
    if (user?.role !== 'admin') return;

    try {
      const { error } = await supabase
        .from('expert_reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;

      toast({
        title: "Expert review deleted",
        description: `${expertName}'s review has been successfully deleted.`,
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

  if (loading) {
    return <p className="text-center text-muted-foreground py-4">Loading expert reviews...</p>;
  }
  if (filteredReviews.length === 0) {
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
          {filteredReviews.map((review) => {
            const expert = review.expert_id ? experts[review.expert_id] : null;
            const expertName = expert?.name || review.author || 'Unknown Expert';
            const isNatty = (review.rating ?? 0) >= 4 || (review.natty_or_not?.toLowerCase() === 'natty');
            const cardColor = isNatty ? 'bg-natty/10 border-natty' : 'bg-juicy/10 border-juicy';
            
            return (
              <div
                key={review.id}
                className={`relative flex items-start gap-4 border-2 ${cardColor} rounded-xl p-4 shadow-sm`}
              >
                {/* Admin Actions - Top Right */}
                {user?.role === 'admin' && (
                  <div className="absolute top-3 right-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-white/20">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem 
                          onClick={() => setEditingReview(review)}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Edit className="h-4 w-4 text-blue-600" />
                          <span>Edit Review</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteExpertReview(review.id, expertName)}
                          className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete Review</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}

                {/* Avatar */}
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold overflow-hidden">
                  {expert?.profile_picture_url ? (
                    <img src={expert.profile_picture_url} alt={expertName} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    (expertName[0] || <User className="w-8 h-8" />)
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0 pr-8">
                  <div className="flex items-center gap-2 mb-1">
                    {expert?.id ? (
                      <a href={`/experts/${expert.id}`} className="font-semibold text-lg text-white drop-shadow hover:underline">
                        {expertName}
                      </a>
                    ) : (
                      <span className="font-semibold text-lg text-white drop-shadow">{expertName}</span>
                    )}
                    <span className="text-muted-foreground text-base">said:</span>
                  </div>
                  
                  {review.link_url && (
                    <div className="mb-1">
                      <a href={review.link_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-sm font-medium inline-flex items-center gap-1">
                        <ExternalLink className="h-4 w-4" /> Read Full Review
                      </a>
                    </div>
                  )}
                  
                  <div className="text-base mb-2 break-words whitespace-pre-line text-white drop-shadow">{review.content}</div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-xs text-muted-foreground">VERDICT:</span>
                    <span className={`font-bold text-sm ${isNatty ? 'text-natty' : 'text-juicy'}`}>
                      {isNatty ? 'Natty' : 'Juicy'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

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
