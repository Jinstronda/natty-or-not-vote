// Utility to handle user interaction tracking and safe vibration
class UserInteractionTracker {
  private hasInteracted = false;

  constructor() {
    // Track first user interaction
    const trackInteraction = () => {
      this.hasInteracted = true;
      // Remove listeners after first interaction
      document.removeEventListener('click', trackInteraction);
      document.removeEventListener('keydown', trackInteraction);
      document.removeEventListener('touchstart', trackInteraction);
    };

    // Listen for any user interaction
    document.addEventListener('click', trackInteraction, { passive: true });
    document.addEventListener('keydown', trackInteraction, { passive: true });
    document.addEventListener('touchstart', trackInteraction, { passive: true });
  }

  /**
   * Safely trigger vibration only after user has interacted with the page
   * @param duration - Vibration duration in milliseconds
   */
  safeVibrate(duration: number | number[]) {
    if (this.hasInteracted && 'vibrate' in navigator) {
      try {
        navigator.vibrate(duration);
      } catch (error) {
        // Silently fail if vibration is not supported or blocked
        console.debug('Vibration not available:', error);
      }
    }
  }

  getInteractionStatus() {
    return this.hasInteracted;
  }
}

// Export singleton instance
export const userInteractionTracker = new UserInteractionTracker(); 