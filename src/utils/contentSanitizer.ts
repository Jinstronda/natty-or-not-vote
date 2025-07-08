import DOMPurify from 'dompurify';

/**
 * Content sanitization utility to prevent XSS attacks
 * This is the CRITICAL security fix for user-generated content
 */

export interface SanitizationOptions {
  allowedTags?: string[];
  allowedAttributes?: string[];
  stripTags?: boolean;
  maxLength?: number;
}

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export const sanitizeHtml = (content: string, options: SanitizationOptions = {}): string => {
  if (!content) return '';

  const {
    allowedTags = ['b', 'i', 'em', 'strong', 'u', 'br', 'p'],
    allowedAttributes = [],
    stripTags = false,
    maxLength = 500 // Default to 500 for reviews
  } = options;

  // Truncate if too long
  let sanitized = content.length > maxLength ? content.substring(0, maxLength) + '...' : content;

  if (stripTags) {
    // Remove all HTML tags
    sanitized = sanitized.replace(/<[^>]*>/g, '');
  } else {
    // Use DOMPurify for safe HTML sanitization
    sanitized = DOMPurify.sanitize(sanitized, {
      ALLOWED_TAGS: allowedTags,
      ALLOWED_ATTR: allowedAttributes,
      FORBID_TAGS: ['script', 'object', 'embed', 'link', 'style', 'iframe'],
      FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'style']
    });
  }

  return sanitized;
};

/**
 * Sanitize plain text input (for usernames, search terms, etc.)
 */
export const sanitizeText = (text: string, options: SanitizationOptions = {}): string => {
  if (!text) return '';

  const { maxLength = 1000 } = options;

  // Remove all HTML tags
  let sanitized = text.replace(/<[^>]*>/g, '');
  
  // Remove potentially dangerous patterns
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/data:/gi, '');
  sanitized = sanitized.replace(/vbscript:/gi, '');
  sanitized = sanitized.replace(/on\w+=/gi, '');
  
  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  // Truncate if too long
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength) + '...';
  }

  return sanitized;
};

/**
 * Validate and sanitize username input
 */
export const sanitizeUsername = (username: string): string => {
  if (!username) return '';

  // Remove dangerous characters, keep only alphanumeric and underscore
  let sanitized = username.replace(/[^a-zA-Z0-9_]/g, '');
  
  // Ensure minimum length
  if (sanitized.length < 3) {
    throw new Error('Username must be at least 3 characters long');
  }
  
  // Ensure maximum length
  if (sanitized.length > 20) {
    sanitized = sanitized.substring(0, 20);
  }
  
  return sanitized.toLowerCase();
};

/**
 * Validate and sanitize email input
 */
export const sanitizeEmail = (email: string): string => {
  if (!email) return '';

  // Basic email validation and sanitization
  const sanitized = email.toLowerCase().trim();
  
  // Check for basic email format
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized)) {
    throw new Error('Invalid email format');
  }
  
  // Remove potentially dangerous patterns
  if (sanitized.includes('javascript:') || sanitized.includes('data:')) {
    throw new Error('Invalid email format');
  }
  
  return sanitized;
};

/**
 * Sanitize URL input
 */
export const sanitizeUrl = (url: string): string => {
  if (!url) return '';

  const sanitized = url.trim();
  
  // Only allow http/https URLs
  if (!/^https?:\/\//i.test(sanitized)) {
    throw new Error('Only HTTP/HTTPS URLs are allowed');
  }
  
  // Block dangerous protocols
  if (/javascript:|data:|vbscript:|file:|ftp:/i.test(sanitized)) {
    throw new Error('Invalid URL format');
  }
  
  return sanitized;
};

/**
 * Sanitize search query input
 */
export const sanitizeSearchQuery = (query: string): string => {
  if (!query) return '';

  // Remove HTML and dangerous patterns
  let sanitized = query.replace(/<[^>]*>/g, '');
  sanitized = sanitized.replace(/[<>'"]/g, '');
  
  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  // Limit length
  if (sanitized.length > 100) {
    sanitized = sanitized.substring(0, 100);
  }
  
  return sanitized;
};

/**
 * Sanitize review content specifically
 */
export const sanitizeReviewContent = (content: string): string => {
  if (!content) return '';

  // Remove HTML tags and dangerous patterns
  let sanitized = content.replace(/<[^>]*>/g, '');
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/data:/gi, '');
  sanitized = sanitized.replace(/vbscript:/gi, '');
  sanitized = sanitized.replace(/on\w+=/gi, '');
  
  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  // Enforce 500 character limit
  if (sanitized.length > 500) {
    sanitized = sanitized.substring(0, 497) + '...';
  }
  
  return sanitized;
};

/**
 * Validate review content length
 */
export const validateReviewLength = (content: string): { isValid: boolean; message?: string } => {
  if (!content || content.trim().length === 0) {
    return { isValid: false, message: 'Review content cannot be empty' };
  }
  
  if (content.length > 500) {
    return { isValid: false, message: 'Review content cannot exceed 500 characters' };
  }
  
  return { isValid: true };
};

/**
 * Rate limiting helper - track requests by IP or user
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 60) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return true;
  }

  getRemainingRequests(identifier: string): number {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];
    const validRequests = userRequests.filter(time => now - time < this.windowMs);
    
    return Math.max(0, this.maxRequests - validRequests.length);
  }

  getTimeUntilReset(identifier: string): number {
    const userRequests = this.requests.get(identifier) || [];
    if (userRequests.length === 0) return 0;
    
    const oldestRequest = Math.min(...userRequests);
    return Math.max(0, this.windowMs - (Date.now() - oldestRequest));
  }
}

// Export default rate limiter instances
export const searchRateLimiter = new RateLimiter(60000, 100); // 100 searches per minute
export const formRateLimiter = new RateLimiter(60000, 10); // 10 form submissions per minute
export const uploadRateLimiter = new RateLimiter(300000, 5); // 5 uploads per 5 minutes