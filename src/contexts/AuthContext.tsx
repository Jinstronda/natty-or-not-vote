
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile';
import { loginWithEmail, signOut, signupWithEmail } from '@/services/authService';
import { AuthContextType, User } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { fetchUserProfile } = useUserProfile();

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('AuthContext: Initializing auth...');
        
        // Get the current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthContext: Session error:', error);
        }

        console.log('AuthContext: Current session exists:', !!session);

        if (mounted) {
          if (session?.user) {
            console.log('AuthContext: User found in session, fetching profile...');
            try {
              const userData = await fetchUserProfile(session.user);
              console.log('AuthContext: User profile fetched successfully:', userData.username);
              setUser(userData);
            } catch (profileError) {
              console.error('AuthContext: Profile fetch error, using fallback:', profileError);
              // Still set basic user data even if profile fetch fails
              setUser({
                id: session.user.id,
                username: session.user.email?.split('@')[0] || 'user',
                email: session.user.email || '',
                role: 'user'
              });
            }
          } else {
            console.log('AuthContext: No user session found');
            setUser(null);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('AuthContext: Auth initialization error:', error);
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthContext: Auth state change:', event, 'Session exists:', !!session?.user);
      
      if (!mounted) return;

      try {
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('AuthContext: User signed in, fetching profile...');
          try {
            const userData = await fetchUserProfile(session.user);
            console.log('AuthContext: Profile fetched after sign in:', userData.username);
            setUser(userData);
          } catch (profileError) {
            console.error('AuthContext: Profile fetch error after sign in, using fallback:', profileError);
            // Still set basic user data even if profile fetch fails
            setUser({
              id: session.user.id,
              username: session.user.email?.split('@')[0] || 'user',
              email: session.user.email || '',
              role: 'user'
            });
          }
        } else if (event === 'SIGNED_OUT' || !session) {
          console.log('AuthContext: User signed out or no session');
          setUser(null);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          console.log('AuthContext: Token refreshed');
          // Only refetch if we don't have user data
          if (!user && session.user) {
            try {
              const userData = await fetchUserProfile(session.user);
              setUser(userData);
            } catch (profileError) {
              console.error('AuthContext: Profile fetch error on token refresh:', profileError);
            }
          }
        }
      } catch (error) {
        console.error('AuthContext: Error in auth state change:', error);
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
        }
      }
      
      if (mounted && event !== 'TOKEN_REFRESHED') {
        setLoading(false);
      }
    });

    // Initialize auth
    initializeAuth();

    return () => {
      console.log('AuthContext: Cleaning up auth context');
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('AuthContext: Attempting login for:', email);
      const success = await loginWithEmail(email, password);
      console.log('AuthContext: Login result:', success);
      return success;
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      console.log('AuthContext: Logging out...');
      await signOut();
      setUser(null);
      console.log('AuthContext: Logout complete');
    } catch (error) {
      console.error('AuthContext: Logout error:', error);
    }
  };

  const signup = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      console.log('AuthContext: Attempting signup for:', email);
      const success = await signupWithEmail(username, email, password);
      console.log('AuthContext: Signup result:', success);
      return success;
    } catch (error) {
      console.error('AuthContext: Signup error:', error);
      return false;
    }
  };

  const contextValue = {
    user,
    login,
    logout,
    signup,
    loading
  };

  console.log('AuthContext: Render - user exists:', !!user, 'loading:', loading, 'user role:', user?.role);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
