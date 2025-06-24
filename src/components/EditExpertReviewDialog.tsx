import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import { Award, Zap, User, Edit3 } from "lucide-react";

interface EditExpertReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  review: ExpertReview;
  onSuccess: () => void;
}

const EditExpertReviewDialog = ({ isOpen, onClose, review, onSuccess }: EditExpertReviewDialogProps) => {
  const [formData, setFormData] = useState({
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
  const expertName = review.author || 'Unknown Expert';

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
          // Note: We're NOT updating the author field - it stays the same
          content: formData.content,
          rating: formData.rating,
          link_url: formData.link_url || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', review.id);

      if (error) throw error;

      toast({
        title: "Review updated",
        description: `${expertName}'s review has been successfully updated.`,
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
      content: review.content || '',
      rating: review.rating || 1,
      link_url: review.link_url || '',
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-blue-600" />
            Edit Expert Review
          </DialogTitle>
          <DialogDescription>
            Update the review content and verdict for this expert's assessment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Expert Info - Readonly Display */}
          <Card className="bg-slate-50 border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600">Expert Reviewer</Label>
                  <p className="text-lg font-semibold text-slate-900">{expertName}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verdict Selector - Primary Focus */}
          <div>
            <Label htmlFor="verdict" className="text-base font-semibold">Final Verdict</Label>
            <p className="text-sm text-muted-foreground mb-3">
              What is this expert's assessment of this physique?
            </p>
            <Select 
              value={currentVerdict} 
              onValueChange={(value: 'natty' | 'juicy') => handleVerdictChange(value)}
            >
              <SelectTrigger className="w-full h-12">
                <SelectValue placeholder="Select verdict" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="natty">
                  <div className="flex items-center gap-3 py-2">
                    <Award className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium">Natty</div>
                      <div className="text-xs text-muted-foreground">Natural physique</div>
                    </div>
                    <Badge variant="outline" className="ml-2 bg-green-100 text-green-800">Natural</Badge>
                  </div>
                </SelectItem>
                <SelectItem value="juicy">
                  <div className="flex items-center gap-3 py-2">
                    <Zap className="h-5 w-5 text-pink-600" />
                    <div>
                      <div className="font-medium">Juicy</div>
                      <div className="text-xs text-muted-foreground">Enhanced physique</div>
                    </div>
                    <Badge variant="outline" className="ml-2 bg-pink-100 text-pink-800">Enhanced</Badge>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            <div className="mt-2 p-3 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600">
                Current verdict: <strong className={currentVerdict === 'natty' ? 'text-green-700' : 'text-pink-700'}>
                  {currentVerdict === 'natty' ? 'Natty (Natural)' : 'Juicy (Enhanced)'}
                </strong>
              </p>
            </div>
          </div>

          {/* Review Content */}
          <div>
            <Label htmlFor="content" className="text-base font-semibold">Review Content</Label>
            <p className="text-sm text-muted-foreground mb-3">
              What reasoning or evidence supports this verdict?
            </p>
            <Textarea
              id="content"
              placeholder="Expert's analysis and reasoning for their verdict..."
              value={formData.content || ''}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* External Link */}
          <div>
            <Label htmlFor="link_url" className="text-base font-semibold">External Link (Optional)</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Link to full review, video, or additional analysis
            </p>
            <Input
              id="link_url"
              type="url"
              placeholder="https://example.com/full-review"
              value={formData.link_url || ''}
              onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
            />
          </div>
        </div>

        <DialogFooter className="gap-3 pt-6">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.content?.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? "Updating..." : "Update Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditExpertReviewDialog;