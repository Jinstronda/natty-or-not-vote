
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Users, Shield, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: string;
  created_at: string;
}

const AdminRoleManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      // Prevent removing admin role from current user
      if (userId === user?.id && newRole !== 'admin') {
        toast({
          title: "Error",
          description: "You cannot remove your own admin privileges",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      // Log admin action to console for now
      console.log('Admin Action:', {
        action: 'role_change',
        admin_user: user?.id,
        target_user: userId,
        new_role: newRole,
        timestamp: new Date().toISOString()
      });

      await fetchUsers();
      
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'moderator':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  if (user?.role !== 'admin') {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertTriangle className="h-5 w-5" />
            <span>Admin access required</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Role Management ({users.length} users)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading users...
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((userProfile) => (
              <div key={userProfile.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{userProfile.username}</span>
                    <Badge className={getRoleBadgeColor(userProfile.role)}>
                      {userProfile.role}
                    </Badge>
                    {userProfile.id === user?.id && (
                      <Badge variant="outline">You</Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {userProfile.email}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Joined {new Date(userProfile.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={userProfile.role}
                    onValueChange={(newRole) => updateUserRole(userProfile.id, newRole)}
                    disabled={userProfile.id === user?.id}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="moderator">Moderator</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  {userProfile.role === 'admin' && (
                    <Shield className="h-4 w-4 text-red-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminRoleManagement;
