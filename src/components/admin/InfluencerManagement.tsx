import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Trash2, Edit, Plus, Users, Link, Instagram, Youtube, Music, Loader2 } from "lucide-react";
import SecureImageUpload from "@/components/SecureImageUpload";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SocialLinks {
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  twitter?: string;
  website?: string;
}

interface Influencer {
  id: string;
  name: string;
  image: string;
  height?: string;
  weight?: string;
  years_training?: string;
  claimed_status?: string;
  description?: string;
  social_links?: SocialLinks;
}

interface DatabaseInfluencer {
  id: string;
  name: string;
  image: string | null;
  height?: string | null;
  weight?: string | null;
  years_training?: string | null;
  claimed_status?: string | null;
  description?: string | null;
  social_links?: any;
  created_at: string;
  updated_at: string;
}

// Google Custom Search API integration
const GOOGLE_CX = import.meta.env.VITE_GOOGLE_CX;
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
async function fetchImagesForInfluencer(name: string): Promise<string[]> {
  try {
    const params = new URLSearchParams({
      key: GOOGLE_API_KEY,
      cx: GOOGLE_CX,
      q: name,
      searchType: 'image',
      num: '3',
      safe: 'active',
    });
    const res = await fetch(`https://www.googleapis.com/customsearch/v1?${params.toString()}`);
    if (!res.ok) throw new Error('Google API error');
    const data = await res.json();
    if (!data.items || !Array.isArray(data.items)) throw new Error('No images found');
    return data.items.map((item: any) => item.link).slice(0, 3);
  } catch (err) {
    // Fallback to placeholder images
    return [1, 2, 3].map(i => `https://via.placeholder.com/400x400?text=${encodeURIComponent(name)}+${i}`);
  }
}

const InfluencerManagement = () => {
  const queryClient = useQueryClient();

  const { data: influencers = [] } = useQuery({
    queryKey: ['admin-influencers'],
    queryFn: async (): Promise<Influencer[]> => {
      const { data, error } = await supabase
        .from('influencers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map((item: DatabaseInfluencer): Influencer => ({
        id: item.id,
        name: item.name,
        image: item.image || '/placeholder.svg',
        height: item.height || undefined,
        weight: item.weight || undefined,
        years_training: item.years_training || undefined,
        claimed_status: item.claimed_status || undefined,
        description: item.description || undefined,
        social_links: (item.social_links as SocialLinks) || {}
      }));
    }
  });

  const [newInfluencer, setNewInfluencer] = useState<Omit<Influencer, 'id'>>({
    name: '',
    image: '/placeholder.svg',
    height: '',
    weight: '',
    years_training: '',
    claimed_status: 'unclaimed',
    description: '',
    social_links: {}
  });

  const [editingInfluencer, setEditingInfluencer] = useState<Influencer | null>(null);
  const [fetchingImages, setFetchingImages] = useState(false);

  const addInfluencerMutation = useMutation({
    mutationFn: async (influencer: Omit<Influencer, 'id'>) => {
      const { error } = await supabase
        .from('influencers')
        .insert({
          name: influencer.name,
          image: influencer.image,
          height: influencer.height || null,
          weight: influencer.weight || null,
          years_training: influencer.years_training || null,
          claimed_status: influencer.claimed_status || null,
          description: influencer.description || null,
          social_links: influencer.social_links as any
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-influencers'] });
      queryClient.invalidateQueries({ queryKey: ['influencers'] });
    }
  });

  const updateInfluencerMutation = useMutation({
    mutationFn: async (influencer: Influencer) => {
      const { error } = await supabase
        .from('influencers')
        .update({
          name: influencer.name,
          image: influencer.image,
          height: influencer.height || null,
          weight: influencer.weight || null,
          years_training: influencer.years_training || null,
          claimed_status: influencer.claimed_status || null,
          description: influencer.description || null,
          social_links: influencer.social_links as any
        })
        .eq('id', influencer.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-influencers'] });
      queryClient.invalidateQueries({ queryKey: ['influencers'] });
    }
  });

  const deleteInfluencerMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('influencers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-influencers'] });
      queryClient.invalidateQueries({ queryKey: ['influencers'] });
    }
  });

  const handleCreateInfluencer = async () => {
    if (!newInfluencer.name.trim()) {
      toast({
        title: "Error",
        description: "Influencer name is required.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addInfluencerMutation.mutateAsync(newInfluencer);
      setNewInfluencer({
        name: '',
        image: '/placeholder.svg',
        height: '',
        weight: '',
        years_training: '',
        claimed_status: 'unclaimed',
        description: '',
        social_links: {}
      });
      
      toast({
        title: "Success",
        description: "Influencer created successfully.",
      });
    } catch (error) {
      console.error('Error creating influencer:', error);
      toast({
        title: "Error",
        description: "Failed to create influencer.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteInfluencer = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}? This will also delete all associated votes and reviews.`)) {
      try {
        await deleteInfluencerMutation.mutateAsync(id);
        toast({
          title: "Deleted",
          description: `${name} has been removed.`,
        });
      } catch (error) {
        console.error('Error deleting influencer:', error);
        toast({
          title: "Error",
          description: "Failed to delete influencer.",
          variant: "destructive",
        });
      }
    }
  };

  const handleUpdateInfluencer = async () => {
    if (!editingInfluencer) return;
    
    try {
      await updateInfluencerMutation.mutateAsync(editingInfluencer);
      setEditingInfluencer(null);
      
      toast({
        title: "Success",
        description: "Influencer updated successfully.",
      });
    } catch (error) {
      console.error('Error updating influencer:', error);
      toast({
        title: "Error",
        description: "Failed to update influencer.",
        variant: "destructive",
      });
    }
  };

  const updateSocialLink = (platform: keyof SocialLinks, value: string, isEditing = false) => {
    if (isEditing && editingInfluencer) {
      setEditingInfluencer({
        ...editingInfluencer,
        social_links: {
          ...editingInfluencer.social_links,
          [platform]: value
        }
      });
    } else {
      setNewInfluencer({
        ...newInfluencer,
        social_links: {
          ...newInfluencer.social_links,
          [platform]: value
        }
      });
    }
  };

  const SocialLinksForm = ({ 
    socialLinks, 
    onUpdate, 
    isEditing = false 
  }: { 
    socialLinks: SocialLinks, 
    onUpdate: (platform: keyof SocialLinks, value: string) => void,
    isEditing?: boolean 
  }) => (
    <div className="space-y-4">
      <Label className="text-sm font-medium flex items-center gap-2">
        <Link className="h-4 w-4" />
        Social Media Links
      </Label>
      <div className="grid grid-cols-1 gap-3">
        <div className="flex items-center gap-2">
          <Instagram className="h-4 w-4 text-pink-500" />
          <Input
            placeholder="Instagram URL or @username"
            value={socialLinks.instagram || ''}
            onChange={(e) => onUpdate('instagram', e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Youtube className="h-4 w-4 text-red-500" />
          <Input
            placeholder="YouTube URL or channel name"
            value={socialLinks.youtube || ''}
            onChange={(e) => onUpdate('youtube', e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Music className="h-4 w-4 text-black" />
          <Input
            placeholder="TikTok URL or @username"
            value={socialLinks.tiktok || ''}
            onChange={(e) => onUpdate('tiktok', e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Link className="h-4 w-4 text-blue-500" />
          <Input
            placeholder="Twitter/X URL or @username"
            value={socialLinks.twitter || ''}
            onChange={(e) => onUpdate('twitter', e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Link className="h-4 w-4 text-gray-500" />
          <Input
            placeholder="Website URL"
            value={socialLinks.website || ''}
            onChange={(e) => onUpdate('website', e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const getClaimedStatusColor = (status: string) => {
    switch (status) {
      case 'claimed': return 'bg-green-100 text-green-800';
      case 'verified': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Fetch and add images for influencers without photos
  const handleFetchImagesForMissing = async () => {
    setFetchingImages(true);
    try {
      // 1. Get all influencers
      const { data: allInfluencers, error: infError } = await supabase
        .from('influencers')
        .select('id, name');
      if (infError) throw infError;
      // 2. For each, check if they have photos
      let updatedCount = 0;
      for (const inf of allInfluencers) {
        const { data: photos, error: photoError } = await supabase
          .from('influencer_photos')
          .select('id')
          .eq('influencer_id', inf.id);
        if (photoError) continue;
        if (!photos || photos.length === 0) {
          // 3. Fetch 3 images (placeholder for now)
          const images = await fetchImagesForInfluencer(inf.name);
          // 4. Set the first image as the influencer's main image
          if (images[0]) {
            await supabase.from('influencers').update({ image: images[0] }).eq('id', inf.id);
          }
          // 5. Insert all images into influencer_photos
          for (let i = 0; i < images.length; i++) {
            await supabase.from('influencer_photos').insert({
              influencer_id: inf.id,
              image_url: images[i],
              description: `Auto-fetched image for ${inf.name}`,
              order: i
            });
          }
          updatedCount++;
        }
      }
      toast({
        title: 'Image Fetch Complete',
        description: `Added images for ${updatedCount} influencer(s) without photos.`,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-influencers'] });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch or add images.',
        variant: 'destructive',
      });
    } finally {
      setFetchingImages(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <Button onClick={handleFetchImagesForMissing} disabled={fetchingImages} variant="outline">
          {fetchingImages && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
          Fetch Images for Influencers Without Photos
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Influencer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <SecureImageUpload
            onImageUploaded={(url) => setNewInfluencer({...newInfluencer, image: url})}
            currentImage={newInfluencer.image === '/placeholder.svg' ? undefined : newInfluencer.image}
            onImageRemoved={() => setNewInfluencer({...newInfluencer, image: '/placeholder.svg'})}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
            <Input
                id="name"
                placeholder="Full Name"
              value={newInfluencer.name}
              onChange={(e) => setNewInfluencer({...newInfluencer, name: e.target.value})}
            />
            </div>
            <div className="space-y-2">
              <Label htmlFor="claimed-status">Claimed Status</Label>
              <Select
                value={newInfluencer.claimed_status}
                onValueChange={(value) => setNewInfluencer({...newInfluencer, claimed_status: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unclaimed">Unclaimed</SelectItem>
                  <SelectItem value="claimed">Claimed</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height</Label>
            <Input
                id="height"
                placeholder="e.g., 5'10&quot; or 178cm"
              value={newInfluencer.height}
              onChange={(e) => setNewInfluencer({...newInfluencer, height: e.target.value})}
            />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight</Label>
            <Input
                id="weight"
                placeholder="e.g., 180 lbs or 82kg"
              value={newInfluencer.weight}
              onChange={(e) => setNewInfluencer({...newInfluencer, weight: e.target.value})}
            />
            </div>
            <div className="space-y-2">
              <Label htmlFor="years">Years Training</Label>
            <Input
                id="years"
                placeholder="e.g., 5 years"
              value={newInfluencer.years_training}
              onChange={(e) => setNewInfluencer({...newInfluencer, years_training: e.target.value})}
            />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description about the influencer..."
              value={newInfluencer.description}
              onChange={(e) => setNewInfluencer({...newInfluencer, description: e.target.value})}
              rows={3}
            />
          </div>

          <SocialLinksForm
            socialLinks={newInfluencer.social_links || {}}
            onUpdate={(platform, value) => updateSocialLink(platform, value)}
          />
          
          <Button 
            onClick={handleCreateInfluencer}
            disabled={addInfluencerMutation.isPending}
            className="w-full"
          >
            {addInfluencerMutation.isPending ? 'Creating...' : 'Create Influencer'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manage Influencers ({influencers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {influencers.map((influencer) => (
              <div key={influencer.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-4">
                  <img 
                    src={influencer.image || '/placeholder.svg'} 
                    alt={influencer.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{influencer.name}</h3>
                      <Badge className={getClaimedStatusColor(influencer.claimed_status || 'unclaimed')}>
                        {influencer.claimed_status || 'unclaimed'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{influencer.description}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      {influencer.height && <span>H: {influencer.height}</span>}
                      {influencer.weight && <span>W: {influencer.weight}</span>}
                      {influencer.years_training && <span>Training: {influencer.years_training}</span>}
                    </div>
                    {influencer.social_links && Object.values(influencer.social_links).some(link => link) && (
                      <div className="flex items-center gap-1 mt-1">
                        {influencer.social_links.instagram && <Instagram className="h-3 w-3 text-pink-500" />}
                        {influencer.social_links.youtube && <Youtube className="h-3 w-3 text-red-500" />}
                        {influencer.social_links.tiktok && <Music className="h-3 w-3 text-black" />}
                        {influencer.social_links.twitter && <Link className="h-3 w-3 text-blue-500" />}
                        {influencer.social_links.website && <Link className="h-3 w-3 text-gray-500" />}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setEditingInfluencer({...influencer})}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                      <SheetHeader>
                        <SheetTitle>Edit {influencer.name}</SheetTitle>
                      </SheetHeader>
                      {editingInfluencer && (
                        <div className="space-y-6 mt-6">
                          <SecureImageUpload
                            onImageUploaded={(url) => setEditingInfluencer({...editingInfluencer, image: url})}
                            currentImage={editingInfluencer.image === '/placeholder.svg' ? undefined : editingInfluencer.image}
                            onImageRemoved={() => setEditingInfluencer({...editingInfluencer, image: '/placeholder.svg'})}
                          />
                          
                          <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-name">Name</Label>
                          <Input
                                id="edit-name"
                            placeholder="Name"
                            value={editingInfluencer.name}
                            onChange={(e) => setEditingInfluencer({...editingInfluencer, name: e.target.value})}
                          />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-status">Claimed Status</Label>
                              <Select
                                value={editingInfluencer.claimed_status || 'unclaimed'}
                                onValueChange={(value) => setEditingInfluencer({...editingInfluencer, claimed_status: value})}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="unclaimed">Unclaimed</SelectItem>
                                  <SelectItem value="claimed">Claimed</SelectItem>
                                  <SelectItem value="verified">Verified</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-height">Height</Label>
                          <Input
                                id="edit-height"
                            placeholder="Height"
                            value={editingInfluencer.height || ''}
                            onChange={(e) => setEditingInfluencer({...editingInfluencer, height: e.target.value})}
                          />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-weight">Weight</Label>
                          <Input
                                id="edit-weight"
                            placeholder="Weight"
                            value={editingInfluencer.weight || ''}
                            onChange={(e) => setEditingInfluencer({...editingInfluencer, weight: e.target.value})}
                          />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-years">Years Training</Label>
                          <Input
                                id="edit-years"
                            placeholder="Years Training"
                            value={editingInfluencer.years_training || ''}
                            onChange={(e) => setEditingInfluencer({...editingInfluencer, years_training: e.target.value})}
                          />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-description">Description</Label>
                          <Textarea
                                id="edit-description"
                            placeholder="Description"
                            value={editingInfluencer.description || ''}
                            onChange={(e) => setEditingInfluencer({...editingInfluencer, description: e.target.value})}
                                rows={3}
                              />
                            </div>
                          </div>

                          <SocialLinksForm
                            socialLinks={editingInfluencer.social_links || {}}
                            onUpdate={(platform, value) => updateSocialLink(platform, value, true)}
                            isEditing={true}
                          />
                          
                          <Button 
                            onClick={handleUpdateInfluencer} 
                            className="w-full"
                            disabled={updateInfluencerMutation.isPending}
                          >
                            {updateInfluencerMutation.isPending ? 'Saving...' : 'Save Changes'}
                          </Button>
                        </div>
                      )}
                    </SheetContent>
                  </Sheet>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDeleteInfluencer(influencer.id, influencer.name)}
                    disabled={deleteInfluencerMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {influencers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No influencers yet. Add your first influencer above!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InfluencerManagement;
