
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

    const initAuth = async () => {
      try {
        // Get the current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
        }

        if (mounted) {
          if (session?.user) {
            const userData = await fetchUserProfile(session.user);
            setUser(userData);
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
          const userData = await fetchUserProfile(session.user);
          setUser(userData);
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
    const success = await loginWithEmail(email, password);
    return success;
  };

  const logout = async () => {
    await signOut();
    setUser(null);
  };

  const signup = async (username: string, email: string, password: string): Promise<boolean> => {
    return await signupWithEmail(username, email, password);
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
