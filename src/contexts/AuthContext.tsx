
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

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

  useEffect(() => {
    let mounted = true;
    let authTimeoutId: NodeJS.Timeout | null = null;

    // Set a timeout for auth initialization
    authTimeoutId = setTimeout(() => {
      if (mounted && loading) {
        console.error('[AuthContext] Authentication timed out - forcing completion');
        setLoading(false);
        toast({
          title: "Connection Timeout",
          description: "Authentication is taking longer than expected. Please refresh the page.",
          variant: "destructive",
        });
      }
    }, 12000); // 12 second timeout (reduced from 15)

    // Check for stale auth state and clear if necessary
    const clearStaleState = async () => {
      const lastActivity = localStorage.getItem('lastAuthActivity');
      const now = Date.now();
      
      // If no activity recorded or it's been more than 1 hour, check if we have a valid session
      if (!lastActivity || now - parseInt(lastActivity) > 3600000) {
        console.log('[AuthContext] Checking for stale auth state...');
        
        // Check if there's a valid current session before clearing
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!sessionData.session) {
          // Only clear if there's actually no valid session
          console.log('[AuthContext] No valid session found, clearing stale state');
          localStorage.removeItem('lastAuthActivity');
          supabase.auth.signOut({ scope: 'local' });
        } else {
          // Valid session exists (like fresh Google OAuth), update activity timestamp
          console.log('[AuthContext] Valid session found, updating activity timestamp');
          localStorage.setItem('lastAuthActivity', String(now));
        }
      }
    };

    // Get initial session with timeout protection and stale state handling
    const getInitialSession = async () => {
      try {
        console.log('[AuthContext] Initializing session...');
        
        // Clear stale state first
        await clearStaleState();
        
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (sessionError) {
          console.error('[AuthContext] Session error:', sessionError);
          throw sessionError;
        }
        
        if (sessionData.session?.user) {
          console.log('[AuthContext] Found existing session for user:', sessionData.session.user.id);
          
          // Record successful auth activity
          localStorage.setItem('lastAuthActivity', String(Date.now()));
          
          const user = await createUserFromSupabase(sessionData.session.user);
          setUser(user);
        } else {
          console.log('[AuthContext] No existing session found');
          // Ensure we're in a clean state
          setUser(null);
        }
        
        // Clear the timeout since we completed successfully
        if (authTimeoutId) {
          clearTimeout(authTimeoutId);
          authTimeoutId = null;
        }
        setLoading(false);
      } catch (error) {
        console.error('[AuthContext] Error getting initial session:', error);
        if (mounted) {
          // Force clean state on initialization error
          setUser(null);
          // Clear the timeout
          if (authTimeoutId) {
            clearTimeout(authTimeoutId);
            authTimeoutId = null;
          }
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
            console.log('[AuthContext] User signed in, using session metadata for fast login:', session.user.id);
            
            // Record successful auth activity
            localStorage.setItem('lastAuthActivity', String(Date.now()));
            
            // Use session metadata directly for fast login (no database call)
            const fastUser: User = {
              id: session.user.id,
              email: session.user.email || '',
              username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'user',
              role: session.user.email === 'jistronda100@gmail.com' ? 'admin' : 'user'
            };
            
            setUser(fastUser);
            // Invalidate auth-dependent queries
            queryClient.invalidateQueries({ queryKey: ['user-vote'] });
            queryClient.invalidateQueries({ queryKey: ['vote-stats'] });
          } else if (event === 'TOKEN_REFRESHED' && session?.user) {
            // Handle token refresh without expensive DB calls
            if (!user || user.id !== session.user.id) {
              console.log('[AuthContext] Token refreshed, creating user from session metadata (no DB call)');
              
              // Update activity timestamp
              localStorage.setItem('lastAuthActivity', String(Date.now()));
              
              // Use session metadata directly instead of expensive DB call during token refresh
              const refreshedUser: User = {
                id: session.user.id,
                email: session.user.email || '',
                username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'user',
                role: session.user.email === 'jistronda100@gmail.com' ? 'admin' : 'user'
              };
              
              setUser(refreshedUser);
              queryClient.invalidateQueries({ queryKey: ['user-vote'] });
            } else {
              console.log('[AuthContext] Token refreshed, user data unchanged');
              // Still update activity timestamp
              localStorage.setItem('lastAuthActivity', String(Date.now()));
            }
          } else if (event === 'INITIAL_SESSION' && session?.user) {
            // Background fetch of complete profile data (non-blocking)
            console.log('[AuthContext] Initial session detected, fetching complete profile in background');
            
            try {
              const completeUser = await createUserFromSupabase(session.user);
              // Only update if user data has changed (e.g., profile_picture_url)
              if (user && (
                user.username !== completeUser.username ||
                user.profile_picture_url !== completeUser.profile_picture_url
              )) {
                console.log('[AuthContext] Updating user with complete profile data');
                setUser(completeUser);
              }
            } catch (error) {
              console.log('[AuthContext] Background profile fetch failed, keeping session metadata');
              // This is fine - we already have working user data from session metadata
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
      // Clean up timeout if it exists
      if (authTimeoutId) {
        clearTimeout(authTimeoutId);
      }
      subscription.unsubscribe();
    };
  }, []);

  const createUserFromSupabase = async (supabaseUser: SupabaseUser): Promise<User> => {
    try {
      console.log('[AuthContext] Creating user from Supabase data for:', supabaseUser.id);
      
      // Add timeout protection for database queries
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database query timeout')), 8000) // 8 second timeout
      );

      // Get profile with timeout protection
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      const { data: profileData, error: profileError } = await Promise.race([
        profilePromise,
        timeoutPromise
      ]) as any;

      if (profileData && !profileError) {
        console.log('[AuthContext] Successfully fetched profile from database');
        return {
          id: profileData.id,
          email: profileData.email,
          username: profileData.username,
          role: profileData.role,
          profile_picture_url: profileData.profile_picture_url || undefined
        };
      }

      // Only create profile if explicitly missing (not on token refresh)
      if (profileError?.code === 'PGRST116') {
        console.log('[AuthContext] Profile not found, calling create_user_profile function for:', supabaseUser.id);
        const username = supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || 'user';
        
        // Use the create_user_profile function instead of direct insert
        const createPromise = supabase.rpc('create_user_profile', {
          user_id: supabaseUser.id,
          user_email: supabaseUser.email || '',
          user_username: username
        });

        const { data: createData, error: createError } = await Promise.race([
          createPromise,
          timeoutPromise
        ]) as any;

        if (!createError) {
          console.log('[AuthContext] Successfully created new profile via function');
          // Fetch the newly created profile
          const { data: newProfileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', supabaseUser.id)
            .single();
            
          if (newProfileData) {
            return {
              id: newProfileData.id,
              email: newProfileData.email,
              username: newProfileData.username,
              role: newProfileData.role,
              profile_picture_url: newProfileData.profile_picture_url || undefined
            };
          }
        }
        
        console.warn('[AuthContext] Failed to create profile via function, using fallback');
      }
    } catch (error) {
      console.error('[AuthContext] Error in createUserFromSupabase:', error);
      
      // If it's a timeout error, log it specifically
      if (error instanceof Error && error.message === 'Database query timeout') {
        console.warn('[AuthContext] Database query timed out, using fallback user data');
      }
    }

    // Fallback to user metadata (crucial for token refresh scenarios and timeouts)
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
