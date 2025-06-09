
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useVoteStore } from "@/stores/VoteStore";
import { toast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import ImageUpload from "@/components/ImageUpload";

const SuggestInfluencerForm = () => {
  const { user } = useAuth();
  const { submitInfluencerSuggestion } = useVoteStore();
  const [formData, setFormData] = useState({
    name: '',
    imageUrl: '',
    height: '',
    weight: '',
    yearsTraining: '',
    claimedStatus: '',
    description: '',
    instagram: '',
    youtube: '',
    tiktok: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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

    submitInfluencerSuggestion(user.id, user.username, formData.name, socialLinks, formData.imageUrl);

    // Reset form
    setFormData({
      name: '',
      imageUrl: '',
      height: '',
      weight: '',
      yearsTraining: '',
      claimedStatus: '',
      description: '',
      instagram: '',
      youtube: '',
      tiktok: ''
    });

    toast({
      title: "Suggestion submitted!",
      description: "Thank you for your suggestion. It will be reviewed by our admin team.",
    });
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <UserPlus className="h-6 w-6" />
              Suggest an Influencer
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Please login to suggest an influencer for the community to vote on.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild variant="outline">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <UserPlus className="h-6 w-6" />
            Suggest an Influencer
          </CardTitle>
          <p className="text-muted-foreground">
            Know a fitness influencer that should be on Natty or Not? Submit their information and we'll review it for inclusion.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium block mb-2">Influencer Name *</label>
                <Input
                  placeholder="Enter the influencer's name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <ImageUpload
                  onImageUploaded={(url) => setFormData({...formData, imageUrl: url})}
                  currentImage={formData.imageUrl}
                  onImageRemoved={() => setFormData({...formData, imageUrl: ''})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-2">Height</label>
                <Input
                  placeholder="e.g., 5'10&quot;"
                  value={formData.height}
                  onChange={(e) => setFormData({...formData, height: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-2">Weight</label>
                <Input
                  placeholder="e.g., 180 lbs"
                  value={formData.weight}
                  onChange={(e) => setFormData({...formData, weight: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-2">Years Training</label>
                <Input
                  placeholder="e.g., 5 years"
                  value={formData.yearsTraining}
                  onChange={(e) => setFormData({...formData, yearsTraining: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-2">Claimed Status</label>
                <Input
                  placeholder="e.g., Natural, Enhanced, etc."
                  value={formData.claimedStatus}
                  onChange={(e) => setFormData({...formData, claimedStatus: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Description</label>
              <Textarea
                placeholder="Tell us about this influencer..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
              />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Social Media Links</h3>
              
              <div>
                <label className="text-sm font-medium block mb-2">Instagram</label>
                <Input
                  placeholder="https://instagram.com/username"
                  value={formData.instagram}
                  onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-2">YouTube</label>
                <Input
                  placeholder="https://youtube.com/channel"
                  value={formData.youtube}
                  onChange={(e) => setFormData({...formData, youtube: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-2">TikTok</label>
                <Input
                  placeholder="https://tiktok.com/@username"
                  value={formData.tiktok}
                  onChange={(e) => setFormData({...formData, tiktok: e.target.value})}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg">
              Submit Suggestion
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuggestInfluencerForm;
