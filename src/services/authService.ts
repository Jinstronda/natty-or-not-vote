
import { supabase } from '@/integrations/supabase/client';
import { logSecurityEvent } from '@/utils/securityLogger';

export const loginWithEmail = async (email: string, password: string): Promise<boolean> => {
  try {
    console.log('AuthService: Attempting login with email:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log('AuthService: Login response:', { user: !!data.user, session: !!data.session, error });

    const success = !error && !!data.user;
    
    logSecurityEvent(
      success ? 'login_attempt' : 'failed_login',
      { email, success, error: error?.message }
    );
    
    if (error) {
      console.error('AuthService: Login error:', error.message);
    }
    
    return success;
  } catch (error) {
    console.error('AuthService: Login exception:', error);
    logSecurityEvent('failed_login', { email, success: false, error: 'Exception occurred' });
    return false;
  }
};

export const signupWithEmail = async (username: string, email: string, password: string): Promise<boolean> => {
  try {
    console.log('AuthService: Attempting signup with email:', email);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        },
        emailRedirectTo: `${window.location.origin}/`
      },
    });

    console.log('AuthService: Signup response:', { user: !!data.user, session: !!data.session, error });

    const success = !error;
    
    if (error) {
      console.error('AuthService: Signup error:', error.message);
    }
    
    return success;
  } catch (error) {
    console.error('AuthService: Signup exception:', error);
    return false;
  }
};

export const signOut = async (): Promise<void> => {
  try {
    console.log('AuthService: Signing out...');
    logSecurityEvent('logout');
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('AuthService: Signout error:', error.message);
    } else {
      console.log('AuthService: Signout successful');
    }
  } catch (error) {
    console.error('AuthService: Signout exception:', error);
  }
};
