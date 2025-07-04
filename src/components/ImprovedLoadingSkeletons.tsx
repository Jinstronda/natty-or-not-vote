import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Advanced shimmer effect
const shimmerKeyframes = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  @keyframes pulse-glow {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.8; }
  }
  
  @keyframes wave {
    0%, 100% { transform: scaleX(1); }
    50% { transform: scaleX(1.05); }
  }
`;

// Inject keyframes into document head
if (typeof document !== 'undefined' && !document.getElementById('loading-animations')) {
  const style = document.createElement('style');
  style.id = 'loading-animations';
  style.textContent = shimmerKeyframes;
  document.head.appendChild(style);
}

// Base shimmer component with advanced effects
const ShimmerElement = ({ 
  width = "100%", 
  height = "1rem", 
  className = "",
  delay = 0 
}: {
  width?: string;
  height?: string;
  className?: string;
  delay?: number;
}) => (
  <div 
    className={`relative overflow-hidden rounded ${className}`}
    style={{ width, height, animationDelay: `${delay}ms` }}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted-foreground/30 to-muted animate-pulse" />
    <div 
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
      style={{
        animation: 'shimmer 2s infinite linear',
        animationDelay: `${delay}ms`
      }}
    />
  </div>
);

// Enhanced vote bar skeleton that mimics real layout
const VoteBarSkeleton = ({ delay = 0 }: { delay?: number }) => (
  <div className="space-y-2" style={{ animationDelay: `${delay}ms` }}>
    {/* Percentage labels */}
    <div className="flex justify-between items-center">
      <ShimmerElement width="60px" height="12px" delay={delay} />
      <ShimmerElement width="60px" height="12px" delay={delay + 100} />
    </div>
    
    {/* Vote bar with animated filling effect */}
    <div className="relative overflow-hidden">
      <div className="w-full bg-muted/50 rounded-full h-2">
        <div 
          className="h-full bg-gradient-to-r from-muted-foreground/40 to-muted-foreground/60 rounded-full"
          style={{
            animation: 'wave 2s infinite ease-in-out',
            animationDelay: `${delay + 200}ms`,
            width: '70%'
          }}
        />
      </div>
    </div>
    
    {/* Badge skeleton */}
    <div className="flex justify-center">
      <ShimmerElement 
        width="80px" 
        height="24px" 
        className="rounded-full" 
        delay={delay + 300} 
      />
    </div>
  </div>
);

// Realistic influencer card skeleton
export const RealisticInfluencerSkeleton = ({ index = 0 }: { index?: number }) => {
  const delay = index * 100; // Stagger animations
  
  return (
    <Card className="overflow-hidden relative">
      {/* Subtle border animation */}
      <div 
        className="absolute inset-0 border-2 border-transparent bg-gradient-to-r from-transparent via-muted-foreground/20 to-transparent rounded-lg"
        style={{
          animation: 'shimmer 3s infinite linear',
          animationDelay: `${delay}ms`
        }}
      />
      
      <CardHeader className="p-0">
        <div className="aspect-square relative overflow-hidden">
          {/* Image skeleton with gradient animation */}
          <div className="w-full h-full bg-gradient-to-br from-muted via-muted-foreground/20 to-muted relative overflow-hidden">
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              style={{
                animation: 'shimmer 2.5s infinite linear',
                animationDelay: `${delay}ms`
              }}
            />
          </div>
          
          {/* Badge skeletons */}
          <div className="absolute top-2 right-2">
            <ShimmerElement 
              width="60px" 
              height="20px" 
              className="rounded-full" 
              delay={delay + 500} 
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-3">
        {/* Name skeleton */}
        <div className="flex justify-center">
          <ShimmerElement 
            width="120px" 
            height="20px" 
            delay={delay + 200} 
          />
        </div>
        
        {/* Vote bar skeleton */}
        <VoteBarSkeleton delay={delay + 400} />
      </CardContent>
    </Card>
  );
};

// Grid of realistic skeletons with staggered animations
export const EnhancedSkeletonGrid = ({ count = 8 }: { count?: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, index) => (
      <RealisticInfluencerSkeleton key={index} index={index} />
    ))}
  </div>
);

// Progressive loading skeleton that transforms into content
export const ProgressiveLoadingSkeleton = ({ 
  stage = 'initial',
  children 
}: {
  stage: 'initial' | 'data-loading' | 'complete';
  children?: React.ReactNode;
}) => {
  if (stage === 'complete') {
    return <>{children}</>;
  }
  
  return (
    <div className={`
      transition-all duration-500 ease-out
      ${stage === 'data-loading' ? 'opacity-70 scale-[0.98]' : 'opacity-100 scale-100'}
    `}>
      {stage === 'initial' ? (
        <RealisticInfluencerSkeleton />
      ) : (
        <div className="relative">
          {children}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse pointer-events-none" />
        </div>
      )}
    </div>
  );
};

// Micro-interaction loading states
export const MicroLoadingDot = ({ 
  size = 4, 
  color = 'bg-primary',
  delay = 0 
}: {
  size?: number;
  color?: string;
  delay?: number;
}) => (
  <div 
    className={`w-${size} h-${size} ${color} rounded-full`}
    style={{
      animation: 'pulse-glow 1.5s infinite ease-in-out',
      animationDelay: `${delay}ms`
    }}
  />
);

export const ThreeDotsLoader = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center justify-center space-x-1 ${className}`}>
    <MicroLoadingDot delay={0} />
    <MicroLoadingDot delay={200} />
    <MicroLoadingDot delay={400} />
  </div>
);

// Optimized for vote percentage loading
export const PercentageLoader = ({ 
  targetPercentage = 0,
  isLoading = true,
  color = 'text-primary' 
}: {
  targetPercentage?: number;
  isLoading?: boolean;
  color?: string;
}) => {
  if (isLoading) {
    return (
      <span className={`${color} animate-pulse`}>
        --% 
      </span>
    );
  }
  
  return (
    <span className={`${color} transition-all duration-300`}>
      {targetPercentage}%
    </span>
  );
};