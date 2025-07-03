import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useMobileViewport } from '@/hooks/useMobileViewport';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, X } from 'lucide-react';

interface MobileInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  clearable?: boolean;
  showPasswordToggle?: boolean;
  autoSizeKeyboard?: boolean;
  preventZoom?: boolean;
  enhancedKeyboard?: boolean;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export const MobileInput: React.FC<MobileInputProps> = ({
  label,
  error,
  clearable = false,
  showPasswordToggle = false,
  autoSizeKeyboard = true,
  preventZoom = true,
  enhancedKeyboard = true,
  className,
  type = 'text',
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [localValue, setLocalValue] = useState(value || '');
  const inputRef = useRef<HTMLInputElement>(null);
  const { isKeyboardOpen, visualViewportHeight } = useMobileViewport();

  const inputType = type === 'password' && showPassword ? 'text' : type;

  // Enhanced input types for better mobile keyboards
  const getOptimalInputType = useCallback(() => {
    if (!enhancedKeyboard) return inputType;

    switch (type) {
      case 'email':
        return 'email';
      case 'tel':
        return 'tel';
      case 'url':
        return 'url';
      case 'number':
        return 'number';
      case 'search':
        return 'search';
      default:
        return inputType;
    }
  }, [type, inputType, enhancedKeyboard]);

  // Get optimal input mode for better keyboard
  const getInputMode = useCallback((): React.HTMLAttributes<HTMLInputElement>['inputMode'] => {
    if (!enhancedKeyboard) return undefined;

    switch (type) {
      case 'email':
        return 'email';
      case 'tel':
        return 'tel';
      case 'url':
        return 'url';
      case 'number':
        return 'numeric';
      case 'search':
        return 'search';
      default:
        return 'text';
    }
  }, [type, enhancedKeyboard]);

  // Auto-scroll input into view when keyboard opens
  useEffect(() => {
    if (isFocused && isKeyboardOpen && inputRef.current) {
      const input = inputRef.current;
      const rect = input.getBoundingClientRect();
      const keyboardHeight = window.innerHeight - visualViewportHeight;
      
      // Check if input is hidden behind keyboard
      if (rect.bottom > visualViewportHeight) {
        const scrollOffset = rect.bottom - visualViewportHeight + 20; // 20px padding
        window.scrollBy(0, scrollOffset);
      }
    }
  }, [isFocused, isKeyboardOpen, visualViewportHeight]);

  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    
    // Prevent zoom on iOS
    if (preventZoom && /iPhone|iPad|iPod/.test(navigator.userAgent)) {
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        const content = viewport.getAttribute('content');
        viewport.setAttribute('content', `${content}, user-scalable=0`);
        
        // Restore after blur
        setTimeout(() => {
          viewport.setAttribute('content', content || '');
        }, 1000);
      }
    }

    onFocus?.(e);
  }, [onFocus, preventZoom]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  }, [onBlur]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange?.(e);
  }, [onChange]);

  const handleClear = useCallback(() => {
    setLocalValue('');
    if (inputRef.current) {
      const event = new Event('input', { bubbles: true });
      Object.defineProperty(event, 'target', {
        writable: false,
        value: { ...inputRef.current, value: '' }
      });
      inputRef.current.value = '';
      onChange?.(event as any);
      inputRef.current.focus();
    }
  }, [onChange]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(!showPassword);
  }, [showPassword]);

  // Enhanced keyboard patterns for better UX
  const getKeyboardPattern = useCallback(() => {
    switch (type) {
      case 'tel':
        return '[0-9]*';
      case 'number':
        return '[0-9]*';
      default:
        return undefined;
    }
  }, [type]);

  // Auto-capitalize settings
  const getAutoCapitalize = useCallback((): React.HTMLAttributes<HTMLInputElement>['autoCapitalize'] => {
    switch (type) {
      case 'email':
      case 'url':
        return 'none';
      case 'password':
        return 'none';
      default:
        return 'sentences';
    }
  }, [type]);

  const currentValue = value !== undefined ? value : localValue;

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label 
          htmlFor={props.id}
          className={cn(
            'block text-sm font-medium mb-2 transition-colors',
            error ? 'text-destructive' : 'text-foreground',
            isFocused && !error && 'text-primary'
          )}
        >
          {label}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        <input
          ref={inputRef}
          type={getOptimalInputType()}
          inputMode={getInputMode()}
          pattern={getKeyboardPattern()}
          autoCapitalize={getAutoCapitalize()}
          autoComplete={type === 'password' ? 'current-password' : 'on'}
          autoCorrect={type === 'password' ? 'off' : 'on'}
          spellCheck={type === 'password' ? false : true}
          value={currentValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={cn(
            // Base styles
            'w-full px-3 py-3 text-base border rounded-lg transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            
            // Mobile optimizations
            'min-h-[44px]', // Minimum touch target
            preventZoom && 'text-[16px]', // Prevent zoom on iOS
            
            // Dynamic padding based on icons
            (clearable && currentValue) && 'pr-10',
            showPasswordToggle && 'pr-10',
            (clearable && currentValue && showPasswordToggle) && 'pr-16',
            
            // Error state
            error 
              ? 'border-destructive focus:border-destructive focus:ring-destructive/20' 
              : 'border-border',
            
            // Focus state
            isFocused && 'ring-2 ring-primary/20 border-primary',
            
            className
          )}
          {...props}
        />

        {/* Clear button */}
        {clearable && currentValue && (
          <button
            type="button"
            onClick={handleClear}
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2 p-1',
              'text-muted-foreground hover:text-foreground',
              'transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary/20 rounded',
              showPasswordToggle && 'right-10'
            )}
            aria-label="Clear input"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Password visibility toggle */}
        {showPasswordToggle && type === 'password' && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2 p-1',
              'text-muted-foreground hover:text-foreground',
              'transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary/20 rounded'
            )}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Focus indicator for accessibility */}
        <div 
          className={cn(
            'absolute inset-0 rounded-lg pointer-events-none transition-opacity',
            'ring-2 ring-primary opacity-0',
            isFocused && 'opacity-100'
          )}
          aria-hidden="true"
        />
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {/* Character count for text inputs */}
      {props.maxLength && type === 'text' && (
        <p className="mt-1 text-xs text-muted-foreground text-right">
          {String(currentValue).length} / {props.maxLength}
        </p>
      )}
    </div>
  );
};

// Specialized mobile textarea component
interface MobileTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: string;
  error?: string;
  autoResize?: boolean;
  maxRows?: number;
  minRows?: number;
}

export const MobileTextarea: React.FC<MobileTextareaProps> = ({
  label,
  error,
  autoResize = true,
  maxRows = 10,
  minRows = 3,
  className,
  value,
  onChange,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [localValue, setLocalValue] = useState(value || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isKeyboardOpen, visualViewportHeight } = useMobileViewport();

  const currentValue = value !== undefined ? value : localValue;

  // Auto-resize functionality
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea || !autoResize) return;

    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 20;
    const maxHeight = lineHeight * maxRows;
    const minHeight = lineHeight * minRows;

    textarea.style.height = `${Math.min(Math.max(scrollHeight, minHeight), maxHeight)}px`;
  }, [autoResize, maxRows, minRows]);

  useEffect(() => {
    adjustHeight();
  }, [currentValue, adjustHeight]);

  // Auto-scroll into view when keyboard opens
  useEffect(() => {
    if (isFocused && isKeyboardOpen && textareaRef.current) {
      const textarea = textareaRef.current;
      const rect = textarea.getBoundingClientRect();
      
      if (rect.bottom > visualViewportHeight) {
        const scrollOffset = rect.bottom - visualViewportHeight + 20;
        window.scrollBy(0, scrollOffset);
      }
    }
  }, [isFocused, isKeyboardOpen, visualViewportHeight]);

  const handleFocus = useCallback((e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  }, [onFocus]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  }, [onBlur]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange?.(e);
    adjustHeight();
  }, [onChange, adjustHeight]);

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label 
          htmlFor={props.id}
          className={cn(
            'block text-sm font-medium mb-2 transition-colors',
            error ? 'text-destructive' : 'text-foreground',
            isFocused && !error && 'text-primary'
          )}
        >
          {label}
        </label>
      )}

      {/* Textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={currentValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          rows={minRows}
          className={cn(
            // Base styles
            'w-full px-3 py-3 text-base border rounded-lg transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'resize-none', // Disable manual resize on mobile
            
            // Mobile optimizations
            'text-[16px]', // Prevent zoom on iOS
            
            // Error state
            error 
              ? 'border-destructive focus:border-destructive focus:ring-destructive/20' 
              : 'border-border',
            
            // Focus state
            isFocused && 'ring-2 ring-primary/20 border-primary',
            
            className
          )}
          {...props}
        />
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {/* Character count */}
      {props.maxLength && (
        <p className="mt-1 text-xs text-muted-foreground text-right">
          {String(currentValue).length} / {props.maxLength}
        </p>
      )}
    </div>
  );
};