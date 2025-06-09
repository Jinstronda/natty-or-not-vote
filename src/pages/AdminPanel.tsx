
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useVoteStore, Influencer } from "@/stores/VoteStore";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Trash2, Edit, Plus, Check, X, Users, MessageSquare, UserPlus } from "lucide-react";
import Header from "@/components/Header";

const AdminPanel = () => {
  const { user } = useAuth();
  const { 
    influencers, 
    reviews, 
    suggestions,
    addInfluencer, 
    updateInfluencer, 
    deleteInfluencer, 
    deleteReview,
    updateSuggestionStatus
  } = useVoteStore();

  const [newInfluencer, setNewInfluencer] = useState<Omit<Influencer, 'id'>>({
    name: '',
    image: '/placeholder.svg',
    height: '',
    weight: '',
    yearsTraining: '',
    claimedStatus: '',
    description: '',
    socialLinks: {}
  });

  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Access denied. Admin privileges required.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleCreateInfluencer = () => {
    if (!newInfluencer.name.trim()) {
      toast({
        title: "Error",
        description: "Influencer name is required.",
        variant: "destructive",
      });
      return;
    }

    addInfluencer(newInfluencer);
    setNewInfluencer({
      name: '',
      image: '/placeholder.svg',
      height: '',
      weight: '',
      yearsTraining: '',
      claimedStatus: '',
      description: '',
      socialLinks: {}
    });
    
    toast({
      title: "Success",
      description: "Influencer created successfully.",
    });
  };

  const handleDeleteInfluencer = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}? This will also delete all associated votes and reviews.`)) {
      deleteInfluencer(id);
      toast({
        title: "Deleted",
        description: `${name} has been removed.`,
      });
    }
  };

  const handleDeleteReview = (reviewId: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      deleteReview(reviewId);
      toast({
        title: "Deleted",
        description: "Review has been removed.",
      });
    }
  };

  const handleSuggestionAction = async (suggestionId: string, action: 'approved' | 'rejected') => {
    if (action === 'approved') {
      // Find the suggestion to approve
      const suggestion = suggestions.find(s => s.id === suggestionId);
      if (suggestion) {
        try {
          // Add the suggestion as a new influencer
          await addInfluencer({
            name: suggestion.influencerName,
            image: suggestion.imageUrl || '/placeholder.svg',
            height: '',
            weight: '',
            yearsTraining: '',
            claimedStatus: '',
            description: `Suggested by ${suggestion.submitterUsername}`,
            socialLinks: suggestion.socialLinks
          });

          // Update the suggestion status
          updateSuggestionStatus(suggestionId, action);
          
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
      updateSuggestionStatus(suggestionId, action);
      toast({
        title: "Rejected",
        description: "Suggestion has been rejected.",
      });
    }
  };

  const pendingSuggestions = suggestions.filter(s => s.status === 'pending');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">Manage influencers, reviews, and user suggestions</p>
        </div>

        <Tabs defaultValue="influencers" className="space-y-6">
          <TabsList>
            <TabsTrigger value="influencers">Influencers</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="suggestions" className="relative">
              Suggestions
              {pendingSuggestions.length > 0 && (
                <Badge className="ml-2 h-5 w-5 p-0 text-xs">{pendingSuggestions.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="influencers">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add New Influencer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Name"
                      value={newInfluencer.name}
                      onChange={(e) => setNewInfluencer({...newInfluencer, name: e.target.value})}
                    />
                    <Input
                      placeholder="Height (e.g., 5'10&quot;)"
                      value={newInfluencer.height}
                      onChange={(e) => setNewInfluencer({...newInfluencer, height: e.target.value})}
                    />
                    <Input
                      placeholder="Weight (e.g., 180 lbs)"
                      value={newInfluencer.weight}
                      onChange={(e) => setNewInfluencer({...newInfluencer, weight: e.target.value})}
                    />
                    <Input
                      placeholder="Years Training"
                      value={newInfluencer.yearsTraining}
                      onChange={(e) => setNewInfluencer({...newInfluencer, yearsTraining: e.target.value})}
                    />
                    <Input
                      placeholder="Claimed Status"
                      value={newInfluencer.claimedStatus}
                      onChange={(e) => setNewInfluencer({...newInfluencer, claimedStatus: e.target.value})}
                    />
                  </div>
                  <Textarea
                    placeholder="Description"
                    value={newInfluencer.description}
                    onChange={(e) => setNewInfluencer({...newInfluencer, description: e.target.value})}
                  />
                  <Button onClick={handleCreateInfluencer}>Create Influencer</Button>
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
                      <div key={influencer.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-semibold">{influencer.name}</h3>
                          <p className="text-sm text-muted-foreground">{influencer.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Sheet>
                            <SheetTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </SheetTrigger>
                            <SheetContent>
                              <SheetHeader>
                                <SheetTitle>Edit {influencer.name}</SheetTitle>
                              </SheetHeader>
                              <div className="space-y-4 mt-6">
                                <Input
                                  placeholder="Name"
                                  defaultValue={influencer.name}
                                  onChange={(e) => updateInfluencer(influencer.id, {name: e.target.value})}
                                />
                                <Input
                                  placeholder="Height"
                                  defaultValue={influencer.height}
                                  onChange={(e) => updateInfluencer(influencer.id, {height: e.target.value})}
                                />
                                <Input
                                  placeholder="Weight"
                                  defaultValue={influencer.weight}
                                  onChange={(e) => updateInfluencer(influencer.id, {weight: e.target.value})}
                                />
                                <Textarea
                                  placeholder="Description"
                                  defaultValue={influencer.description}
                                  onChange={(e) => updateInfluencer(influencer.id, {description: e.target.value})}
                                />
                              </div>
                            </SheetContent>
                          </Sheet>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteInfluencer(influencer.id, influencer.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Moderate Reviews ({reviews.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{review.username}</span>
                          <Badge className={review.vote === 'natty' ? 'bg-natty' : 'bg-juicy'}>
                            {review.vote === 'natty' ? '🏆 Natty' : '💉 Juicy'}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{review.timestamp}</span>
                        </div>
                        <p className="text-muted-foreground">{review.content}</p>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteReview(review.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suggestions">
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
