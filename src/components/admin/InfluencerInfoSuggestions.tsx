import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "@/hooks/use-toast";
import { Check, X, Edit, UserCheck, MessageSquare } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const InfluencerInfoSuggestions = () => {
  const queryClient = useQueryClient();
  const [editingSuggestion, setEditingSuggestion] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

  const { data: infoSuggestions = [] } = useQuery({
    queryKey: ['admin-info-suggestions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('influencer_info_suggestions')
        .select(`
          *,
          influencer:influencers(name, image)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const updateSuggestionMutation = useMutation({
    mutationFn: async ({ suggestionId, status, adminNotes }: { 
      suggestionId: string, 
      status: string,
      adminNotes?: string 
    }) => {
      const updateData: any = { status };
      if (adminNotes !== undefined) {
        updateData.admin_notes = adminNotes;
      }
      
      const { error } = await supabase
        .from('influencer_info_suggestions')
        .update(updateData)
        .eq('id', suggestionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-info-suggestions'] });
    }
  });

  const approveAndApplySuggestionMutation = useMutation({
    mutationFn: async ({ suggestion, adminNotes }: { suggestion: any, adminNotes?: string }) => {
      // First, update the influencer record with approved changes (excluding images)
      const updateData: any = {};
      
      if (suggestion.suggested_height) updateData.height = suggestion.suggested_height;
      if (suggestion.suggested_weight) updateData.weight = suggestion.suggested_weight;
      if (suggestion.suggested_training) updateData.years_training = suggestion.suggested_training;
      if (suggestion.suggested_description) updateData.description = suggestion.suggested_description;

      if (Object.keys(updateData).length > 0) {
        const { error: influencerError } = await supabase
          .from('influencers')
          .update(updateData)
          .eq('id', suggestion.influencer_id);
        
        if (influencerError) throw influencerError;
      }

      // Handle suggested images - add them to influencer_photos table
      if (suggestion.suggested_images && suggestion.suggested_images.length > 0) {
        // First, check current image count to enforce 40-image limit
        const { count: currentImageCount, error: countError } = await supabase
          .from('influencer_photos')
          .select('*', { count: 'exact', head: true })
          .eq('influencer_id', suggestion.influencer_id);

        if (countError) throw countError;

        const newImageCount = (currentImageCount || 0) + suggestion.suggested_images.length;
        
        if (newImageCount > 40) {
          throw new Error(`Cannot add ${suggestion.suggested_images.length} images. Would exceed limit of 40 images per influencer (currently has ${currentImageCount || 0}).`);
        }

        // Get the current highest order to maintain proper ordering
        const { data: lastPhoto } = await supabase
          .from('influencer_photos')
          .select('order')
          .eq('influencer_id', suggestion.influencer_id)
          .order('order', { ascending: false })
          .limit(1);

        const startOrder = lastPhoto && lastPhoto.length > 0 ? (lastPhoto[0].order || 0) + 1 : 1;

        // Insert all suggested images into influencer_photos table
        const photosToInsert = suggestion.suggested_images.map((imageUrl: string, index: number) => ({
          influencer_id: suggestion.influencer_id,
          image_url: imageUrl,
          description: `Image suggested by user`,
          order: startOrder + index
        }));

        const { error: photosError } = await supabase
          .from('influencer_photos')
          .insert(photosToInsert);

        if (photosError) throw photosError;
      }

      // Then update the suggestion status
      const suggestionUpdate: any = { status: 'approved' };
      if (adminNotes) suggestionUpdate.admin_notes = adminNotes;
      
      const { error: suggestionError } = await supabase
        .from('influencer_info_suggestions')
        .update(suggestionUpdate)
        .eq('id', suggestion.id);
      
      if (suggestionError) throw suggestionError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-info-suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['influencers'] });
      queryClient.invalidateQueries({ queryKey: ['influencer-photos'] });
    }
  });

  const handleQuickReject = async (suggestionId: string, reason?: string) => {
    try {
      await updateSuggestionMutation.mutateAsync({ 
        suggestionId, 
        status: 'rejected',
        adminNotes: reason 
      });
      toast({
        title: "Rejected",
        description: "Info suggestion has been rejected.",
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
      await approveAndApplySuggestionMutation.mutateAsync({ suggestion });
      
      toast({
        title: "Approved & Applied",
        description: `Info updates for ${suggestion.influencer?.name} have been applied.`,
      });
    } catch (error: any) {
      console.error('Error approving suggestion:', error);
      const errorMessage = error.message || "Failed to approve and apply suggestion.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleApproveWithNotes = async () => {
    if (!editingSuggestion) return;
    
    try {
      await approveAndApplySuggestionMutation.mutateAsync({ 
        suggestion: editingSuggestion,
        adminNotes 
      });
      
      toast({
        title: "Success",
        description: `Info updates for ${editingSuggestion.influencer?.name} have been applied with notes.`,
      });

      setEditingSuggestion(null);
      setAdminNotes("");
    } catch (error: any) {
      console.error('Error with approval:', error);
      const errorMessage = error.message || "Failed to approve suggestion.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const openAdvancedReview = (suggestion: any) => {
    setEditingSuggestion(suggestion);
    setAdminNotes(suggestion.admin_notes || "");
  };

  const formatFieldChanges = (suggestion: any) => {
    const changes: string[] = [];
    if (suggestion.suggested_height) changes.push(`Height: ${suggestion.suggested_height}`);
    if (suggestion.suggested_weight) changes.push(`Weight: ${suggestion.suggested_weight}`);
    if (suggestion.suggested_training) changes.push(`Training: ${suggestion.suggested_training} years`);
    if (suggestion.suggested_description) changes.push(`Description updated`);
    if (suggestion.suggested_images && suggestion.suggested_images.length > 0) {
      changes.push(`${suggestion.suggested_images.length} new image(s)`);
    }
    return changes;
  };

  const filteredSuggestions = infoSuggestions.filter((s: any) => s.status === tab);

  const statusColors = {
    pending: 'border-gray-300',
    approved: 'border-green-500',
    rejected: 'border-fuchsia-700',
  };
  
  const badgeColors = {
    pending: 'bg-gray-200 text-gray-700',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-fuchsia-100 text-fuchsia-800',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Influencer Info Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={(value) => setTab(value as 'pending' | 'approved' | 'rejected')} className="w-full">
          <TabsList className="mb-4 flex gap-2">
            <TabsTrigger value="pending" className={tab === 'pending' ? 'font-bold text-green-700 border-b-2 border-green-500' : ''}>
              Pending ({infoSuggestions.filter(s => s.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="approved" className={tab === 'approved' ? 'font-bold text-green-700 border-b-2 border-green-500' : ''}>
              Approved ({infoSuggestions.filter(s => s.status === 'approved').length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className={tab === 'rejected' ? 'font-bold text-fuchsia-700 border-b-2 border-fuchsia-500' : ''}>
              Rejected ({infoSuggestions.filter(s => s.status === 'rejected').length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={tab} className="space-y-6">
            {filteredSuggestions.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No info suggestions in this category.
              </div>
            ) : (
              filteredSuggestions.map((suggestion: any) => (
                <Card key={suggestion.id} className={`flex flex-col md:flex-row items-start gap-4 p-6 rounded-2xl shadow-md border-l-8 ${statusColors[suggestion.status]}`}>
                  <img
                    src={suggestion.influencer?.image || '/placeholder.svg'}
                    alt={suggestion.influencer?.name || 'Unknown'}
                    className="w-24 h-24 object-cover rounded-xl border shadow-sm"
                  />
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-xl tracking-tight">
                        {suggestion.influencer?.name || 'Unknown Influencer'}
                      </h3>
                      <Badge className={`${badgeColors[suggestion.status]}`}>
                        {suggestion.status.charAt(0).toUpperCase() + suggestion.status.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="text-xs text-muted-foreground mb-2">
                      Submitted by: {suggestion.user_email || 'Unknown'} on {new Date(suggestion.created_at).toLocaleDateString()}
                    </div>
                    
                    {suggestion.reason && (
                      <div className="mb-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                        <div className="text-sm font-medium text-blue-900 mb-1">Reason for suggestion:</div>
                        <div className="text-sm text-blue-800">{suggestion.reason}</div>
                      </div>
                    )}
                    
                    <div className="mb-3">
                      <div className="text-sm font-medium text-gray-900 mb-2">Suggested changes:</div>
                      <div className="flex flex-wrap gap-2">
                        {formatFieldChanges(suggestion).map((change, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {change}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {suggestion.suggested_images && suggestion.suggested_images.length > 0 && (
                      <div className="mb-3">
                        <div className="text-sm font-medium text-gray-900 mb-2">Suggested images:</div>
                        <div className="flex gap-2 overflow-x-auto">
                          {suggestion.suggested_images.map((imageUrl: string, index: number) => (
                            <img
                              key={index}
                              src={imageUrl}
                              alt={`Suggested image ${index + 1}`}
                              className="w-16 h-16 object-cover rounded border"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {suggestion.admin_notes && (
                      <div className="mb-3 p-3 bg-gray-50 rounded-lg border-l-4 border-gray-400">
                        <div className="text-sm font-medium text-gray-900 mb-1">Admin notes:</div>
                        <div className="text-sm text-gray-700">{suggestion.admin_notes}</div>
                      </div>
                    )}
                    
                    {tab === 'pending' && (
                      <div className="flex gap-3 mt-4">
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700 text-white" 
                          onClick={() => handleQuickApprove(suggestion)} 
                          disabled={approveAndApplySuggestionMutation.isPending}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve & Apply
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white" 
                          onClick={() => handleQuickReject(suggestion.id)} 
                          disabled={updateSuggestionMutation.isPending}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-fuchsia-500 text-fuchsia-700 hover:bg-fuchsia-50" 
                          onClick={() => openAdvancedReview(suggestion)}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Review...
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Advanced Review Sheet */}
        {editingSuggestion && (
          <Sheet open={!!editingSuggestion} onOpenChange={() => setEditingSuggestion(null)}>
            <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Review Info Suggestion</SheetTitle>
              </SheetHeader>
              <div className="space-y-6 mt-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-900">Influencer:</Label>
                    <div className="text-lg font-semibold">{editingSuggestion.influencer?.name}</div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-900">Suggested Changes:</Label>
                    <div className="mt-2 space-y-2">
                      {editingSuggestion.suggested_height && (
                        <div className="p-2 bg-gray-50 rounded">
                          <span className="font-medium">Height:</span> {editingSuggestion.suggested_height}
                        </div>
                      )}
                      {editingSuggestion.suggested_weight && (
                        <div className="p-2 bg-gray-50 rounded">
                          <span className="font-medium">Weight:</span> {editingSuggestion.suggested_weight}
                        </div>
                      )}
                      {editingSuggestion.suggested_training && (
                        <div className="p-2 bg-gray-50 rounded">
                          <span className="font-medium">Training:</span> {editingSuggestion.suggested_training} years
                        </div>
                      )}
                      {editingSuggestion.suggested_description && (
                        <div className="p-2 bg-gray-50 rounded">
                          <span className="font-medium">Description:</span> {editingSuggestion.suggested_description}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {editingSuggestion.reason && (
                    <div>
                      <Label className="text-sm font-medium text-gray-900">User's Reason:</Label>
                      <div className="mt-1 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                        {editingSuggestion.reason}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-notes">Admin Notes (optional)</Label>
                  <Textarea
                    id="admin-notes"
                    placeholder="Add notes about this decision..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    onClick={handleApproveWithNotes}
                    disabled={approveAndApplySuggestionMutation.isPending}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    {approveAndApplySuggestionMutation.isPending ? 'Applying...' : 'Approve & Apply'}
                  </Button>
                  
                  <Button 
                    onClick={() => {
                      handleQuickReject(editingSuggestion.id, adminNotes || undefined);
                      setEditingSuggestion(null);
                      setAdminNotes("");
                    }}
                    disabled={updateSuggestionMutation.isPending}
                    className="flex-1 bg-fuchsia-600 hover:bg-fuchsia-700 text-white"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </CardContent>
    </Card>
  );
};

export default InfluencerInfoSuggestions;
