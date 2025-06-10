import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import SuggestInfluencer from "@/components/SuggestInfluencer";
import { Crown } from "lucide-react";

const Header = () => {
  const { user, signOut } = useAuth();

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
            {user && <SuggestInfluencer />}
            
            {user && user.profile?.role === 'admin' && (
              <Button asChild variant="ghost">
                <Link to="/admin">Admin Panel</Link>
              </Button>
            )}
            
            {user ? (
              <div className="flex items-center gap-4">
                <Link 
                  to={`/user/${user.id}`}
                  className="font-medium hover:text-primary transition-colors flex items-center gap-1"
                >
                  {user.user_metadata?.username || user.email}
                  {user.profile?.role === 'admin' && <Crown className="h-4 w-4 text-yellow-500" />}
                </Link>
                <Button variant="outline" onClick={signOut}>
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
