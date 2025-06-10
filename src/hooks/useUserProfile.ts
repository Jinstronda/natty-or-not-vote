import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  username: string;
  profilePictureUrl: string | null;
  role: 'user' | 'admin';
}

export const useUserProfile = (userId: string) => {
  const fetchUserProfile = useCallback(async (supabaseUser: SupabaseUser): Promise<UserProfile> => {
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
          profilePictureUrl: profile.profile_picture_url,
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
          profilePictureUrl: null,
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

  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          throw error;
        }

        if (profile) {
          setProfileData({
            id: profile.id,
            username: profile.username,
            profilePictureUrl: profile.profile_picture_url,
            role: profile.role as 'user' | 'admin',
          });
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    } else {
      setProfileData(null);
      setLoading(false);
    }
  }, [userId]);

  return { profileData, loading, error };
};
