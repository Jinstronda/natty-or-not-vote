
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User } from '@/types/auth';

export const useUserProfile = () => {
  const fetchUserProfile = useCallback(async (supabaseUser: SupabaseUser): Promise<User> => {
    console.log('👤 UserProfile: Fetching profile for:', supabaseUser.id);
    
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      if (error) {
        console.error('❌ UserProfile: Profile fetch error:', error);
        throw error;
      }

      if (profile) {
        console.log('✅ UserProfile: Profile found');
        return {
          id: profile.id,
          username: profile.username,
          email: profile.email,
          role: profile.role as 'user' | 'admin'
        };
      } else {
        console.log('🔄 UserProfile: No profile found, creating basic user');
        return {
          id: supabaseUser.id,
          username: supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || 'user',
          email: supabaseUser.email || '',
          role: 'user' as const
        };
      }
    } catch (error) {
      console.error('❌ UserProfile: Exception:', error);
      throw error;
    }
  }, []);

  return { fetchUserProfile };
};
