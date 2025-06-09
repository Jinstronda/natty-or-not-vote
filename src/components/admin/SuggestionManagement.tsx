
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useVoteStore } from "@/stores/VoteStore";
import { toast } from "@/hooks/use-toast";
import { Check, X, UserPlus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const SuggestionManagement = () => {
  const { suggestions, addInfluencer, updateSuggestionStatus } = useVoteStore();
  const queryClient = useQueryClient();

  const handleSuggestionAction = async (suggestionId: string, action: 'approved' | 'rejected') => {
    if (action === 'approved') {
      // Find the suggestion to approve
      const suggestion = suggestions.find(s => s.id === suggestionId);
      if (suggestion) {
        try {
          console.log('Approving suggestion:', suggestion);
          
          // Add the suggestion as a new influencer
          const newInfluencerId = await addInfluencer({
            name: suggestion.influencerName,
            image: suggestion.imageUrl || '/placeholder.svg',
            height: '',
            weight: '',
            yearsTraining: '',
            claimedStatus: '',
            description: `Suggested by ${suggestion.submitterUsername}`,
            socialLinks: suggestion.socialLinks
          });

          console.log('New influencer added with ID:', newInfluencerId);

          // Update the suggestion status
          await updateSuggestionStatus(suggestionId, action);
          
          // Invalidate relevant queries to refresh the UI
          queryClient.invalidateQueries({ queryKey: ['influencers'] });
          queryClient.invalidateQueries({ queryKey: ['suggestions'] });
          
          toast({
            title: "Approved & Added",
            description: `${suggestion.influencerName} has been approved and added to the influencers list.`,
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
        await updateSuggestionStatus(suggestionId, action);
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
                  <span className="font-medium">{suggestion.influencerName}</span>
                  <Badge variant={
                    suggestion.status === 'pending' ? 'default' :
                    suggestion.status === 'approved' ? 'default' : 'destructive'
                  }>
                    {suggestion.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Suggested by {suggestion.submitterUsername} on {suggestion.timestamp}
                </p>
                {suggestion.imageUrl && (
                  <div className="mb-2">
                    <img src={suggestion.imageUrl} alt={suggestion.influencerName} className="w-16 h-16 object-cover rounded" />
                  </div>
                )}
                {Object.keys(suggestion.socialLinks).length > 0 && (
                  <div className="text-sm">
                    <strong>Social Links:</strong>
                    <ul className="list-disc list-inside ml-4">
                      {suggestion.socialLinks.instagram && (
                        <li>Instagram: {suggestion.socialLinks.instagram}</li>
                      )}
                      {suggestion.socialLinks.youtube && (
                        <li>YouTube: {suggestion.socialLinks.youtube}</li>
                      )}
                      {suggestion.socialLinks.tiktok && (
                        <li>TikTok: {suggestion.socialLinks.tiktok}</li>
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
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleSuggestionAction(suggestion.id, 'rejected')}
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
