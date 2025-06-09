
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile';
import { loginWithEmail, signOut, signupWithEmail } from '@/services/authService';
import { AuthContextType, User } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { fetchUserProfile } = useUserProfile();

  // Stable user update function to prevent unnecessary re-renders
  const updateUser = useCallback((newUser: User | null) => {
    console.log('AuthContext: Updating user:', newUser?.username || 'null');
    setUser(newUser);
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('AuthContext: Initializing auth...');
        
        // First, get the current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthContext: Session error:', error);
        }

        if (mounted) {
          if (session?.user) {
            console.log('AuthContext: User found in session, fetching profile...');
            try {
              const userData = await fetchUserProfile(session.user);
              console.log('AuthContext: User profile fetched successfully:', userData.username);
              updateUser(userData);
            } catch (profileError) {
              console.error('AuthContext: Profile fetch error, using fallback:', profileError);
              updateUser({
                id: session.user.id,
                username: session.user.email?.split('@')[0] || 'user',
                email: session.user.email || '',
                role: 'user'
              });
            }
          } else {
            console.log('AuthContext: No user session found');
            updateUser(null);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('AuthContext: Auth initialization error:', error);
        if (mounted) {
          updateUser(null);
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
            updateUser(userData);
          } catch (profileError) {
            console.error('AuthContext: Profile fetch error after sign in:', profileError);
            updateUser({
              id: session.user.id,
              username: session.user.email?.split('@')[0] || 'user',
              email: session.user.email || '',
              role: 'user'
            });
          }
        } else if (event === 'SIGNED_OUT' || !session) {
          console.log('AuthContext: User signed out or no session');
          updateUser(null);
        }
        
        // Always update loading state after auth events
        setLoading(false);
      } catch (error) {
        console.error('AuthContext: Error in auth state change:', error);
        if (event === 'SIGNED_OUT' || !session) {
          updateUser(null);
        }
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
  }, [fetchUserProfile, updateUser]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('AuthContext: Attempting login for:', email);
      const success = await loginWithEmail(email, password);
      console.log('AuthContext: Login result:', success);
      return success;
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      console.log('AuthContext: Logging out...');
      await signOut();
      updateUser(null);
      console.log('AuthContext: Logout complete');
    } catch (error) {
      console.error('AuthContext: Logout error:', error);
    }
  }, [updateUser]);

  const signup = useCallback(async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      console.log('AuthContext: Attempting signup for:', email);
      const success = await signupWithEmail(username, email, password);
      console.log('AuthContext: Signup result:', success);
      return success;
    } catch (error) {
      console.error('AuthContext: Signup error:', error);
      return false;
    }
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({
    user,
    login,
    logout,
    signup,
    loading
  }), [user, login, logout, signup, loading]);

  console.log('AuthContext: Render - user exists:', !!user, 'loading:', loading);

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
