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

  const pendingSuggestions = suggestions.filter(s => s.status === 'pending');
  const processedSuggestions = suggestions.filter(s => s.status !== 'pending');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Pending Suggestions ({pendingSuggestions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingSuggestions.map((suggestion) => {
              const socialLinks = suggestion.social_links as SocialLinks | null;
              
              return (
                <div key={suggestion.id} className="flex items-start justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-lg">{suggestion.influencer_name}</span>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Suggested on {new Date(suggestion.timestamp).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    
                    {suggestion.image_url && (
                      <div className="mb-3">
                        <img 
                          src={suggestion.image_url} 
                          alt={suggestion.influencer_name} 
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    
                    {socialLinks && Object.keys(socialLinks).length > 0 && (
                      <div className="mb-3">
                        <div className="text-sm font-medium mb-2">Social Links:</div>
                        <div className="flex flex-wrap gap-2">
                          {socialLinks.instagram && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Instagram className="h-3 w-3 text-pink-500" />
                              Instagram
                            </Badge>
                          )}
                          {socialLinks.youtube && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Youtube className="h-3 w-3 text-red-500" />
                              YouTube
                            </Badge>
                          )}
                          {socialLinks.tiktok && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Music className="h-3 w-3 text-black" />
                              TikTok
                            </Badge>
                          )}
                          {socialLinks.twitter && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Link className="h-3 w-3 text-blue-500" />
                              Twitter
                            </Badge>
                          )}
                          {socialLinks.website && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Link className="h-3 w-3 text-gray-500" />
                              Website
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => handleQuickApprove(suggestion)}
                      disabled={addInfluencerMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      <Check className="h-4 w-4" />
                      Quick Approve
                    </Button>
                    
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openAdvancedApproval(suggestion)}
                          className="flex items-center gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Advanced
                        </Button>
                      </SheetTrigger>
                      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                        <SheetHeader>
                          <SheetTitle>Approve with Enhanced Details</SheetTitle>
                        </SheetHeader>
                        {editingSuggestion && (
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
                        )}
                      </SheetContent>
                    </Sheet>
                    
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleQuickReject(suggestion.id)}
                      disabled={updateSuggestionMutation.isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
            
            {pendingSuggestions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No pending suggestions
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {processedSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Processed Suggestions ({processedSuggestions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {processedSuggestions.map((suggestion) => (
                <div key={suggestion.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                  <div>
                    <span className="font-medium">{suggestion.influencer_name}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {new Date(suggestion.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <Badge variant={suggestion.status === 'approved' ? 'default' : 'destructive'}>
                    {suggestion.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SuggestionManagement;
