import { Button } from "@/components/ui/button";
import { useMemo } from "react";

interface DynamicPercentageButtonProps {
  nattyPercentage: number;
  juicyPercentage: number;
  totalVotes: number;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const DynamicPercentageButton = ({ 
  nattyPercentage, 
  juicyPercentage, 
  totalVotes,
  className = "",
  onClick,
  disabled = false
}: DynamicPercentageButtonProps) => {
  
  // Calculate dynamic styling based on percentages
  const dynamicStyles = useMemo(() => {
    if (totalVotes === 0) {
      return {
        background: 'linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--muted-foreground)) 100%)',
        color: 'hsl(var(--muted-foreground))',
        borderColor: 'hsl(var(--border))',
        text: 'No Votes Yet',
        shadowColor: 'hsl(var(--muted))'
      };
    }

    const nattyRatio = nattyPercentage / 100;
    const juicyRatio = juicyPercentage / 100;
    
    // Create gradient based on percentages
    const nattyColor = `hsl(var(--natty))`;
    const juicyColor = `hsl(var(--juicy))`;
    
    if (nattyPercentage === juicyPercentage) {
      // Equal split - create balanced gradient
      return {
        background: `linear-gradient(135deg, ${nattyColor} 0%, ${juicyColor} 100%)`,
        color: 'white',
        borderColor: nattyRatio > 0.5 ? nattyColor : juicyColor,
        text: `${nattyPercentage}% Natty • ${juicyPercentage}% Juicy`,
        shadowColor: 'hsl(var(--primary))'
      };
    } else if (nattyPercentage > juicyPercentage) {
      // More natty - green dominant with subtle purple
      const intensity = Math.min(nattyRatio * 1.2, 1);
      return {
        background: `linear-gradient(135deg, 
          ${nattyColor} 0%, 
          hsl(var(--natty) / ${0.8 + intensity * 0.2}) 50%,
          hsl(var(--juicy) / ${0.1 + juicyRatio * 0.3}) 100%)`,
        color: 'white',
        borderColor: nattyColor,
        text: `${nattyPercentage}% Natty Dominant`,
        shadowColor: `hsl(var(--natty) / 0.3)`
      };
    } else {
      // More juicy - purple dominant with subtle green
      const intensity = Math.min(juicyRatio * 1.2, 1);
      return {
        background: `linear-gradient(135deg, 
          ${juicyColor} 0%, 
          hsl(var(--juicy) / ${0.8 + intensity * 0.2}) 50%,
          hsl(var(--natty) / ${0.1 + nattyRatio * 0.3}) 100%)`,
        color: 'white',
        borderColor: juicyColor,
        text: `${juicyPercentage}% Juicy Dominant`,
        shadowColor: `hsl(var(--juicy) / 0.3)`
      };
    }
  }, [nattyPercentage, juicyPercentage, totalVotes]);

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative overflow-hidden font-semibold text-sm
        transition-all duration-500 ease-out
        hover:scale-105 active:scale-95
        hover:shadow-lg hover:shadow-${dynamicStyles.shadowColor}
        border-2
        ${className}
      `}
      style={{
        background: dynamicStyles.background,
        color: dynamicStyles.color,
        borderColor: dynamicStyles.borderColor,
        boxShadow: `0 4px 14px 0 ${dynamicStyles.shadowColor}`,
      }}
    >
      {/* Shimmer effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      
      {/* Content */}
      <div className="relative z-10 flex items-center gap-2">
        {totalVotes > 0 && (
          <span className="text-xs opacity-80">
            {totalVotes.toLocaleString()} votes
          </span>
        )}
        <span>{dynamicStyles.text}</span>
      </div>
    </Button>
  );
}; 