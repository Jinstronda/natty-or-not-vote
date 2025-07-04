
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import AdminTabs from "@/components/admin/AdminTabs";
import { AdminGate } from "@/components/admin/AdminGate";

const AdminPanel = () => {
  return (
    <AdminGate>
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">Manage influencers, reviews, and user suggestions</p>
          </div>
          <AdminTabs />
        </div>
      </Layout>
    </AdminGate>
  );
};

export default AdminPanel;
