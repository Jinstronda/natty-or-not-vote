
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InfluencerManagement from "./InfluencerManagement";
import SuggestionManagement from "./SuggestionManagement";
import ReviewModeration from "./ReviewModeration";
import SecurityAuditLog from "./SecurityAuditLog";
import AdminRoleManagement from "./AdminRoleManagement";

const AdminTabs = () => {
  return (
    <Tabs defaultValue="influencers" className="w-full">
      <TabsList className="grid grid-cols-5 w-full">
        <TabsTrigger value="influencers">Influencers</TabsTrigger>
        <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
        <TabsTrigger value="users">Users</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
      </TabsList>
      <TabsContent value="influencers">
        <InfluencerManagement />
      </TabsContent>
      <TabsContent value="suggestions">
        <SuggestionManagement />
      </TabsContent>
      <TabsContent value="reviews">
        <ReviewModeration />
      </TabsContent>
      <TabsContent value="users">
        <AdminRoleManagement />
      </TabsContent>
      <TabsContent value="security">
        <SecurityAuditLog />
      </TabsContent>
    </Tabs>
  );
};

export default AdminTabs;
