
export const logSecurityEvent = (eventType: string, eventDetails: any = {}) => {
  console.log('Security Event:', {
    event_type: eventType,
    event_details: eventDetails,
    timestamp: new Date().toISOString()
  });
};
