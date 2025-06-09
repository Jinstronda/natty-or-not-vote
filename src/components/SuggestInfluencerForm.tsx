
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useSupabaseSuggestions } from "@/hooks/useSupabaseSuggestions";
import { toast } from "@/hooks/use-toast";
import SecureImageUpload from "./SecureImageUpload";

const SuggestInfluencerForm = () => {
  const [influencerName, setInfluencerName] = useState("");
  const [instagram, setInstagram] = useState("");
  const [youtube, setYoutube] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  const { user } = useAuth();
  const { submitInfluencerSuggestion } = useSupabaseSuggestions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to suggest an influencer.",
        variant: "destructive",
      });
      return;
    }

    if (!influencerName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter the influencer's name.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      
      const socialLinks = {
        ...(instagram && { instagram }),
        ...(youtube && { youtube }),
        ...(tiktok && { tiktok }),
      };

      await submitInfluencerSuggestion(
        user.id,
        user.username,
        influencerName.trim(),
        socialLinks,
        imageUrl || undefined
      );

      // Reset form
      setInfluencerName("");
      setInstagram("");
      setYoutube("");
      setTiktok("");
      setImageUrl("");
      
      toast({
        title: "Suggestion Submitted!",
        description: "Your influencer suggestion has been submitted for review.",
      });
    } catch (error) {
      console.error("Error submitting suggestion:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your suggestion. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Suggest an Influencer</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Influencer Name *</Label>
            <Input
              id="name"
              type="text"
              value={influencerName}
              onChange={(e) => setInfluencerName(e.target.value)}
              placeholder="Enter the influencer's name"
              required
            />
          </div>

          <SecureImageUpload
            onImageUploaded={setImageUrl}
            currentImage={imageUrl}
            onImageRemoved={() => setImageUrl("")}
          />

          <div>
            <Label htmlFor="instagram">Instagram Handle</Label>
            <Input
              id="instagram"
              type="text"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="@username (optional)"
            />
          </div>

          <div>
            <Label htmlFor="youtube">YouTube Channel</Label>
            <Input
              id="youtube"
              type="text"
              value={youtube}
              onChange={(e) => setYoutube(e.target.value)}
              placeholder="Channel name or URL (optional)"
            />
          </div>

          <div>
            <Label htmlFor="tiktok">TikTok Handle</Label>
            <Input
              id="tiktok"
              type="text"
              value={tiktok}
              onChange={(e) => setTiktok(e.target.value)}
              placeholder="@username (optional)"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={submitting || !user}
          >
            {submitting ? "Submitting..." : "Submit Suggestion"}
          </Button>
          
          {!user && (
            <p className="text-sm text-muted-foreground text-center">
              Please log in to suggest an influencer.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default SuggestInfluencerForm;
