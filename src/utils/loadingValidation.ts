/**
 * Loading Validation System - Preventing Iatrogenic Effects
 * 
 * This module implements safeguards to prevent unintended consequences
 * from the new loading system, following iatrogenic principles:
 * 1. Do no harm to existing functionality
 * 2. Graceful degradation
 * 3. Fail-safe mechanisms
 * 4. Performance monitoring
 */

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  performance: {
    apiCalls: number;
    loadTime: number;
    memoryUsage: number;
  };
}

interface LoadingMetrics {
  startTime: number;
  endTime?: number;
  apiCalls: number;
  errors: number;
  retries: number;
  cacheHits: number;
}

class LoadingValidator {
  private metrics: Map<string, LoadingMetrics> = new Map();
  private performanceThresholds = {
    maxApiCalls: 5,           // Maximum API calls per loading session
    maxLoadTime: 8000,        // Maximum load time in ms
    maxMemoryIncrease: 50,    // Maximum memory increase in MB
    maxRetries: 3             // Maximum retry attempts
  };

  /**
   * Start tracking a loading session
   */
  startTracking(sessionId: string): void {
    this.metrics.set(sessionId, {
      startTime: Date.now(),
      apiCalls: 0,
      errors: 0,
      retries: 0,
      cacheHits: 0
    });
  }

  /**
   * Record an API call
   */
  recordApiCall(sessionId: string, isCacheHit: boolean = false): void {
    const metric = this.metrics.get(sessionId);
    if (metric) {
      if (isCacheHit) {
        metric.cacheHits++;
      } else {
        metric.apiCalls++;
      }
    }
  }

  /**
   * Record an error
   */
  recordError(sessionId: string): void {
    const metric = this.metrics.get(sessionId);
    if (metric) {
      metric.errors++;
    }
  }

  /**
   * Record a retry attempt
   */
  recordRetry(sessionId: string): void {
    const metric = this.metrics.get(sessionId);
    if (metric) {
      metric.retries++;
    }
  }

  /**
   * End tracking and validate the session
   */
  endTracking(sessionId: string): ValidationResult {
    const metric = this.metrics.get(sessionId);
    if (!metric) {
      return {
        isValid: false,
        errors: ['Session not found'],
        warnings: [],
        performance: { apiCalls: 0, loadTime: 0, memoryUsage: 0 }
      };
    }

    metric.endTime = Date.now();
    const loadTime = metric.endTime - metric.startTime;

    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      performance: {
        apiCalls: metric.apiCalls,
        loadTime,
        memoryUsage: this.getMemoryUsage()
      }
    };

    // Validate against thresholds
    this.validatePerformance(metric, loadTime, result);
    this.validateReliability(metric, result);
    this.validateEfficiency(metric, result);

    // Clean up
    this.metrics.delete(sessionId);

    return result;
  }

  private validatePerformance(
    metric: LoadingMetrics, 
    loadTime: number, 
    result: ValidationResult
  ): void {
    // Check load time
    if (loadTime > this.performanceThresholds.maxLoadTime) {
      result.errors.push(`Load time exceeded: ${loadTime}ms > ${this.performanceThresholds.maxLoadTime}ms`);
      result.isValid = false;
    } else if (loadTime > this.performanceThresholds.maxLoadTime * 0.8) {
      result.warnings.push(`Load time approaching limit: ${loadTime}ms`);
    }

    // Check API calls
    if (metric.apiCalls > this.performanceThresholds.maxApiCalls) {
      result.errors.push(`Too many API calls: ${metric.apiCalls} > ${this.performanceThresholds.maxApiCalls}`);
      result.isValid = false;
    } else if (metric.apiCalls > this.performanceThresholds.maxApiCalls * 0.8) {
      result.warnings.push(`API calls approaching limit: ${metric.apiCalls}`);
    }

    // Check memory usage
    const memoryIncrease = result.performance.memoryUsage;
    if (memoryIncrease > this.performanceThresholds.maxMemoryIncrease) {
      result.errors.push(`Memory usage exceeded: ${memoryIncrease}MB > ${this.performanceThresholds.maxMemoryIncrease}MB`);
      result.isValid = false;
    }
  }

  private validateReliability(metric: LoadingMetrics, result: ValidationResult): void {
    // Check retry count
    if (metric.retries > this.performanceThresholds.maxRetries) {
      result.errors.push(`Too many retries: ${metric.retries} > ${this.performanceThresholds.maxRetries}`);
      result.isValid = false;
    }

    // Check error rate
    const errorRate = metric.errors / Math.max(metric.apiCalls, 1);
    if (errorRate > 0.5) {
      result.errors.push(`High error rate: ${Math.round(errorRate * 100)}%`);
      result.isValid = false;
    } else if (errorRate > 0.2) {
      result.warnings.push(`Elevated error rate: ${Math.round(errorRate * 100)}%`);
    }
  }

  private validateEfficiency(metric: LoadingMetrics, result: ValidationResult): void {
    // Check cache hit ratio
    const totalRequests = metric.apiCalls + metric.cacheHits;
    if (totalRequests > 0) {
      const cacheHitRatio = metric.cacheHits / totalRequests;
      if (cacheHitRatio < 0.3 && totalRequests > 3) {
        result.warnings.push(`Low cache hit ratio: ${Math.round(cacheHitRatio * 100)}%`);
      }
    }

    // Check for unnecessary API calls
    if (metric.apiCalls > 1 && metric.cacheHits === 0) {
      result.warnings.push('Multiple API calls without caching - consider optimization');
    }
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return Math.round(memory.usedJSHeapSize / 1024 / 1024);
    }
    return 0;
  }

  /**
   * Get performance summary for monitoring
   */
  getPerformanceSummary(): {
    activeSessions: number;
    averageLoadTime: number;
    totalApiCalls: number;
    totalErrors: number;
  } {
    const metrics = Array.from(this.metrics.values());
    const completedMetrics = metrics.filter(m => m.endTime);

    return {
      activeSessions: this.metrics.size,
      averageLoadTime: completedMetrics.length > 0 
        ? completedMetrics.reduce((sum, m) => sum + (m.endTime! - m.startTime), 0) / completedMetrics.length
        : 0,
      totalApiCalls: metrics.reduce((sum, m) => sum + m.apiCalls, 0),
      totalErrors: metrics.reduce((sum, m) => sum + m.errors, 0)
    };
  }
}

// Global instance
export const loadingValidator = new LoadingValidator();

/**
 * Hook for automatic validation in React components
 */
export const useLoadingValidation = (sessionId: string) => {
  const startValidation = () => {
    loadingValidator.startTracking(sessionId);
  };

  const recordApiCall = (isCacheHit: boolean = false) => {
    loadingValidator.recordApiCall(sessionId, isCacheHit);
  };

  const recordError = () => {
    loadingValidator.recordError(sessionId);
  };

  const recordRetry = () => {
    loadingValidator.recordRetry(sessionId);
  };

  const endValidation = (): ValidationResult => {
    return loadingValidator.endTracking(sessionId);
  };

  return {
    startValidation,
    recordApiCall,
    recordError,
    recordRetry,
    endValidation
  };
};

/**
 * Safeguard function to prevent loading system failures
 */
export const withLoadingSafeguards = async <T>(
  operation: () => Promise<T>,
  fallback: () => T,
  sessionId: string
): Promise<T> => {
  const validation = useLoadingValidation(sessionId);
  validation.startValidation();

  try {
    const result = await operation();
    const validationResult = validation.endValidation();
    
    if (!validationResult.isValid) {
      console.warn(`[LoadingValidation] Session ${sessionId} failed validation:`, validationResult.errors);
      // Log but don't fail - use graceful degradation
    }
    
    if (validationResult.warnings.length > 0) {
      console.warn(`[LoadingValidation] Session ${sessionId} warnings:`, validationResult.warnings);
    }
    
    return result;
  } catch (error) {
    validation.recordError();
    console.error(`[LoadingValidation] Session ${sessionId} failed, using fallback:`, error);
    
    // Use fallback to prevent total failure
    return fallback();
  }
};

/**
 * Circuit breaker pattern for preventing cascading failures
 */
class CircuitBreaker {
  private failures = 0;
  private lastFailure = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  constructor(
    private threshold = 5,
    private timeout = 30000
  ) {}

  async execute<T>(operation: () => Promise<T>, fallback: () => T): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailure > this.timeout) {
        this.state = 'half-open';
      } else {
        console.warn('[CircuitBreaker] Circuit is open, using fallback');
        return fallback();
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailure = Date.now();
    
    if (this.failures >= this.threshold) {
      this.state = 'open';
      console.warn(`[CircuitBreaker] Circuit opened after ${this.failures} failures`);
    }
  }
}

export const loadingCircuitBreaker = new CircuitBreaker();

/**
 * Performance monitor for detecting degradation
 */
export class PerformanceMonitor {
  private samples: number[] = [];
  private maxSamples = 100;

  recordLoadTime(time: number): void {
    this.samples.push(time);
    if (this.samples.length > this.maxSamples) {
      this.samples.shift();
    }
  }

  getAverageLoadTime(): number {
    if (this.samples.length === 0) return 0;
    return this.samples.reduce((a, b) => a + b, 0) / this.samples.length;
  }

  isPerformanceDegrading(): boolean {
    if (this.samples.length < 10) return false;
    
    const recent = this.samples.slice(-10);
    const older = this.samples.slice(-20, -10);
    
    if (older.length === 0) return false;
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    
    return recentAvg > olderAvg * 1.5; // 50% degradation threshold
  }
}

export const performanceMonitor = new PerformanceMonitor();