import { Button } from "@/components/ui/button";
import { useVote } from "@/hooks/api/useVote";
import { ThumbsUp, ThumbsDown } from "lucide-react";

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

  return (
    <Button
      size="sm"
      onClick={handleVote}
      disabled={isPending}
      className={`
        relative overflow-hidden font-semibold
        transition-all duration-300 ease-out
        hover:scale-105 active:scale-95
        hover:-translate-y-1
        border-2
        ${isNatty 
          ? `bg-gradient-to-r from-natty to-natty/90 
             hover:from-natty/90 hover:to-natty 
             text-white border-natty
             hover:shadow-lg hover:shadow-natty/30
             shadow-md shadow-natty/20` 
          : `bg-gradient-to-r from-juicy to-juicy/90 
             hover:from-juicy/90 hover:to-juicy 
             text-white border-juicy
             hover:shadow-lg hover:shadow-juicy/30
             shadow-md shadow-juicy/20`
        }
        ${isPending ? 'animate-pulse cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {/* Shimmer effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-700" />
      
      {/* Content */}
      <div className="relative z-10 flex items-center">
        {isNatty ? (
          <ThumbsUp className={`w-4 h-4 mr-2 transition-transform duration-200 ${isPending ? '' : 'group-hover:rotate-12'}`} />
        ) : (
          <ThumbsDown className={`w-4 h-4 mr-2 transition-transform duration-200 ${isPending ? '' : 'group-hover:-rotate-12'}`} />
        )}
        {isPending ? (
          <span className="animate-pulse">...</span>
        ) : (
          <span className="transition-all duration-200">
            {isNatty ? "Natty" : "Juicy"}
          </span>
        )}
      </div>
    </Button>
  );
}; 