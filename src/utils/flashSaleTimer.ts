import React from 'react';
import { supabase } from "@/integrations/supabase/client";

export interface FlashSaleTimer {
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

interface FlashSaleRecord {
  id: string;
  sale_end_time: string;
  duration_hours: number;
  auto_reset: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export class FlashSaleTimerService {
  private static instance: FlashSaleTimerService;
  private currentTimer: FlashSaleRecord | null = null;
  private intervalId: NodeJS.Timeout | null = null;
  private callbacks: ((timer: FlashSaleTimer) => void)[] = [];

  private constructor() {}

  static getInstance(): FlashSaleTimerService {
    if (!FlashSaleTimerService.instance) {
      FlashSaleTimerService.instance = new FlashSaleTimerService();
    }
    return FlashSaleTimerService.instance;
  }

  /**
   * Get current timer state from database
   */
  private async fetchTimerFromDatabase(): Promise<FlashSaleRecord | null> {
    try {
      const { data, error } = await supabase
        .from('flash_sale_timer' as any)
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching flash sale timer:', error);
        return null;
      }

      return data as FlashSaleRecord;
    } catch (error) {
      console.error('Error in fetchTimerFromDatabase:', error);
      return null;
    }
  }

  /**
   * Reset timer by creating new end time
   */
  private async resetTimer(currentRecord: FlashSaleRecord): Promise<FlashSaleRecord | null> {
    try {
      const newEndTime = new Date();
      newEndTime.setHours(newEndTime.getHours() + currentRecord.duration_hours);

      const { data, error } = await supabase
        .from('flash_sale_timer' as any)
        .update({
          sale_end_time: newEndTime.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', currentRecord.id)
        .select()
        .single();

      if (error) {
        console.error('Error resetting timer:', error);
        return null;
      }

      console.log('Timer reset successfully:', data);
      return data as FlashSaleRecord;
    } catch (error) {
      console.error('Error in resetTimer:', error);
      return null;
    }
  }

  /**
   * Calculate time remaining from end time
   */
  private calculateTimeRemaining(endTime: string): FlashSaleTimer {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const timeLeft = end - now;

    if (timeLeft <= 0) {
      return { hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    return { hours, minutes, seconds, isExpired: false };
  }

  /**
   * Get current timer state, handling resets automatically
   */
  async getCurrentTimer(): Promise<FlashSaleTimer> {
    try {
      // Fetch from database if we don't have cached data
      if (!this.currentTimer) {
        console.log('🕒 Fetching flash sale timer from database...');
        this.currentTimer = await this.fetchTimerFromDatabase();
      }

      // Fallback if no timer found
      if (!this.currentTimer) {
        console.warn('⚠️ No flash sale timer found, using fallback values');
        return { hours: 23, minutes: 59, seconds: 59, isExpired: false };
      }

      // Calculate time remaining
      const timeRemaining = this.calculateTimeRemaining(this.currentTimer.sale_end_time);
      console.log(`⏰ Flash sale timer: ${timeRemaining.hours}h ${timeRemaining.minutes}m ${timeRemaining.seconds}s remaining (from DB: ${this.currentTimer.sale_end_time})`);

      // If expired and auto-reset is enabled, reset the timer
      if (timeRemaining.isExpired && this.currentTimer.auto_reset) {
        console.log('🔄 Timer expired, resetting for next 24 hours...');
        this.currentTimer = await this.resetTimer(this.currentTimer);
        
        if (this.currentTimer) {
          const newTimeRemaining = this.calculateTimeRemaining(this.currentTimer.sale_end_time);
          console.log(`✅ Timer reset complete: ${newTimeRemaining.hours}h ${newTimeRemaining.minutes}m ${newTimeRemaining.seconds}s remaining`);
          return newTimeRemaining;
        }
      }

      return timeRemaining;
    } catch (error) {
      console.error('❌ Error in getCurrentTimer:', error);
      console.warn('⚠️ Using fallback timer due to error');
      // Return fallback timer
      return { hours: 23, minutes: 59, seconds: 59, isExpired: false };
    }
  }

  /**
   * Subscribe to timer updates
   */
  subscribe(callback: (timer: FlashSaleTimer) => void): () => void {
    this.callbacks.push(callback);
    
    // Start interval if not already running
    if (!this.intervalId) {
      this.startTimer();
    }

    // Return unsubscribe function
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
      if (this.callbacks.length === 0) {
        this.stopTimer();
      }
    };
  }

  /**
   * Start the timer interval
   */
  private startTimer(): void {
    this.intervalId = setInterval(async () => {
      const timer = await this.getCurrentTimer();
      this.callbacks.forEach(callback => callback(timer));
    }, 1000);
  }

  /**
   * Stop the timer interval
   */
  private stopTimer(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Force refresh timer from database
   */
  async refreshTimer(): Promise<void> {
    this.currentTimer = null;
    await this.getCurrentTimer();
  }
}

/**
 * React hook for using flash sale timer
 */
export const useFlashSaleTimer = () => {
  const [timer, setTimer] = React.useState<FlashSaleTimer>({ 
    hours: 0, 
    minutes: 0, 
    seconds: 0, 
    isExpired: false 
  });

  React.useEffect(() => {
    const timerService = FlashSaleTimerService.getInstance();
    
    // Get initial timer state
    timerService.getCurrentTimer().then(setTimer);
    
    // Subscribe to updates
    const unsubscribe = timerService.subscribe(setTimer);
    
    return unsubscribe;
  }, []);

  return timer;
}; 