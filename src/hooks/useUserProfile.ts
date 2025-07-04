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
        
        // Handle specific API key errors
        if (error.message?.includes('No API key found') || 
            error.message?.includes('Invalid API key')) {
          console.error('🚨 UserProfile: API key issue detected');
          throw new Error('Authentication service temporarily unavailable. Please refresh the page.');
        }
        
        throw error;
      }

      if (profile) {
        console.log('✅ UserProfile: Profile found');
        return {
          id: profile.id,
          username: profile.username,
          email: profile.email,
          role: profile.role as 'user' | 'admin',
          profile_picture_url: profile.profile_picture_url,
          // Add required Supabase User properties
          app_metadata: supabaseUser.app_metadata || {},
          user_metadata: supabaseUser.user_metadata || {},
          aud: supabaseUser.aud || '',
          created_at: supabaseUser.created_at || ''
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
            
            // Handle API key errors during insert
            if (insertError.message?.includes('No API key found') || 
                insertError.message?.includes('Invalid API key')) {
              console.error('🚨 UserProfile: API key issue during profile creation');
              throw new Error('Authentication service temporarily unavailable. Please refresh the page.');
            }
          } else {
            console.log('✅ UserProfile: Profile created for OAuth user');
          }
        } catch (insertError: any) {
          console.log('⚠️ UserProfile: Profile creation error:', insertError);
          
          // Don't throw on profile creation errors unless it's an API key issue
          if (insertError.message?.includes('No API key found') || 
              insertError.message?.includes('Invalid API key')) {
            throw insertError;
          }
        }

        return {
          ...newProfile,
          profile_picture_url: undefined,
          // Add required Supabase User properties
          app_metadata: supabaseUser.app_metadata || {},
          user_metadata: supabaseUser.user_metadata || {},
          aud: supabaseUser.aud || '',
          created_at: supabaseUser.created_at || ''
        };
      }
    } catch (error: any) {
      console.error('❌ UserProfile: Exception:', error);
      
      // Provide user-friendly error messages
      if (error.message?.includes('No API key found') || 
          error.message?.includes('Invalid API key')) {
        throw new Error('Authentication service temporarily unavailable. Please refresh the page.');
      }
      
      throw error;
    }
  }, []);

  return { fetchUserProfile };
};
