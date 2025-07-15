
import React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  colorVariant?: 'natty' | 'juicy' | 'gradient' | 'default';
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, colorVariant = 'default', ...props }, ref) => {
  const getIndicatorClass = () => {
    switch (colorVariant) {
      case 'natty':
        return 'bg-natty';
      case 'juicy':
        return 'bg-juicy';
      case 'gradient':
        // Create a gradient that goes from purple (juicy) to green (natty)
        return 'bg-gradient-to-r from-juicy to-natty';
      default:
        return 'bg-primary';
    }
  };

  const getBackgroundClass = () => {
    if (colorVariant === 'gradient') {
      // For gradient variant, show the full gradient as background
      return 'bg-gradient-to-r from-juicy/20 to-natty/20';
    }
    return 'bg-secondary';
  };

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full",
        getBackgroundClass(),
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn("h-full w-full flex-1 transition-all", getIndicatorClass())}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
