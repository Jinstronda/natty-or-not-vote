import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useSupabaseReviews } from "@/hooks/useSupabaseReviews";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface ReviewPromptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  influencerId: string;
  vote: 'natty' | 'juicy';
  onReviewSubmitted?: () => void;
}

const ReviewPromptDialog = ({ isOpen, onClose, influencerId, vote, onReviewSubmitted }: ReviewPromptDialogProps) => {
  const { user } = useAuth();
  const { submitReview } = useSupabaseReviews();
  const queryClient = useQueryClient();
  const [reviewContent, setReviewContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Character limit for reviews
  const MAX_REVIEW_LENGTH = 500;
  const remainingChars = MAX_REVIEW_LENGTH - reviewContent.length;
  const isOverLimit = remainingChars < 0;
  
  // Character count color based on remaining characters
  const getCharCountColor = () => {
    if (isOverLimit) return 'text-destructive';
    if (remainingChars <= 50) return 'text-yellow-600';
    return 'text-muted-foreground';
  };

  const handleSubmitReview = async () => {
    if (!user || !reviewContent.trim() || isOverLimit) return;

    setIsSubmitting(true);
    try {
      await submitReview(user.id, user.username, influencerId, vote, reviewContent.trim());
      
      console.log('💫 Review submitted - optimistic update completed');
      
      toast({
        title: "Review submitted!",
        description: "Thank you for sharing your thoughts.",
      });
      
      setReviewContent("");
      onClose();
      onReviewSubmitted?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    setReviewContent("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share your thoughts</DialogTitle>
          <DialogDescription>
            You voted <span className={vote === 'natty' ? 'text-natty font-semibold' : 'text-juicy font-semibold'}>
              {vote === 'natty' ? '🏆 Natty' : '💉 Juicy'}
            </span>. Would you like to explain why?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Share your reasoning, evidence, or thoughts about this decision..."
              value={reviewContent}
              onChange={(e) => setReviewContent(e.target.value)}
              rows={4}
              className={`resize-none ${isOverLimit ? 'border-destructive focus:border-destructive' : ''}`}
              maxLength={MAX_REVIEW_LENGTH + 100} // Allow slight overflow for user feedback
            />
            <div className="flex justify-between items-center text-sm">
              <span className={getCharCountColor()}>
                {remainingChars >= 0 ? `${remainingChars} characters remaining` : `${Math.abs(remainingChars)} characters over limit`}
              </span>
              <span className="text-muted-foreground">
                {reviewContent.length}/{MAX_REVIEW_LENGTH}
              </span>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={isSubmitting}
          >
            Skip
          </Button>
          <Button
            onClick={handleSubmitReview}
            disabled={isSubmitting || !reviewContent.trim() || isOverLimit}
            className={vote === 'natty' ? 'bg-natty hover:bg-natty/90' : 'bg-juicy hover:bg-juicy/90'}
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewPromptDialog;