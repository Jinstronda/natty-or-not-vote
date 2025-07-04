import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InfluencerManagement from "./InfluencerManagement";
import BulkInfluencerImport from "./BulkInfluencerImport";
import SuggestionManagement from "./SuggestionManagement";
import ReviewModeration from "./ReviewModeration";
import SecurityAuditLog from "./SecurityAuditLog";
import AdminRoleManagement from "./AdminRoleManagement";
import BulkExpertReviewImport from "./BulkExpertReviewImport";

const AdminTabs = () => {
  return (
    <Tabs defaultValue="influencers" className="w-full">
      <TabsList className="grid grid-cols-7 w-full">
        <TabsTrigger value="influencers">Influencers</TabsTrigger>
        <TabsTrigger value="bulk-import">Bulk Import</TabsTrigger>
        <TabsTrigger value="bulk-expert-reviews">Bulk Expert Reviews</TabsTrigger>
        <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
        <TabsTrigger value="users">Users</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
      </TabsList>
      <TabsContent value="influencers">
        <InfluencerManagement />
      </TabsContent>
      <TabsContent value="bulk-import">
        <BulkInfluencerImport />
      </TabsContent>
      <TabsContent value="bulk-expert-reviews">
        <BulkExpertReviewImport />
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
