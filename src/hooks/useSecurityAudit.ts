
export const useSecurityAudit = () => {
  const logSecurityEvent = async (
    eventType: string,
    eventDetails: any = {},
    ipAddress?: string,
    userAgent?: string
  ) => {
    try {
      // Log to console for now - no user context needed to avoid circular dependency
      console.log('Security Event:', {
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
