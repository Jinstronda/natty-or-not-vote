
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (username: string, email: string, password: string) => Promise<boolean>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Simple logging function that doesn't depend on useAuth
  const logSecurityEvent = (eventType: string, eventDetails: any = {}) => {
    console.log('Security Event:', {
      event_type: eventType,
      event_details: eventDetails,
      timestamp: new Date().toISOString()
    });
  };

  const fetchUserProfile = React.useCallback(async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (profile && !error) {
        setUser({
          id: profile.id,
          username: profile.username,
          email: profile.email,
          role: profile.role as 'user' | 'admin'
        });
      } else {
        // If no profile exists, create a basic user object
        setUser({
          id: supabaseUser.id,
          username: supabaseUser.email?.split('@')[0] || 'user',
          email: supabaseUser.email || '',
          role: 'user'
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Still set a basic user object even if profile fetch fails
      setUser({
        id: supabaseUser.id,
        username: supabaseUser.email?.split('@')[0] || 'user',
        email: supabaseUser.email || '',
        role: 'user'
      });
    }
  }, []);

  React.useEffect(() => {
    let isMounted = true;

    // Get initial session first
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else if (session?.user && isMounted) {
          await fetchUserProfile(session.user);
        }
      } catch (error) {
        console.error('Failed to get initial session:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Initialize auth first
    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      
      console.log('Auth state change:', event, !!session);
      
      try {
        if (session?.user) {
          await fetchUserProfile(session.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setUser(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      const success = !error;
      logSecurityEvent(
        success ? 'login_attempt' : 'failed_login',
        { email, success }
      );
      
      return success;
    } catch (error) {
      logSecurityEvent('failed_login', { email, success: false });
      return false;
    }
  };

  const logout = async () => {
    logSecurityEvent('logout');
    await supabase.auth.signOut();
    setUser(null);
  };

  const signup = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          },
        },
      });

      return !error;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, loading }}>
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
