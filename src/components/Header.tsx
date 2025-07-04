import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import SuggestInfluencer from "@/components/SuggestInfluencer";
import { Menu, X, User, ChevronRight } from "lucide-react";
import { useMobileHeaderSafety } from "@/hooks/useMobileHeaderSafety";

const Header = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Mobile header safety to prevent backdrop blur conflicts and ensure proper functionality
  const { runManualSafetyCheck } = useMobileHeaderSafety({
    preventBackdropBlurConflicts: true,
    ensureHeaderVisibility: true,
    fixTouchTargets: true,
    monitorZIndexStacking: true
  });

  // Close mobile menu when route changes (UX best practice)
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    
    // Run safety check after menu state change to ensure header remains functional
    setTimeout(() => {
      runManualSafetyCheck();
    }, 100);
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
      className="border-b border-border bg-card sticky top-0 z-50 shadow-sm w-full"
      role="banner"
    >
      <div className="container mx-auto px-4 py-3 max-w-full">
        <div className="flex items-center justify-between">
          {/* Logo - Enhanced with better mobile sizing */}
          <Link 
            to="/" 
            className="font-heading font-bold text-base sm:text-lg md:text-xl xl:text-2xl hover:opacity-90 transition-opacity focus:ring-2 focus:ring-primary focus:outline-none rounded-md"
            onClick={closeMobileMenu}
            aria-label="Natty or Juicy Home"
          >
            <span className="text-natty">Natty</span> or <span className="text-juicy">Juicy</span>
          </Link>
          
          {/* Desktop Navigation - Force hidden on mobile screens */}
          <nav className="hidden xl:flex items-center gap-1 2xl:gap-4" role="navigation" aria-label="Main navigation">
            {navigationItems.map((item) => (
              <Button 
                key={item.path}
                asChild 
                variant={isCurrentRoute(item.path) ? "secondary" : "ghost"} 
                size="sm" 
                className={`2xl:size-default ${isCurrentRoute(item.path) ? 'bg-primary/10 text-primary font-semibold' : ''}`}
              >
                <Link to={item.path} title={item.description}>
                  {item.label}
                </Link>
              </Button>
            ))}
            {user && <SuggestInfluencer />}
            
            {user ? (
              <div className="flex items-center gap-2 2xl:gap-4">
                <Link 
                  to={`/user/${user.id}`}
                  className="font-medium hover:text-primary transition-colors text-sm 2xl:text-base flex items-center gap-1 p-2 hover:bg-muted rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  title="View your profile"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden 2xl:inline">
                    {user.user_metadata?.username || user.email}
                  </span>
                </Link>
                <Button variant="outline" size="sm" className="2xl:size-default" onClick={signOut}>
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1 2xl:gap-2">
                <Button asChild variant="ghost" size="sm" className="2xl:size-default">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild size="sm" className="2xl:size-default">
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button - Show on everything except extra large screens */}
          <button
            onClick={toggleMobileMenu}
            className="xl:hidden p-3 hover:bg-muted rounded-lg transition-colors focus:ring-2 focus:ring-primary focus:outline-none"
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

        {/* ULTIMATE FIX: Mobile Menu Backdrop with pointer-events exclusion */}
        {isMobileMenuOpen && (
          <div
            className="xl:hidden fixed inset-0 bg-black/20"
            style={{ 
              zIndex: 25, // Well below header z-50
              pointerEvents: 'none' // Allow clicks to pass through
            }}
            aria-hidden="true"
            role="presentation"
          />
        )}
        {/* Separate clickable area that doesn't interfere with header */}
        {isMobileMenuOpen && (
          <div
            className="xl:hidden fixed bg-transparent"
            style={{ 
              top: '73px', // Below header
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 25,
              pointerEvents: 'auto'
            }}
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
        {/* Mobile Navigation Menu - Show on everything except extra large screens */}
        <div 
          id="mobile-navigation"
          className={`
            xl:hidden overflow-hidden transition-all duration-300 ease-in-out w-full
            ${isMobileMenuOpen 
              ? 'max-h-screen opacity-100 mt-4' 
              : 'max-h-0 opacity-0 mt-0'
            }
          `}
          role="navigation" 
          aria-label="Mobile navigation"
          style={{ zIndex: 50, position: 'relative' }}
        >
          <nav className="flex flex-col gap-1 pb-4 border-t border-border pt-4 w-full">
            {/* Enhanced navigation items with current scope highlighting and descriptions */}
            {navigationItems.map((item) => (
              <Button 
                key={item.path}
                asChild 
                variant={isCurrentRoute(item.path) ? "secondary" : "ghost"}
                className={`justify-start h-14 text-base group w-full ${
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
              <div className="py-2 w-full" onClick={closeMobileMenu}>
                <SuggestInfluencer />
              </div>
            )}

            {/* User section with enhanced mobile UX */}
            <div className="border-t border-border pt-3 mt-2 w-full">
              {user ? (
                <div className="flex flex-col gap-2 w-full">
                  <Button 
                    asChild 
                    variant="ghost" 
                    className="justify-start h-14 text-base group w-full"
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
                    className="justify-start h-12 text-base mx-2 w-auto"
                    onClick={() => {
                      signOut();
                      closeMobileMenu();
                    }}
                  >
                    🚪 Logout
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 w-full">
                  <Button 
                    asChild 
                    variant="ghost" 
                    className="justify-start h-12 text-base w-full"
                    onClick={closeMobileMenu}
                    data-testid="mobile-login-btn"
                  >
                    <Link to="/login">🔐 Login</Link>
                  </Button>
                  <Button 
                    asChild 
                    className="justify-start h-12 text-base w-full"
                    onClick={closeMobileMenu}
                    data-testid="mobile-signup-btn"
                  >
                    <Link to="/signup">✨ Sign Up</Link>
                  </Button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
