
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "@/hooks/use-toast";
import { Trash2, Edit, Plus, Users } from "lucide-react";
import SecureImageUpload from "@/components/SecureImageUpload";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Influencer {
  id: string;
  name: string;
  image: string;
  height?: string;
  weight?: string;
  years_training?: string;
  claimed_status?: string;
  description?: string;
  social_links?: any;
}

const InfluencerManagement = () => {
  const queryClient = useQueryClient();

  const { data: influencers = [] } = useQuery({
    queryKey: ['admin-influencers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('influencers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const [newInfluencer, setNewInfluencer] = useState<Omit<Influencer, 'id'>>({
    name: '',
    image: '/placeholder.svg',
    height: '',
    weight: '',
    years_training: '',
    claimed_status: '',
    description: '',
    social_links: {}
  });

  const [editingInfluencer, setEditingInfluencer] = useState<Influencer | null>(null);

  const addInfluencerMutation = useMutation({
    mutationFn: async (influencer: Omit<Influencer, 'id'>) => {
      const { error } = await supabase
        .from('influencers')
        .insert({
          name: influencer.name,
          image: influencer.image,
          height: influencer.height,
          weight: influencer.weight,
          years_training: influencer.years_training,
          claimed_status: influencer.claimed_status,
          description: influencer.description,
          social_links: influencer.social_links
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
          height: influencer.height,
          weight: influencer.weight,
          years_training: influencer.years_training,
          claimed_status: influencer.claimed_status,
          description: influencer.description,
          social_links: influencer.social_links
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
        claimed_status: '',
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Influencer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SecureImageUpload
            onImageUploaded={(url) => setNewInfluencer({...newInfluencer, image: url})}
            currentImage={newInfluencer.image === '/placeholder.svg' ? undefined : newInfluencer.image}
            onImageRemoved={() => setNewInfluencer({...newInfluencer, image: '/placeholder.svg'})}
          />
          
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
              value={newInfluencer.years_training}
              onChange={(e) => setNewInfluencer({...newInfluencer, years_training: e.target.value})}
            />
            <Input
              placeholder="Claimed Status"
              value={newInfluencer.claimed_status}
              onChange={(e) => setNewInfluencer({...newInfluencer, claimed_status: e.target.value})}
            />
          </div>
          <Textarea
            placeholder="Description"
            value={newInfluencer.description}
            onChange={(e) => setNewInfluencer({...newInfluencer, description: e.target.value})}
          />
          <Button 
            onClick={handleCreateInfluencer}
            disabled={addInfluencerMutation.isPending}
          >
            Create Influencer
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
              <div key={influencer.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <img 
                    src={influencer.image || '/placeholder.svg'} 
                    alt={influencer.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="font-semibold">{influencer.name}</h3>
                    <p className="text-sm text-muted-foreground">{influencer.description}</p>
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
                        <div className="space-y-4 mt-6">
                          <SecureImageUpload
                            onImageUploaded={(url) => setEditingInfluencer({...editingInfluencer, image: url})}
                            currentImage={editingInfluencer.image === '/placeholder.svg' ? undefined : editingInfluencer.image}
                            onImageRemoved={() => setEditingInfluencer({...editingInfluencer, image: '/placeholder.svg'})}
                          />
                          
                          <Input
                            placeholder="Name"
                            value={editingInfluencer.name}
                            onChange={(e) => setEditingInfluencer({...editingInfluencer, name: e.target.value})}
                          />
                          <Input
                            placeholder="Height"
                            value={editingInfluencer.height || ''}
                            onChange={(e) => setEditingInfluencer({...editingInfluencer, height: e.target.value})}
                          />
                          <Input
                            placeholder="Weight"
                            value={editingInfluencer.weight || ''}
                            onChange={(e) => setEditingInfluencer({...editingInfluencer, weight: e.target.value})}
                          />
                          <Input
                            placeholder="Years Training"
                            value={editingInfluencer.years_training || ''}
                            onChange={(e) => setEditingInfluencer({...editingInfluencer, years_training: e.target.value})}
                          />
                          <Input
                            placeholder="Claimed Status"
                            value={editingInfluencer.claimed_status || ''}
                            onChange={(e) => setEditingInfluencer({...editingInfluencer, claimed_status: e.target.value})}
                          />
                          <Textarea
                            placeholder="Description"
                            value={editingInfluencer.description || ''}
                            onChange={(e) => setEditingInfluencer({...editingInfluencer, description: e.target.value})}
                          />
                          
                          <Button 
                            onClick={handleUpdateInfluencer} 
                            className="w-full"
                            disabled={updateInfluencerMutation.isPending}
                          >
                            Save Changes
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InfluencerManagement;
