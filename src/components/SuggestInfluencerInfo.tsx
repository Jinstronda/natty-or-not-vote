import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, Info } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SuggestInfluencerInfoProps {
  influencer: {
    id: string;
    name: string;
    height?: string;
    weight?: string;
    years_training?: string;
    description?: string;
  };
}

export default function SuggestInfluencerInfo({ influencer }: SuggestInfluencerInfoProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    suggested_height: "",
    suggested_weight: "",
    suggested_training: "",
    suggested_description: "",
    reason: "",
    suggested_images: [] as string[]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please log in to suggest improvements");
      return;
    }

    // Check if at least one field is filled
    const hasChanges = formData.suggested_height ||
                      formData.suggested_weight ||
                      formData.suggested_training ||
                      formData.suggested_description ||
                      formData.suggested_images.length > 0;

    if (!hasChanges) {
      toast.error("Please suggest at least one improvement");
      return;
    }

    setIsSubmitting(true);

    try {
             const { error } = await (supabase as any)
         .from("influencer_info_suggestions")
         .insert({
           influencer_id: influencer.id,
           submitted_by: user.id,
           suggested_height: formData.suggested_height || null,
           suggested_weight: formData.suggested_weight || null,
           suggested_training: formData.suggested_training || null,
           suggested_description: formData.suggested_description || null,
           suggested_images: formData.suggested_images.length > 0 ? formData.suggested_images : null,
           reason: formData.reason || null
         });

      if (error) throw error;

      toast.success("Your suggestions have been submitted for review!");
      setIsOpen(false);
      setFormData({
        suggested_height: "",
        suggested_weight: "",
        suggested_training: "",
        suggested_description: "",
        reason: "",
        suggested_images: []
      });
    } catch (error) {
      console.error("Error submitting suggestion:", error);
      toast.error("Failed to submit suggestions. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUrlAdd = () => {
    const url = prompt("Enter image URL:");
    if (url && url.trim()) {
      setFormData(prev => ({
        ...prev,
        suggested_images: [...prev.suggested_images, url.trim()]
      }));
    }
  };

  const removeImageUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      suggested_images: prev.suggested_images.filter((_, i) => i !== index)
    }));
  };

  if (!user) {
    return null; // Only show to logged-in users
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
        >
          <Info className="w-4 h-4 mr-2" />
          Suggest Info
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Suggest Improvements for {influencer.name}</DialogTitle>
          <p className="text-sm text-gray-600">
            Help improve the accuracy of {influencer.name}'s profile information. 
            Fill in any fields you'd like to suggest changes for.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Info Display */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2">Current Information:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Height:</span> {influencer.height || "Not specified"}
              </div>
              <div>
                <span className="font-medium">Weight:</span> {influencer.weight || "Not specified"}
              </div>
              <div>
                <span className="font-medium">Training:</span> {influencer.years_training || "Not specified"}
              </div>
              <div className="col-span-2">
                <span className="font-medium">Description:</span> {influencer.description || "Not specified"}
              </div>
            </div>
          </div>

          {/* Suggestion Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="height">Suggested Height</Label>
                             <Input
                 id="height"
                 placeholder="e.g., 6'2&quot; or 188cm"
                 value={formData.suggested_height}
                 onChange={(e) => setFormData(prev => ({ ...prev, suggested_height: e.target.value }))}
               />
            </div>
            
            <div>
              <Label htmlFor="weight">Suggested Weight</Label>
              <Input
                id="weight"
                placeholder="e.g., 190 lbs or 86kg"
                value={formData.suggested_weight}
                onChange={(e) => setFormData(prev => ({ ...prev, suggested_weight: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="training">Suggested Training Experience</Label>
            <Input
              id="training"
              placeholder="e.g., 10+ years or 15 years"
              value={formData.suggested_training}
              onChange={(e) => setFormData(prev => ({ ...prev, suggested_training: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="description">Suggested Description</Label>
            <Textarea
              id="description"
              placeholder="Suggest a better description for this influencer"
              value={formData.suggested_description}
              onChange={(e) => setFormData(prev => ({ ...prev, suggested_description: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Image Suggestions */}
          <div>
            <Label>Suggested Images</Label>
            <div className="space-y-2">
              {formData.suggested_images.map((url, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input 
                    value={url} 
                    readOnly 
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeImageUrl(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={handleImageUrlAdd}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Add Image URL
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Suggest better images for this influencer's profile
            </p>
          </div>

          {/* Reason */}
          <div>
            <Label htmlFor="reason">Reason for Changes (Optional)</Label>
            <Textarea
              id="reason"
              placeholder="Explain why you think these changes should be made..."
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              rows={2}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Submitting..." : "Submit Suggestions"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 