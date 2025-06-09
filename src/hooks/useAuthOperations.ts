
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAuthOperations = () => {
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('AuthOperations: Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('AuthOperations: Login error:', error);
        return false;
      }

      if (data.user && data.session) {
        console.log('AuthOperations: Login successful');
        return true;
      }

      return false;
    } catch (error) {
      console.error('AuthOperations: Login exception:', error);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      console.log('AuthOperations: Logging out...');
      await supabase.auth.signOut();
      console.log('AuthOperations: Logout complete');
    } catch (error) {
      console.error('AuthOperations: Logout error:', error);
    }
  }, []);

  const signup = useCallback(async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      console.log('AuthOperations: Attempting signup for:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          }
        },
      });

      if (error) {
        console.error('AuthOperations: Signup error:', error);
        return false;
      }

      if (data.user) {
        console.log('AuthOperations: Signup successful');
        return true;
      }

      return false;
    } catch (error) {
      console.error('AuthOperations: Signup exception:', error);
      return false;
    }
  }, []);

  return { login, logout, signup };
};
