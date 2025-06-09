
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import AdminTabs from "@/components/admin/AdminTabs";

const AdminPanel = () => {
  const { user } = useAuth();

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">Manage influencers, reviews, and user suggestions</p>
        </div>

        <AdminTabs />
      </div>
    </div>
  );
};

export default AdminPanel;
