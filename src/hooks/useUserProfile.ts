
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
        console.log('🔄 UserProfile: No profile found, creating for OAuth user');
        
        // For OAuth users, try to create a profile
        const newProfile = {
          id: supabaseUser.id,
          username: supabaseUser.user_metadata?.username || 
                   supabaseUser.user_metadata?.full_name ||
                   supabaseUser.email?.split('@')[0] || 
                   'user',
          email: supabaseUser.email || '',
          role: 'user' as const
        };

        // Try to insert the profile (this might fail if trigger already created it)
        try {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert(newProfile);
          
          if (insertError) {
            console.log('⚠️ UserProfile: Profile insert failed (might already exist):', insertError);
          } else {
            console.log('✅ UserProfile: Profile created for OAuth user');
          }
        } catch (insertError) {
          console.log('⚠️ UserProfile: Profile creation error:', insertError);
        }

        return newProfile;
      }
    } catch (error) {
      console.error('❌ UserProfile: Exception:', error);
      throw error;
    }
  }, []);

  return { fetchUserProfile };
};
