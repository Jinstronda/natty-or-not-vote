
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
        console.log('Initializing auth...');
        
        // Get the current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
        }

        console.log('Current session:', !!session);

        if (mounted) {
          if (session?.user) {
            console.log('User found in session, fetching profile...');
            try {
              const userData = await fetchUserProfile(session.user);
              console.log('User profile fetched:', userData);
              setUser(userData);
            } catch (profileError) {
              console.error('Profile fetch error:', profileError);
              // Still set basic user data even if profile fetch fails
              setUser({
                id: session.user.id,
                username: session.user.email?.split('@')[0] || 'user',
                email: session.user.email || '',
                role: 'user'
              });
            }
          } else {
            console.log('No user session found');
            setUser(null);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, !!session?.user);
      
      if (!mounted) return;

      try {
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in, fetching profile...');
          try {
            const userData = await fetchUserProfile(session.user);
            console.log('Profile fetched after sign in:', userData);
            setUser(userData);
          } catch (profileError) {
            console.error('Profile fetch error after sign in:', profileError);
            // Still set basic user data even if profile fetch fails
            setUser({
              id: session.user.id,
              username: session.user.email?.split('@')[0] || 'user',
              email: session.user.email || '',
              role: 'user'
            });
          }
        } else if (event === 'SIGNED_OUT' || !session) {
          console.log('User signed out or no session');
          setUser(null);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          console.log('Token refreshed, updating user data');
          // Don't refetch profile on token refresh, just ensure user is still set
          if (!user && session.user) {
            try {
              const userData = await fetchUserProfile(session.user);
              setUser(userData);
            } catch (profileError) {
              console.error('Profile fetch error on token refresh:', profileError);
            }
          }
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
        }
      }
      
      if (mounted) {
        setLoading(false);
      }
    });

    // Initialize auth
    initializeAuth();

    return () => {
      console.log('Cleaning up auth context');
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting login for:', email);
      const success = await loginWithEmail(email, password);
      console.log('Login result:', success);
      return success;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out...');
      await signOut();
      setUser(null);
      console.log('Logout complete');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const signup = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting signup for:', email);
      const success = await signupWithEmail(username, email, password);
      console.log('Signup result:', success);
      return success;
    } catch (error) {
      console.error('Signup error:', error);
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

  console.log('AuthContext render - user:', !!user, 'loading:', loading);

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
