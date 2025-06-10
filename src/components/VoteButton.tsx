import { Button } from "@/components/ui/button";
import { useVote } from "@/hooks/api/useVote";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface VoteButtonProps {
  influencerId: string;
  voteType: "natty" | "not_natty";
}

export const VoteButton = ({ influencerId, voteType }: VoteButtonProps) => {
  const { mutate: vote, isLoading } = useVote();
  const isNatty = voteType === "natty";

  const handleVote = () => {
    vote({ influencerId, voteType });
  };

  return (
    <Button
      variant={isNatty ? "default" : "destructive"}
      size="sm"
      onClick={handleVote}
      disabled={isLoading}
    >
      {isNatty ? (
        <ThumbsUp className="w-4 h-4 mr-2" />
      ) : (
        <ThumbsDown className="w-4 h-4 mr-2" />
      )}
      {isNatty ? "Natty" : "Not Natty"}
    </Button>
  );
}; 