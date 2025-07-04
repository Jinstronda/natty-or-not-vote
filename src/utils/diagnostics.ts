
/**
 * Diagnostic utilities for troubleshooting loading issues
 */

import { supabase } from '@/integrations/supabase/client';

interface DiagnosticResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  duration?: number;
}

/**
 * Run comprehensive diagnostics to identify loading issues
 */
export const runDiagnostics = async (): Promise<DiagnosticResult[]> => {
  const results: DiagnosticResult[] = [];
  
  // Test 1: Basic Supabase connection
  try {
    const start = Date.now();
    const { data, error } = await supabase.from('influencers').select('count').limit(1).single();
    const duration = Date.now() - start;
    
    if (error) {
      results.push({
        test: 'Supabase Connection',
        status: 'fail',
        message: `Connection failed: ${error.message}`,
        duration
      });
    } else {
      results.push({
        test: 'Supabase Connection',
        status: duration > 3000 ? 'warning' : 'pass',
        message: duration > 3000 ? `Connection slow: ${duration}ms` : `Connection good: ${duration}ms`,
        duration
      });
    }
  } catch (error) {
    results.push({
      test: 'Supabase Connection',
      status: 'fail',
      message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }

  // Test 2: Auth state
  try {
    const start = Date.now();
    const { data: session } = await supabase.auth.getSession();
    const duration = Date.now() - start;
    
    results.push({
      test: 'Auth Session',
      status: 'pass',
      message: session?.session ? `Authenticated: ${session.session.user?.email}` : 'Not authenticated',
      duration
    });
  } catch (error) {
    results.push({
      test: 'Auth Session',
      status: 'fail',
      message: `Auth check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }

  // Test 3: Influencers table access
  try {
    const start = Date.now();
    const { data, error } = await supabase
      .from('influencers')
      .select('id, name')
      .limit(1);
    const duration = Date.now() - start;
    
    if (error) {
      results.push({
        test: 'Influencers Table',
        status: 'fail',
        message: `Table access failed: ${error.message}`,
        duration
      });
    } else {
      results.push({
        test: 'Influencers Table',
        status: duration > 5000 ? 'warning' : 'pass',
        message: `Table accessible: ${data?.length || 0} rows found`,
        duration
      });
    }
  } catch (error) {
    results.push({
      test: 'Influencers Table',
      status: 'fail',
      message: `Table test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }

  // Test 4: Network connectivity
  try {
    const start = Date.now();
    await fetch('https://www.google.com/favicon.ico', { mode: 'no-cors' });
    const duration = Date.now() - start;
    
    results.push({
      test: 'Network Connectivity',
      status: duration > 5000 ? 'warning' : 'pass',
      message: `Network ${duration > 5000 ? 'slow' : 'good'}: ${duration}ms`,
      duration
    });
  } catch (error) {
    results.push({
      test: 'Network Connectivity',
      status: 'fail',
      message: 'Network connectivity issues detected'
    });
  }

  return results;
};

/**
 * Quick connection test for immediate feedback
 */
export const quickConnectionTest = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('influencers').select('count').limit(1);
    return !error;
  } catch (error) {
    console.error('[Diagnostics] Quick connection test failed:', error);
    return false;
  }
};

/**
 * Add diagnostic functions to window for debugging
 */
if (typeof window !== 'undefined') {
  (window as any).runDiagnostics = async () => {
    console.log('🔍 Running diagnostics...');
    const results = await runDiagnostics();
    
    console.table(results);
    
    const failures = results.filter(r => r.status === 'fail');
    const warnings = results.filter(r => r.status === 'warning');
    
    if (failures.length > 0) {
      console.error('❌ Critical issues found:', failures);
    }
    if (warnings.length > 0) {
      console.warn('⚠️ Performance issues found:', warnings);
    }
    if (failures.length === 0 && warnings.length === 0) {
      console.log('✅ All diagnostics passed!');
    }
    
    return results;
  };
  
  (window as any).quickTest = async () => {
    console.log('⚡ Running quick connection test...');
    const success = await quickConnectionTest();
    console.log(success ? '✅ Connection OK' : '❌ Connection Failed');
    return success;
  };
}
