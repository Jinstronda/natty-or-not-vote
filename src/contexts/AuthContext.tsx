
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { withDatabaseTimeout, useLoadingTimeout } from '@/utils/loadingTimeout';

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
  const queryClient = useQueryClient();
  
  // Timeout protection for auth operations
  const authTimeout = useLoadingTimeout({
    timeout: 15000, // 15 second max for auth operations
    operation: 'Authentication',
    onTimeout: () => {
      console.error('[AuthContext] Authentication timed out - forcing completion');
      setLoading(false);
      toast({
        title: "Connection Timeout",
        description: "Authentication is taking longer than expected. Please refresh the page.",
        variant: "destructive",
      });
    },
    enableLogging: true
  });

  useEffect(() => {
    let mounted = true;
    
    // Start auth timeout protection
    authTimeout.startLoading();

    // Check for stale auth state and clear if necessary
    const clearStaleState = () => {
      const lastActivity = localStorage.getItem('lastAuthActivity');
      const now = Date.now();
      
      // If no activity recorded or it's been more than 1 hour, clear everything
      if (!lastActivity || now - parseInt(lastActivity) > 3600000) {
        console.log('[AuthContext] Clearing potentially stale auth state');
        localStorage.removeItem('lastAuthActivity');
        // Clear any stale Supabase state
        supabase.auth.signOut({ scope: 'local' });
      }
    };

    // Get initial session with timeout protection and stale state handling
    const getInitialSession = async () => {
      try {
        console.log('[AuthContext] Initializing session...');
        
        // Clear stale state first
        clearStaleState();
        
        const sessionResult = await withDatabaseTimeout(
          () => supabase.auth.getSession(),
          { timeout: 8000, operation: 'getInitialSession' }
        );
        
        if (!mounted) return;
        
        if (sessionResult.data.session?.user) {
          console.log('[AuthContext] Found existing session for user:', sessionResult.data.session.user.id);
          
          // Record successful auth activity
          localStorage.setItem('lastAuthActivity', Date.now().toString());
          
          const user = await createUserFromSupabase(sessionResult.data.session.user);
          setUser(user);
        } else {
          console.log('[AuthContext] No existing session found');
          // Ensure we're in a clean state
          setUser(null);
        }
        
        authTimeout.completeLoading();
        setLoading(false);
      } catch (error) {
        console.error('[AuthContext] Error getting initial session:', error);
        if (mounted) {
          // Force clean state on initialization error
          setUser(null);
          authTimeout.completeLoading(error instanceof Error ? error.message : 'Session initialization failed');
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes with complete event coverage
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('[AuthContext] Auth event:', event, 'User ID:', session?.user?.id);
        
        try {
          if (event === 'SIGNED_IN' && session?.user) {
            console.log('[AuthContext] User signed in:', session.user.id);
            
            // Record successful auth activity
            localStorage.setItem('lastAuthActivity', Date.now().toString());
            
            const user = await createUserFromSupabase(session.user);
            setUser(user);
            // Invalidate auth-dependent queries
            queryClient.invalidateQueries({ queryKey: ['user-vote'] });
            queryClient.invalidateQueries({ queryKey: ['vote-stats'] });
          } else if (event === 'TOKEN_REFRESHED' && session?.user) {
            // Handle token refresh without expensive DB calls
            if (!user || user.id !== session.user.id) {
              console.log('[AuthContext] Token refreshed, updating user data');
              
              // Update activity timestamp
              localStorage.setItem('lastAuthActivity', Date.now().toString());
              
              const refreshedUser = await createUserFromSupabase(session.user);
              setUser(refreshedUser);
              queryClient.invalidateQueries({ queryKey: ['user-vote'] });
            } else {
              console.log('[AuthContext] Token refreshed, user data unchanged');
              // Still update activity timestamp
              localStorage.setItem('lastAuthActivity', Date.now().toString());
            }
          } else if (event === 'SIGNED_OUT') {
            console.log('[AuthContext] User signed out');
            setUser(null);
            queryClient.clear();
            // Clear activity tracking
            localStorage.removeItem('lastAuthActivity');
          }
        } catch (error) {
          console.error('[AuthContext] Error in auth state change:', error);
          
          // On critical auth errors, force clean state
          if (event === 'SIGNED_OUT' || error instanceof Error && error.message.includes('JWT')) {
            console.warn('[AuthContext] Forcing clean auth state due to error');
            setUser(null);
            queryClient.clear();
            localStorage.removeItem('lastAuthActivity');
          }
        }
        
        if (mounted) {
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      authTimeout.cleanup();
      subscription.unsubscribe();
    };
  }, [queryClient, authTimeout]);

  const createUserFromSupabase = async (supabaseUser: SupabaseUser): Promise<User> => {
    try {
      // Get profile with timeout protection
      const profileResult = await withDatabaseTimeout(
        () => supabase
          .from('profiles')
          .select('*')
          .eq('id', supabaseUser.id)
          .single(),
        { timeout: 5000, operation: 'getProfile' }
      );

      if (profileResult.data && !profileResult.error) {
        return {
          id: profileResult.data.id,
          email: profileResult.data.email,
          username: profileResult.data.username,
          role: profileResult.data.role,
          profile_picture_url: profileResult.data.profile_picture_url || undefined
        };
      }

      // Only create profile if explicitly missing (not on token refresh)
      if (profileResult.error?.code === 'PGRST116') {
        console.log('[AuthContext] Profile not found, creating new profile for:', supabaseUser.id);
        const username = supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || 'user';
        const isAdmin = supabaseUser.email === 'jistronda100@gmail.com';
        
        const createResult = await withDatabaseTimeout(
          () => supabase
            .from('profiles')
            .insert({
              id: supabaseUser.id,
              email: supabaseUser.email || '',
              username: username,
              role: isAdmin ? 'admin' : 'user'
            })
            .select('*')
            .single(),
          { timeout: 5000, operation: 'createProfile' }
        );

        if (createResult.data && !createResult.error) {
          return {
            id: createResult.data.id,
            email: createResult.data.email,
            username: createResult.data.username,
            role: createResult.data.role,
            profile_picture_url: createResult.data.profile_picture_url || undefined
          };
        }
      }
    } catch (error) {
      console.error('[AuthContext] Error in createUserFromSupabase:', error);
    }

    // Fallback to user metadata (crucial for token refresh scenarios)
    console.log('[AuthContext] Using fallback user data for:', supabaseUser.id);
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
