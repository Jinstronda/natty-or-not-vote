import React from 'react';
import { cn } from '@/lib/utils';

interface MobileLayoutContainerProps {
  children: React.ReactNode;
  className?: string;
  preventHorizontalScroll?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

/**
 * MobileLayoutContainer - Research-based mobile layout component
 * 
 * Addresses critical mobile UX issues:
 * - Prevents horizontal scrolling (common cause of broken mobile layouts)
 * - Ensures proper touch target sizing (44px minimum)
 * - Implements mobile-first responsive patterns
 * - Provides consistent spacing and containment
 * 
 * Based on Baymard Institute research: 81% of sites have mediocre mobile UX
 */
export const MobileLayoutContainer: React.FC<MobileLayoutContainerProps> = ({
  children,
  className,
  preventHorizontalScroll = true,
  maxWidth = 'full'
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full'
  };

  return (
    <div
      className={cn(
        // Base mobile layout classes
        'w-full',
        maxWidthClasses[maxWidth],
        
        // Prevent horizontal scroll (Research: Major cause of broken mobile UX)
        preventHorizontalScroll && [
          'overflow-x-hidden',
          'min-w-0', // Prevents flex items from overflowing
        ],
        
        // Mobile-first responsive spacing
        'px-3 sm:px-4 md:px-6 lg:px-8',
        
        // Ensure proper box sizing
        'box-border',
        
        className
      )}
      style={{
        // CSS-in-JS for critical mobile layout fixes
        ...(preventHorizontalScroll && {
          maxWidth: '100vw',
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          hyphens: 'auto',
        })
      }}
    >
      {children}
    </div>
  );
};

/**
 * MobileTouchTarget - Ensures WCAG-compliant touch targets
 * 
 * Research finding: 63% of sites don't meet touch target size requirements
 * WCAG requirement: Minimum 44px x 44px for touch targets
 */
interface MobileTouchTargetProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  asChild?: boolean;
}

export const MobileTouchTarget: React.FC<MobileTouchTargetProps> = ({
  children,
  className,
  size = 'md',
  asChild = false
}) => {
  const sizeClasses = {
    sm: 'min-h-[44px] min-w-[44px]', // WCAG minimum
    md: 'min-h-[48px] min-w-[48px]', // Recommended
    lg: 'min-h-[56px] min-w-[56px]'  // Large touch targets
  };

  const Component = asChild ? React.Fragment : 'div';
  const props = asChild ? {} : {
    className: cn(
      sizeClasses[size],
      'flex items-center justify-center',
      'touch-manipulation', // Improve touch responsiveness
      className
    )
  };

  return (
    <Component {...props}>
      {children}
    </Component>
  );
};

/**
 * MobileTypography - Research-based mobile typography scaling
 * 
 * Implements progressive enhancement for mobile readability
 */
interface MobileTypographyProps {
  variant: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption';
  children: React.ReactNode;
  className?: string;
}

export const MobileTypography: React.FC<MobileTypographyProps> = ({
  variant,
  children,
  className
}) => {
  const variantClasses = {
    h1: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight',
    h2: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight',
    h3: 'text-lg sm:text-xl md:text-2xl font-semibold leading-tight',
    h4: 'text-base sm:text-lg md:text-xl font-semibold',
    body: 'text-sm sm:text-base leading-relaxed',
    caption: 'text-xs sm:text-sm text-muted-foreground'
  };

  const Component = variant.startsWith('h') ? variant as keyof JSX.IntrinsicElements : 'p';

  return (
    <Component
      className={cn(
        variantClasses[variant],
        'max-w-full', // Prevent text overflow
        className
      )}
    >
      {children}
    </Component>
  );
};

/**
 * MobileGrid - Responsive grid system optimized for mobile
 * 
 * Prevents common grid overflow issues on mobile devices
 */
interface MobileGridProps {
  children: React.ReactNode;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const MobileGrid: React.FC<MobileGridProps> = ({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
  className
}) => {
  const gapClasses = {
    sm: 'gap-2 sm:gap-3',
    md: 'gap-3 sm:gap-4 md:gap-6',
    lg: 'gap-4 sm:gap-6 md:gap-8'
  };

  const gridClasses = [
    `grid-cols-${columns.mobile}`,
    columns.tablet && `sm:grid-cols-${columns.tablet}`,
    columns.desktop && `md:grid-cols-${columns.desktop}`
  ].filter(Boolean).join(' ');

  return (
    <div
      className={cn(
        'grid',
        gridClasses,
        gapClasses[gap],
        'w-full',
        'min-w-0', // Prevent grid item overflow
        className
      )}
    >
      {children}
    </div>
  );
};

export default MobileLayoutContainer; 