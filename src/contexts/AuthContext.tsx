
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile';
import { AuthContextType, User } from '@/types/auth';
import type { Session } from '@supabase/supabase-js';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const { fetchUserProfile } = useUserProfile();

  const updateUser = useCallback(async (newSession: Session | null) => {
    console.log('AuthContext: Processing session update:', !!newSession);
    
    if (!newSession?.user) {
      console.log('AuthContext: No session/user, clearing state');
      setUser(null);
      setSession(null);
      return;
    }

    try {
      console.log('AuthContext: Fetching user profile for:', newSession.user.id);
      const userData = await fetchUserProfile(newSession.user);
      console.log('AuthContext: Profile fetched successfully:', userData.username);
      setUser(userData);
      setSession(newSession);
    } catch (error) {
      console.error('AuthContext: Profile fetch failed, using fallback:', error);
      // Create fallback user object
      const fallbackUser: User = {
        id: newSession.user.id,
        username: newSession.user.user_metadata?.username || 
                 newSession.user.email?.split('@')[0] || 
                 'user',
        email: newSession.user.email || '',
        role: 'user'
      };
      setUser(fallbackUser);
      setSession(newSession);
    }
  }, [fetchUserProfile]);

  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    const initializeAuth = async () => {
      try {
        console.log('AuthContext: Initializing authentication...');
        
        // Add retry logic for production environments
        const getSessionWithRetry = async (): Promise<{ data: { session: Session | null }, error: any }> => {
          while (retryCount < maxRetries) {
            try {
              const result = await supabase.auth.getSession();
              return result;
            } catch (error) {
              retryCount++;
              console.log(`AuthContext: Session fetch attempt ${retryCount} failed:`, error);
              if (retryCount >= maxRetries) throw error;
              await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            }
          }
          throw new Error('Max retries exceeded');
        };

        const { data: { session: initialSession }, error } = await getSessionWithRetry();
        
        if (error) {
          console.error('AuthContext: Session fetch error:', error);
        }

        if (mounted) {
          if (initialSession) {
            console.log('AuthContext: Found existing session');
            await updateUser(initialSession);
          } else {
            console.log('AuthContext: No existing session');
            setUser(null);
            setSession(null);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('AuthContext: Initialization error:', error);
        if (mounted) {
          setUser(null);
          setSession(null);
          setLoading(false);
        }
      }
    };

    // Set up auth state listener with improved error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthContext: Auth state changed:', event, 'Has session:', !!session);
      
      if (!mounted) return;

      try {
        if (event === 'SIGNED_IN' && session) {
          console.log('AuthContext: User signed in');
          await updateUser(session);
        } else if (event === 'SIGNED_OUT' || !session) {
          console.log('AuthContext: User signed out');
          setUser(null);
          setSession(null);
        } else if (event === 'TOKEN_REFRESHED' && session) {
          console.log('AuthContext: Token refreshed');
          await updateUser(session);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('AuthContext: Auth state change error:', error);
        setLoading(false);
      }
    });

    // Initialize auth with a small delay to ensure DOM is ready
    const timeoutId = setTimeout(initializeAuth, 100);

    return () => {
      console.log('AuthContext: Cleaning up');
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [updateUser]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('AuthContext: Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('AuthContext: Login error:', error);
        return false;
      }

      if (data.user && data.session) {
        console.log('AuthContext: Login successful');
        return true;
      }

      return false;
    } catch (error) {
      console.error('AuthContext: Login exception:', error);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      console.log('AuthContext: Logging out...');
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      console.log('AuthContext: Logout complete');
    } catch (error) {
      console.error('AuthContext: Logout error:', error);
    }
  }, []);

  const signup = useCallback(async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      console.log('AuthContext: Attempting signup for:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          }
        },
      });

      if (error) {
        console.error('AuthContext: Signup error:', error);
        return false;
      }

      if (data.user) {
        console.log('AuthContext: Signup successful');
        return true;
      }

      return false;
    } catch (error) {
      console.error('AuthContext: Signup exception:', error);
      return false;
    }
  }, []);

  const contextValue = React.useMemo(() => ({
    user,
    login,
    logout,
    signup,
    loading
  }), [user, login, logout, signup, loading]);

  console.log('AuthContext: Rendering - user:', !!user, 'loading:', loading);

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
