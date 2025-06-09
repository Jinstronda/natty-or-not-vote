
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useVoteStore } from "@/stores/VoteStore";
import { useToast } from "@/hooks/use-toast";
import { Influencer } from "@/types/vote";

interface AdminInfluencerEditorProps {
  influencer: Influencer;
}

const AdminInfluencerEditor = ({ influencer }: AdminInfluencerEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: influencer.name,
    image: influencer.image,
    height: influencer.height,
    weight: influencer.weight,
    yearsTraining: influencer.yearsTraining,
    claimedStatus: influencer.claimedStatus,
    description: influencer.description,
    socialLinks: influencer.socialLinks
  });

  const { updateInfluencer } = useVoteStore();
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      await updateInfluencer(influencer.id, formData);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Influencer updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update influencer",
        variant: "destructive",
      });
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  if (!isEditing) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Admin Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setIsEditing(true)} className="w-full">
            Edit Influencer
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Edit Influencer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="image">Image URL</Label>
          <Input
            id="image"
            value={formData.image}
            onChange={(e) => handleChange('image', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="height">Height</Label>
          <Input
            id="height"
            value={formData.height}
            onChange={(e) => handleChange('height', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="weight">Weight</Label>
          <Input
            id="weight"
            value={formData.weight}
            onChange={(e) => handleChange('weight', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="yearsTraining">Years Training</Label>
          <Input
            id="yearsTraining"
            value={formData.yearsTraining}
            onChange={(e) => handleChange('yearsTraining', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="claimedStatus">Claimed Status</Label>
          <Input
            id="claimedStatus"
            value={formData.claimedStatus}
            onChange={(e) => handleChange('claimedStatus', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="instagram">Instagram URL</Label>
          <Input
            id="instagram"
            value={formData.socialLinks?.instagram || ''}
            onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="youtube">YouTube URL</Label>
          <Input
            id="youtube"
            value={formData.socialLinks?.youtube || ''}
            onChange={(e) => handleSocialLinkChange('youtube', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="tiktok">TikTok URL</Label>
          <Input
            id="tiktok"
            value={formData.socialLinks?.tiktok || ''}
            onChange={(e) => handleSocialLinkChange('tiktok', e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} className="flex-1">
            Save Changes
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsEditing(false)}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminInfluencerEditor;
