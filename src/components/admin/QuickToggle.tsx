import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flame, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToggleControversial } from '@/hooks/api/useToggleControversial';

interface QuickToggleProps {
  isControversial: boolean;
  isLoading?: boolean;
  onToggle?: () => void;
  influencerName: string;
  influencerId?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function QuickToggle({
  isControversial,
  isLoading: isLoadingProp,
  onToggle,
  influencerName,
  influencerId,
  size = 'sm',
  showLabel = true
}: QuickToggleProps) {
  const isMobile = useIsMobile();

  // Self-contained mode: use the hook if influencerId is provided and no onToggle
  const { mutate: toggleControversial, isPending: isLoadingHook } = useToggleControversial();

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else if (influencerId) {
      toggleControversial({ influencerId, controversial: !isControversial });
    }
  };

  const isLoading = typeof isLoadingProp === 'boolean' ? isLoadingProp : isLoadingHook;

  // Mobile-optimized button sizes (ensure minimum 44px touch target)
  const mobileButtonSizes = {
    sm: 'h-11 px-4 text-sm min-w-11', // 44px height minimum
    md: 'h-11 px-4 text-sm min-w-11', // 44px height minimum
    lg: 'h-12 px-6 text-base min-w-12' // 48px height for large
  };

  // Desktop button sizes (original)
  const desktopButtonSizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-9 px-4 text-sm',
    lg: 'h-10 px-6 text-base'
  };

  const buttonSizes = isMobile ? mobileButtonSizes : desktopButtonSizes;

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4', 
    lg: 'h-5 w-5'
  };

  // Mobile-specific styles (remove problematic hover effects)
  const mobileStyles = isMobile 
    ? "active:scale-95 active:opacity-75 touch-manipulation" 
    : "transition-all duration-200 transform hover:scale-105";

  if (isControversial) {
    return (
      <Button
        variant="default"
        size="sm"
        onClick={handleToggle}
        disabled={isLoading}
        className={cn(
          buttonSizes[size],
          "bg-orange-600 hover:bg-orange-700 text-white",
          mobileStyles
        )}
        title={`Remove ${influencerName} from controversial`}
      >
        {isLoading ? (
          <Loader2 className={cn(iconSizes[size], "animate-spin")} />
        ) : (
          <Flame className={iconSizes[size]} />
        )}
        {showLabel && (
          <span className="ml-1">
            Controversial
          </span>
        )}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      disabled={isLoading}
      className={cn(
        buttonSizes[size],
        "border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300",
        mobileStyles
      )}
      title={`Mark ${influencerName} as controversial`}
    >
      {isLoading ? (
        <Loader2 className={cn(iconSizes[size], "animate-spin")} />
      ) : (
        <Flame className={iconSizes[size]} />
      )}
      {showLabel && (
        <span className="ml-1">
          Mark Controversial
        </span>
      )}
    </Button>
  );
}

interface ControversialBadgeProps {
  isControversial: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ControversialBadge({ isControversial, size = 'sm' }: ControversialBadgeProps) {
  if (!isControversial) return null;

  const badgeSizes = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <Badge 
      variant="secondary"
      className={cn(
        badgeSizes[size],
        "bg-orange-100 text-orange-800 border-orange-200",
        "inline-flex items-center gap-1"
      )}
    >
      <Flame className={iconSizes[size]} />
      Controversial
    </Badge>
  );
} 