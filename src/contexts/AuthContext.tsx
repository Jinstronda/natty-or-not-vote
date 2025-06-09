
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  profile_picture_url?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const user = await createUserFromSupabase(session.user);
        setUser(user);
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const user = await createUserFromSupabase(session.user);
          setUser(user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const createUserFromSupabase = async (supabaseUser: SupabaseUser): Promise<User> => {
    try {
      // Try to get profile from database
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (profile && !error) {
        return {
          id: profile.id,
          email: profile.email,
          username: profile.username,
          role: profile.role,
          profile_picture_url: profile.profile_picture_url || undefined
        };
      }

      // If profile doesn't exist, create it
      console.log('Profile not found, creating one...');
      const username = supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || 'user';
      const isAdmin = supabaseUser.email === 'jistronda100@gmail.com';
      
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          username: username,
          role: isAdmin ? 'admin' : 'user'
        })
        .select('*')
        .single();

      if (newProfile && !createError) {
        return {
          id: newProfile.id,
          email: newProfile.email,
          username: newProfile.username,
          role: newProfile.role,
          profile_picture_url: newProfile.profile_picture_url || undefined
        };
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
    }

    // Ultimate fallback to user metadata
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      username: supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || 'user',
      role: supabaseUser.email === 'jistronda100@gmail.com' ? 'admin' : 'user'
    };
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        }
      },
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
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
