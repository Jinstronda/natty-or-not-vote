import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AdminExpertEditorProps {
  expert: any;
}

const AdminExpertEditor = ({ expert }: AdminExpertEditorProps) => {
  const [formData, setFormData] = useState({
    name: expert.name || '',
    email: expert.email || '',
    bio: expert.bio || '',
    twitter: expert.twitter || '',
    instagram: expert.instagram || '',
    influencer_id: expert.influencer_id || '',
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

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
          <Label>Influencer ID</Label>
          <Input value={formData.influencer_id} onChange={e => handleChange('influencer_id', e.target.value)} placeholder="(optional)" />
        </div>
        <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
      </CardContent>
    </Card>
  );
};

export default AdminExpertEditor; 