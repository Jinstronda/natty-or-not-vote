import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ExpertReview } from "@/types/vote";
import { Award, Zap } from "lucide-react";

interface EditExpertReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  review: ExpertReview;
  onSuccess: () => void;
}

const EditExpertReviewDialog = ({ isOpen, onClose, review, onSuccess }: EditExpertReviewDialogProps) => {
  const [formData, setFormData] = useState({
    author: review.author || '',
    content: review.content || '',
    rating: review.rating || 1,
    link_url: review.link_url || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Convert rating to verdict for display
  const getVerdictFromRating = (rating: number | null | undefined): 'natty' | 'juicy' => {
    return (rating || 1) >= 3 ? 'natty' : 'juicy';
  };

  // Convert verdict back to rating
  const getRatingFromVerdict = (verdict: 'natty' | 'juicy'): number => {
    return verdict === 'natty' ? 5 : 1;
  };

  const currentVerdict = getVerdictFromRating(formData.rating);

  const handleVerdictChange = (verdict: 'natty' | 'juicy') => {
    setFormData({ 
      ...formData, 
      rating: getRatingFromVerdict(verdict)
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('expert_reviews')
        .update({
          author: formData.author,
          content: formData.content,
          rating: formData.rating,
          link_url: formData.link_url || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', review.id);

      if (error) throw error;

      toast({
        title: "Review updated",
        description: "Expert review has been successfully updated.",
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update expert review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      author: review.author || '',
      content: review.content || '',
      rating: review.rating || 1,
      link_url: review.link_url || '',
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Expert Review</DialogTitle>
          <DialogDescription>
            Update the expert review details and final verdict below.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="author">Expert Name</Label>
            <Input
              id="author"
              placeholder="Expert name"
              value={formData.author || ''}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            />
          </div>
          
          <div>
            <Label htmlFor="verdict">Final Verdict</Label>
            <Select 
              value={currentVerdict} 
              onValueChange={(value: 'natty' | 'juicy') => handleVerdictChange(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select verdict" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="natty">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-green-600" />
                    <span>Natty</span>
                    <Badge variant="outline" className="ml-2 bg-green-100 text-green-800">Natural</Badge>
                  </div>
                </SelectItem>
                <SelectItem value="juicy">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-pink-600" />
                    <span>Juicy</span>
                    <Badge variant="outline" className="ml-2 bg-pink-100 text-pink-800">Enhanced</Badge>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Current verdict: <strong>{currentVerdict === 'natty' ? 'Natty (Natural)' : 'Juicy (Enhanced)'}</strong>
            </p>
          </div>

          <div>
            <Label htmlFor="content">Review Content</Label>
            <Textarea
              id="content"
              placeholder="Expert review content..."
              value={formData.content || ''}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={4}
              className="resize-none"
            />
          </div>

          <div>
            <Label htmlFor="link_url">External Link (Optional)</Label>
            <Input
              id="link_url"
              type="url"
              placeholder="https://example.com/full-review"
              value={formData.link_url || ''}
              onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.author?.trim() || !formData.content?.trim()}
          >
            {isSubmitting ? "Updating..." : "Update Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditExpertReviewDialog;