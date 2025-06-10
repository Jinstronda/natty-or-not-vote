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
      className={`transition-all ${
        isNatty 
          ? 'bg-natty hover:bg-natty/90 text-white border-natty' 
          : 'bg-juicy hover:bg-juicy/90 text-white border-juicy'
      }`}
    >
      {isNatty ? (
        <ThumbsUp className="w-4 h-4 mr-2" />
      ) : (
        <ThumbsDown className="w-4 h-4 mr-2" />
      )}
      {isNatty ? "Natty" : "Juicy"}
    </Button>
  );
}; 