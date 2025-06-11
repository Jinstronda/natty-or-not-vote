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
import InfluencerPhotoGallery from './InfluencerPhotoGallery';
import { InfluencerPhoto } from '@/types/vote';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

// Sortable photo card component
function SortablePhotoCard({ photo, idx, listeners, attributes, isDragging, style, ...props }: any) {
  return (
    <div
      className={`relative rounded-lg overflow-hidden border bg-secondary transition-shadow ${isDragging ? 'ring-2 ring-primary shadow-xl opacity-80' : ''}`}
      style={style}
      {...attributes}
      {...listeners}
      {...props}
    >
      <img src={photo.image_url} alt="" className="w-full h-40 object-cover select-none" draggable={false} />
      <input
        className="absolute bottom-2 left-2 right-10 bg-black/60 text-white text-xs rounded px-2 py-1"
        value={photo.description}
        onChange={e => props.onUpdateDesc(photo.id, e.target.value)}
        placeholder="Description"
        style={{ minWidth: 0 }}
      />
      <button
        className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1"
        onClick={() => props.onDeletePhoto(photo.id)}
        type="button"
        title="Delete photo"
      >
        ×
      </button>
      <div className="absolute bottom-2 right-2 flex gap-1">
        <button
          className="bg-black/40 text-white rounded-full px-2 py-0.5 text-xs"
          onClick={() => props.onMovePhoto(idx, idx - 1)}
          disabled={idx === 0}
          type="button"
        >↑</button>
        <button
          className="bg-black/40 text-white rounded-full px-2 py-0.5 text-xs"
          onClick={() => props.onMovePhoto(idx, idx + 1)}
          disabled={idx === props.photosLength - 1}
          type="button"
        >↓</button>
      </div>
      <div className="absolute top-2 left-2 cursor-grab text-white bg-black/40 rounded-full px-2 py-0.5 text-xs select-none" title="Drag to reorder">
        ≡
      </div>
    </div>
  );
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
    if (error) return toast({ title: 'Error', description: error.message, variant: 'destructive' });
    setPhotos([...photos, ...(data || [])]);
    setNewPhotoUrl('');
    setNewPhotoDesc('');
  };

  // Delete photo
  const handleDeletePhoto = async (photoId: string) => {
    const { error } = await supabase.from('influencer_photos').delete().eq('id', photoId);
    if (error) return toast({ title: 'Error', description: error.message, variant: 'destructive' });
    setPhotos(photos.filter(p => p.id !== photoId));
  };

  // Update description
  const handleUpdateDesc = async (photoId: string, desc: string) => {
    const { error } = await supabase.from('influencer_photos').update({ description: desc }).eq('id', photoId);
    if (error) return toast({ title: 'Error', description: error.message, variant: 'destructive' });
    setPhotos(photos.map(p => p.id === photoId ? { ...p, description: desc } : p));
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

        <div className="mt-8">
          <h3 className="font-semibold mb-2">Photos</h3>
          <DndContext
            sensors={useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))}
            collisionDetection={closestCenter}
            onDragEnd={async (event) => {
              const { active, over } = event;
              if (!over || active.id === over.id) return;
              const oldIndex = photos.findIndex(p => p.id === active.id);
              const newIndex = photos.findIndex(p => p.id === over.id);
              if (oldIndex === -1 || newIndex === -1) return;
              const reordered = arrayMove(photos, oldIndex, newIndex);
              setPhotos(reordered);
              // Persist order to DB
              await Promise.all(reordered.map((p, i) =>
                supabase.from('influencer_photos').update({ order: i }).eq('id', p.id)
              ));
            }}
          >
            <SortableContext items={photos.map(p => p.id)} strategy={verticalListSortingStrategy}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {photos.map((photo, idx) => {
                  const sortable = useSortable({ id: photo.id });
                  return (
                    <SortablePhotoCard
                      key={photo.id}
                      photo={photo}
                      idx={idx}
                      photosLength={photos.length}
                      onUpdateDesc={handleUpdateDesc}
                      onDeletePhoto={handleDeletePhoto}
                      onMovePhoto={handleMovePhoto}
                      // dnd-kit props
                      ref={sortable.setNodeRef}
                      listeners={sortable.listeners}
                      attributes={sortable.attributes}
                      isDragging={sortable.isDragging}
                      style={{ ...sortable.transform ? { transform: CSS.Transform.toString(sortable.transform) } : {}, ...sortable.transition ? { transition: sortable.transition } : {} }}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
          <div className="flex flex-col md:flex-row gap-2 mt-4 items-end">
            <SecureImageUpload
              onImageUploaded={setNewPhotoUrl}
              currentImage={newPhotoUrl || undefined}
              onImageRemoved={() => setNewPhotoUrl('')}
            />
            <input
              className="flex-1 border rounded px-2 py-1 text-xs"
              value={newPhotoDesc}
              onChange={e => setNewPhotoDesc(e.target.value)}
              placeholder="Description (optional)"
            />
            <Button onClick={handleAddPhoto} disabled={!newPhotoUrl || uploadingPhoto}>
              Add Photo
            </Button>
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
