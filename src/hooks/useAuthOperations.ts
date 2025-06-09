
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAuthOperations = () => {
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 AuthOps: Starting login attempt for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('📡 AuthOps: Login response:', {
        hasUser: !!data.user,
        hasSession: !!data.session,
        hasError: !!error,
        errorMessage: error?.message,
        userId: data.user?.id
      });

      if (error) {
        console.error('❌ AuthOps: Login error:', error);
        return false;
      }

      if (data.user && data.session) {
        console.log('✅ AuthOps: Login successful for user:', data.user.id);
        return true;
      }

      console.log('❌ AuthOps: Login failed - no user or session returned');
      return false;
    } catch (error) {
      console.error('❌ AuthOps: Login exception:', error);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      console.log('🚪 AuthOps: Starting logout...');
      await supabase.auth.signOut();
      console.log('✅ AuthOps: Logout complete');
    } catch (error) {
      console.error('❌ AuthOps: Logout error:', error);
    }
  }, []);

  const signup = useCallback(async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      console.log('📝 AuthOps: Starting signup for:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          }
        },
      });

      console.log('📡 AuthOps: Signup response:', {
        hasUser: !!data.user,
        hasSession: !!data.session,
        hasError: !!error,
        errorMessage: error?.message,
        userId: data.user?.id
      });

      if (error) {
        console.error('❌ AuthOps: Signup error:', error);
        return false;
      }

      if (data.user) {
        console.log('✅ AuthOps: Signup successful for user:', data.user.id);
        return true;
      }

      console.log('❌ AuthOps: Signup failed - no user returned');
      return false;
    } catch (error) {
      console.error('❌ AuthOps: Signup exception:', error);
      return false;
    }
  }, []);

  return { login, logout, signup };
};
