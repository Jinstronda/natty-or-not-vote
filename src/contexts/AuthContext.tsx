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
    let initializationComplete = false;

    // Set a timeout for auth initialization
    authTimeoutId = setTimeout(() => {
      if (mounted && loading && !initializationComplete) {
        authDebugger.error('🚨 Authentication timeout reached - forcing fallback', { 
          mounted, 
          loading, 
          timeoutDuration: 8000, // Increased back to 8 seconds
          initializationComplete
        });
        
        // Force completion with fallback state
        setLoading(false);
        setUser(null);
        initializationComplete = true;
        
        authDebugger.info('✅ Auth fallback completed', { user: null, loading: false });
      }
    }, 8000); // Increased back to 8 seconds for better network handling

    authDebugger.verbose('⏰ Auth timeout timer set', { timeoutId: authTimeoutId });

    // Initialize auth state with timeout protection
    const initAuth = async () => {
      try {
        authDebugger.startTimer('getSession_call');
        
        // Race condition: getSession vs timeout - increased timeout for network issues
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('getSession timeout')), 6000) // Increased to 6 seconds
        );
        
        const { data: { session }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]);
        
        authDebugger.endTimer('getSession_call');
        
        if (error) throw error;
        
        if (mounted && !initializationComplete) {
          if (session?.user) {
            authDebugger.info('🔐 Session found, creating user');
            try {
              const user = await createUserFromSupabase(session.user);
              setUser(user);
            } catch (userError) {
              // If user creation fails, use basic fallback immediately
              authDebugger.error('User creation failed, using immediate fallback', userError);
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                username: session.user.email?.split('@')[0] || 'user',
                role: (session.user.email === 'jistronda100@gmail.com' || session.user.email === 'joaopanizzutti@gmail.com') ? 'admin' : 'user'
              });
            }
          } else {
            authDebugger.info('🔓 No session found');
            setUser(null);
          }
          setLoading(false);
          initializationComplete = true;
          
          if (authTimeoutId) {
            clearTimeout(authTimeoutId);
            authTimeoutId = null;
          }
          
          authDebugger.info('✅ Auth state initialized successfully', { 
            hasUser: !!session?.user,
            loading: false 
          });
        }
      } catch (error) {
        authDebugger.endTimer('getSession_call');
        authDebugger.error('❌ Auth initialization failed', { error });
        
        if (mounted && !initializationComplete) {
          // Fallback: Continue without auth
          setLoading(false);
          setUser(null);
          initializationComplete = true;
          
          if (authTimeoutId) {
            clearTimeout(authTimeoutId);
            authTimeoutId = null;
          }
          
          authDebugger.info('⚠️ Auth fallback completed after error', { error: error.message });
        }
      }
    };

    initAuth();

    // Listen for auth changes with better error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      authDebugger.info('🔔 Auth state changed', { event, hasSession: !!session });
      
      if (mounted) {
        try {
          if (session?.user) {
            const user = await createUserFromSupabase(session.user);
            setUser(user);
          } else {
            setUser(null);
          }
          
          // Only set loading false if not already completed
          if (!initializationComplete) {
            setLoading(false);
            initializationComplete = true;
            
            if (authTimeoutId) {
              clearTimeout(authTimeoutId);
              authTimeoutId = null;
            }
          }
          
          // Invalidate queries when auth state changes
          queryClient.invalidateQueries();
          
        } catch (error) {
          authDebugger.error('❌ Error in auth state change handler', { error });
          
          // Fallback on error
          if (!initializationComplete) {
            setLoading(false);
            setUser(null);
            initializationComplete = true;
            
            if (authTimeoutId) {
              clearTimeout(authTimeoutId);
              authTimeoutId = null;
            }
          }
        }
      }
    });

    return () => {
      mounted = false;
      if (authTimeoutId) {
        clearTimeout(authTimeoutId);
      }
      subscription.unsubscribe();
      authDebugger.info('🧹 AuthContext cleanup complete');
    };
  }, [queryClient]);

  const createUserFromSupabase = async (supabaseUser: SupabaseUser): Promise<User> => {
    try {
      console.log('[AuthContext] Creating user from Supabase data for:', supabaseUser.id);
      
      // Add timeout protection for database queries
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database query timeout')), 12000) // Increased to 12 seconds
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
          username: username
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
    // Schedule background fetch to update user context if DB is slow
    setTimeout(async () => {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', supabaseUser.id)
          .single();
        if (profileData && !profileError) {
          console.log('[AuthContext] Background profile fetch succeeded, updating user context');
          setUser({
            id: profileData.id,
            email: profileData.email,
            username: profileData.username,
            role: profileData.role,
            profile_picture_url: profileData.profile_picture_url || undefined
          });
        } else {
          console.warn('[AuthContext] Background profile fetch failed:', profileError);
        }
      } catch (err) {
        console.error('[AuthContext] Background profile fetch error:', err);
      }
    }, 5000); // Try again after 5 seconds
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      username: supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || 'user',
      role: (supabaseUser.email === 'jistronda100@gmail.com' || supabaseUser.email === 'joaopanizzutti@gmail.com') ? 'admin' : 'user'
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
