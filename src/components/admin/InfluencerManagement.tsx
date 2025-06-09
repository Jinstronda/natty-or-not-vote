
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useVoteStore, Influencer } from "@/stores/VoteStore";
import { toast } from "@/hooks/use-toast";
import { Trash2, Edit, Plus, Users } from "lucide-react";

const InfluencerManagement = () => {
  const { influencers, addInfluencer, updateInfluencer, deleteInfluencer } = useVoteStore();

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
  );
};

export default InfluencerManagement;
