import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Check, X, UserPlus, Edit, Instagram, Youtube, Music, Link } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SecureImageUpload from "@/components/SecureImageUpload";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface SocialLinks {
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  twitter?: string;
  website?: string;
}

interface EnhancedInfluencer {
  name: string;
  image: string;
  height?: string;
  weight?: string;
  years_training?: string;
  claimed_status: string;
  description?: string;
  social_links: SocialLinks;
}

const SuggestionManagement = () => {
  const queryClient = useQueryClient();
  const [editingSuggestion, setEditingSuggestion] = useState<any>(null);
  const [enhancedData, setEnhancedData] = useState<EnhancedInfluencer>({
    name: '',
    image: '/placeholder.svg',
    height: '',
    weight: '',
    years_training: '',
    claimed_status: 'unclaimed',
    description: '',
    social_links: {}
  });
  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

  const { data: suggestions = [] } = useQuery({
    queryKey: ['admin-suggestions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('influencer_suggestions')
        .select('*')
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const updateSuggestionMutation = useMutation({
    mutationFn: async ({ suggestionId, status }: { suggestionId: string, status: string }) => {
      const { error } = await supabase
        .from('influencer_suggestions')
        .update({ status })
        .eq('id', suggestionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-suggestions'] });
    }
  });

  const addInfluencerMutation = useMutation({
    mutationFn: async (influencerData: EnhancedInfluencer) => {
      const { error } = await supabase
        .from('influencers')
        .insert({
          name: influencerData.name,
          image: influencerData.image,
          height: influencerData.height || null,
          weight: influencerData.weight || null,
          years_training: influencerData.years_training || null,
          claimed_status: influencerData.claimed_status,
          description: influencerData.description || null,
          social_links: influencerData.social_links as any
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['influencers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-influencers'] });
    }
  });

  const handleQuickReject = async (suggestionId: string) => {
    try {
      await updateSuggestionMutation.mutateAsync({ suggestionId, status: 'rejected' });
      toast({
        title: "Rejected",
        description: "Suggestion has been rejected.",
      });
    } catch (error) {
      console.error('Error rejecting suggestion:', error);
      toast({
        title: "Error",
        description: "Failed to reject suggestion.",
        variant: "destructive",
      });
    }
  };

  const handleQuickApprove = async (suggestion: any) => {
    try {
      const basicInfluencer: EnhancedInfluencer = {
        name: suggestion.influencer_name,
        image: suggestion.image_url || '/placeholder.svg',
        claimed_status: 'unclaimed',
        description: `Suggested by community`,
        social_links: (suggestion.social_links as SocialLinks) || {}
      };

      await addInfluencerMutation.mutateAsync(basicInfluencer);
      await updateSuggestionMutation.mutateAsync({ 
        suggestionId: suggestion.id, 
        status: 'approved' 
      });
      
      toast({
        title: "Approved & Added",
        description: `${suggestion.influencer_name} has been added to the platform.`,
      });
    } catch (error) {
      console.error('Error approving suggestion:', error);
      toast({
        title: "Error",
        description: "Failed to approve suggestion.",
        variant: "destructive",
      });
    }
  };

  const handleAdvancedApprove = async () => {
    if (!editingSuggestion) return;
    
    try {
      await addInfluencerMutation.mutateAsync(enhancedData);
      await updateSuggestionMutation.mutateAsync({ 
        suggestionId: editingSuggestion.id, 
        status: 'approved' 
      });
      
      toast({
        title: "Success",
        description: `${enhancedData.name} has been added with enhanced details.`,
      });

      setEditingSuggestion(null);
      setEnhancedData({
        name: '',
        image: '/placeholder.svg',
        height: '',
        weight: '',
        years_training: '',
        claimed_status: 'unclaimed',
        description: '',
        social_links: {}
      });
    } catch (error) {
      console.error('Error with advanced approval:', error);
      toast({
        title: "Error",
        description: "Failed to approve with enhanced details.",
        variant: "destructive",
      });
    }
  };

  const openAdvancedApproval = (suggestion: any) => {
    setEditingSuggestion(suggestion);
    setEnhancedData({
      name: suggestion.influencer_name,
      image: suggestion.image_url || '/placeholder.svg',
      height: '',
      weight: '',
      years_training: '',
      claimed_status: 'unclaimed',
      description: `Suggested by community`,
      social_links: (suggestion.social_links as SocialLinks) || {}
    });
  };

  const updateSocialLink = (platform: keyof SocialLinks, value: string) => {
    setEnhancedData({
      ...enhancedData,
      social_links: {
        ...enhancedData.social_links,
        [platform]: value
      }
    });
  };

  const SocialLinksForm = ({ 
    socialLinks, 
    onUpdate 
  }: { 
    socialLinks: SocialLinks, 
    onUpdate: (platform: keyof SocialLinks, value: string) => void
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

  const filteredSuggestions = suggestions.filter((s: any) => (tab === 'pending' ? s.status === 'pending' : tab === 'approved' ? s.status === 'approved' : s.status === 'rejected'));

  // Update statusColors for left border: purple for 'juicy' (rejected), green for 'natty' (approved), gray for pending
  const statusColors = {
    pending: 'border-gray-300',
    approved: 'border-green-500', // natty
    rejected: 'border-fuchsia-700', // juicy (purple)
  };
  const badgeColors = {
    pending: 'bg-gray-200 text-gray-700',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-fuchsia-100 text-fuchsia-800',
  };
  // Button colors remain as before, no cross-coloring
  const buttonColors = {
    approve: 'bg-green-600 hover:bg-green-700 text-white', // natty
    reject: 'bg-fuchsia-600 hover:bg-fuchsia-700 text-white', // juicy
    advanced: 'border-fuchsia-500 text-fuchsia-700 hover:bg-fuchsia-50',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Influencer Submissions</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={(value) => setTab(value as 'pending' | 'approved' | 'rejected')} className="w-full">
          <TabsList className="mb-4 flex gap-2">
            <TabsTrigger value="pending" className={tab === 'pending' ? 'font-bold text-green-700 border-b-2 border-green-500' : ''}>Pending</TabsTrigger>
            <TabsTrigger value="approved" className={tab === 'approved' ? 'font-bold text-green-700 border-b-2 border-green-500' : ''}>Approved</TabsTrigger>
            <TabsTrigger value="rejected" className={tab === 'rejected' ? 'font-bold text-fuchsia-700 border-b-2 border-fuchsia-500' : ''}>Rejected</TabsTrigger>
          </TabsList>
          <TabsContent value={tab} className="space-y-6">
            {filteredSuggestions.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">No submissions in this category.</div>
            ) : (
              filteredSuggestions.map((suggestion: any) => (
                <Card key={suggestion.id} className={`flex flex-col md:flex-row items-center md:items-start gap-4 p-6 rounded-2xl shadow-md border-l-8 ${statusColors[suggestion.status]}`}>
                  <img
                    src={suggestion.image_url || '/placeholder.svg'}
                    alt={suggestion.influencer_name}
                    className="w-24 h-24 object-cover rounded-xl border shadow-sm"
                  />
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-xl tracking-tight">{suggestion.influencer_name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeColors[suggestion.status]}`}>{suggestion.status.charAt(0).toUpperCase() + suggestion.status.slice(1)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">Submitted by: {suggestion.user_email || 'Unknown'} on {new Date(suggestion.timestamp).toLocaleDateString()}</div>
                    <div className="mb-2 text-base text-gray-700">{suggestion.description || <span className="italic text-muted-foreground">No description</span>}</div>
                    {suggestion.social_links && (
                      <div className="flex gap-3 text-xs text-muted-foreground mb-2">
                        {suggestion.social_links.instagram && <span className="flex items-center gap-1 text-pink-500"><Instagram className="h-4 w-4" />{suggestion.social_links.instagram}</span>}
                        {suggestion.social_links.youtube && <span className="flex items-center gap-1 text-red-500"><Youtube className="h-4 w-4" />{suggestion.social_links.youtube}</span>}
                        {suggestion.social_links.tiktok && <span className="flex items-center gap-1 text-black"><Music className="h-4 w-4" />{suggestion.social_links.tiktok}</span>}
                        {suggestion.social_links.twitter && <span className="flex items-center gap-1 text-blue-500"><Link className="h-4 w-4" />{suggestion.social_links.twitter}</span>}
                        {suggestion.social_links.website && <span className="flex items-center gap-1 text-fuchsia-500"><Link className="h-4 w-4" />{suggestion.social_links.website}</span>}
                      </div>
                    )}
                    {tab === 'pending' && (
                      <div className="flex gap-3 mt-4">
                        <Button size="lg" className={buttonColors.approve} onClick={() => handleQuickApprove(suggestion)} disabled={updateSuggestionMutation.isPending || addInfluencerMutation.isPending}>
                          Approve
                        </Button>
                        <Button size="lg" className={buttonColors.reject} onClick={() => handleQuickReject(suggestion.id)} disabled={updateSuggestionMutation.isPending}>
                          Reject
                        </Button>
                        <Button size="lg" variant="outline" className={buttonColors.advanced} onClick={() => openAdvancedApproval(suggestion)}>
                          Advanced...
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
        {editingSuggestion && (
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="w-full mt-4"
              >
                <Edit className="h-4 w-4 mr-2" />
                Approve with Enhanced Details
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Approve with Enhanced Details</SheetTitle>
              </SheetHeader>
              <div className="space-y-6 mt-6">
                <SecureImageUpload
                  onImageUploaded={(url) => setEnhancedData({...enhancedData, image: url})}
                  currentImage={enhancedData.image === '/placeholder.svg' ? undefined : enhancedData.image}
                  onImageRemoved={() => setEnhancedData({...enhancedData, image: '/placeholder.svg'})}
                />
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="enhanced-name">Name</Label>
                    <Input
                      id="enhanced-name"
                      value={enhancedData.name}
                      onChange={(e) => setEnhancedData({...enhancedData, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="enhanced-status">Claimed Status</Label>
                    <Select
                      value={enhancedData.claimed_status}
                      onValueChange={(value) => setEnhancedData({...enhancedData, claimed_status: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unclaimed">Unclaimed</SelectItem>
                        <SelectItem value="claimed">Claimed</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="enhanced-height">Height</Label>
                    <Input
                      id="enhanced-height"
                      placeholder="e.g., 5'10&quot; or 178cm"
                      value={enhancedData.height}
                      onChange={(e) => setEnhancedData({...enhancedData, height: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="enhanced-weight">Weight</Label>
                    <Input
                      id="enhanced-weight"
                      placeholder="e.g., 180 lbs or 82kg"
                      value={enhancedData.weight}
                      onChange={(e) => setEnhancedData({...enhancedData, weight: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="enhanced-training">Years Training</Label>
                    <Input
                      id="enhanced-training"
                      placeholder="e.g., 5 years"
                      value={enhancedData.years_training}
                      onChange={(e) => setEnhancedData({...enhancedData, years_training: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="enhanced-description">Description</Label>
                    <Textarea
                      id="enhanced-description"
                      placeholder="Brief description..."
                      value={enhancedData.description}
                      onChange={(e) => setEnhancedData({...enhancedData, description: e.target.value})}
                      rows={3}
                    />
                  </div>
                </div>

                <SocialLinksForm
                  socialLinks={enhancedData.social_links}
                  onUpdate={updateSocialLink}
                />
                
                <Button 
                  onClick={handleAdvancedApprove}
                  disabled={addInfluencerMutation.isPending}
                  className="w-full"
                >
                  {addInfluencerMutation.isPending ? 'Adding...' : 'Approve & Add'}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </CardContent>
    </Card>
  );
};

export default SuggestionManagement;
