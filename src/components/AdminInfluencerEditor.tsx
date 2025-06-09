
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Pencil, Save, X } from "lucide-react";
import { Influencer } from '@/types/vote';
import { useVoteStore } from '@/stores/VoteStore';
import { toast } from "@/hooks/use-toast";

interface AdminInfluencerEditorProps {
  influencer: Influencer;
}

const AdminInfluencerEditor = ({ influencer }: AdminInfluencerEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(influencer);
  const { updateInfluencer } = useVoteStore();

  const handleSave = async () => {
    try {
      await updateInfluencer(influencer.id, editData);
      setIsEditing(false);
      toast({
        title: "Influencer updated",
        description: "The influencer data has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update influencer data.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditData(influencer);
    setIsEditing(false);
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setEditData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  if (!isEditing) {
    return (
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Admin Controls</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2"
            >
              <Pencil className="h-4 w-4" />
              Edit Influencer
            </Button>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Edit Influencer</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={editData.name}
            onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>
        
        <div>
          <Label htmlFor="image">Image URL</Label>
          <Input
            id="image"
            value={editData.image || ''}
            onChange={(e) => setEditData(prev => ({ ...prev, image: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="height">Height</Label>
            <Input
              id="height"
              value={editData.height || ''}
              onChange={(e) => setEditData(prev => ({ ...prev, height: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="weight">Weight</Label>
            <Input
              id="weight"
              value={editData.weight || ''}
              onChange={(e) => setEditData(prev => ({ ...prev, weight: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="yearsTraining">Years Training</Label>
            <Input
              id="yearsTraining"
              value={editData.yearsTraining || ''}
              onChange={(e) => setEditData(prev => ({ ...prev, yearsTraining: e.target.value }))}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="claimedStatus">Claimed Status</Label>
          <Input
            id="claimedStatus"
            value={editData.claimedStatus || ''}
            onChange={(e) => setEditData(prev => ({ ...prev, claimedStatus: e.target.value }))}
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={editData.description || ''}
            onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label>Social Links</Label>
          <div className="grid grid-cols-1 gap-2">
            <div>
              <Label htmlFor="instagram" className="text-sm">Instagram</Label>
              <Input
                id="instagram"
                value={editData.socialLinks?.instagram || ''}
                onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                placeholder="Instagram URL"
              />
            </div>
            <div>
              <Label htmlFor="youtube" className="text-sm">YouTube</Label>
              <Input
                id="youtube"
                value={editData.socialLinks?.youtube || ''}
                onChange={(e) => handleSocialLinkChange('youtube', e.target.value)}
                placeholder="YouTube URL"
              />
            </div>
            <div>
              <Label htmlFor="tiktok" className="text-sm">TikTok</Label>
              <Input
                id="tiktok"
                value={editData.socialLinks?.tiktok || ''}
                onChange={(e) => handleSocialLinkChange('tiktok', e.target.value)}
                placeholder="TikTok URL"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminInfluencerEditor;
