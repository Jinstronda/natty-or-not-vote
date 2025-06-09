
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import SuggestInfluencer from "@/components/SuggestInfluencer";
import { useEffect, useState } from "react";
import { emergencyAuthReset, detectStuckAuth } from "@/utils/authRecovery";
import { AlertTriangle } from "lucide-react";

const Header = () => {
  const { user, logout, loading } = useAuth();
  const [showRecoveryButton, setShowRecoveryButton] = useState(false);

  // Check for stuck auth state after 20 seconds of loading
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        if (loading && detectStuckAuth()) {
          console.warn('[Header] Stuck auth detected, showing recovery option');
          setShowRecoveryButton(true);
        }
      }, 20000); // Show recovery after 20 seconds

      return () => clearTimeout(timer);
    } else {
      setShowRecoveryButton(false);
    }
  }, [loading]);

  const handleAuthRecovery = async () => {
    setShowRecoveryButton(false);
    await emergencyAuthReset();
  };

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="font-heading font-bold text-2xl">
            <span className="text-natty">Natty</span> or <span className="text-juicy">Juicy</span>
          </Link>
          
          <nav className="flex items-center gap-4">
            <Button asChild variant="ghost">
              <Link to="/">Trending</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/how-it-works">How It Works</Link>
            </Button>
            <SuggestInfluencer />
            
            {/* Emergency auth recovery button */}
            {showRecoveryButton && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleAuthRecovery}
                className="flex items-center gap-2"
              >
                <AlertTriangle className="h-4 w-4" />
                Fix Login
              </Button>
            )}
            
            {user ? (
              <div className="flex items-center gap-4">
                {user.role === 'admin' && (
                  <Button asChild variant="outline">
                    <Link to="/admin">Admin Panel</Link>
                  </Button>
                )}
                <Link 
                  to={`/user/${user.id}`}
                  className="font-medium hover:text-primary transition-colors"
                >
                  {user.username}
                </Link>
                <Button variant="outline" onClick={logout}>
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button asChild variant="ghost">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
