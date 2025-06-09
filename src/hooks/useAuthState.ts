
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
    console.log('🔄 AuthState: updateUser called with session:', {
      hasSession: !!newSession,
      userId: newSession?.user?.id,
      userEmail: newSession?.user?.email
    });
    
    if (!newSession?.user) {
      console.log('❌ AuthState: No session/user, clearing state');
      setUser(null);
      setSession(null);
      setLoading(false); // Important: Set loading to false here
      return;
    }

    try {
      console.log('👤 AuthState: Fetching user profile for:', newSession.user.id);
      const userData = await fetchUserProfile(newSession.user);
      console.log('✅ AuthState: Profile fetched successfully:', {
        username: userData.username,
        email: userData.email,
        role: userData.role
      });
      setUser(userData);
      setSession(newSession);
      setLoading(false); // Set loading to false after successful update
      console.log('✅ AuthState: User and session state updated, loading set to false');
    } catch (error) {
      console.error('❌ AuthState: Profile fetch failed, using fallback:', error);
      // Create fallback user object
      const fallbackUser: User = {
        id: newSession.user.id,
        username: newSession.user.user_metadata?.username || 
                 newSession.user.email?.split('@')[0] || 
                 'user',
        email: newSession.user.email || '',
        role: 'user'
      };
      console.log('🔄 AuthState: Using fallback user:', fallbackUser);
      setUser(fallbackUser);
      setSession(newSession);
      setLoading(false); // Set loading to false even on error
    }
  }, [fetchUserProfile]);

  useEffect(() => {
    console.log('🚀 AuthState: useEffect starting...');
    let mounted = true;

    // Set up auth state listener first
    console.log('👂 AuthState: Setting up auth state listener...');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 AuthState: Auth state changed:', {
        event,
        hasSession: !!session,
        userId: session?.user?.id,
        mounted
      });
      
      if (!mounted) {
        console.log('❌ AuthState: Component unmounted, ignoring auth state change');
        return;
      }

      // Handle different auth events
      if (event === 'SIGNED_IN' && session) {
        console.log('✅ AuthState: User signed in, updating user...');
        await updateUser(session);
      } else if (event === 'SIGNED_OUT' || !session) {
        console.log('🚪 AuthState: User signed out, clearing state...');
        setUser(null);
        setSession(null);
        setLoading(false);
      } else if (event === 'TOKEN_REFRESHED' && session) {
        console.log('🔄 AuthState: Token refreshed, updating user...');
        await updateUser(session);
      } else if (event === 'INITIAL_SESSION') {
        console.log('🔄 AuthState: Initial session event...');
        if (session) {
          await updateUser(session);
        } else {
          setUser(null);
          setSession(null);
          setLoading(false);
        }
      }
    });

    // Then check for existing session
    const initializeAuth = async () => {
      try {
        console.log('🔧 AuthState: Starting initialization...');
        console.log('🔧 AuthState: Current URL:', window.location.href);
        console.log('🔧 AuthState: Mounted status:', mounted);
        
        // Get initial session
        console.log('📡 AuthState: Calling supabase.auth.getSession()...');
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        console.log('📡 AuthState: getSession result:', {
          hasSession: !!initialSession,
          hasError: !!error,
          errorMessage: error?.message,
          userId: initialSession?.user?.id
        });
        
        if (error) {
          console.error('❌ AuthState: Session fetch error:', error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        if (mounted) {
          console.log('✅ AuthState: Still mounted, processing session...');
          if (initialSession) {
            console.log('🔄 AuthState: Found existing session, updating user...');
            await updateUser(initialSession);
          } else {
            console.log('🔄 AuthState: No existing session, clearing state...');
            setUser(null);
            setSession(null);
            setLoading(false);
          }
        } else {
          console.log('❌ AuthState: Component unmounted during initialization');
        }
      } catch (error) {
        console.error('❌ AuthState: Initialization error:', error);
        if (mounted) {
          console.log('🔄 AuthState: Error occurred but still mounted, clearing state');
          setUser(null);
          setSession(null);
          setLoading(false);
        }
      }
    };

    console.log('✅ AuthState: Auth state listener set up, starting initialization...');
    initializeAuth();

    return () => {
      console.log('🧹 AuthState: Cleaning up...');
      mounted = false;
      subscription.unsubscribe();
      console.log('✅ AuthState: Cleanup complete');
    };
  }, [updateUser]);

  console.log('📊 AuthState: Current state:', {
    hasUser: !!user,
    hasSession: !!session,
    loading,
    userId: user?.id,
    userEmail: user?.email
  });

  return { user, session, loading };
};
