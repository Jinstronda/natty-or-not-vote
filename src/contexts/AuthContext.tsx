import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { useUserProfile } from '@/hooks/useUserProfile';
import { User } from '@/types/auth';

interface AuthContextValue {
  user: User | null;
  supabaseUser: SupabaseUser | null; // Add separate supabase user for hooks that need it
  loading: boolean;
  signUp: (email: string, password: string, username?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { fetchUserProfile } = useUserProfile();

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        }
        
        if (session?.user) {
          setSupabaseUser(session.user);
          try {
            const userProfile = await fetchUserProfile(session.user);
            setUser(userProfile);
          } catch (profileError) {
            console.error('Error fetching user profile:', profileError);
            setUser(null);
          }
        } else {
          setUser(null);
          setSupabaseUser(null);
        }
      } catch (error) {
        console.error('Exception getting session:', error);
        setUser(null);
        setSupabaseUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (session?.user) {
        setSupabaseUser(session.user);
        // Defer profile fetching to avoid blocking the auth callback
        setTimeout(async () => {
          try {
            const userProfile = await fetchUserProfile(session.user);
            setUser(userProfile);
          } catch (profileError) {
            console.error('Error fetching user profile:', profileError);
            setUser(null);
          } finally {
            setLoading(false);
          }
        }, 0);
      } else {
        setUser(null);
        setSupabaseUser(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const signUp = async (email: string, password: string, username?: string) => {
    setLoading(true);
    try {
      // Validate inputs before sending to Supabase
      if (!email || !email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }
      
      if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      
      if (username && username.length < 3) {
        throw new Error('Username must be at least 3 characters long');
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            username: username?.trim(),
          },
        },
      });
      
      if (error) {
        // Handle specific Supabase errors with user-friendly messages
        if (error.message.includes('User already registered')) {
          throw new Error('An account with this email already exists. Please try signing in instead.');
        } else if (error.message.includes('Invalid email')) {
          throw new Error('Please enter a valid email address');
        } else if (error.message.includes('Weak password')) {
          throw new Error('Password is too weak. Please choose a stronger password.');
        } else if (error.message.includes('rate limit')) {
          throw new Error('Too many signup attempts. Please wait a moment and try again.');
        } else if (error.status === 422) {
          throw new Error('There was an issue creating your account. Please try a different username or contact support.');
        } else {
          // Generic error with original message
          throw new Error(error.message || 'Failed to create account. Please try again.');
        }
      }

      // If signup requires email confirmation, inform the user
      if (data?.user && !data.session) {
        throw new Error('Please check your email and click the confirmation link to complete your signup.');
      }
    } catch (err: any) {
      // Re-throw the error to be handled by the component
      throw err;
    } finally {
      // Don't set loading to false here - onAuthStateChange will handle it
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } finally {
      // Don't set loading to false here - onAuthStateChange will handle it
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } finally {
      // Don't set loading to false here - onAuthStateChange will handle it
    }
  };

  return (
    <AuthContext.Provider value={{ user, supabaseUser, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
