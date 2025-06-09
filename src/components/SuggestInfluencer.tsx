
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useVoteStore } from "@/stores/VoteStore";
import { toast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";

const SuggestInfluencer = () => {
  const { user } = useAuth();
  const { submitInfluencerSuggestion } = useVoteStore();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    instagram: '',
    youtube: '',
    tiktok: ''
  });

  const handleSubmit = () => {
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

    const socialLinks = {
      ...(formData.instagram && { instagram: formData.instagram }),
      ...(formData.youtube && { youtube: formData.youtube }),
      ...(formData.tiktok && { tiktok: formData.tiktok })
    };

    submitInfluencerSuggestion(user.id, user.username, formData.name, socialLinks);

    // Reset form
    setFormData({
      name: '',
      instagram: '',
      youtube: '',
      tiktok: ''
    });
    setIsOpen(false);

    toast({
      title: "Suggestion submitted!",
      description: "Thank you for your suggestion. It will be reviewed by our admin team.",
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Suggest an Influencer
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Suggest an Influencer</SheetTitle>
        </SheetHeader>
        <div className="space-y-6 mt-6">
          <p className="text-sm text-muted-foreground">
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
