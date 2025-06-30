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
import { PhotoManagerModal } from './PhotoManagerModal';
import { InfluencerPhoto } from '@/types/vote';
import { useQueryClient } from '@tanstack/react-query';

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
  photos?: InfluencerPhoto[];
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
  const [photos, setPhotos] = useState<InfluencerPhoto[]>(influencer.photos || []);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoDesc, setNewPhotoDesc] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch latest photos on mount or influencer change
  useEffect(() => {
    setPhotos(influencer.photos || []);
  }, [influencer.photos]);

  // Add new photo
  const handleAddPhoto = async () => {
    if (!newPhotoUrl) return;
    setUploadingPhoto(true);
    const { data, error } = await supabase.from('influencer_photos').insert({
      influencer_id: influencer.id,
      image_url: newPhotoUrl,
      description: newPhotoDesc,
      order: photos.length
    }).select();
    setUploadingPhoto(false);
    console.log('Add photo result:', { data, error });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    setPhotos([...photos, ...(data || [])]);
    setNewPhotoUrl('');
    setNewPhotoDesc('');
    queryClient.invalidateQueries({ queryKey: ['influencer', influencer.id] });
  };

  // Delete photo
  const handleDeletePhoto = async (photoId: string) => {
    const { error } = await supabase.from('influencer_photos').delete().eq('id', photoId);
    if (error) return toast({ title: 'Error', description: error.message, variant: 'destructive' });
    setPhotos(photos.filter(p => p.id !== photoId));
    queryClient.invalidateQueries({ queryKey: ['influencer', influencer.id] });
  };

  // Update description
  const handleUpdateDesc = async (photoId: string, desc: string) => {
    const { error } = await supabase.from('influencer_photos').update({ description: desc }).eq('id', photoId);
    if (error) return toast({ title: 'Error', description: error.message, variant: 'destructive' });
    setPhotos(photos.map(p => p.id === photoId ? { ...p, description: desc } : p));
    queryClient.invalidateQueries({ queryKey: ['influencer', influencer.id] });
  };

  // Reorder photos
  const handleMovePhoto = async (from: number, to: number) => {
    if (to < 0 || to >= photos.length) return;
    const reordered = [...photos];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    // Update order in DB
    await Promise.all(reordered.map((p, i) =>
      supabase.from('influencer_photos').update({ order: i }).eq('id', p.id)
    ));
    setPhotos(reordered);
    queryClient.invalidateQueries({ queryKey: ['influencer', influencer.id] });
  };

  const handleSave = async () => {
    try {
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
      <CardContent className="space-y-8">
        {/* Main Profile Picture Section */}
        <div>
          <h3 className="text-xl font-semibold mb-2">Main Profile Picture</h3>
          <p className="text-muted-foreground mb-4 text-sm">This image is shown as the influencer's main profile picture on the main page and profile cards.</p>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-center">
              <img
                src={formData.image || '/placeholder.svg'}
                alt="Main profile"
                className="w-32 h-32 object-cover rounded-xl border shadow"
              />
            </div>
            <div className="flex flex-col gap-2">
              <SecureImageUpload
                onImageUploaded={(url) => setFormData(prev => ({ ...prev, image: url }))}
                currentImage={formData.image}
                onImageRemoved={() => setFormData(prev => ({ ...prev, image: "" }))}
              />
              <div className="flex flex-col gap-2 mt-2">
                <Button
                  onClick={async () => {
                    const { error } = await supabase
                      .from('influencers')
                      .update({ image: formData.image })
                      .eq('id', influencer.id);
                    if (error) {
                      toast({ title: "Error", description: error.message, variant: "destructive" });
                    } else {
                      toast({ title: "Success", description: "Main image updated!" });
                      queryClient.invalidateQueries({ queryKey: ['influencer', influencer.id] });
                    }
                  }}
                  disabled={!formData.image || formData.image === influencer.image}
                  className="w-full"
                >
                  Save Main Image
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    setFormData(prev => ({ ...prev, image: "" }));
                    await supabase.from('influencers').update({ image: null }).eq('id', influencer.id);
                    toast({ title: "Main image removed" });
                    queryClient.invalidateQueries({ queryKey: ['influencer', influencer.id] });
                  }}
                  disabled={!formData.image}
                  className="w-full"
                >
                  Remove Main Image
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Photo Gallery Section - Now with proper UX modal */}
        <PhotoManagerModal
          photos={photos}
          onUpdateDescription={handleUpdateDesc}
          onDeletePhoto={handleDeletePhoto}
          onMovePhoto={handleMovePhoto}
          onAddPhoto={handleAddPhoto}
          newPhotoUrl={newPhotoUrl}
          newPhotoDescription={newPhotoDesc}
          onNewPhotoUrlChange={setNewPhotoUrl}
          onNewPhotoDescriptionChange={setNewPhotoDesc}
          onImageRemoved={() => setNewPhotoUrl('')}
          isUploading={uploadingPhoto}
          maxPhotos={3}
        />

        {/* Other influencer fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
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
          <div className="col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
            />
          </div>
          {/* Social links */}
          <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div>
              <Label htmlFor="twitter">Twitter URL</Label>
              <Input
                id="twitter"
                value={formData.socialLinks?.twitter || ''}
                onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="website">Website URL</Label>
              <Input
                id="website"
                value={formData.socialLinks?.website || ''}
                onChange={(e) => handleSocialLinkChange('website', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-8">
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
