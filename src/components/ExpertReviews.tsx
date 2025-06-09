
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, ThumbsUp } from "lucide-react";

interface ExpertReview {
  id: number;
  author: string;
  rating: number;
  content: string;
  likes: number;
}

interface ExpertReviewsProps {
  reviews: ExpertReview[];
}

const ExpertReviews = ({ reviews }: ExpertReviewsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Expert Reviews
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">{review.author}</span>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`} 
                  />
                ))}
              </div>
            </div>
            <p className="text-muted-foreground mb-3">{review.content}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ThumbsUp className="h-4 w-4" />
              <span>{review.likes}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ExpertReviews;
