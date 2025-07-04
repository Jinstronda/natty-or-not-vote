import React, { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface MobileTouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  hapticFeedback?: boolean;
  touchFeedback?: 'ripple' | 'scale' | 'none';
  children: React.ReactNode;
  className?: string;
}

export const MobileTouchButton: React.FC<MobileTouchButtonProps> = ({
  hapticFeedback = true,
  touchFeedback = 'ripple',
  children,
  className,
  onClick,
  onTouchStart,
  onTouchEnd,
  disabled,
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const rippleId = useRef(0);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const triggerHapticFeedback = useCallback(() => {
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10); // Subtle haptic feedback
    }
  }, [hapticFeedback]);

  const createRipple = useCallback((event: React.TouchEvent<HTMLButtonElement>) => {
    if (touchFeedback !== 'ripple' || !buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const touch = event.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const newRipple = {
      id: rippleId.current++,
      x,
      y
    };

    setRipples(prev => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  }, [touchFeedback]);

  const handleTouchStart = useCallback((event: React.TouchEvent<HTMLButtonElement>) => {
    if (disabled) return;

    setIsPressed(true);
    createRipple(event);
    triggerHapticFeedback();

    if (onTouchStart) {
      onTouchStart(event);
    }
  }, [disabled, createRipple, triggerHapticFeedback, onTouchStart]);

  const handleTouchEnd = useCallback((event: React.TouchEvent<HTMLButtonElement>) => {
    setIsPressed(false);

    if (onTouchEnd) {
      onTouchEnd(event);
    }
  }, [onTouchEnd]);

  const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;

    triggerHapticFeedback();

    if (onClick) {
      onClick(event);
    }
  }, [disabled, triggerHapticFeedback, onClick]);

  return (
    <button
      ref={buttonRef}
      className={cn(
        'relative overflow-hidden transition-all duration-150 ease-out select-none',
        'min-h-[44px] min-w-[44px]', // Minimum touch target size
        'active:scale-95', // Subtle press animation
        touchFeedback === 'scale' && isPressed && 'scale-95',
        touchFeedback === 'scale' && 'transform transition-transform duration-150',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {/* Button content */}
      <span className="relative z-10">
        {children}
      </span>

      {/* Ripple effects */}
      {touchFeedback === 'ripple' && ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full animate-ping pointer-events-none"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            animationDuration: '600ms',
            animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      ))}

      {/* Press state overlay */}
      <div 
        className={cn(
          'absolute inset-0 bg-black/5 transition-opacity duration-150 pointer-events-none',
          isPressed ? 'opacity-100' : 'opacity-0'
        )}
      />
    </button>
  );
};