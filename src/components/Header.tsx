import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import SuggestInfluencer from "@/components/SuggestInfluencer";
import { Menu, X, User } from "lucide-react";

const Header = () => {
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="font-heading font-bold text-xl sm:text-2xl"
            onClick={closeMobileMenu}
          >
            <span className="text-natty">Natty</span> or <span className="text-juicy">Juicy</span>
          </Link>
          
          {/* Desktop Navigation - Hidden on mobile */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-4">
            <Button asChild variant="ghost" size="sm" className="lg:size-default">
              <Link to="/">Trending</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="lg:size-default">
              <Link to="/merch">Merch</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="lg:size-default">
              <Link to="/how-it-works">How It Works</Link>
            </Button>
            {user && <SuggestInfluencer />}
            
            {user ? (
              <div className="flex items-center gap-2 lg:gap-4">
                <Link 
                  to={`/user/${user.id}`}
                  className="font-medium hover:text-primary transition-colors text-sm lg:text-base flex items-center gap-1"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden lg:inline">
                    {user.user_metadata?.username || user.email}
                  </span>
                </Link>
                <Button variant="outline" size="sm" className="lg:size-default" onClick={signOut}>
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1 lg:gap-2">
                <Button asChild variant="ghost" size="sm" className="lg:size-default">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild size="sm" className="lg:size-default">
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button - Only visible on mobile */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu - Slide down from top */}
        <div className={`
          md:hidden overflow-hidden transition-all duration-300 ease-in-out
          ${isMobileMenuOpen 
            ? 'max-h-96 opacity-100 mt-4' 
            : 'max-h-0 opacity-0 mt-0'
          }
        `}>
          <nav className="flex flex-col gap-2 pb-4 border-t border-border pt-4">
            <Button 
              asChild 
              variant="ghost" 
              className="justify-start h-12 text-base"
              onClick={closeMobileMenu}
            >
              <Link to="/">🔥 Trending</Link>
            </Button>
            
            <Button 
              asChild 
              variant="ghost" 
              className="justify-start h-12 text-base"
              onClick={closeMobileMenu}
            >
              <Link to="/merch">🛍️ Merch</Link>
            </Button>
            
            <Button 
              asChild 
              variant="ghost" 
              className="justify-start h-12 text-base"
              onClick={closeMobileMenu}
            >
              <Link to="/how-it-works">❓ How It Works</Link>
            </Button>

            {user && (
              <div onClick={closeMobileMenu}>
                <SuggestInfluencer />
              </div>
            )}

            <div className="border-t border-border pt-3 mt-2">
              {user ? (
                <div className="flex flex-col gap-2">
                  <Button 
                    asChild 
                    variant="ghost" 
                    className="justify-start h-12 text-base"
                    onClick={closeMobileMenu}
                  >
                    <Link to={`/user/${user.id}`} className="flex items-center gap-3">
                      <User className="w-5 h-5" />
                      👤 {user.user_metadata?.username || user.email}
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="justify-start h-12 text-base"
                    onClick={() => {
                      signOut();
                      closeMobileMenu();
                    }}
                  >
                    🚪 Logout
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button 
                    asChild 
                    variant="ghost" 
                    className="justify-start h-12 text-base"
                    onClick={closeMobileMenu}
                  >
                    <Link to="/login">🔐 Login</Link>
                  </Button>
                  <Button 
                    asChild 
                    className="justify-start h-12 text-base"
                    onClick={closeMobileMenu}
                  >
                    <Link to="/signup">✨ Sign Up</Link>
                  </Button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}
    </header>
  );
};

export default Header;
