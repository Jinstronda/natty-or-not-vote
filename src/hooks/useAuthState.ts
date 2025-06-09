
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile';
import { User } from '@/types/auth';
import type { Session } from '@supabase/supabase-js';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const { fetchUserProfile } = useUserProfile();

  const updateUser = useCallback(async (newSession: Session | null) => {
    console.log('AuthState: Processing session update:', !!newSession);
    
    if (!newSession?.user) {
      console.log('AuthState: No session/user, clearing state');
      setUser(null);
      setSession(null);
      return;
    }

    try {
      console.log('AuthState: Fetching user profile for:', newSession.user.id);
      const userData = await fetchUserProfile(newSession.user);
      console.log('AuthState: Profile fetched successfully:', userData.username);
      setUser(userData);
      setSession(newSession);
    } catch (error) {
      console.error('AuthState: Profile fetch failed, using fallback:', error);
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

    const initializeAuth = async () => {
      try {
        console.log('AuthState: Starting initialization...');
        
        // Get initial session
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthState: Session fetch error:', error);
        }

        if (mounted) {
          if (initialSession) {
            console.log('AuthState: Found existing session');
            await updateUser(initialSession);
          } else {
            console.log('AuthState: No existing session');
            setUser(null);
            setSession(null);
          }
          
          console.log('AuthState: Initialization complete, setting loading to false');
          setLoading(false);
        }
      } catch (error) {
        console.error('AuthState: Initialization error:', error);
        if (mounted) {
          setUser(null);
          setSession(null);
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthState: Auth state changed:', event, 'Has session:', !!session);
      
      if (!mounted) return;

      try {
        if (event === 'SIGNED_IN' && session) {
          console.log('AuthState: User signed in');
          await updateUser(session);
        } else if (event === 'SIGNED_OUT' || !session) {
          console.log('AuthState: User signed out');
          setUser(null);
          setSession(null);
        } else if (event === 'TOKEN_REFRESHED' && session) {
          console.log('AuthState: Token refreshed');
          await updateUser(session);
        }
        
        // Ensure loading is false after any auth state change
        setLoading(false);
      } catch (error) {
        console.error('AuthState: Auth state change error:', error);
        setLoading(false);
      }
    });

    // Initialize after setting up the listener
    initializeAuth();

    return () => {
      console.log('AuthState: Cleaning up');
      mounted = false;
      subscription.unsubscribe();
    };
  }, [updateUser]);

  return { user, session, loading };
};
