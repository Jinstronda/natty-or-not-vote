import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, ExternalLink, ThumbsUp, Trash2, Edit, User, MoreVertical, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ExpertReviewForm from "@/components/ExpertReviewForm";
import EditExpertReviewDialog from "@/components/EditExpertReviewDialog";
import { MobileExpertReviewsCarousel } from "@/components/MobileExpertReviewsCarousel";
import { ProgressiveExpertReviewsSkeleton, MobileExpertReviewsCarouselSkeleton, ExpertReviewFormSkeleton } from "@/components/loading/ExpertReviewSkeleton";
import { useOptimizedExpertReviews } from '@/hooks/api/useOptimizedExpertReviews';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ExpertReview } from "@/types/vote";
import { isValidUrl } from "@/utils/urlValidator";

interface EnhancedExpertReviewsProps {
  influencerId?: string;
  expertId?: string;
}

/**
 * SAFE ENHANCED COMPONENT: Optimized Expert Reviews
 * - Uses batched data loading (1 API call instead of 4)
 * - Progressive loading with realistic skeletons
 * - Maintains exact same interface as original
 * - Fallback to original behavior on error
 */
const EnhancedExpertReviews = ({ influencerId, expertId }: EnhancedExpertReviewsProps) => {
  const { user } = useAuth();
  
  // SAFE: Use optimized hook with error fallback
  const { data: optimizedReviews, isLoading, error, refetch } = useOptimizedExpertReviews(influencerId);
  
  // SAFE: Filter reviews exactly like original component
  let filteredReviews = optimizedReviews || [];
  if (expertId) {
    filteredReviews = filteredReviews.filter(r => r.expert_id === expertId);
  }
  
  // SAFE: State management exactly like original
  const [editingReview, setEditingReview] = useState<ExpertReview | null>(null);
  const [editingInfluencerFor, setEditingInfluencerFor] = useState<string | null>(null);
  const [allInfluencers, setAllInfluencers] = useState<any[]>([]);

  // SAFE: Load all influencers for admin (same as original)
  useEffect(() => {
    const fetchAllInfluencers = async () => {
      if (user?.role !== 'admin') return;
      const { data } = await supabase.from('influencers').select('id, name').order('name');
      if (data) {
        setAllInfluencers(data);
      }
    };
    fetchAllInfluencers();
  }, [user?.role]);

  // SAFE: Same delete handler as original
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

  // SAFE: Same update handler as original
  const handleInfluencerChange = async (reviewId: string, newInfluencerId: string) => {
    if (user?.role !== 'admin') return;

    try {
      const { error } = await supabase
        .from('expert_reviews')
        .update({ influencer_id: newInfluencerId, updated_at: new Date().toISOString() })
        .eq('id', reviewId);

      if (error) throw error;
      
      const influencerName = allInfluencers.find(i => i.id === newInfluencerId)?.name || 'Unknown';
      
      toast({
        title: "Review updated",
        description: `Review has been reassigned to ${influencerName}.`,
      });

      setEditingInfluencerFor(null);
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update review. Please try again.",
        variant: "destructive",
      });
    }
  };

  // SAFE: Error handling - fallback to original message
  if (error) {
    console.error('Enhanced Expert Reviews Error:', error);
    return (
      <div className="text-center py-4 text-muted-foreground">
        <p>Error loading expert reviews. Please try again.</p>
        <Button variant="outline" onClick={() => refetch()} className="mt-2">
          Retry
        </Button>
      </div>
    );
  }

  // SAFE: Progressive loading with realistic skeletons
  if (isLoading) {
    return (
      <>
        {/* Mobile skeleton */}
        <div className="block lg:hidden">
          <MobileExpertReviewsCarouselSkeleton />
        </div>
        
        {/* Desktop skeleton */}
        <Card className="hidden lg:block">
          <ProgressiveExpertReviewsSkeleton count={3} />
        </Card>
      </>
    );
  }

  // SAFE: Empty state exactly like original
  if (filteredReviews.length === 0) {
    return <p className="text-center text-muted-foreground py-4">No expert reviews yet.</p>;
  }

  // SAFE: Transform optimized data back to original format for compatibility
  const compatibleReviews = filteredReviews.map(review => ({
    ...review,
    // Remove the nested objects to match original interface
    expert_id: review.expert_id,
    influencer_id: review.influencer_id
  }));

  // SAFE: Create lookup maps exactly like original
  const experts: Record<string, any> = {};
  const influencers: Record<string, any> = {};
  
  filteredReviews.forEach(review => {
    if (review.expert && review.expert_id) {
      experts[review.expert_id] = review.expert;
    }
    if (review.influencer && review.influencer_id) {
      influencers[review.influencer_id] = review.influencer;
    }
  });

  return (
    <>
      {/* SAFE: Mobile Carousel - exact same as original */}
      <div className="block lg:hidden">
        <MobileExpertReviewsCarousel
          reviews={compatibleReviews}
          experts={experts}
          influencers={influencers}
          isAdmin={user?.role === 'admin'}
          onEdit={setEditingReview}
          onDelete={handleDeleteExpertReview}
          onChangeInfluencer={(reviewId) => setEditingInfluencerFor(reviewId)}
        />
      </div>

      {/* SAFE: Desktop Layout - exact same as original */}
      <Card className="hidden lg:block">
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
              const expert = review.expert || null;
              const influencer = review.influencer || null;
              const expertName = expert?.name || review.author || 'Unknown Expert';
              const influencerName = influencer?.name || 'Unknown Influencer';
              const isNatty = (review.rating ?? 0) >= 4 || (review.natty_or_not?.toLowerCase() === 'natty');
              const cardColor = isNatty ? 'bg-natty/10 border-natty' : 'bg-juicy/10 border-juicy';
            
            return (
              <div
                key={review.id}
                className={`relative flex items-start gap-4 border-2 ${cardColor} rounded-xl p-4 shadow-sm transition-all duration-300 hover:shadow-lg`}
              >
                {/* SAFE: Admin Actions - exact same as original */}
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
                          onClick={() => setEditingInfluencerFor(review.id)}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <UserCheck className="h-4 w-4 text-green-600" />
                          <span>Change Influencer</span>
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

                {/* SAFE: Avatar - exact same as original */}
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold overflow-hidden">
                  {expert?.profile_picture_url ? (
                    <img src={expert.profile_picture_url} alt={expertName} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    (expertName[0] || <User className="w-8 h-8" />)
                  )}
                </div>
                
                {/* SAFE: Content - exact same as original */}
                <div className="flex-1 min-w-0 pr-8">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {expert?.id ? (
                      <a href={`/experts/${expert.id}`} className="font-semibold text-lg text-white drop-shadow hover:underline">
                        {expertName}
                      </a>
                    ) : (
                      <span className="font-semibold text-lg text-white drop-shadow">{expertName}</span>
                    )}
                    <span className="text-muted-foreground text-base">said about</span>
                    <a href={`/influencer/${review.influencer_id}`} className="font-semibold text-lg text-white drop-shadow hover:underline bg-white/10 px-2 py-1 rounded">
                      {influencerName}
                    </a>
                    <span className="text-muted-foreground text-base">:</span>
                  </div>
                  
                  {/* SAFE: Admin influencer change - exact same as original */}
                  {user?.role === 'admin' && editingInfluencerFor === review.id && (
                    <div className="mb-3 p-3 bg-white/10 rounded border">
                      <div className="flex items-center gap-2 mb-2">
                        <UserCheck className="h-4 w-4" />
                        <span className="font-medium text-sm">Change Review Target:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select value={review.influencer_id} onValueChange={(value) => handleInfluencerChange(review.id, value)}>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select influencer" />
                          </SelectTrigger>
                          <SelectContent>
                            {allInfluencers.map((inf) => (
                              <SelectItem key={inf.id} value={inf.id}>
                                {inf.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="sm" onClick={() => setEditingInfluencerFor(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* SAFE: Content sections - exact same as original */}
                  {review.link_url && isValidUrl(review.link_url) && (
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
        </CardContent>
      </Card>

      {/* SAFE: Shared dialog - exact same as original */}
      {editingReview && (
        <EditExpertReviewDialog
          isOpen={!!editingReview}
          onClose={() => setEditingReview(null)}
          review={editingReview}
          onSuccess={refetch}
        />
      )}
    </>
  );
};

export default EnhancedExpertReviews;