import { Button } from "@/components/ui/button";
import { useVote } from "@/hooks/api/useVote";
import { ThumbsUp, ThumbsDown, Sparkles, Zap } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface VoteButtonProps {
  influencerId: string;
  voteType: "natty" | "not_natty";
}

export const VoteButton = ({ influencerId, voteType }: VoteButtonProps) => {
  const { mutate: vote, isPending } = useVote();
  const isNatty = voteType === "natty";
  const [isClicked, setIsClicked] = useState(false);
  const [showEffect, setShowEffect] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [isPressed, setIsPressed] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Enhanced haptic feedback for mobile devices
  const triggerHapticFeedback = (intensity: 'light' | 'medium' | 'heavy' = 'medium') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [30],
        medium: [50, 20, 50],
        heavy: [100, 30, 100, 30, 100]
      };
      navigator.vibrate(patterns[intensity]);
    }
  };

  // Create particle effect
  const createParticles = () => {
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50,
    }));
    setParticles(newParticles);
    
    // Clear particles after animation
    setTimeout(() => setParticles([]), 2000);
  };

  const handleVote = () => {
    // Enhanced haptic feedback
    triggerHapticFeedback('heavy');
    
    // Visual feedback
    setIsClicked(true);
    setShowEffect(true);
    createParticles();
    
    // Reset visual state
    setTimeout(() => setIsClicked(false), 300);
    setTimeout(() => setShowEffect(false), 1000);
    
    // Perform vote
    vote({ influencerId, voteType });
  };

  // Touch interaction handlers
  const handleTouchStart = () => {
    setIsPressed(true);
    triggerHapticFeedback('light');
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
  };

  // Mouse interaction handlers for desktop
  const handleMouseDown = () => {
    setIsPressed(true);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const handleMouseLeave = () => {
    setIsPressed(false);
  };

  return (
    <Button
      ref={buttonRef}
      size="sm"
      onClick={handleVote}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      disabled={isPending}
      className={`
        relative overflow-hidden font-semibold group
        transition-all duration-300 ease-out btn-enhanced mobile-touch-feedback focus-ring
        hover:scale-110 active:scale-95
        hover:-translate-y-2 hover:rotate-1
        border-2 border-opacity-50
        ${isClicked ? 'scale-125 rotate-2 spring-animation' : ''}
        ${isPressed ? 'scale-95 brightness-110' : ''}
        ${isNatty 
          ? `bg-gradient-to-r from-natty via-natty/95 to-natty/80 
             hover:from-natty/80 hover:via-natty hover:to-natty/90
             text-white border-natty
             hover:shadow-2xl hover:shadow-natty/40
             shadow-lg shadow-natty/25
             hover:ring-4 hover:ring-natty/20` 
          : `bg-gradient-to-r from-juicy via-juicy/95 to-juicy/80 
             hover:from-juicy/80 hover:via-juicy hover:to-juicy/90
             text-white border-juicy
             hover:shadow-2xl hover:shadow-juicy/40
             shadow-lg shadow-juicy/25
             hover:ring-4 hover:ring-juicy/20`
        }
        ${isPending ? 'animate-pulse cursor-not-allowed opacity-70' : 'cursor-pointer'}
        before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent
        before:translate-x-[-100%] before:skew-x-12 before:transition-transform before:duration-700
        hover:before:translate-x-[100%]
      `}
    >
      {/* Particle Effects */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute pointer-events-none particle-float"
          style={{
            left: '50%',
            top: '50%',
            transform: `translate(${particle.x}px, ${particle.y}px)`,
          }}
        >
          <div className={`w-2 h-2 rounded-full ${isNatty ? 'bg-natty' : 'bg-juicy'}`} />
        </div>
      ))}

      {/* Enhanced Click Effect */}
      {showEffect && (
        <div className="absolute inset-0 pointer-events-none">
          <div className={`absolute inset-0 rounded-full ${isNatty ? 'bg-natty' : 'bg-juicy'} opacity-30 animate-ping`} />
          <div className={`absolute inset-0 rounded-full ${isNatty ? 'bg-natty' : 'bg-juicy'} opacity-20`} 
               style={{ animation: 'ping 0.8s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Sparkles className="w-6 h-6 text-white animate-spin" />
          </div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Zap className={`w-8 h-8 ${isNatty ? 'text-natty' : 'text-juicy'} animate-pulse`} />
          </div>
        </div>
      )}
      
      {/* Content */}
      <div className="relative z-10 flex items-center">
        {isNatty ? (
          <ThumbsUp className={`
            w-4 h-4 mr-2 transition-all duration-300 
            ${isPending ? 'animate-bounce' : 'group-hover:rotate-12 group-hover:scale-110'}
            ${isClicked ? 'rotate-12 scale-125' : ''}
            ${isPressed ? 'scale-110' : ''}
          `} />
        ) : (
          <ThumbsDown className={`
            w-4 h-4 mr-2 transition-all duration-300 
            ${isPending ? 'animate-bounce' : 'group-hover:-rotate-12 group-hover:scale-110'}
            ${isClicked ? '-rotate-12 scale-125' : ''}
            ${isPressed ? 'scale-110' : ''}
          `} />
        )}
        {isPending ? (
          <span className="animate-pulse font-bold">Voting...</span>
        ) : (
          <span className={`
            transition-all duration-300 font-semibold
            group-hover:scale-110
            ${isClicked ? 'scale-110' : ''}
            ${isPressed ? 'scale-105' : ''}
          `}>
            {isNatty ? "Natty" : "Juicy"}
          </span>
        )}
      </div>
    </Button>
  );
}; 