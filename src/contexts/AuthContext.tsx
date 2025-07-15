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

// Timeout wrapper for Supabase operations
const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number = 10000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
    ),
  ]);
};

// Retry wrapper for Supabase operations
const withRetry = async <T,>(
  operation: () => Promise<T>, 
  maxRetries: number = 3, 
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      console.warn(`Operation failed (attempt ${i + 1}/${maxRetries}):`, error);
      
      // Don't retry certain errors
      if (error.message?.includes('Invalid login credentials') || 
          error.message?.includes('User already registered') ||
          error.status === 422) {
        throw error;
      }
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  throw lastError;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { fetchUserProfile } = useUserProfile();

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      try {
        console.log('🔄 Auth: Checking existing session...');
        
        const sessionResult = await withTimeout(
          withRetry(() => supabase.auth.getSession()),
          15000 // 15 second timeout for initial session check
        );
        
        const { data: { session }, error } = sessionResult;
        
        if (error) {
          console.error('❌ Auth: Error getting session:', error);
          // Don't throw on session check errors, just log and continue
        }
        
        if (session?.user) {
          console.log('✅ Auth: Session found, fetching profile...');
          setSupabaseUser(session.user);
          try {
            const userProfile = await withTimeout(
              fetchUserProfile(session.user),
              10000 // 10 second timeout for profile fetch
            );
            setUser(userProfile);
            console.log('✅ Auth: Profile loaded successfully');
          } catch (profileError) {
            console.error('❌ Auth: Error fetching user profile:', profileError);
            // Keep session alive even if profile fetch fails - this prevents logout on refresh
            console.log('⚠️ Auth: Profile fetch failed but keeping session alive');
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'User',
              role: 'user'
            });
          }
        } else {
          console.log('ℹ️ Auth: No existing session found');
          setUser(null);
          setSupabaseUser(null);
        }
      } catch (error: any) {
        console.error('❌ Auth: Exception during session check:', error);
        setUser(null);
        setSupabaseUser(null);
        
        // Show user-friendly error for API key issues
        if (error.message?.includes('No API key found') || 
            error.message?.includes('Invalid API key')) {
          console.error('🚨 Auth: Supabase API key issue detected. Please refresh the page.');
        }
      } finally {
        setLoading(false);
        console.log('✅ Auth: Initial auth check completed');
      }
    };

    checkSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth: State changed:', event, session?.user?.email);
      
      if (session?.user) {
        setSupabaseUser(session.user);
        
        // Use setTimeout to avoid blocking the auth callback, but with timeout
        const timeoutId = setTimeout(async () => {
          try {
            const userProfile = await withTimeout(
              fetchUserProfile(session.user),
              10000 // 10 second timeout
            );
            setUser(userProfile);
            console.log('✅ Auth: Profile updated from auth state change');
          } catch (profileError) {
            console.error('❌ Auth: Error fetching profile on auth change:', profileError);
            setUser(null);
          } finally {
            setLoading(false);
          }
        }, 100); // Short delay to avoid blocking

        // Ensure loading is cleared even if profile fetch fails
        const failsafeTimeout = setTimeout(() => {
          setLoading(false);
          console.log('⚠️ Auth: Failsafe timeout - clearing loading state');
        }, 15000); // 15 second failsafe

        // Clear failsafe if normal timeout completes
        const originalTimeout = timeoutId;
        clearTimeout(failsafeTimeout);
        
      } else {
        setUser(null);
        setSupabaseUser(null);
        setLoading(false);
        console.log('ℹ️ Auth: User signed out');
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

      console.log('🔄 Auth: Attempting signup...');
      
      const signupResult = await withTimeout(
        withRetry(() => supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: {
              username: username?.trim(),
            },
          },
        })),
        20000 // 20 second timeout for signup
      );
      
      const { data, error } = signupResult;
      
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
        } else if (error.message.includes('No API key found')) {
          throw new Error('Authentication service temporarily unavailable. Please refresh the page and try again.');
        } else {
          // Generic error with original message
          throw new Error(error.message || 'Failed to create account. Please try again.');
        }
      }

      // If signup requires email confirmation, inform the user
      if (data?.user && !data.session) {
        throw new Error('Please check your email and click the confirmation link to complete your signup.');
      }
      
      console.log('✅ Auth: Signup successful');
    } catch (err: any) {
      console.error('❌ Auth: Signup error:', err);
      // Re-throw the error to be handled by the component
      throw err;
    } finally {
      // Don't set loading to false here - onAuthStateChange will handle it
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log('🔄 Auth: Attempting signin...');
      
      const signinResult = await withTimeout(
        withRetry(() => supabase.auth.signInWithPassword({ email, password })),
        15000 // 15 second timeout for signin
      );
      
      const { error } = signinResult;
      if (error) {
        if (error.message.includes('No API key found')) {
          throw new Error('Authentication service temporarily unavailable. Please refresh the page and try again.');
        }
        throw error;
      }
      
      console.log('✅ Auth: Signin successful');
    } catch (err: any) {
      console.error('❌ Auth: Signin error:', err);
      throw err;
    } finally {
      // Don't set loading to false here - onAuthStateChange will handle it
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      console.log('🔄 Auth: Attempting signout...');
      
      const signoutResult = await withTimeout(
        withRetry(() => supabase.auth.signOut()),
        10000 // 10 second timeout for signout
      );
      
      const { error } = signoutResult;
      if (error) throw error;
      
      console.log('✅ Auth: Signout successful');
    } catch (err: any) {
      console.error('❌ Auth: Signout error:', err);
      throw err;
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
