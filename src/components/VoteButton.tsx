import { Button } from "@/components/ui/button";
import { useVote } from "@/hooks/api/useVote";
import { ThumbsUp, ThumbsDown, Sparkles } from "lucide-react";
import { useState } from "react";

interface VoteButtonProps {
  influencerId: string;
  voteType: "natty" | "not_natty";
}

export const VoteButton = ({ influencerId, voteType }: VoteButtonProps) => {
  const { mutate: vote, isPending } = useVote();
  const isNatty = voteType === "natty";
  const [isClicked, setIsClicked] = useState(false);
  const [showEffect, setShowEffect] = useState(false);

  // Haptic feedback for mobile devices
  const triggerHapticFeedback = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50); // 50ms vibration
    }
  };

  const handleVote = () => {
    // Trigger haptic feedback
    triggerHapticFeedback();
    
    // Visual feedback
    setIsClicked(true);
    setShowEffect(true);
    
    // Reset visual state
    setTimeout(() => setIsClicked(false), 150);
    setTimeout(() => setShowEffect(false), 600);
    
    // Perform vote
    vote({ influencerId, voteType });
  };

  return (
    <Button
      size="sm"
      onClick={handleVote}
      disabled={isPending}
      className={`
        relative overflow-hidden font-semibold group
        transition-all duration-500 ease-out
        hover:scale-110 active:scale-95
        hover:-translate-y-2 hover:rotate-1
        border-2 border-opacity-50
        ${isClicked ? 'scale-125 rotate-2' : ''}
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
      {/* Click effect */}
      {showEffect && (
        <div className="absolute inset-0 pointer-events-none">
          <div className={`absolute inset-0 rounded-full ${isNatty ? 'bg-natty' : 'bg-juicy'} opacity-30 animate-ping`} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Sparkles className="w-4 h-4 text-white animate-spin" />
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
          `} />
        ) : (
          <ThumbsDown className={`
            w-4 h-4 mr-2 transition-all duration-300 
            ${isPending ? 'animate-bounce' : 'group-hover:-rotate-12 group-hover:scale-110'}
            ${isClicked ? '-rotate-12 scale-125' : ''}
          `} />
        )}
        {isPending ? (
          <span className="animate-pulse font-bold">Voting...</span>
        ) : (
          <span className={`
            transition-all duration-300 font-semibold
            group-hover:scale-110
            ${isClicked ? 'scale-110' : ''}
          `}>
            {isNatty ? "Natty" : "Juicy"}
          </span>
        )}
      </div>
    </Button>
  );
}; 