// Flash Sale Timer Utility - Real countdown that resets daily
export interface TimeRemaining {
  hours: number;
  minutes: number;
  seconds: number;
}

/**
 * Calculates time remaining until end of current day (midnight)
 * @param timezone - Optional timezone (defaults to user's local timezone)
 * @returns Object with hours, minutes, seconds remaining
 */
export const getTimeUntilMidnight = (timezone?: string): TimeRemaining => {
  const now = new Date();
  const tomorrow = new Date(now);
  
  // Set to next midnight
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  // If timezone is specified, adjust for that timezone
  if (timezone) {
    const nowInTimezone = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
    const tomorrowInTimezone = new Date(tomorrow.toLocaleString("en-US", { timeZone: timezone }));
    
    const diffMs = tomorrowInTimezone.getTime() - nowInTimezone.getTime();
    return millisecondsToTimeRemaining(diffMs);
  }
  
  // Use local timezone
  const diffMs = tomorrow.getTime() - now.getTime();
  return millisecondsToTimeRemaining(diffMs);
};

/**
 * Converts milliseconds to hours, minutes, seconds
 */
const millisecondsToTimeRemaining = (ms: number): TimeRemaining => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return {
    hours: Math.max(0, hours),
    minutes: Math.max(0, minutes),
    seconds: Math.max(0, seconds)
  };
};

/**
 * Custom hook for flash sale countdown
 */
export const useFlashSaleCountdown = (timezone?: string) => {
  const [timeLeft, setTimeLeft] = useState<TimeRemaining>(() => getTimeUntilMidnight(timezone));
  const [lastResetDate, setLastResetDate] = useState<string>(() => new Date().toDateString());
  
  useEffect(() => {
    const updateTimer = () => {
      const currentDate = new Date().toDateString();
      const newTime = getTimeUntilMidnight(timezone);
      
      // Check if we've crossed into a new day
      if (currentDate !== lastResetDate) {
        setLastResetDate(currentDate);
        console.log('🔄 Flash sale timer reset for new day!');
      }
      
      setTimeLeft(newTime);
    };
    
    // Update immediately
    updateTimer();
    
    // Update every second
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [timezone, lastResetDate]);
  
  return timeLeft;
};

/**
 * Get flash sale end time as a readable string
 */
export const getFlashSaleEndTime = (timezone?: string): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  if (timezone) {
    return tomorrow.toLocaleString("en-US", { 
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  }
  
  return tomorrow.toLocaleString("en-US", { 
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });
};

// Export useState for the component
import { useState, useEffect } from 'react'; 