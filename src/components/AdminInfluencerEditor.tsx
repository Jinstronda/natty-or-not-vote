import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload } from "lucide-react";
import SecureImageUpload from "@/components/SecureImageUpload";

interface Influencer {
  id: string;
  name: string;
  image: string;
  height: string;
  weight: string;
  years_training: string;
  claimed_status: string;
  description: string;
  social_links: any;
  photos?: Array<{ id?: string; image_url: string; description: string }>;
}

interface AdminInfluencerEditorProps {
  influencer: Influencer;
}

const AdminInfluencerEditor = ({ influencer }: AdminInfluencerEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: influencer.name,
    image: influencer.image,
    height: influencer.height,
    weight: influencer.weight,
    yearsTraining: influencer.years_training,
    claimedStatus: influencer.claimed_status,
    description: influencer.description,
    socialLinks: influencer.social_links || {}
  });
  const [photos, setPhotos] = useState<Array<{ id?: string; image_url: string; description: string }>>(influencer.photos || []);
  const [photoUploading, setPhotoUploading] = useState(false);

  const { toast } = useToast();

  // Fetch latest photos if influencer changes
  useEffect(() => {
    setPhotos(influencer.photos || []);
  }, [influencer.photos]);

  // Add new photo
  const handleAddPhoto = (image_url: string) => {
    setPhotos(prev => [...prev, { image_url, description: "" }]);
  };

  // Update photo description
  const handlePhotoDescriptionChange = (idx: number, desc: string) => {
    setPhotos(prev => prev.map((p, i) => i === idx ? { ...p, description: desc } : p));
  };

  // Remove photo
  const handleRemovePhoto = (idx: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  // Save all changes (influencer + photos)
  const handleSave = async () => {
    try {
      // Save influencer fields as before
      const { error } = await supabase
        .from('influencers')
        .update({
          name: formData.name,
          image: formData.image,
          height: formData.height,
          weight: formData.weight,
          years_training: formData.yearsTraining,
          claimed_status: formData.claimedStatus,
          description: formData.description,
          social_links: formData.socialLinks
        })
        .eq('id', influencer.id);
      if (error) throw error;

      // Save photos: delete all old, insert all new (simple approach)
      await supabase.from('influencer_photos').delete().eq('influencer_id', influencer.id);
      for (const photo of photos) {
        if (photo.image_url) {
          await supabase.from('influencer_photos').insert({
            influencer_id: influencer.id,
            image_url: photo.image_url,
            description: photo.description || null,
          });
        }
      }

      setIsEditing(false);
      toast({
        title: "Success",
        description: "Influencer updated successfully",
      });
    } catch (error) {
      console.error('Error updating influencer:', error);
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
          <Label htmlFor="image">Image</Label>
          <SecureImageUpload
            onImageUploaded={(url) => setFormData(prev => ({ ...prev, image: url }))}
            currentImage={formData.image}
            onImageRemoved={() => setFormData(prev => ({ ...prev, image: "" }))}
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

        {/* Multiple Photos Section */}
        <div>
          <Label>Influencer Photos</Label>
          <div className="space-y-4">
            {photos.map((photo, idx) => (
              <div key={photo.id || photo.image_url} className="flex items-center gap-4 mb-2">
                <img src={photo.image_url} alt="Influencer" className="w-20 h-20 object-cover rounded-lg border" />
                <Input
                  className="flex-1"
                  placeholder="Description (optional)"
                  value={photo.description}
                  onChange={e => handlePhotoDescriptionChange(idx, e.target.value)}
                  maxLength={80}
                />
                <Button variant="destructive" size="icon" onClick={() => handleRemovePhoto(idx)}>
                  &times;
                </Button>
              </div>
            ))}
            <SecureImageUpload
              onImageUploaded={handleAddPhoto}
              currentImage={undefined}
              onImageRemoved={() => {}}
            />
          </div>
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
