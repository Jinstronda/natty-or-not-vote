// 🛡️ COMPREHENSIVE ERROR BOUNDARIES AND FALLBACK SYSTEMS
// Handles all possible error scenarios with graceful degradation

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

// 🔧 ERROR TYPES AND CLASSIFICATION
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ErrorCategory = 'auth' | 'network' | 'ui' | 'data' | 'unknown';

export interface AppError {
  name: string;
  message: string;
  stack?: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  timestamp: number;
  context?: any;
  recoverable: boolean;
  userFriendly: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: AppError | null;
  errorId: string | null;
  retryCount: number;
  lastRetryTime: number;
}

// 🧠 ERROR CLASSIFIER
class ErrorClassifier {
  static classify(error: Error, context?: any): AppError {
    const timestamp = Date.now();
    
    // Authentication errors
    if (this.isAuthError(error)) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
        severity: 'high',
        category: 'auth',
        timestamp,
        context,
        recoverable: true,
        userFriendly: 'There was an issue with authentication. Please try logging in again.'
      };
    }
    
    // Network errors
    if (this.isNetworkError(error)) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
        severity: 'medium',
        category: 'network',
        timestamp,
        context,
        recoverable: true,
        userFriendly: 'Network connection issue. Please check your internet connection and try again.'
      };
    }
    
    // React Query errors
    if (this.isQueryError(error)) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
        severity: 'medium',
        category: 'data',
        timestamp,
        context,
        recoverable: true,
        userFriendly: 'Failed to load data. Please try refreshing the page.'
      };
    }
    
    // React rendering errors
    if (this.isRenderError(error)) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
        severity: 'high',
        category: 'ui',
        timestamp,
        context,
        recoverable: true,
        userFriendly: 'There was a display issue. Refreshing the page should fix it.'
      };
    }
    
    // JavaScript errors
    if (this.isJavaScriptError(error)) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
        severity: 'critical',
        category: 'unknown',
        timestamp,
        context,
        recoverable: false,
        userFriendly: 'An unexpected error occurred. Please refresh the page or contact support.'
      };
    }
    
    // Default classification
    return {
      name: error.name || 'UnknownError',
      message: error.message || 'An unknown error occurred',
      stack: error.stack,
      severity: 'medium',
      category: 'unknown',
      timestamp,
      context,
      recoverable: true,
      userFriendly: 'Something went wrong. Please try again.'
    };
  }
  
  private static isAuthError(error: Error): boolean {
    return error.message.includes('auth') || 
           error.message.includes('unauthorized') ||
           error.message.includes('session') ||
           error.message.includes('token');
  }
  
  private static isNetworkError(error: Error): boolean {
    return error.message.includes('network') ||
           error.message.includes('fetch') ||
           error.message.includes('timeout') ||
           error.name === 'NetworkError';
  }
  
  private static isQueryError(error: Error): boolean {
    return error.message.includes('query') ||
           error.message.includes('data') ||
           error.name.includes('Query');
  }
  
  private static isRenderError(error: Error): boolean {
    return error.message.includes('render') ||
           error.message.includes('component') ||
           error.stack?.includes('React');
  }
  
  private static isJavaScriptError(error: Error): boolean {
    return error.name === 'TypeError' ||
           error.name === 'ReferenceError' ||
           error.name === 'SyntaxError';
  }
}

// 🛡️ ROOT ERROR BOUNDARY
export class RootErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  ErrorBoundaryState
> {
  private retryTimeoutId: NodeJS.Timeout | null = null;
  
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: null,
      retryCount: 0,
      lastRetryTime: 0
    };
  }
  
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const classifiedError = ErrorClassifier.classify(error);
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.error('[RootErrorBoundary] Caught error:', {
      errorId,
      classifiedError,
      originalError: error
    });
    
    return {
      hasError: true,
      error: classifiedError,
      errorId
    };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { error: classifiedError, errorId } = this.state;
    
    // Log to external service (e.g., Sentry)
    this.logErrorToService(error, errorInfo, errorId);
    
    // Store error in localStorage for debugging
    this.storeErrorForDebugging(error, errorInfo, classifiedError, errorId);
    
    // Auto-retry for recoverable errors
    if (classifiedError?.recoverable && this.state.retryCount < 3) {
      this.scheduleRetry();
    }
  }
  
  private logErrorToService(error: Error, errorInfo: ErrorInfo, errorId: string | null): void {
    // Integration point for error tracking services
    console.error('[ErrorService] Logging error:', {
      errorId,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      errorInfo,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    });
  }
  
  private storeErrorForDebugging(
    error: Error, 
    errorInfo: ErrorInfo, 
    classifiedError: AppError | null, 
    errorId: string | null
  ): void {
    const errorData = {
      errorId,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      errorInfo,
      classifiedError,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    try {
      const existingErrors = JSON.parse(localStorage.getItem('app_errors') || '[]');
      existingErrors.push(errorData);
      
      // Keep only last 10 errors
      if (existingErrors.length > 10) {
        existingErrors.splice(0, existingErrors.length - 10);
      }
      
      localStorage.setItem('app_errors', JSON.stringify(existingErrors));
    } catch (storageError) {
      console.warn('[RootErrorBoundary] Failed to store error:', storageError);
    }
  }
  
  private scheduleRetry(): void {
    const retryDelay = Math.min(1000 * Math.pow(2, this.state.retryCount), 10000);
    
    console.log(`[RootErrorBoundary] Scheduling retry in ${retryDelay}ms (attempt ${this.state.retryCount + 1})`);
    
    this.retryTimeoutId = setTimeout(() => {
      this.handleRetry();
    }, retryDelay);
  }
  
  private handleRetry = (): void => {
    console.log('[RootErrorBoundary] Attempting recovery...');
    
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorId: null,
      retryCount: prevState.retryCount + 1,
      lastRetryTime: Date.now()
    }));
  };
  
  private handleManualRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorId: null,
      retryCount: 0,
      lastRetryTime: Date.now()
    });
  };
  
  private handleReportError = (): void => {
    const { error, errorId } = this.state;
    
    if (error && errorId) {
      // Create error report
      const report = {
        errorId,
        error,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };
      
      // Copy to clipboard for easy reporting
      navigator.clipboard.writeText(JSON.stringify(report, null, 2)).then(() => {
        alert('Error report copied to clipboard. Please paste it when contacting support.');
      });
    }
  };
  
  componentWillUnmount(): void {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }
  
  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      const { error } = this.state;
      
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Critical errors get full-page fallback
      if (error.severity === 'critical') {
        return (
          <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-destructive">Critical Error</CardTitle>
                <CardDescription>The application encountered a serious error</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert variant="destructive">
                  <AlertDescription>{error.userFriendly}</AlertDescription>
                </Alert>
                
                <div className="flex gap-2">
                  <Button onClick={() => window.location.reload()} className="flex-1">
                    Reload Page
                  </Button>
                  <Button variant="outline" onClick={this.handleReportError}>
                    Report Error
                  </Button>
                </div>
                
                {process.env.NODE_ENV === 'development' && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm text-muted-foreground">
                      Error Details (Dev)
                    </summary>
                    <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                      {JSON.stringify(error, null, 2)}
                    </pre>
                  </details>
                )}
              </CardContent>
            </Card>
          </div>
        );
      }
      
      // Non-critical errors get inline fallback
      return (
        <div className="p-4">
          <Alert variant="destructive">
            <AlertDescription className="mb-3">
              {error.userFriendly}
            </AlertDescription>
            <div className="flex gap-2">
              <Button size="sm" onClick={this.handleManualRetry}>
                Try Again
              </Button>
              {error.category === 'auth' && (
                <Button size="sm" variant="outline" onClick={() => window.location.href = '/login'}>
                  Go to Login
                </Button>
              )}
            </div>
          </Alert>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// 🔄 QUERY ERROR BOUNDARY
export const QueryErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <RootErrorBoundary
          fallback={
            <div className="p-4">
              <Alert variant="destructive">
                <AlertDescription className="mb-3">
                  Failed to load data. This might be a temporary issue.
                </AlertDescription>
                <Button size="sm" onClick={reset}>
                  Retry Loading
                </Button>
              </Alert>
            </div>
          }
        >
          {children}
        </RootErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
};

// 🎯 COMPONENT-SPECIFIC ERROR BOUNDARY
export const ComponentErrorBoundary: React.FC<{
  children: ReactNode;
  componentName: string;
  fallback?: ReactNode;
}> = ({ children, componentName, fallback }) => {
  return (
    <RootErrorBoundary
      fallback={
        fallback || (
          <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
            <p className="text-sm text-destructive">
              The {componentName} component encountered an error. Please refresh the page.
            </p>
          </div>
        )
      }
    >
      {children}
    </RootErrorBoundary>
  );
};

// 🔧 GLOBAL ERROR HANDLER
export const setupGlobalErrorHandling = (): void => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('[GlobalErrorHandler] Unhandled promise rejection:', event.reason);
    
    const error = new Error(event.reason?.message || 'Unhandled promise rejection');
    const classifiedError = ErrorClassifier.classify(error, { type: 'unhandledrejection' });
    
    // Store for debugging
    try {
      const errorData = {
        type: 'unhandledrejection',
        error: classifiedError,
        timestamp: new Date().toISOString()
      };
      
      const existingErrors = JSON.parse(localStorage.getItem('global_errors') || '[]');
      existingErrors.push(errorData);
      localStorage.setItem('global_errors', JSON.stringify(existingErrors.slice(-10)));
    } catch (storageError) {
      console.warn('[GlobalErrorHandler] Failed to store global error:', storageError);
    }
    
    // Prevent default browser error handling for non-critical errors
    if (classifiedError.severity !== 'critical') {
      event.preventDefault();
    }
  });
  
  // Handle JavaScript errors
  window.addEventListener('error', (event) => {
    console.error('[GlobalErrorHandler] JavaScript error:', event.error);
    
    const classifiedError = ErrorClassifier.classify(event.error, { 
      type: 'javascript',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
    
    // Store for debugging
    try {
      const errorData = {
        type: 'javascript',
        error: classifiedError,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        timestamp: new Date().toISOString()
      };
      
      const existingErrors = JSON.parse(localStorage.getItem('global_errors') || '[]');
      existingErrors.push(errorData);
      localStorage.setItem('global_errors', JSON.stringify(existingErrors.slice(-10)));
    } catch (storageError) {
      console.warn('[GlobalErrorHandler] Failed to store global error:', storageError);
    }
  });
};

// 🔧 GLOBAL DEBUG FUNCTIONS
declare global {
  interface Window {
    getStoredErrors: () => any;
    clearStoredErrors: () => void;
    simulateError: (type: string) => void;
  }
}

if (typeof window !== 'undefined') {
  window.getStoredErrors = () => {
    return {
      appErrors: JSON.parse(localStorage.getItem('app_errors') || '[]'),
      globalErrors: JSON.parse(localStorage.getItem('global_errors') || '[]')
    };
  };
  
  window.clearStoredErrors = () => {
    localStorage.removeItem('app_errors');
    localStorage.removeItem('global_errors');
    console.log('🧹 All stored errors cleared');
  };
  
  window.simulateError = (type: string) => {
    switch (type) {
      case 'js':
        throw new Error('Simulated JavaScript error');
      case 'promise':
        Promise.reject(new Error('Simulated promise rejection'));
        break;
      case 'auth':
        throw new Error('Authentication failed - simulated');
      case 'network':
        throw new Error('Network timeout - simulated');
      default:
        throw new Error(`Simulated ${type} error`);
    }
  };
}