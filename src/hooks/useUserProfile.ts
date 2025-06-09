
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User } from '@/types/auth';

export const useUserProfile = () => {
  const fetchUserProfile = useCallback(async (supabaseUser: SupabaseUser): Promise<User> => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (profile && !error) {
        return {
          id: profile.id,
          username: profile.username,
          email: profile.email,
          role: profile.role as 'user' | 'admin'
        };
      } else {
        // If no profile exists, create a basic user object
        return {
          id: supabaseUser.id,
          username: supabaseUser.email?.split('@')[0] || 'user',
          email: supabaseUser.email || '',
          role: 'user' as const
        };
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Still return a basic user object even if profile fetch fails
      return {
        id: supabaseUser.id,
        username: supabaseUser.email?.split('@')[0] || 'user',
        email: supabaseUser.email || '',
        role: 'user' as const
      };
    }
  }, []);

  return { fetchUserProfile };
};
