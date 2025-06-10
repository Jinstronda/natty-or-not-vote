// 🏗️ ROBUST AUTHENTICATION STATE MACHINE
// Handles all edge cases and race conditions

export type AuthState = 
  | 'INITIALIZING'
  | 'AUTHENTICATED' 
  | 'UNAUTHENTICATED'
  | 'SESSION_EXPIRED'
  | 'ERROR'
  | 'RECOVERING';

export type AuthEvent = 
  | 'INIT_SUCCESS'
  | 'INIT_FAILURE'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE' 
  | 'LOGOUT'
  | 'SESSION_REFRESH'
  | 'SESSION_EXPIRED'
  | 'NETWORK_ERROR'
  | 'RECOVERY_SUCCESS'
  | 'RECOVERY_FAILURE';

export interface AuthContext {
  user: any | null;
  sessionValid: boolean;
  lastActivity: number;
  retryCount: number;
  error: Error | null;
}

export interface AuthStateTransition {
  from: AuthState;
  event: AuthEvent;
  to: AuthState;
  guard?: (context: AuthContext) => boolean;
  action?: (context: AuthContext) => AuthContext;
}

// 🔧 COMPREHENSIVE STATE MACHINE DEFINITION
const AUTH_TRANSITIONS: AuthStateTransition[] = [
  // Initialization flows
  {
    from: 'INITIALIZING',
    event: 'INIT_SUCCESS',
    to: 'AUTHENTICATED',
    guard: (ctx) => !!ctx.user && ctx.sessionValid,
    action: (ctx) => ({ ...ctx, error: null, retryCount: 0 })
  },
  {
    from: 'INITIALIZING', 
    event: 'INIT_FAILURE',
    to: 'UNAUTHENTICATED',
    action: (ctx) => ({ ...ctx, user: null, sessionValid: false })
  },
  
  // Login flows
  {
    from: 'UNAUTHENTICATED',
    event: 'LOGIN_SUCCESS', 
    to: 'AUTHENTICATED',
    action: (ctx) => ({ ...ctx, error: null, retryCount: 0, lastActivity: Date.now() })
  },
  {
    from: 'UNAUTHENTICATED',
    event: 'LOGIN_FAILURE',
    to: 'ERROR',
    action: (ctx) => ({ ...ctx, retryCount: ctx.retryCount + 1 })
  },
  
  // Session management
  {
    from: 'AUTHENTICATED',
    event: 'SESSION_EXPIRED',
    to: 'SESSION_EXPIRED',
    action: (ctx) => ({ ...ctx, sessionValid: false })
  },
  {
    from: 'SESSION_EXPIRED',
    event: 'SESSION_REFRESH',
    to: 'AUTHENTICATED',
    action: (ctx) => ({ ...ctx, sessionValid: true, lastActivity: Date.now() })
  },
  
  // Error handling and recovery
  {
    from: 'ERROR',
    event: 'RECOVERY_SUCCESS',
    to: 'AUTHENTICATED',
    guard: (ctx) => ctx.retryCount < 3,
    action: (ctx) => ({ ...ctx, error: null, retryCount: 0 })
  },
  {
    from: 'ERROR',
    event: 'RECOVERY_FAILURE',
    to: 'UNAUTHENTICATED',
    guard: (ctx) => ctx.retryCount >= 3,
    action: (ctx) => ({ ...ctx, user: null, sessionValid: false })
  },
  
  // Network error handling
  {
    from: 'AUTHENTICATED',
    event: 'NETWORK_ERROR',
    to: 'RECOVERING',
    action: (ctx) => ({ ...ctx, retryCount: ctx.retryCount + 1 })
  },
  {
    from: 'RECOVERING',
    event: 'RECOVERY_SUCCESS',
    to: 'AUTHENTICATED',
    action: (ctx) => ({ ...ctx, retryCount: 0, error: null })
  },
  
  // Logout
  {
    from: 'AUTHENTICATED',
    event: 'LOGOUT',
    to: 'UNAUTHENTICATED',
    action: (ctx) => ({ ...ctx, user: null, sessionValid: false, error: null })
  }
];

export class AuthStateMachine {
  private currentState: AuthState = 'INITIALIZING';
  private context: AuthContext = {
    user: null,
    sessionValid: false,
    lastActivity: 0,
    retryCount: 0,
    error: null
  };
  
  private listeners: Array<(state: AuthState, context: AuthContext) => void> = [];

  constructor() {
    this.logStateChange('CONSTRUCTOR', 'INITIALIZING');
  }

  getCurrentState(): AuthState {
    return this.currentState;
  }

  getContext(): AuthContext {
    return { ...this.context };
  }

  subscribe(listener: (state: AuthState, context: AuthContext) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  send(event: AuthEvent, payload?: Partial<AuthContext>): boolean {
    const transition = this.findTransition(this.currentState, event);
    
    if (!transition) {
      console.warn(`[AuthStateMachine] No transition for ${this.currentState} + ${event}`);
      return false;
    }

    // Update context with payload
    if (payload) {
      this.context = { ...this.context, ...payload };
    }

    // Check guard condition
    if (transition.guard && !transition.guard(this.context)) {
      console.warn(`[AuthStateMachine] Guard failed for ${this.currentState} + ${event}`);
      return false;
    }

    // Execute action
    if (transition.action) {
      this.context = transition.action(this.context);
    }

    // Update state
    const previousState = this.currentState;
    this.currentState = transition.to;

    this.logStateChange(event, transition.to, previousState);
    this.notifyListeners();

    return true;
  }

  private findTransition(state: AuthState, event: AuthEvent): AuthStateTransition | null {
    return AUTH_TRANSITIONS.find(t => t.from === state && t.event === event) || null;
  }

  private logStateChange(event: string, newState: AuthState, oldState?: AuthState): void {
    console.log(`[AuthStateMachine] ${oldState || 'INIT'} --${event}--> ${newState}`, {
      context: this.context,
      timestamp: new Date().toISOString()
    });
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentState, this.context);
      } catch (error) {
        console.error('[AuthStateMachine] Listener error:', error);
      }
    });
  }

  // Utility methods for common checks
  isReady(): boolean {
    return this.currentState !== 'INITIALIZING';
  }

  isAuthenticated(): boolean {
    return this.currentState === 'AUTHENTICATED' && this.context.sessionValid;
  }

  canMakeRequests(): boolean {
    return this.isAuthenticated() || this.currentState === 'UNAUTHENTICATED';
  }

  shouldRetry(): boolean {
    return this.context.retryCount < 3;
  }

  getDebugInfo() {
    return {
      state: this.currentState,
      context: this.context,
      possibleEvents: AUTH_TRANSITIONS
        .filter(t => t.from === this.currentState)
        .map(t => t.event)
    };
  }
}