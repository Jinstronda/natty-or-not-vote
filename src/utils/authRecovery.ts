/**
 * Auth Recovery Utilities
 * Emergency functions to recover from stuck auth states
 */

import { supabase } from '@/integrations/supabase/client';
import { queryClient } from '@/lib/queryClient';

/**
 * Emergency auth state reset - clears all auth-related state
 */
export const emergencyAuthReset = async (): Promise<void> => {
  try {
    console.log('[AuthRecovery] Starting emergency auth reset...');
    
    // 1. Clear all local storage auth-related data
    localStorage.removeItem('lastAuthActivity');
    localStorage.removeItem('supabase.auth.token');
    
    // 2. Clear session storage
    sessionStorage.clear();
    
    // 3. Sign out from Supabase (local scope to avoid network issues)
    await supabase.auth.signOut({ scope: 'local' });
    
    // 4. Clear all React Query cache
    queryClient.clear();
    
    // 5. Clear any cookies (if any)
    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=");
      const name = eqPos > -1 ? c.substr(0, eqPos) : c;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    });
    
    console.log('[AuthRecovery] Emergency auth reset completed');
    
    // 6. Force page reload to ensure clean state
    setTimeout(() => {
      window.location.href = '/';
    }, 500);
    
  } catch (error) {
    console.error('[AuthRecovery] Error during emergency reset:', error);
    // Force page reload anyway
    window.location.reload();
  }
};

/**
 * Detect stuck auth state
 */
export const detectStuckAuth = (): boolean => {
  const now = Date.now();
  const lastActivity = localStorage.getItem('lastAuthActivity');
  
  // If auth started more than 30 seconds ago with no resolution, consider it stuck
  if (lastActivity && now - parseInt(lastActivity) > 30000) {
    const authStartTime = localStorage.getItem('authStartTime');
    if (authStartTime && now - parseInt(authStartTime) > 30000) {
      return true;
    }
  }
  
  return false;
};

/**
 * Auth state diagnostics
 */
export const authDiagnostics = async () => {
  console.log('🔍 Auth State Diagnostics:');
  
  try {
    // Check Supabase session
    const { data: session, error } = await supabase.auth.getSession();
    console.log('Supabase Session:', session?.session ? 'Active' : 'None', error ? `Error: ${error.message}` : '');
    
    // Check local storage
    const lastActivity = localStorage.getItem('lastAuthActivity');
    console.log('Last Activity:', lastActivity ? new Date(parseInt(lastActivity)).toLocaleString() : 'None');
    
    // Check if stuck
    const isStuck = detectStuckAuth();
    console.log('Auth State:', isStuck ? '🚨 STUCK' : '✅ Normal');
    
    // Check React Query cache
    const queryCache = queryClient.getQueryCache();
    console.log('Query Cache Size:', queryCache.getAll().length);
    
    return {
      hasSession: !!session?.session,
      lastActivity,
      isStuck,
      queryCacheSize: queryCache.getAll().length
    };
    
  } catch (error) {
    console.error('Diagnostics failed:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * Quick auth recovery - less aggressive than emergency reset
 */
export const quickAuthRecovery = async () => {
  try {
    console.log('[AuthRecovery] Starting quick recovery...');
    
    // Clear activity timestamp to force re-initialization
    localStorage.removeItem('lastAuthActivity');
    
    // Refresh auth session
    await supabase.auth.refreshSession();
    
    // Clear auth-related queries
    queryClient.invalidateQueries({ queryKey: ['user-vote'] });
    queryClient.invalidateQueries({ queryKey: ['vote-stats'] });
    
    console.log('[AuthRecovery] Quick recovery completed');
    
  } catch (error) {
    console.error('[AuthRecovery] Quick recovery failed, trying emergency reset:', error);
    await emergencyAuthReset();
  }
};

// Add to window for debugging
if (typeof window !== 'undefined') {
  (window as any).emergencyAuthReset = emergencyAuthReset;
  (window as any).authDiagnostics = authDiagnostics;
  (window as any).quickAuthRecovery = quickAuthRecovery;
  
  // Auto-detect stuck auth after 30 seconds
  setTimeout(() => {
    if (detectStuckAuth()) {
      console.warn('🚨 Stuck auth state detected! Run window.emergencyAuthReset() to recover');
    }
  }, 30000);
}