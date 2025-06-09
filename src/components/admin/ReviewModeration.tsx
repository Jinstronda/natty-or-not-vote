
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Trash2, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const ReviewModeration = () => {
  const queryClient = useQueryClient();

  const { data: reviews = [] } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast({
        title: "Deleted",
        description: "Review has been removed.",
      });
    },
    onError: (error) => {
      console.error('Error deleting review:', error);
      toast({
        title: "Error",
        description: "Failed to delete review.",
        variant: "destructive",
      });
    }
  });

  const handleDeleteReview = (reviewId: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      deleteReviewMutation.mutate(reviewId);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Moderate Reviews ({reviews.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="flex items-start justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">User {review.user_id}</span>
                  <Badge className={review.vote === 'natty' ? 'bg-natty' : 'bg-juicy'}>
                    {review.vote === 'natty' ? '🏆 Natty' : '💉 Juicy'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-muted-foreground">{review.content}</p>
              </div>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => handleDeleteReview(review.id)}
                disabled={deleteReviewMutation.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          {reviews.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No reviews found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewModeration;
