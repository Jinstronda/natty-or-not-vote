
import { supabase } from '@/integrations/supabase/client';
import { logSecurityEvent } from '@/utils/securityLogger';

export const loginWithEmail = async (email: string, password: string): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    const success = !error;
    logSecurityEvent(
      success ? 'login_attempt' : 'failed_login',
      { email, success }
    );
    
    return success;
  } catch (error) {
    logSecurityEvent('failed_login', { email, success: false });
    return false;
  }
};

export const signupWithEmail = async (username: string, email: string, password: string): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        },
      },
    });

    return !error;
  } catch (error) {
    console.error('Signup error:', error);
    return false;
  }
};

export const signOut = async (): Promise<void> => {
  logSecurityEvent('logout');
  await supabase.auth.signOut();
};
