
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Users, Shield, AlertTriangle, Crown } from "lucide-react";
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

  const updateUserRole = async (userId: string, newRole: string, username: string) => {
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
        admin_username: user?.username,
        target_user: userId,
        target_username: username,
        new_role: newRole,
        timestamp: new Date().toISOString()
      });

      await fetchUsers();
      
      const roleText = newRole === 'admin' ? 'Administrator' : newRole === 'moderator' ? 'Moderator' : 'User';
      
      toast({
        title: "Success",
        description: `${username} is now a ${roleText}`,
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
        return 'bg-red-100 text-red-800 border-red-200';
      case 'moderator':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-3 w-3" />;
      case 'moderator':
        return <Shield className="h-3 w-3" />;
      default:
        return null;
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

  const adminCount = users.filter(u => u.role === 'admin').length;
  const moderatorCount = users.filter(u => u.role === 'moderator').length;
  const userCount = users.filter(u => u.role === 'user').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Role Management
        </CardTitle>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>{adminCount} Admin{adminCount !== 1 ? 's' : ''}</span>
          <span>{moderatorCount} Moderator{moderatorCount !== 1 ? 's' : ''}</span>
          <span>{userCount} User{userCount !== 1 ? 's' : ''}</span>
          <span className="font-medium">Total: {users.length}</span>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading users...
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((userProfile) => (
              <div key={userProfile.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{userProfile.username}</span>
                    <Badge className={`${getRoleBadgeColor(userProfile.role)} flex items-center gap-1`}>
                      {getRoleIcon(userProfile.role)}
                      {userProfile.role}
                    </Badge>
                    {userProfile.id === user?.id && (
                      <Badge variant="outline" className="text-xs">You</Badge>
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
                    onValueChange={(newRole) => updateUserRole(userProfile.id, newRole, userProfile.username)}
                    disabled={userProfile.id === user?.id}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">
                        <div className="flex items-center gap-2">
                          <span>User</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="moderator">
                        <div className="flex items-center gap-2">
                          <Shield className="h-3 w-3" />
                          <span>Moderator</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <Crown className="h-3 w-3" />
                          <span>Admin</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {userProfile.id === user?.id && (
                    <div className="text-xs text-muted-foreground">
                      (Cannot change own role)
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {users.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No users found
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminRoleManagement;
