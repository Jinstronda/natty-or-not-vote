
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVoteStore } from "@/stores/VoteStore";
import InfluencerManagement from "./InfluencerManagement";
import ReviewModeration from "./ReviewModeration";
import SuggestionManagement from "./SuggestionManagement";

const AdminTabs = () => {
  const { suggestions } = useVoteStore();
  const pendingSuggestions = suggestions.filter(s => s.status === 'pending');

  return (
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
        <InfluencerManagement />
      </TabsContent>

      <TabsContent value="reviews">
        <ReviewModeration />
      </TabsContent>

      <TabsContent value="suggestions">
        <SuggestionManagement />
      </TabsContent>
    </Tabs>
  );
};

export default AdminTabs;
