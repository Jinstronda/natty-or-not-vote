import { Button } from "@/components/ui/button";
import { useVote } from "@/hooks/api/useVote";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { motion, type Variants } from "framer-motion";

interface VoteButtonProps {
  influencerId: string;
  voteType: "natty" | "not_natty";
}

export const VoteButton = ({ influencerId, voteType }: VoteButtonProps) => {
  const { mutate: vote, isPending } = useVote();
  const isNatty = voteType === "natty";

  const handleVote = () => {
    vote({ influencerId, voteType });
  };

  // Framer Motion variants for enhanced interactions
  const buttonVariants: Variants = {
    idle: { 
      scale: 1, 
      y: 0,
      rotateX: 0,
    },
    hover: { 
      scale: 1.05, 
      y: -4,
      rotateX: -5,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 10
      }
    },
    tap: { 
      scale: 0.95,
      y: 0,
      rotateX: 5,
      transition: {
        type: "spring" as const,
        stiffness: 600,
        damping: 15
      }
    },
    loading: {
      scale: [1, 1.02, 1],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const iconVariants: Variants = {
    idle: { rotate: 0 },
    hover: { 
      rotate: isNatty ? 12 : -12,
      transition: { type: "spring" as const, stiffness: 300 }
    },
    tap: { 
      rotate: isNatty ? -5 : 5,
      scale: 1.1,
      transition: { type: "spring" as const, stiffness: 400 }
    }
  };

  const shimmerVariants: Variants = {
    idle: { x: "-100%" },
    hover: { 
      x: "100%",
      transition: { duration: 0.6, ease: [0.4, 0.0, 0.2, 1] }
    }
  };

  return (
    <motion.div
      variants={buttonVariants}
      initial="idle"
      animate={isPending ? "loading" : "idle"}
      whileHover={!isPending ? "hover" : undefined}
      whileTap={!isPending ? "tap" : undefined}
      style={{ transformStyle: "preserve-3d" }}
    >
      <Button
        size="sm"
        onClick={handleVote}
        disabled={isPending}
        className={`
          relative overflow-hidden font-semibold
          transition-colors duration-300 ease-out
          border-2
          ${isNatty 
            ? `bg-gradient-to-r from-natty to-natty/90 
               hover:from-natty/90 hover:to-natty 
               text-white border-natty
               shadow-lg shadow-natty/30` 
            : `bg-gradient-to-r from-juicy to-juicy/90 
               hover:from-juicy/90 hover:to-juicy 
               text-white border-juicy
               shadow-lg shadow-juicy/30`
          }
          ${isPending ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {/* Enhanced shimmer effect with Framer Motion */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12"
          variants={shimmerVariants}
          initial="idle"
        />
        
        {/* Content with enhanced icon animation */}
        <div className="relative z-10 flex items-center">
          <motion.div variants={iconVariants}>
            {isNatty ? (
              <ThumbsUp className="w-4 h-4 mr-2" />
            ) : (
              <ThumbsDown className="w-4 h-4 mr-2" />
            )}
          </motion.div>
          
          {isPending ? (
            <motion.span 
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              Voting...
            </motion.span>
          ) : (
            <span className="transition-all duration-200">
              {isNatty ? "Natty" : "Juicy"}
            </span>
          )}
        </div>
      </Button>
    </motion.div>
  );
}; 