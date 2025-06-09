
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { UserPlus, Sparkles } from "lucide-react";
import SecureImageUpload from "@/components/SecureImageUpload";
import { supabase } from "@/integrations/supabase/client";

const SuggestInfluencer = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    imageUrl: '',
    instagram: '',
    youtube: '',
    tiktok: ''
  });

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to suggest an influencer.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter the influencer's name.",
        variant: "destructive",
      });
      return;
    }

    try {
      const socialLinks = {
        ...(formData.instagram && { instagram: formData.instagram }),
        ...(formData.youtube && { youtube: formData.youtube }),
        ...(formData.tiktok && { tiktok: formData.tiktok })
      };

      const { error } = await supabase
        .from('influencer_suggestions')
        .insert({
          influencer_name: formData.name,
          submitter_id: user.id,
          image_url: formData.imageUrl,
          social_links: socialLinks
        });

      if (error) throw error;

      // Reset form
      setFormData({
        name: '',
        imageUrl: '',
        instagram: '',
        youtube: '',
        tiktok: ''
      });
      setIsOpen(false);

      toast({
        title: "Suggestion submitted!",
        description: "Thank you for your suggestion. It will be reviewed by our admin team.",
      });
    } catch (error) {
      console.error('Error submitting suggestion:', error);
      toast({
        title: "Error",
        description: "Failed to submit suggestion. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          size="lg" 
          className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
        >
          <Sparkles className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
          Suggest an Influencer
          <UserPlus className="h-5 w-5 ml-2" />
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-2xl font-heading">Suggest an Influencer</SheetTitle>
        </SheetHeader>
        <div className="space-y-6 mt-6">
          <p className="text-muted-foreground">
            Know a fitness influencer that should be on Natty or Not? Submit their information and we'll review it for inclusion.
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Influencer Name *</label>
              <Input
                placeholder="Enter the influencer's name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <SecureImageUpload
              onImageUploaded={(url) => setFormData({...formData, imageUrl: url})}
              currentImage={formData.imageUrl}
              onImageRemoved={() => setFormData({...formData, imageUrl: ''})}
            />
            
            <div>
              <label className="text-sm font-medium">Instagram</label>
              <Input
                placeholder="https://instagram.com/username"
                value={formData.instagram}
                onChange={(e) => setFormData({...formData, instagram: e.target.value})}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">YouTube</label>
              <Input
                placeholder="https://youtube.com/channel"
                value={formData.youtube}
                onChange={(e) => setFormData({...formData, youtube: e.target.value})}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">TikTok</label>
              <Input
                placeholder="https://tiktok.com/@username"
                value={formData.tiktok}
                onChange={(e) => setFormData({...formData, tiktok: e.target.value})}
              />
            </div>
          </div>

          <Button onClick={handleSubmit} className="w-full">
            Submit Suggestion
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SuggestInfluencer;
