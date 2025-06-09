
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useVoteStore } from "@/stores/VoteStore";
import { toast } from "@/hooks/use-toast";
import { Trash2, MessageSquare } from "lucide-react";

const ReviewModeration = () => {
  const { reviews, deleteReview } = useVoteStore();

  const handleDeleteReview = (reviewId: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      deleteReview(reviewId);
      toast({
        title: "Deleted",
        description: "Review has been removed.",
      });
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
                  <span className="font-medium">{review.username}</span>
                  <Badge className={review.vote === 'natty' ? 'bg-natty' : 'bg-juicy'}>
                    {review.vote === 'natty' ? '🏆 Natty' : '💉 Juicy'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{review.timestamp}</span>
                </div>
                <p className="text-muted-foreground">{review.content}</p>
              </div>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => handleDeleteReview(review.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewModeration;
