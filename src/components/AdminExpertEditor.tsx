import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import SecureImageUpload from '@/components/SecureImageUpload';

interface AdminExpertEditorProps {
  expert: any;
}

const AdminExpertEditor = ({ expert }: AdminExpertEditorProps) => {
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    bio: string;
    twitter: string;
    instagram: string;
    influencer_id: string;
    profile_picture_url?: string;
  }>({
    name: expert.name || '',
    email: expert.email || '',
    bio: expert.bio || '',
    twitter: expert.twitter || '',
    instagram: expert.instagram || '',
    influencer_id: expert.influencer_id || '',
    profile_picture_url: expert.profile_picture_url || '',
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const [influencers, setInfluencers] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    async function fetchInfluencers() {
      const { data } = await supabase.from('influencers').select('id, name').order('name');
      setInfluencers(data || []);
    }
    fetchInfluencers();
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from('experts').update(formData).eq('id', expert.id);
    setSaving(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Expert updated successfully' });
    }
  };

  const handleProfilePictureUpload = async (url: string) => {
    setFormData(prev => ({ ...prev, profile_picture_url: url }));
    const { error } = await supabase.from('experts').update({ profile_picture_url: url }).eq('id', expert.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Profile picture updated' });
    }
  };

  const handleRemoveProfilePicture = async () => {
    setFormData(prev => ({ ...prev, profile_picture_url: '' }));
    const { error } = await supabase.from('experts').update({ profile_picture_url: null }).eq('id', expert.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Profile picture removed' });
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Edit Expert Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Name</Label>
          <Input value={formData.name} onChange={e => handleChange('name', e.target.value)} />
        </div>
        <div>
          <Label>Email</Label>
          <Input value={formData.email} onChange={e => handleChange('email', e.target.value)} />
        </div>
        <div>
          <Label>Bio</Label>
          <Textarea value={formData.bio} onChange={e => handleChange('bio', e.target.value)} />
        </div>
        <div>
          <Label>Twitter</Label>
          <Input value={formData.twitter} onChange={e => handleChange('twitter', e.target.value)} placeholder="https://twitter.com/username" />
        </div>
        <div>
          <Label>Instagram</Label>
          <Input value={formData.instagram} onChange={e => handleChange('instagram', e.target.value)} placeholder="https://instagram.com/username" />
        </div>
        <div>
          <Label>Link to Influencer</Label>
          <select
            className="w-full border rounded px-2 py-1"
            value={formData.influencer_id || ''}
            onChange={e => handleChange('influencer_id', e.target.value)}
          >
            <option value="">-- None --</option>
            {influencers.map(inf => (
              <option key={inf.id} value={inf.id}>{inf.name}</option>
            ))}
          </select>
          {formData.influencer_id && (
            <div className="text-xs text-muted-foreground mt-1">
              Linked to: {influencers.find(i => i.id === formData.influencer_id)?.name || 'Unknown'}
            </div>
          )}
        </div>
        <div>
          <Label>Profile Picture</Label>
          <SecureImageUpload
            onImageUploaded={handleProfilePictureUpload}
            currentImage={formData.profile_picture_url}
            onImageRemoved={handleRemoveProfilePicture}
            allowedTypes={["image/jpeg", "image/png", "image/webp", "image/gif"]}
            maxSizeBytes={2 * 1024 * 1024}
          />
        </div>
        <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
      </CardContent>
    </Card>
  );
};

export default AdminExpertEditor; 