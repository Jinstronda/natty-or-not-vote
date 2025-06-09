
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Check, X, UserPlus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const SuggestionManagement = () => {
  const queryClient = useQueryClient();

  const { data: suggestions = [] } = useQuery({
    queryKey: ['admin-suggestions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('influencer_suggestions')
        .select('*')
        .order('created_at', { ascending: false });
      
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
    mutationFn: async (suggestion: any) => {
      const { error } = await supabase
        .from('influencers')
        .insert({
          name: suggestion.influencer_name,
          image: suggestion.image_url || '/placeholder.svg',
          description: `Suggested by user`,
          social_links: suggestion.social_links || {}
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['influencers'] });
    }
  });

  const handleSuggestionAction = async (suggestionId: string, action: 'approved' | 'rejected') => {
    if (action === 'approved') {
      const suggestion = suggestions.find(s => s.id === suggestionId);
      if (suggestion) {
        try {
          await addInfluencerMutation.mutateAsync(suggestion);
          await updateSuggestionMutation.mutateAsync({ suggestionId, status: action });
          
          toast({
            title: "Approved & Added",
            description: `${suggestion.influencer_name} has been approved and added to the influencers list.`,
          });
        } catch (error) {
          console.error('Error adding influencer:', error);
          toast({
            title: "Error",
            description: "Failed to add influencer. Please try again.",
            variant: "destructive",
          });
        }
      }
    } else {
      try {
        await updateSuggestionMutation.mutateAsync({ suggestionId, status: action });
        toast({
          title: "Rejected",
          description: "Suggestion has been rejected.",
        });
      } catch (error) {
        console.error('Error rejecting suggestion:', error);
        toast({
          title: "Error",
          description: "Failed to reject suggestion. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const pendingSuggestions = suggestions.filter(s => s.status === 'pending');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Influencer Suggestions ({pendingSuggestions.length} pending)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <div key={suggestion.id} className="flex items-start justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{suggestion.influencer_name}</span>
                  <Badge variant={
                    suggestion.status === 'pending' ? 'default' :
                    suggestion.status === 'approved' ? 'default' : 'destructive'
                  }>
                    {suggestion.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Suggested by user on {new Date(suggestion.created_at).toLocaleDateString()}
                </p>
                {suggestion.image_url && (
                  <div className="mb-2">
                    <img src={suggestion.image_url} alt={suggestion.influencer_name} className="w-16 h-16 object-cover rounded" />
                  </div>
                )}
                {suggestion.social_links && Object.keys(suggestion.social_links).length > 0 && (
                  <div className="text-sm">
                    <strong>Social Links:</strong>
                    <ul className="list-disc list-inside ml-4">
                      {suggestion.social_links.instagram && (
                        <li>Instagram: {suggestion.social_links.instagram}</li>
                      )}
                      {suggestion.social_links.youtube && (
                        <li>YouTube: {suggestion.social_links.youtube}</li>
                      )}
                      {suggestion.social_links.tiktok && (
                        <li>TikTok: {suggestion.social_links.tiktok}</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
              {suggestion.status === 'pending' && (
                <div className="flex gap-2">
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => handleSuggestionAction(suggestion.id, 'approved')}
                    disabled={updateSuggestionMutation.isPending || addInfluencerMutation.isPending}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleSuggestionAction(suggestion.id, 'rejected')}
                    disabled={updateSuggestionMutation.isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
          
          {suggestions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No suggestions yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SuggestionManagement;
