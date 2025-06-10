
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

// 🔧 COMPREHENSIVE DEBUGGING SYSTEM
const DEBUG_CONFIG = {
  ENABLED: true,
  LOG_LEVEL: 'VERBOSE', // BASIC | DETAILED | VERBOSE
  TRACK_TIMING: true,
  TRACK_ERRORS: true,
  TRACK_STATE_CHANGES: true,
  LOG_TO_CONSOLE: true,
  LOG_TO_STORAGE: true,
  MAX_LOGS: 1000
};

class AuthDebugger {
  private logs: any[] = [];
  private timers: Map<string, number> = new Map();
  private stateSnapshots: any[] = [];

  private shouldLog(level: string): boolean {
    if (!DEBUG_CONFIG.ENABLED) return false;
    const levels = ['BASIC', 'DETAILED', 'VERBOSE'];
    return levels.indexOf(level) <= levels.indexOf(DEBUG_CONFIG.LOG_LEVEL);
  }

  startTimer(operation: string): void {
    if (!DEBUG_CONFIG.TRACK_TIMING) return;
    this.timers.set(operation, performance.now());
    this.log('TIMING', `⏱️ START: ${operation}`, { timestamp: Date.now() });
  }

  endTimer(operation: string): number {
    if (!DEBUG_CONFIG.TRACK_TIMING) return 0;
    const startTime = this.timers.get(operation);
    if (!startTime) return 0;
    
    const duration = performance.now() - startTime;
    this.timers.delete(operation);
    this.log('TIMING', `⏱️ END: ${operation} (${duration.toFixed(2)}ms)`, { 
      duration, 
      timestamp: Date.now(),
      operation 
    });
    return duration;
  }

  log(level: string, message: string, data?: any): void {
    if (!this.shouldLog(level)) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data: data ? JSON.parse(JSON.stringify(data)) : undefined,
      stack: level === 'ERROR' ? new Error().stack : undefined
    };

    this.logs.push(logEntry);
    
    if (DEBUG_CONFIG.LOG_TO_CONSOLE) {
      const emoji = {
        'ERROR': '🚨',
        'WARN': '⚠️',
        'INFO': 'ℹ️',
        'TIMING': '⏱️',
        'STATE': '📊',
        'NETWORK': '🌐',
        'DATABASE': '💾',
        'VERBOSE': '🔍'
      }[level] || '📝';
      
      console.log(`${emoji} [AuthDebugger] ${message}`, data || '');
    }

    if (DEBUG_CONFIG.LOG_TO_STORAGE && this.logs.length <= DEBUG_CONFIG.MAX_LOGS) {
      localStorage.setItem('auth_debug_logs', JSON.stringify(this.logs.slice(-DEBUG_CONFIG.MAX_LOGS)));
    }
  }

  captureState(stateName: string, state: any): void {
    if (!DEBUG_CONFIG.TRACK_STATE_CHANGES) return;
    
    const snapshot = {
      timestamp: Date.now(),
      stateName,
      state: JSON.parse(JSON.stringify(state))
    };
    
    this.stateSnapshots.push(snapshot);
    this.log('STATE', `📊 STATE CAPTURE: ${stateName}`, snapshot);
  }

  error(message: string, error: any, context?: any): void {
    this.log('ERROR', message, { error: error?.message || error, context, stack: error?.stack });
  }

  warn(message: string, data?: any): void {
    this.log('WARN', message, data);
  }

  info(message: string, data?: any): void {
    this.log('INFO', message, data);
  }

  verbose(message: string, data?: any): void {
    this.log('VERBOSE', message, data);
  }

  network(message: string, data?: any): void {
    this.log('NETWORK', message, data);
  }

  database(message: string, data?: any): void {
    this.log('DATABASE', message, data);
  }

  exportLogs(): string {
    return JSON.stringify({
      logs: this.logs,
      stateSnapshots: this.stateSnapshots,
      timers: Array.from(this.timers.entries()),
      config: DEBUG_CONFIG,
      timestamp: new Date().toISOString()
    }, null, 2);
  }

  clearLogs(): void {
    this.logs = [];
    this.stateSnapshots = [];
    this.timers.clear();
    localStorage.removeItem('auth_debug_logs');
    this.info('🧹 Debug logs cleared');
  }
}

const authDebugger = new AuthDebugger();

// 🔧 GLOBAL DEBUG EXPORT FUNCTIONS
declare global {
  interface Window {
    exportAuthDebugLogs: () => void;
    exportAllDebugLogs: () => void;
    clearAuthDebugLogs: () => void;
    testAuthHypothesis: (hypothesis: string) => void;
  }
}

if (typeof window !== 'undefined') {
  window.exportAuthDebugLogs = () => {
    const logs = authDebugger.exportLogs();
    console.log('📊 AUTH DEBUG LOGS EXPORT:', logs);
    
    // Also save to file
    const blob = new Blob([logs], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auth-debug-logs-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  window.exportAllDebugLogs = () => {
    console.log('📊 EXPORTING ALL DEBUG LOGS...');
    if (window.exportAuthDebugLogs) window.exportAuthDebugLogs();
    if (window.exportInfluencerDebugLogs) window.exportInfluencerDebugLogs();
  };

  window.clearAuthDebugLogs = () => {
    authDebugger.clearLogs();
  };

  window.testAuthHypothesis = (hypothesis: string) => {
    authDebugger.info(`🧪 HYPOTHESIS TEST: ${hypothesis}`, {
      timestamp: Date.now(),
      hypothesis,
      currentState: {
        localStorage: {
          lastAuthActivity: localStorage.getItem('lastAuthActivity'),
          authDebugLogs: localStorage.getItem('auth_debug_logs')
        }
      }
    });
  };
}

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  profile_picture_url?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    authDebugger.info('🚀 AuthContext useEffect initializing');
    authDebugger.startTimer('AuthContext_initialization');
    authDebugger.captureState('initial_state', { user, loading });

    let mounted = true;
    let authTimeoutId: NodeJS.Timeout | null = null;

    // Set a timeout for auth initialization
    authTimeoutId = setTimeout(() => {
      if (mounted && loading) {
        authDebugger.error('🚨 Authentication timeout reached', { 
          mounted, 
          loading, 
          timeoutDuration: 12000 
        });
        setLoading(false);
        toast({
          title: "Connection Timeout",
          description: "Authentication is taking longer than expected. Please refresh the page.",
          variant: "destructive",
        });
      }
    }, 12000); // 12 second timeout (reduced from 15)

    authDebugger.verbose('⏰ Auth timeout timer set', { timeoutId: authTimeoutId });

    // Check for stale auth state and clear if necessary
    const clearStaleState = async () => {
      authDebugger.startTimer('clearStaleState');
      authDebugger.info('🧹 Starting stale state check');

      const lastActivity = localStorage.getItem('lastAuthActivity');
      const now = Date.now();
      const activityAge = lastActivity ? now - parseInt(lastActivity) : 'never';
      
      authDebugger.verbose('📊 Activity analysis', { 
        lastActivity, 
        now, 
        activityAge: typeof activityAge === 'number' ? `${(activityAge / 60000).toFixed(1)} minutes` : activityAge,
        threshold: '60 minutes'
      });
      
      // If no activity recorded or it's been more than 1 hour, check if we have a valid session
      if (!lastActivity || now - parseInt(lastActivity) > 3600000) {
        authDebugger.warn('⚠️ Stale auth state detected, checking session validity');
        authDebugger.startTimer('stale_session_check');
        
        // Use a timeout to prevent hanging on getSession()
        try {
          authDebugger.network('🌐 Starting session check with timeout protection');
          const sessionPromise = supabase.auth.getSession();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Session check timeout')), 3000)
          );
          
          const { data: sessionData } = await Promise.race([sessionPromise, timeoutPromise]) as any;
          const sessionCheckDuration = authDebugger.endTimer('stale_session_check');
          
          authDebugger.database('💾 Session check completed', { 
            duration: sessionCheckDuration,
            hasSession: !!sessionData.session,
            userId: sessionData.session?.user?.id
          });
          
          if (!sessionData.session) {
            authDebugger.warn('🗑️ No valid session found, clearing stale state');
            localStorage.removeItem('lastAuthActivity');
            supabase.auth.signOut({ scope: 'local' });
          } else {
            authDebugger.info('✅ Valid session found, updating activity timestamp');
            localStorage.setItem('lastAuthActivity', String(now));
          }
        } catch (error) {
          authDebugger.error('🚨 Session check failed', error, { timeout: 3000 });
          localStorage.removeItem('lastAuthActivity');
          supabase.auth.signOut({ scope: 'local' });
        }
      } else {
        authDebugger.verbose('✅ Auth state is fresh, no action needed');
      }

      authDebugger.endTimer('clearStaleState');
    };

    // Get initial session with timeout protection and stale state handling
    const getInitialSession = async () => {
      authDebugger.startTimer('getInitialSession');
      authDebugger.info('🎯 Starting initial session retrieval');
      
      try {
        authDebugger.captureState('before_stale_check', { user, loading, mounted });
        
        // Clear stale state first
        authDebugger.info('🧹 Clearing stale state before session check');
        await clearStaleState();
        
        authDebugger.info('🌐 Starting main session check with timeout protection');
        authDebugger.startTimer('main_getSession');
        
        // Add timeout protection to the main getSession call
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Main session check timeout')), 8000)
        );
        
        const { data: sessionData, error: sessionError } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        const mainSessionDuration = authDebugger.endTimer('main_getSession');
        
        authDebugger.database('💾 Main session check result', {
          duration: mainSessionDuration,
          hasSession: !!sessionData?.session,
          hasError: !!sessionError,
          userId: sessionData?.session?.user?.id,
          userEmail: sessionData?.session?.user?.email,
          errorMessage: sessionError?.message
        });
        
        if (!mounted) {
          authDebugger.warn('⚠️ Component unmounted during session check, aborting');
          return;
        }
        
        if (sessionError) {
          authDebugger.error('🚨 Session error detected', sessionError);
          throw sessionError;
        }
        
        if (sessionData.session?.user) {
          authDebugger.info('✅ Found existing session', { 
            userId: sessionData.session.user.id,
            email: sessionData.session.user.email,
            metadata: sessionData.session.user.user_metadata
          });
          
          // Record successful auth activity
          localStorage.setItem('lastAuthActivity', String(Date.now()));
          authDebugger.verbose('📝 Updated lastAuthActivity timestamp');
          
          // Use session metadata immediately for fast initialization (no database call)
          const fastUser: User = {
            id: sessionData.session.user.id,
            email: sessionData.session.user.email || '',
            username: sessionData.session.user.user_metadata?.username || sessionData.session.user.email?.split('@')[0] || 'user',
            role: sessionData.session.user.email === 'jistronda100@gmail.com' ? 'admin' : 'user'
          };
          
          authDebugger.info('⚡ Created fast user from session metadata', fastUser);
          authDebugger.captureState('fast_user_created', { fastUser, sessionData });
          setUser(fastUser);
          
          // Background fetch of complete profile data (non-blocking)
          authDebugger.info('🔄 Starting background profile fetch');
          authDebugger.startTimer('background_profile_fetch');
          
          createUserFromSupabase(sessionData.session.user).then(completeUser => {
            const profileFetchDuration = authDebugger.endTimer('background_profile_fetch');
            authDebugger.database('💾 Background profile fetch completed', {
              duration: profileFetchDuration,
              completeUser,
              needsUpdate: mounted && (
                fastUser.username !== completeUser.username ||
                fastUser.profile_picture_url !== completeUser.profile_picture_url
              )
            });
            
            if (mounted && (
              fastUser.username !== completeUser.username ||
              fastUser.profile_picture_url !== completeUser.profile_picture_url
            )) {
              authDebugger.info('🔄 Updating user with complete profile data');
              setUser(completeUser);
              authDebugger.captureState('user_updated_with_profile', { completeUser });
            }
          }).catch(error => {
            authDebugger.endTimer('background_profile_fetch');
            authDebugger.warn('⚠️ Background profile fetch failed, keeping session metadata', error);
            // This is fine - we already have working user data from session metadata
          });
        } else {
          authDebugger.info('ℹ️ No existing session found, setting user to null');
          authDebugger.captureState('no_session_found', { sessionData });
          setUser(null);
        }
        
        // Clear the timeout since we completed successfully
        if (authTimeoutId) {
          clearTimeout(authTimeoutId);
          authTimeoutId = null;
          authDebugger.verbose('🗑️ Cleared auth timeout timer (success)');
        }
        
        setLoading(false);
        authDebugger.info('✅ Initial session setup completed successfully');
        authDebugger.captureState('initial_session_complete', { user, loading: false });
        authDebugger.endTimer('getInitialSession');
        
      } catch (error) {
        authDebugger.endTimer('getInitialSession');
        authDebugger.error('🚨 Error during initial session setup', error, { mounted });
        
        if (mounted) {
          // Force clean state on initialization error
          setUser(null);
          authDebugger.info('🧹 Forced clean state due to error');
          authDebugger.captureState('error_clean_state', { error: error?.message });
          
          // Clear the timeout
          if (authTimeoutId) {
            clearTimeout(authTimeoutId);
            authTimeoutId = null;
            authDebugger.verbose('🗑️ Cleared auth timeout timer (error)');
          }
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes with complete event coverage
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('[AuthContext] Auth event:', event, 'User ID:', session?.user?.id);
        
        try {
          if (event === 'SIGNED_IN' && session?.user) {
            console.log('[AuthContext] User signed in, using session metadata for fast login:', session.user.id);
            
            // Record successful auth activity
            localStorage.setItem('lastAuthActivity', String(Date.now()));
            
            // Use session metadata directly for fast login (no database call)
            const fastUser: User = {
              id: session.user.id,
              email: session.user.email || '',
              username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'user',
              role: session.user.email === 'jistronda100@gmail.com' ? 'admin' : 'user'
            };
            
            setUser(fastUser);
            // Invalidate auth-dependent queries
            queryClient.invalidateQueries({ queryKey: ['user-vote'] });
            queryClient.invalidateQueries({ queryKey: ['vote-stats'] });
          } else if (event === 'TOKEN_REFRESHED' && session?.user) {
            // Handle token refresh without expensive DB calls
            if (!user || user.id !== session.user.id) {
              console.log('[AuthContext] Token refreshed, creating user from session metadata (no DB call)');
              
              // Update activity timestamp
              localStorage.setItem('lastAuthActivity', String(Date.now()));
              
              // Use session metadata directly instead of expensive DB call during token refresh
              const refreshedUser: User = {
                id: session.user.id,
                email: session.user.email || '',
                username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'user',
                role: session.user.email === 'jistronda100@gmail.com' ? 'admin' : 'user'
              };
              
              setUser(refreshedUser);
              queryClient.invalidateQueries({ queryKey: ['user-vote'] });
            } else {
              console.log('[AuthContext] Token refreshed, user data unchanged');
              // Still update activity timestamp
              localStorage.setItem('lastAuthActivity', String(Date.now()));
            }
          } else if (event === 'INITIAL_SESSION' && session?.user) {
            // Background fetch of complete profile data (non-blocking)
            console.log('[AuthContext] Initial session detected, fetching complete profile in background');
            
            try {
              const completeUser = await createUserFromSupabase(session.user);
              // Only update if user data has changed (e.g., profile_picture_url)
              if (user && (
                user.username !== completeUser.username ||
                user.profile_picture_url !== completeUser.profile_picture_url
              )) {
                console.log('[AuthContext] Updating user with complete profile data');
                setUser(completeUser);
              }
            } catch (error) {
              console.log('[AuthContext] Background profile fetch failed, keeping session metadata');
              // This is fine - we already have working user data from session metadata
            }
          } else if (event === 'SIGNED_OUT') {
            console.log('[AuthContext] User signed out');
            setUser(null);
            queryClient.clear();
            // Clear activity tracking
            localStorage.removeItem('lastAuthActivity');
          }
        } catch (error) {
          console.error('[AuthContext] Error in auth state change:', error);
          
          // On critical auth errors, force clean state
          if (event === 'SIGNED_OUT' || error instanceof Error && error.message.includes('JWT')) {
            console.warn('[AuthContext] Forcing clean auth state due to error');
            setUser(null);
            queryClient.clear();
            localStorage.removeItem('lastAuthActivity');
          }
        }
        
        if (mounted) {
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      // Clean up timeout if it exists
      if (authTimeoutId) {
        clearTimeout(authTimeoutId);
      }
      subscription.unsubscribe();
    };
  }, []);

  const createUserFromSupabase = async (supabaseUser: SupabaseUser): Promise<User> => {
    try {
      console.log('[AuthContext] Creating user from Supabase data for:', supabaseUser.id);
      
      // Add timeout protection for database queries
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database query timeout')), 8000) // 8 second timeout
      );

      // Get profile with timeout protection
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      const { data: profileData, error: profileError } = await Promise.race([
        profilePromise,
        timeoutPromise
      ]) as any;

      if (profileData && !profileError) {
        console.log('[AuthContext] Successfully fetched profile from database');
        return {
          id: profileData.id,
          email: profileData.email,
          username: profileData.username,
          role: profileData.role,
          profile_picture_url: profileData.profile_picture_url || undefined
        };
      }

      // Only create profile if explicitly missing (not on token refresh)
      if (profileError?.code === 'PGRST116') {
        console.log('[AuthContext] Profile not found, calling create_user_profile function for:', supabaseUser.id);
        const username = supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || 'user';
        
        // Use the create_user_profile function instead of direct insert
        const createPromise = supabase.rpc('create_user_profile', {
          user_id: supabaseUser.id,
          user_email: supabaseUser.email || '',
          user_username: username
        });

        const { data: createData, error: createError } = await Promise.race([
          createPromise,
          timeoutPromise
        ]) as any;

        if (!createError) {
          console.log('[AuthContext] Successfully created new profile via function');
          // Fetch the newly created profile
          const { data: newProfileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', supabaseUser.id)
            .single();
            
          if (newProfileData) {
            return {
              id: newProfileData.id,
              email: newProfileData.email,
              username: newProfileData.username,
              role: newProfileData.role,
              profile_picture_url: newProfileData.profile_picture_url || undefined
            };
          }
        }
        
        console.warn('[AuthContext] Failed to create profile via function, using fallback');
      }
    } catch (error) {
      console.error('[AuthContext] Error in createUserFromSupabase:', error);
      
      // If it's a timeout error, log it specifically
      if (error instanceof Error && error.message === 'Database query timeout') {
        console.warn('[AuthContext] Database query timed out, using fallback user data');
      }
    }

    // Fallback to user metadata (crucial for token refresh scenarios and timeouts)
    console.log('[AuthContext] Using fallback user data for:', supabaseUser.id);
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      username: supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || 'user',
      role: supabaseUser.email === 'jistronda100@gmail.com' ? 'admin' : 'user'
    };
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        }
      },
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
