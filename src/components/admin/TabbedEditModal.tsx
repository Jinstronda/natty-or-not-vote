import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X, User, BarChart3, Image, Share2, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InfluencerEditData {
  id: string;
  name: string;
  description?: string;
  claimed_status?: string;
  controversial?: boolean;
  height?: string;
  weight?: string;
  years_training?: string;
  image?: string;
  instagram_url?: string;
  youtube_url?: string;
  tiktok_url?: string;
  twitter_url?: string;
  website_url?: string;
}

interface TabbedEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  influencer: InfluencerEditData;
  onSave: (data: InfluencerEditData) => void;
  isLoading: boolean;
}

export function TabbedEditModal({
  isOpen,
  onClose,
  influencer,
  onSave,
  isLoading
}: TabbedEditModalProps) {
  const [editingData, setEditingData] = useState<InfluencerEditData>(influencer);
  const [activeTab, setActiveTab] = useState('basic');

  const handleSave = () => {
    onSave(editingData);
  };

  const updateField = (field: keyof InfluencerEditData, value: string | boolean) => {
    setEditingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const tabs = [
    {
      id: 'basic',
      label: 'Basic Info',
      icon: User,
      description: 'Name, description, status'
    },
    {
      id: 'stats',
      label: 'Physical Stats',
      icon: BarChart3,
      description: 'Height, weight, training'
    },
    {
      id: 'photos',
      label: 'Photos',
      icon: Image,
      description: 'Profile image'
    },
    {
      id: 'social',
      label: 'Social Media',
      icon: Share2,
      description: 'Social media links'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">
                Edit {influencer.name}
              </DialogTitle>
              <p className="text-muted-foreground mt-1">
                Update influencer information across organized sections
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex flex-col items-center gap-1 p-3"
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs font-medium">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-semibold">
                    Name *
                  </Label>
                  <Input
                    id="name"
                    value={editingData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="Influencer name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="status" className="text-sm font-semibold">
                    Claimed Status
                  </Label>
                  <Select
                    value={editingData.claimed_status || 'unclaimed'}
                    onValueChange={(value) => updateField('claimed_status', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unclaimed">Unclaimed</SelectItem>
                      <SelectItem value="natural">Claims Natty</SelectItem>
                      <SelectItem value="enhanced">Claims Juicy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="controversial"
                    checked={editingData.controversial || false}
                    onCheckedChange={(checked) => updateField('controversial', checked as boolean)}
                  />
                  <Label htmlFor="controversial" className="text-sm font-semibold">
                    Mark as controversial
                  </Label>
                  {editingData.controversial && (
                    <Badge variant="destructive" className="ml-2">
                      🔥 Controversial
                    </Badge>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-semibold">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={editingData.description || ''}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Brief description about the influencer..."
                  rows={6}
                  className="mt-1"
                />
              </div>
            </div>
          </TabsContent>

          {/* Physical Stats Tab */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="height" className="text-sm font-semibold">
                  Height
                </Label>
                <Input
                  id="height"
                  value={editingData.height || ''}
                  onChange={(e) => updateField('height', e.target.value)}
                  placeholder="e.g., 6'2&quot; or 188cm"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="weight" className="text-sm font-semibold">
                  Weight
                </Label>
                <Input
                  id="weight"
                  value={editingData.weight || ''}
                  onChange={(e) => updateField('weight', e.target.value)}
                  placeholder="e.g., 190 lbs or 86kg"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="years_training" className="text-sm font-semibold">
                  Years Training
                </Label>
                <Input
                  id="years_training"
                  value={editingData.years_training || ''}
                  onChange={(e) => updateField('years_training', e.target.value)}
                  placeholder="e.g., 5"
                  className="mt-1"
                />
              </div>
            </div>
          </TabsContent>

          {/* Photos Tab */}
          <TabsContent value="photos" className="space-y-6">
            <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
              <Image className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Photo Upload</h3>
              <p className="text-muted-foreground mb-4">
                Upload or update influencer profile photo
              </p>
              <Button variant="outline">
                Choose Image
              </Button>
              {editingData.image && (
                <div className="mt-4">
                  <img
                    src={editingData.image}
                    alt="Current"
                    className="max-w-xs mx-auto rounded-lg"
                  />
                </div>
              )}
            </div>
          </TabsContent>

          {/* Social Media Tab */}
          <TabsContent value="social" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="instagram" className="text-sm font-semibold">
                  Instagram
                </Label>
                <Input
                  id="instagram"
                  value={editingData.instagram_url || ''}
                  onChange={(e) => updateField('instagram_url', e.target.value)}
                  placeholder="@username or full URL"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="youtube" className="text-sm font-semibold">
                  YouTube
                </Label>
                <Input
                  id="youtube"
                  value={editingData.youtube_url || ''}
                  onChange={(e) => updateField('youtube_url', e.target.value)}
                  placeholder="Channel URL or name"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="tiktok" className="text-sm font-semibold">
                  TikTok
                </Label>
                <Input
                  id="tiktok"
                  value={editingData.tiktok_url || ''}
                  onChange={(e) => updateField('tiktok_url', e.target.value)}
                  placeholder="@username or full URL"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="twitter" className="text-sm font-semibold">
                  Twitter/X
                </Label>
                <Input
                  id="twitter"
                  value={editingData.twitter_url || ''}
                  onChange={(e) => updateField('twitter_url', e.target.value)}
                  placeholder="@username or full URL"
                  className="mt-1"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="website" className="text-sm font-semibold">
                  Website
                </Label>
                <Input
                  id="website"
                  value={editingData.website_url || ''}
                  onChange={(e) => updateField('website_url', e.target.value)}
                  placeholder="https://website.com"
                  className="mt-1"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-6 border-t">
          <div className="text-sm text-muted-foreground">
            {tabs.find(t => t.id === activeTab)?.description}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading} className="min-w-24">
              {isLoading ? (
                "Saving..."
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 