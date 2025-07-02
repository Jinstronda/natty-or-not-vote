import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import SuggestInfluencer from "@/components/SuggestInfluencer";
import { Menu, X, User, ChevronRight } from "lucide-react";

const Header = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes (UX best practice)
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Helper function to determine if a route is current (Research: 95% of sites fail to highlight current scope)
  const isCurrentRoute = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  // Enhanced navigation items with current scope highlighting
  const navigationItems = [
    { path: "/", label: "Trending", emoji: "🔥", description: "Latest fitness content" },
    { path: "/merch", label: "Merch", emoji: "🛍️", description: "Official store" },
    { path: "/how-it-works", label: "How It Works", emoji: "❓", description: "Learn about our process" },
  ];

  return (
    <header 
      className="border-b border-border bg-card/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm"
      role="banner"
    >
      <div className="container mx-auto px-3 sm:px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo - Enhanced with better mobile sizing */}
          <Link 
            to="/" 
            className="font-heading font-bold text-lg sm:text-xl md:text-2xl hover:opacity-90 transition-opacity focus:ring-2 focus:ring-primary focus:outline-none rounded-md"
            onClick={closeMobileMenu}
            aria-label="Natty or Juicy Home"
          >
            <span className="text-natty">Natty</span> or <span className="text-juicy">Juicy</span>
          </Link>
          
          {/* Desktop Navigation - Hidden on mobile with current scope highlighting */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-4" role="navigation" aria-label="Main navigation">
            {navigationItems.map((item) => (
              <Button 
                key={item.path}
                asChild 
                variant={isCurrentRoute(item.path) ? "secondary" : "ghost"} 
                size="sm" 
                className={`lg:size-default ${isCurrentRoute(item.path) ? 'bg-primary/10 text-primary font-semibold' : ''}`}
              >
                <Link to={item.path} title={item.description}>
                  {item.label}
                </Link>
              </Button>
            ))}
            {user && <SuggestInfluencer />}
            
            {user ? (
              <div className="flex items-center gap-2 lg:gap-4">
                <Link 
                  to={`/user/${user.id}`}
                  className="font-medium hover:text-primary transition-colors text-sm lg:text-base flex items-center gap-1 p-2 hover:bg-muted rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  title="View your profile"
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

          {/* Mobile Menu Button - Enhanced with better accessibility */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-3 hover:bg-muted rounded-lg transition-colors focus:ring-2 focus:ring-primary focus:outline-none"
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" aria-hidden="true" />
            ) : (
              <Menu className="w-6 h-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu - Enhanced with better UX patterns */}
        <div 
          id="mobile-navigation"
          className={`
            md:hidden overflow-hidden transition-all duration-300 ease-in-out
            ${isMobileMenuOpen 
              ? 'max-h-screen opacity-100 mt-4' 
              : 'max-h-0 opacity-0 mt-0'
            }
          `}
          role="navigation" 
          aria-label="Mobile navigation"
        >
          <nav className="flex flex-col gap-1 pb-4 border-t border-border pt-4">
            {/* Enhanced navigation items with current scope highlighting and descriptions */}
            {navigationItems.map((item) => (
              <Button 
                key={item.path}
                asChild 
                variant={isCurrentRoute(item.path) ? "secondary" : "ghost"}
                className={`justify-start h-14 text-base group ${
                  isCurrentRoute(item.path) ? 'bg-primary/10 text-primary font-semibold border-l-4 border-primary' : ''
                }`}
                onClick={closeMobileMenu}
              >
                <Link to={item.path} className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <span className="text-lg" aria-hidden="true">{item.emoji}</span>
                    <div className="flex flex-col items-start">
                      <span className="font-semibold">{item.label}</span>
                      <span className="text-xs text-muted-foreground">{item.description}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                </Link>
              </Button>
            ))}

            {user && (
              <div className="py-2" onClick={closeMobileMenu}>
                <SuggestInfluencer />
              </div>
            )}

            {/* User section with enhanced mobile UX */}
            <div className="border-t border-border pt-3 mt-2">
              {user ? (
                <div className="flex flex-col gap-2">
                  <Button 
                    asChild 
                    variant="ghost" 
                    className="justify-start h-14 text-base group"
                    onClick={closeMobileMenu}
                  >
                    <Link to={`/user/${user.id}`} className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5" aria-hidden="true" />
                        <div className="flex flex-col items-start">
                          <span className="font-semibold">👤 My Profile</span>
                          <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                            {user.user_metadata?.username || user.email}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="justify-start h-12 text-base mx-2"
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

      {/* Enhanced Mobile Menu Backdrop with better accessibility */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={closeMobileMenu}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              closeMobileMenu();
            }
          }}
          aria-hidden="true"
          role="presentation"
        />
      )}
    </header>
  );
};

export default Header;
