
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User } from '@/types/auth';

export const useUserProfile = () => {
  const fetchUserProfile = useCallback(async (supabaseUser: SupabaseUser): Promise<User> => {
    try {
      console.log('Fetching user profile for:', supabaseUser.id);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      if (error) {
        console.error('Profile fetch error:', error);
      }

      if (profile && !error) {
        console.log('Profile found:', profile);
        return {
          id: profile.id,
          username: profile.username,
          email: profile.email,
          role: profile.role as 'user' | 'admin'
        };
      } else {
        console.log('No profile found, creating basic user object');
        // If no profile exists, create a basic user object
        const basicUser = {
          id: supabaseUser.id,
          username: supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || 'user',
          email: supabaseUser.email || '',
          role: 'user' as const
        };
        console.log('Basic user object:', basicUser);
        return basicUser;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Still return a basic user object even if profile fetch fails
      const fallbackUser = {
        id: supabaseUser.id,
        username: supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || 'user',
        email: supabaseUser.email || '',
        role: 'user' as const
      };
      console.log('Fallback user object:', fallbackUser);
      return fallbackUser;
    }
  }, []);

  return { fetchUserProfile };
};
