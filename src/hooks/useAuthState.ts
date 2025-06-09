
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
    console.log('🔄 AuthState: updateUser called with session:', !!newSession);
    
    if (!newSession?.user) {
      console.log('❌ AuthState: No session/user, clearing state');
      setUser(null);
      setSession(null);
      setLoading(false);
      return;
    }

    try {
      console.log('👤 AuthState: Fetching user profile for:', newSession.user.id);
      const userData = await fetchUserProfile(newSession.user);
      console.log('✅ AuthState: Profile fetched successfully');
      setUser(userData);
      setSession(newSession);
    } catch (error) {
      console.error('❌ AuthState: Profile fetch failed, using fallback:', error);
      // Create simple fallback user
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
    } finally {
      setLoading(false);
    }
  }, [fetchUserProfile]);

  useEffect(() => {
    console.log('🚀 AuthState: Initializing...');
    let mounted = true;

    const initAuth = async () => {
      try {
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ AuthState: Session error:', error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        if (mounted) {
          await updateUser(session);
        }
      } catch (error) {
        console.error('❌ AuthState: Init error:', error);
        if (mounted) {
          setUser(null);
          setSession(null);
          setLoading(false);
        }
      }
    };

    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 AuthState: Auth state changed:', event, !!session);
      
      if (!mounted) return;

      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        setSession(null);
        setLoading(false);
      } else {
        await updateUser(session);
      }
    });

    initAuth();

    return () => {
      console.log('🧹 AuthState: Cleanup');
      mounted = false;
      subscription.unsubscribe();
    };
  }, [updateUser]);

  return { user, session, loading };
};
