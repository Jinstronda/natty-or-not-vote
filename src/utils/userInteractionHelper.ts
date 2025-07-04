
class UserInteractionTracker {
  private hasInteracted = false;

  constructor() {
    const trackInteraction = () => {
      this.hasInteracted = true;
      // Remove listeners after first interaction
      document.removeEventListener('click', trackInteraction);
      document.removeEventListener('keydown', trackInteraction);
      document.removeEventListener('touchstart', trackInteraction);
    };

    document.addEventListener('click', trackInteraction, { passive: true });
    document.addEventListener('keydown', trackInteraction, { passive: true });
    document.addEventListener('touchstart', trackInteraction, { passive: true });
  }

  safeVibrate(duration: number | number[]) {
    if (this.hasInteracted && 'vibrate' in navigator) {
      try {
        navigator.vibrate(duration);
      } catch (error) {
        console.debug('Vibration not available:', error);
      }
    }
  }
}

export const userInteractionTracker = new UserInteractionTracker();
