
import OptimizedVotingSection from "./OptimizedVotingSection";

interface VotingSectionProps {
  influencerId: string;
}

const VotingSection = ({ influencerId }: VotingSectionProps) => {
  return <OptimizedVotingSection influencerId={influencerId} />;
};

export default VotingSection;
