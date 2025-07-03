import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Settings, 
  Users, 
  UserPlus, 
  FileText, 
  Shield, 
  Upload,
  Eye,
  Crown
} from "lucide-react";

const AdminTopBar = () => {
  const { user } = useAuth();

  // Only show for admin users
  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-red-900/95 to-red-800/95 border-b border-red-600/50 md:backdrop-blur-sm">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Admin Badge and Status */}
          <div className="flex items-center gap-3">
            <Badge className="bg-red-500 hover:bg-red-600 text-white border-red-400 flex items-center gap-1">
              <Crown className="h-3 w-3" />
              Admin Panel
            </Badge>
            <span className="text-red-100 text-sm">
              Welcome, {user.user_metadata?.username || user.email}
            </span>
          </div>

          {/* Quick Admin Actions */}
          <div className="flex items-center gap-2">
            <Button 
              asChild 
              variant="ghost" 
              size="sm"
              className="text-red-100 hover:text-white hover:bg-red-700/50 transition-all duration-200"
            >
              <Link to="/admin" className="flex items-center gap-1">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            </Button>

            <Button 
              asChild 
              variant="ghost" 
              size="sm"
              className="text-red-100 hover:text-white hover:bg-red-700/50 transition-all duration-200"
            >
              <Link to="/admin" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Users</span>
              </Link>
            </Button>

            <Button 
              asChild 
              variant="ghost" 
              size="sm"
              className="text-red-100 hover:text-white hover:bg-red-700/50 transition-all duration-200"
            >
              <Link to="/admin" className="flex items-center gap-1">
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Influencer</span>
              </Link>
            </Button>

            <Button 
              asChild 
              variant="ghost" 
              size="sm"
              className="text-red-100 hover:text-white hover:bg-red-700/50 transition-all duration-200"
            >
              <Link to="/admin" className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Suggestions</span>
              </Link>
            </Button>

            <Button 
              asChild 
              variant="ghost" 
              size="sm"
              className="text-red-100 hover:text-white hover:bg-red-700/50 transition-all duration-200"
            >
              <Link to="/admin" className="flex items-center gap-1">
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Bulk Import</span>
              </Link>
            </Button>

            <Button 
              asChild 
              variant="ghost" 
              size="sm"
              className="text-red-100 hover:text-white hover:bg-red-700/50 transition-all duration-200"
            >
              <Link to="/admin" className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Reviews</span>
              </Link>
            </Button>

            <Button 
              asChild 
              variant="ghost" 
              size="sm"
              className="text-red-100 hover:text-white hover:bg-red-700/50 transition-all duration-200"
            >
              <Link to="/admin" className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Security</span>
              </Link>
            </Button>

            {/* Quick Stats or Notifications */}
            <div className="hidden md:flex items-center gap-1 text-red-200 text-xs ml-2">
              <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>System Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTopBar; 