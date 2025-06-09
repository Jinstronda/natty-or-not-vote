
import { useAuth } from "@/contexts/AuthContext";

export const useSecurityAudit = () => {
  // Only call useAuth if we're inside a component that has access to AuthProvider
  // This prevents the circular dependency issue
  let user = null;
  try {
    const authContext = useAuth();
    user = authContext.user;
  } catch (error) {
    // If useAuth fails, it means we're not in an AuthProvider context
    // In this case, we'll just log without user info
    console.warn('useSecurityAudit called outside AuthProvider context');
  }

  const logSecurityEvent = async (
    eventType: string,
    eventDetails: any = {},
    ipAddress?: string,
    userAgent?: string
  ) => {
    try {
      // Log to console for now until types are updated
      console.log('Security Event:', {
        user_id: user?.id || 'unknown',
        event_type: eventType,
        event_details: eventDetails,
        ip_address: ipAddress,
        user_agent: userAgent,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  };

  const logLoginAttempt = async (success: boolean, email?: string) => {
    await logSecurityEvent(
      success ? 'login_attempt' : 'failed_login',
      { email, success }
    );
  };

  const logLogout = async () => {
    await logSecurityEvent('logout');
  };

  const logAdminAction = async (action: string, details: any = {}) => {
    await logSecurityEvent('admin_action', { action, ...details });
  };

  const logSecurityViolation = async (violation: string, details: any = {}) => {
    await logSecurityEvent('security_violation', { violation, ...details });
  };

  return {
    logSecurityEvent,
    logLoginAttempt,
    logLogout,
    logAdminAction,
    logSecurityViolation
  };
};
