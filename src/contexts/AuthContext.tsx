
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
        const userData = {
          id: profile.id,
          username: profile.username,
          email: profile.email,
          role: profile.role as 'user' | 'admin'
        };
        setUser(userData);
        return userData;
      } else {
        // If no profile exists, create a basic user object
        const userData = {
          id: supabaseUser.id,
          username: supabaseUser.email?.split('@')[0] || 'user',
          email: supabaseUser.email || '',
          role: 'user' as const
        };
        setUser(userData);
        return userData;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Still set a basic user object even if profile fetch fails
      const userData = {
        id: supabaseUser.id,
        username: supabaseUser.email?.split('@')[0] || 'user',
        email: supabaseUser.email || '',
        role: 'user' as const
      };
      setUser(userData);
      return userData;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        // Get the current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
        }

        if (mounted) {
          if (session?.user) {
            await fetchUserProfile(session.user);
          } else {
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

    initAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, !!session);
      
      if (!mounted) return;

      try {
        if (session?.user) {
          await fetchUserProfile(session.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setUser(null);
      }
      
      if (mounted) {
        setLoading(false);
      }
    });

    // Add beforeunload event listener to logout when closing browser/tab
    const handleBeforeUnload = () => {
      supabase.auth.signOut();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
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
