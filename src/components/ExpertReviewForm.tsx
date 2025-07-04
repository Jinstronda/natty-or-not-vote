
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useSupabaseExpertReviews } from '@/hooks/useSupabaseExpertReviews';
import { toast } from "@/hooks/use-toast";

interface ExpertReviewFormProps {
  influencerId: string;
}

const ExpertReviewForm = ({ influencerId }: ExpertReviewFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    author: '',
    content: '',
    rating: 5,
    link_url: ''
  });
  const { addExpertReview } = useSupabaseExpertReviews();

  const handleSubmit = async () => {
    if (!formData.author.trim() || !formData.content.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill in author and content fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addExpertReview({
        influencer_id: influencerId,
        author: formData.author.trim(),
        content: formData.content.trim(),
        rating: formData.rating,
        link_url: formData.link_url.trim() || undefined
      });

      setFormData({
        author: '',
        content: '',
        rating: 5,
        link_url: ''
      });
      setIsOpen(false);
      
      toast({
        title: "Expert review added",
        description: "The expert review has been successfully added.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add expert review.",
        variant: "destructive",
      });
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="mb-4 flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Add Expert Review
      </Button>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Add Expert Review</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="author">Author</Label>
          <Input
            id="author"
            value={formData.author}
            onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
            placeholder="Expert name"
          />
        </div>

        <div>
          <Label htmlFor="content">Review Content</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            placeholder="Expert review content"
          />
        </div>

        <div>
          <Label htmlFor="rating">Rating</Label>
          <Select
            value={String(formData.rating)}
            onValueChange={(value) => setFormData(prev => ({ ...prev, rating: parseInt(value) }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5].map((rating) => (
                <SelectItem key={rating} value={String(rating)}>
                  {rating} Star{rating !== 1 ? 's' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="link_url">Link URL (optional)</Label>
          <Input
            id="link_url"
            value={formData.link_url}
            onChange={(e) => setFormData(prev => ({ ...prev, link_url: e.target.value }))}
            placeholder="Link to full review"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSubmit}>Add Review</Button>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpertReviewForm;
