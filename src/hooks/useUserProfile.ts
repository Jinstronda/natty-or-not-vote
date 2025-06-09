
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User } from '@/types/auth';

export const useUserProfile = () => {
  const fetchUserProfile = useCallback(async (supabaseUser: SupabaseUser): Promise<User> => {
    try {
      console.log('👤 UserProfile: Fetching profile for user ID:', supabaseUser.id);
      console.log('👤 UserProfile: User metadata:', supabaseUser.user_metadata);
      console.log('👤 UserProfile: User email:', supabaseUser.email);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      console.log('📡 UserProfile: Profile query result:', {
        hasProfile: !!profile,
        hasError: !!error,
        errorMessage: error?.message,
        profileData: profile
      });

      if (error) {
        console.error('❌ UserProfile: Profile fetch error:', error);
      }

      if (profile && !error) {
        console.log('✅ UserProfile: Profile found in database:', profile);
        const userObject = {
          id: profile.id,
          username: profile.username,
          email: profile.email,
          role: profile.role as 'user' | 'admin'
        };
        console.log('✅ UserProfile: Returning profile-based user:', userObject);
        return userObject;
      } else {
        console.log('🔄 UserProfile: No profile found, creating basic user object');
        // If no profile exists, create a basic user object
        const basicUser = {
          id: supabaseUser.id,
          username: supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || 'user',
          email: supabaseUser.email || '',
          role: 'user' as const
        };
        console.log('✅ UserProfile: Created basic user object:', basicUser);
        return basicUser;
      }
    } catch (error) {
      console.error('❌ UserProfile: Exception during profile fetch:', error);
      // Still return a basic user object even if profile fetch fails
      const fallbackUser = {
        id: supabaseUser.id,
        username: supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || 'user',
        email: supabaseUser.email || '',
        role: 'user' as const
      };
      console.log('🔄 UserProfile: Using fallback user object:', fallbackUser);
      return fallbackUser;
    }
  }, []);

  return { fetchUserProfile };
};
